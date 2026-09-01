import { z } from "zod";
import { env } from "../../config/env.js";
import { HttpError } from "../../http/errors.js";

export const orsProfileSchema = z.enum([
  "driving-car",
  "driving-hgv",
  "cycling-regular",
  "cycling-mountain",
  "cycling-road",
  "cycling-electric",
  "foot-walking",
  "foot-hiking",
  "wheelchair",
]);

export const orsCoordinatesSchema = z
  .array(z.tuple([z.number(), z.number()]).refine(([lng, lat]) => {
    return Number.isFinite(lng) && Number.isFinite(lat);
  }))
  .min(2);

export const itineraryRequestSchema = z
  .object({
    coordinates: orsCoordinatesSchema,
    profile: orsProfileSchema.default("driving-car"),
    format: z.enum(["json", "geojson"]).default("json"),
    options: z
      .object({
        alternatives: z.boolean().optional(),
        avoid_borders: z.enum(["all", "controlled", "none"]).optional(),
        avoid_features: z.array(z.string()).optional(),
        avoid_polygons: z.array(z.array(z.tuple([z.number(), z.number()]))).optional(),
        continue_straight: z.boolean().optional(),
        geometry: z.boolean().optional(),
        instructions: z.boolean().optional(),
        language: z.string().optional(),
        maneuvers: z.boolean().optional(),
        roundabout_exits: z.boolean().optional(),
        summary: z.boolean().optional(),
        units: z.enum(["m", "km", "mi"]).optional(),
      })
      .passthrough()
      .optional()
      .default({}),
  })
  .passthrough();

export type ItineraryRequest = z.infer<typeof itineraryRequestSchema>;

const itineraryCache = new Map<string, { expiresAt: number; value: unknown }>();
const itineraryInflight = new Map<string, Promise<unknown>>();
const ORS_REQUEST_TIMELINE: number[] = [];

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const WINDOW_MS = 60 * 1000;

export function normalizeItineraryRequest(input: unknown): ItineraryRequest {
  const parsed = itineraryRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const result = parsed.data;
  return {
    ...result,
    coordinates: result.coordinates.map(([lng, lat]) => [Number(lng), Number(lat)]),
    profile: result.profile ?? "driving-car",
    format: result.format ?? "json",
    options: {
      ...(result.options ?? {}),
    },
  };
}

export function validateItineraryRequest(
  input: unknown,
  options: { maxCoordinates?: number } = {},
) {
  const maxCoordinates = options.maxCoordinates ?? 60;
  const normalized = normalizeItineraryRequest(input);

  if (normalized.coordinates.length > maxCoordinates) {
    throw new Error(
      `coordinates exceed the ${maxCoordinates}-coordinate limit.`,
    );
  }

  return normalized;
}

export function buildItineraryCacheKey(payload: unknown): string {
  return JSON.stringify(sortObject(payload));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sortObject(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortObject(entry)]),
    );
  }

  return value;
}

function pruneRateLimitWindow() {
  const cutoff = Date.now() - WINDOW_MS;
  while (ORS_REQUEST_TIMELINE.length > 0 && ORS_REQUEST_TIMELINE[0] < cutoff) {
    ORS_REQUEST_TIMELINE.shift();
  }
}

function enforceOrsRateLimit() {
  pruneRateLimitWindow();
  if (ORS_REQUEST_TIMELINE.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new HttpError(
      429,
      "ORS_RATE_LIMIT_EXCEEDED",
      "The ORS quota has been reached for this server window. Retry later or use cached results.",
    );
  }

  ORS_REQUEST_TIMELINE.push(Date.now());
}

function getCachedItinerary(key: string) {
  const cached = itineraryCache.get(key);
  if (!cached) return undefined;

  if (Date.now() > cached.expiresAt) {
    itineraryCache.delete(key);
    return undefined;
  }

  return cached.value;
}

const UNSUPPORTED_ORS_OPTIONS = new Set(["alternatives"]);

export function toOrsRequestBody(payload: ItineraryRequest) {
  const { profile, format, ...rest } = payload;
  const { coordinates, options, ...extras } = rest as Record<string, unknown>;

  const body: Record<string, unknown> = {
    coordinates,
  };

  const safeOptions = {
    ...(typeof options === "object" && options ? (options as Record<string, unknown>) : {}),
  };

  for (const unsupported of UNSUPPORTED_ORS_OPTIONS) {
    delete safeOptions[unsupported];
  }

  if (Object.keys(safeOptions).length > 0) {
    body.options = safeOptions;
  }

  for (const [key, value] of Object.entries(extras)) {
    if (value !== undefined) {
      body[key] = value;
    }
  }

  return body;
}

export async function requestItinerary(payload: unknown) {
  const normalized = validateItineraryRequest(payload);
  const apiKey = env.ORS_API_KEY?.trim();

  if (!apiKey) {
    throw new HttpError(
      500,
      "ORS_API_KEY_MISSING",
      "Define ORS_API_KEY in the environment before calling the itinerary proxy.",
    );
  }

  const key = buildItineraryCacheKey(normalized);
  const cached = getCachedItinerary(key);
  if (cached) {
    return cached;
  }

  if (itineraryInflight.has(key)) {
    return await itineraryInflight.get(key)!;
  }

  const routePromise = (async () => {
    enforceOrsRateLimit();
    const baseUrl = env.ORS_BASE_URL ?? "https://api.openrouteservice.org";
    const url = new URL(
      `${baseUrl.replace(/\/$/, "")}/v2/directions/${normalized.profile}/${normalized.format ?? "json"}`,
    );

    const body = toOrsRequestBody(normalized);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      throw new HttpError(
        429,
        "ORS_QUOTA_EXCEEDED",
        "The upstream OpenRouteService quota was exceeded. Please retry later.",
      );
    }

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new HttpError(
        response.status || 502,
        "ORS_PROXY_ERROR",
        details || "The ORS request failed.",
        {
          status: response.status,
          raw: details,
        },
      );
    }

    const json = await response.json();
    itineraryCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: json });
    return json;
  })();

  itineraryInflight.set(key, routePromise);

  try {
    return await routePromise;
  } finally {
    itineraryInflight.delete(key);
  }
}
