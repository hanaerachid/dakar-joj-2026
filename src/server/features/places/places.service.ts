import { ObjectId, type Filter, type WithId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";
import type { Place } from "../../../shared/contracts.js";

type PlaceDocument = { _id: string | ObjectId; [key: string]: any };
type PlacePayload = Record<string, any>;

function toIso(value: Date | string | undefined | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

function normalizeLocation(location: any) {
  if (!location) return null;
  if (typeof location.latitude === "number" && typeof location.longitude === "number") {
    return { latitude: location.latitude, longitude: location.longitude };
  }
  if (typeof location.lat === "number" && typeof location.lng === "number") {
    return { latitude: location.lat, longitude: location.lng };
  }
  if (typeof location._lat === "number" && typeof location._long === "number") {
    return { latitude: location._lat, longitude: location._long };
  }
  return null;
}

function serializePlace(id: string, data: PlaceDocument, zoneId?: string | null): Place {
  return {
    id,
    name: String(data.name ?? "Untitled"),
    name_fr: data.name_fr ?? data.nameFr ?? null,
    nameFr: data.nameFr ?? null,
    location: normalizeLocation(data.location) ?? undefined,
    address: data.address ?? null,
    info: data.info ?? null,
    info_fr: data.info_fr ?? data.infoFr ?? null,
    infoFr: data.infoFr ?? null,
    rating: typeof data.rating === "number" ? data.rating : null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    pointColor: data.pointColor ?? null,
    imageUrl: data.imageUrl ?? null,
    brandTitle: data.brandTitle ?? null,
    brandSubtitle: data.brandSubtitle ?? null,
    locationLabel: data.locationLabel ?? null,
    shortCode: data.shortCode ?? null,
    gradientFrom: data.gradientFrom ?? null,
    gradientTo: data.gradientTo ?? null,
    website: data.website ?? null,
    socialHandle: data.socialHandle ?? null,
    sportCount: Number(data.sportCount ?? 0),
    sports: Array.isArray(data.sports) ? data.sports : [],
    categoryId: data.categoryId ?? null,
    zoneId: zoneId ?? data.zoneId ?? null,
    zone: data.zone ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function idFilter(id: string): Filter<PlaceDocument> {
  if (ObjectId.isValid(id)) {
    return { _id: { $in: [id, new ObjectId(id)] } };
  }
  return { _id: id };
}

function buildPayload(input: any, zoneId?: string | null, includeCreatedAt = true) {
  const payload: PlacePayload = {
    name: input.name,
    name_fr: input.name_fr ?? input.nameFr ?? null,
    nameFr: input.nameFr ?? null,
    location: input.location ?? null,
    address: input.address ?? null,
    info: input.info ?? null,
    info_fr: input.info_fr ?? input.infoFr ?? null,
    infoFr: input.infoFr ?? null,
    rating: input.rating ?? null,
    tags: Array.isArray(input.tags) ? input.tags : [],
    pointColor: input.pointColor ?? null,
    imageUrl: input.imageUrl ?? null,
    brandTitle: input.brandTitle ?? null,
    brandSubtitle: input.brandSubtitle ?? null,
    locationLabel: input.locationLabel ?? null,
    shortCode: input.shortCode ?? null,
    gradientFrom: input.gradientFrom ?? null,
    gradientTo: input.gradientTo ?? null,
    website: input.website ?? null,
    socialHandle: input.socialHandle ?? null,
    sportCount: input.sportCount ?? (Array.isArray(input.sports) ? input.sports.length : 0),
    sports: Array.isArray(input.sports) ? input.sports : [],
    categoryId: input.categoryId ?? null,
    zoneId: zoneId ?? input.zoneId ?? null,
    zone: input.zone ?? null,
    updatedAt: new Date(),
  };
  if (includeCreatedAt) payload.createdAt = input.createdAt ?? new Date();
  return payload;
}

function serializeDocument(doc: WithId<PlaceDocument>, zoneId?: string | null) {
  return serializePlace(String(doc._id), doc, zoneId);
}

async function findPlace(id: string, zoneId?: string | null) {
  const db = await getMongoDatabase();
  const filter: Filter<PlaceDocument> = {
    ...idFilter(id),
    ...(zoneId ? { zoneId } : {}),
  };
  return db.collection<PlaceDocument>("places").findOne(filter);
}

function buildCreateDocument(input: any, zoneId?: string | null) {
  const id = new ObjectId().toHexString();
  return {
    _id: id,
    _firestorePath: `places/${id}`,
    ...buildPayload(input, zoneId),
  };
}

export async function listPlaces(params: {
  categoryId?: string;
  zoneId?: string | null;
  scope?: "all" | "zone" | "root";
}) {
  const { categoryId, zoneId, scope } = params;
  const db = await getMongoDatabase();
  const collection = db.collection<PlaceDocument>("places");
  const categoryFilter = { categoryId: categoryId ?? "" };

  if (scope === "all") {
    const docs = await collection.find(categoryFilter).toArray();
    return docs.map((doc) => serializeDocument(doc, doc.zoneId ?? null));
  }

  if (scope === "root" || !zoneId) {
    const docs = await collection.find({ ...categoryFilter, zoneId: null }).toArray();
    return docs.map((doc) => serializeDocument(doc, null));
  }

  const docs = await collection.find({ ...categoryFilter, zoneId }).toArray();
  return docs.map((doc) => serializeDocument(doc, zoneId));
}

export async function getPlace(id: string, zoneId?: string | null) {
  const doc = await findPlace(id, zoneId);
  return doc ? serializeDocument(doc, zoneId ?? doc.zoneId ?? null) : null;
}

export async function createPlace(input: any, zoneId?: string | null) {
  const db = await getMongoDatabase();
  const document = buildCreateDocument(input, zoneId);
  await db.collection<PlaceDocument>("places").insertOne(document);
  return getPlace(String(document._id), zoneId);
}

export async function updatePlace(id: string, input: any, zoneId?: string | null) {
  const db = await getMongoDatabase();
  const filter = {
    ...idFilter(id),
    ...(zoneId ? { zoneId } : {}),
  };
  const payload = buildPayload(input, zoneId, false);
  const fields = [
    "name", "name_fr", "nameFr", "location", "address", "info", "info_fr",
    "infoFr", "rating", "tags", "pointColor", "imageUrl", "brandTitle",
    "brandSubtitle", "locationLabel", "shortCode", "gradientFrom", "gradientTo",
    "website", "socialHandle", "sportCount", "sports", "categoryId", "zoneId", "zone",
  ];
  const changed = Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(input, field))
      .map((field) => [field, payload[field]]),
  );
  await db.collection<PlaceDocument>("places").updateOne(filter, {
    $set: { ...changed, updatedAt: new Date() },
  });
  return getPlace(id, zoneId);
}

export async function deletePlace(id: string, zoneId?: string | null) {
  const db = await getMongoDatabase();
  await db.collection<PlaceDocument>("places").deleteOne({
    ...idFilter(id),
    ...(zoneId ? { zoneId } : {}),
  });
}

export async function duplicatePlace(id: string, zoneId?: string | null) {
  const place = await getPlace(id, zoneId);
  if (!place) return null;
  const db = await getMongoDatabase();
  const document = {
    ...buildCreateDocument(place, zoneId),
    name: `${place.name} (copy)`,
  };
  await db.collection<PlaceDocument>("places").insertOne(document);
  return getPlace(String(document._id), zoneId);
}
