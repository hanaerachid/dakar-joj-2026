import { ObjectId, type Filter } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";
import type { MapProduct, MapProductInput } from "../../../shared/contracts.js";

type MapProductDocument = {
  _id: string | ObjectId;
  [key: string]: unknown;
};

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

function idFilter(id: string): Filter<MapProductDocument> {
  return ObjectId.isValid(id)
    ? { _id: { $in: [id, new ObjectId(id)] } }
    : { _id: id };
}

function serializeMapProduct(doc: MapProductDocument): MapProduct {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    format: String(doc.format ?? ""),
    price: doc.price == null ? null : String(doc.price),
    contact: doc.contact == null ? null : String(doc.contact),
    images: Array.isArray(doc.images) ? doc.images.map(String) : [],
    published: doc.published !== false,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
  };
}

function buildPayload(input: Partial<MapProductInput>) {
  return {
    title: input.title,
    description: input.description,
    format: input.format,
    price: input.price ?? null,
    contact: input.contact ?? null,
    images: input.images ?? [],
    published: input.published !== false,
    updatedAt: new Date(),
  };
}

export async function listMapProducts(includeUnpublished = false) {
  const db = await getMongoDatabase();
  const filter = includeUnpublished ? {} : { published: { $ne: false } };
  const docs = await db.collection<MapProductDocument>("mapProducts")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(serializeMapProduct);
}

export async function getMapProduct(id: string, includeUnpublished = false) {
  const db = await getMongoDatabase();
  const doc = await db.collection<MapProductDocument>("mapProducts").findOne({
    ...idFilter(id),
    ...(includeUnpublished ? {} : { published: { $ne: false } }),
  });
  return doc ? serializeMapProduct(doc) : null;
}

export async function createMapProduct(input: MapProductInput) {
  const db = await getMongoDatabase();
  const id = new ObjectId().toHexString();
  const document = {
    _id: id,
    _firestorePath: `mapProducts/${id}`,
    ...buildPayload(input),
    createdAt: new Date(),
  };
  await db.collection<MapProductDocument>("mapProducts").insertOne(document);
  return serializeMapProduct(document);
}

export async function updateMapProduct(id: string, input: Partial<MapProductInput>) {
  const db = await getMongoDatabase();
  const result = await db.collection<MapProductDocument>("mapProducts").updateOne(
    idFilter(id),
    { $set: buildPayload(input) },
  );
  if (result.matchedCount === 0) return null;
  return getMapProduct(id, true);
}

export async function deleteMapProduct(id: string) {
  const db = await getMongoDatabase();
  const result = await db.collection<MapProductDocument>("mapProducts").deleteOne(idFilter(id));
  return result.deletedCount > 0;
}
