import { ObjectId, type Filter } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";
import type { Offer, OfferInput } from "../../../shared/contracts.js";

type OfferDocument = {
  _id: string | ObjectId;
  [key: string]: unknown;
};

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

function idFilter(id: string): Filter<OfferDocument> {
  return ObjectId.isValid(id)
    ? { _id: { $in: [id, new ObjectId(id)] } }
    : { _id: id };
}

function normalizeLocations(locations: unknown) {
  if (!Array.isArray(locations)) return [];

  return locations.map((location) => {
    if (!location || typeof location !== "object") return location;
    const value = location as Record<string, unknown>;
    if (value.type !== "Feature") return location;

    const properties = value.properties && typeof value.properties === "object"
      ? value.properties as Record<string, unknown>
      : {};
    return {
      geometry: value.geometry,
      label: properties.label ?? properties.name ?? null,
      images: Array.isArray(value.images)
        ? value.images
        : Array.isArray(properties.images) ? properties.images : [],
    };
  });
}

function serializeOffer(doc: OfferDocument): Offer {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    category: String(doc.category ?? ""),
    tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    description: String(doc.description ?? ""),
    services: Array.isArray(doc.services) ? doc.services.map(String) : [],
    price: doc.price == null ? null : String(doc.price),
    whatsapp: doc.whatsapp == null ? null : String(doc.whatsapp),
    images: Array.isArray(doc.images) ? doc.images.map(String) : [],
    locations: normalizeLocations(doc.locations) as Offer["locations"],
    published: doc.published !== false,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

function buildPayload(input: Partial<OfferInput>) {
  return {
    title: input.title,
    category: input.category,
    tags: input.tags ?? [],
    description: input.description,
    services: input.services ?? [],
    price: input.price ?? null,
    whatsapp: input.whatsapp ?? null,
    images: input.images ?? [],
    locations: normalizeLocations(input.locations),
    published: input.published !== false,
    updatedAt: new Date(),
  };
}

export async function listOffers(includeUnpublished = false) {
  const db = await getMongoDatabase();
  const filter = includeUnpublished ? {} : { published: { $ne: false } };
  const docs = await db.collection<OfferDocument>("offers")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serializeOffer);
}

export async function getOffer(id: string, includeUnpublished = false) {
  const db = await getMongoDatabase();
  const doc = await db.collection<OfferDocument>("offers").findOne({
    ...idFilter(id),
    ...(includeUnpublished ? {} : { published: { $ne: false } }),
  });
  return doc ? serializeOffer(doc) : null;
}

export async function createOffer(input: OfferInput) {
  const db = await getMongoDatabase();
  const id = new ObjectId().toHexString();
  const document = {
    _id: id,
    _firestorePath: `offers/${id}`,
    ...buildPayload(input),
    createdAt: new Date(),
  };
  await db.collection<OfferDocument>("offers").insertOne(document);
  return serializeOffer(document);
}

export async function updateOffer(id: string, input: Partial<OfferInput>) {
  const db = await getMongoDatabase();
  const result = await db.collection<OfferDocument>("offers").updateOne(
    idFilter(id),
    { $set: buildPayload(input) },
  );
  if (result.matchedCount === 0) return null;
  return getOffer(id, true);
}

export async function deleteOffer(id: string) {
  const db = await getMongoDatabase();
  const result = await db.collection<OfferDocument>("offers").deleteOne(idFilter(id));
  return result.deletedCount > 0;
}
