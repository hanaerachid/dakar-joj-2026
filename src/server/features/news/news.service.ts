import { type Filter, ObjectId, type WithId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";

type NewsDocument = Record<string, any>;

type Metadata = {
  title?: string;
  description?: string;
  image?: string;
};

type NormalizedNewsDocument = Record<string, any> & {
  metadata?: Metadata | null;
};

type MetadataResponse = {
  success: boolean;
  data?: {
    url?: string;
    title?: string;
    description?: string;
    image?: string;
  };
};

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

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValues(item));
  }

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

async function getMetadata(url: string): Promise<Metadata | null> {
  try {
    const baseUrl = process.env.API_BASE_URL ?? "http://localhost:8787";

    const endpoint = `${baseUrl}/api/v2/metadata?url=${encodeURIComponent(url)}`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as MetadataResponse;

    if (!result.success || !result.data) {
      return null;
    }

    const { title, description, image } = result.data;

    return {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(image ? { image } : {}),
    };
  } catch (error) {
    console.error(`Failed to fetch metadata for ${url}:`, error);
    return null;
  }
}

async function normalizeDocument(
  doc: WithId<NewsDocument> | NewsDocument,
): Promise<NormalizedNewsDocument> {
  const { _id, ...rest } = doc as Record<string, any>;

  const item = normalizeValues(rest) as Record<string, any>;

  const formattedId =
    _id && typeof _id === "object" && "toHexString" in _id
      ? String((_id as { toHexString: () => string }).toHexString())
      : _id != null
        ? String(_id)
        : undefined;

  const normalized: NormalizedNewsDocument  = {
    ...item,
    ...(formattedId ? { id: formattedId } : {}),
    ...(item.createdAt ? { createdAt: toIso(item.createdAt) } : {}),
    ...(item.updatedAt ? { updatedAt: toIso(item.updatedAt) } : {}),
    ...(item.publishedAt ? { publishedAt: toIso(item.publishedAt) } : {}),
    ...(item.date ? { date: toIso(item.date) } : {}),
  };

  // Change `url` to whatever field contains the URL in your MongoDB document.
  if (normalized.url) {
    normalized.metadata = await getMetadata(normalized.url);
  }

  return normalized;
}

export async function listNews(
  params?: {
    status?: string;
    limit?: number;
    sort?: "asc" | "desc";
  },
) {
  const db = await getMongoDatabase();
  const collection = db.collection<NewsDocument>("news");

  const filter: Filter<NewsDocument> = {};

  if (params?.status) {
    filter.status = params.status;
  }

  const docs = await collection
    .find(filter)
    .sort({ publishedAt: -1, createdAt: -1, _id: -1 })
    .limit(params?.limit ?? 100)
    .toArray();

  return Promise.all(
    docs.map((doc) => normalizeDocument(doc)),
  );
}

export async function getNewsItem(id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<NewsDocument>("news");

  const clauses: Array<Record<string, any>> = [
    { legacyFirestoreId: id },
    { id },
  ];

  if (ObjectId.isValid(id)) {
    clauses.push({ _id: new ObjectId(id) });
  }

  const doc = await collection.findOne({
    $or: clauses,
  } as Filter<NewsDocument>);

  return doc ? normalizeDocument(doc) : null;
}
