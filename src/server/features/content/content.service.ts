import { ObjectId, type Filter, type WithId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";

export type ContentCollectionName = "news" | "events" | "torch";

type ContentDocument = Record<string, any>;

function toIso(value: Date | string | undefined | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return null;
}

function normalizeValues(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => normalizeValues(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        normalizeValues(item),
      ]),
    );
  }
  return value;
}

function normalizeDocument(doc: WithId<ContentDocument> | ContentDocument) {
  const { _id, ...rest } = doc as Record<string, any>;
  const item = normalizeValues(rest) as Record<string, any>;
  const formattedId =
    _id && typeof _id === "object" && "toHexString" in _id
      ? String((_id as { toHexString: () => string }).toHexString())
      : _id != null
        ? String(_id)
        : undefined;

  return {
    ...item,
    ...(formattedId ? { id: formattedId } : {}),
    ...(item.createdAt ? { createdAt: toIso(item.createdAt) } : {}),
    ...(item.updatedAt ? { updatedAt: toIso(item.updatedAt) } : {}),
    ...(item.publishedAt ? { publishedAt: toIso(item.publishedAt) } : {}),
    ...(item.date ? { date: toIso(item.date) } : {}),
  };
}

export async function listContentCollection(
  collectionName: ContentCollectionName,
  params?: { status?: string; limit?: number; sort?: "asc" | "desc" },
) {
  const db = await getMongoDatabase();
  const collection = db.collection<ContentDocument>(collectionName);
  const filter: Filter<ContentDocument> = {};

  if (params?.status) {
    filter.status = params.status;
  }

  const docs = await collection
    .find(filter)
    .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
    .limit(params?.limit ?? 100)
    .toArray();

  return docs.map((doc) => normalizeDocument(doc));
}

export async function getContentItem(collectionName: ContentCollectionName, id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<ContentDocument>(collectionName);
  const clauses: Array<Record<string, any>> = [{ legacyFirestoreId: id }, { id }];

  if (ObjectId.isValid(id)) {
    clauses.push({ _id: new ObjectId(id) });
  }

  const doc = await collection.findOne({ $or: clauses } as Filter<ContentDocument>);

  return doc ? normalizeDocument(doc) : null;
}
