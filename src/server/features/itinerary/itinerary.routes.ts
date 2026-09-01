import { Hono } from "hono";
import { ok } from "../../http/response.js";
import { requestItinerary, validateItineraryRequest } from "./itinerary.service.js";

export const itineraryRoutes = new Hono();

itineraryRoutes.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_BODY",
          message: "Expected a JSON body for the itinerary request.",
        },
      },
      400,
    );
  }

  try {
    const payload = validateItineraryRequest(body);
    const result = await requestItinerary(payload);
    return ok(c, result, 200);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json(
        {
          success: false,
          error: {
            code: "INVALID_ITINERARY",
            message: error.message,
          },
        },
        400,
      );
    }

    if (error instanceof Error && "status" in error && typeof (error as any).status === "number") {
      const httpError = error as Error & { status: number; code?: string; details?: unknown };
      return c.json(
        {
          success: false,
          error: {
            code: httpError.code ?? "ORS_PROXY_ERROR",
            message: httpError.message,
            details: httpError.details,
          },
        },
        httpError.status as any,
      );
    }

    return c.json(
      {
        success: false,
        error: {
          code: "ORS_PROXY_ERROR",
          message: error instanceof Error ? error.message : "Unknown itinerary proxy error",
        },
      },
      500,
    );
  }
});
