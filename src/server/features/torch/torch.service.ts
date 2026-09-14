import { type Filter, ObjectId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";

type TorchStopDocument = { _id: string | ObjectId; [key: string]: any };
type TorchStopPayload = Record<string, any>;

function idFilter(id: string) {
  if (ObjectId.isValid(id)) {
    return { _id: { $in: [id, new ObjectId(id)] } };
  }
  return { _id: id };
}

function buildPayload(input: any, includeCreatedAt = true) {
  const payload: TorchStopPayload = {
    name: input.name,
    region: input.region ?? null,
    location: input.location ?? null,
    tourDate: input.tourDate ?? null,
    metadata: input.metadata ?? null,
    updatedAt: new Date(),
  };

  if (includeCreatedAt) payload.createdAt = input.createdAt ?? new Date();
  return payload;
}

function buildCreateDocument(input: any) {
  const id = new ObjectId().toHexString();
  return {
    _id: id,
    ...buildPayload(input),
  };
}

export async function listTorchStops() {
  const db = await getMongoDatabase();
  const collection = db.collection<TorchStopDocument>("torchstops");

  const docs = await collection.find({}).sort({ tourDate: 1 }).toArray();

  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    tourDate: doc.tourDate instanceof Date ? doc.tourDate.toISOString() : doc.tourDate,
  }));
}

export async function getTorchStopById(id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<TorchStopDocument>("torchstops");

  const filter: Filter<TorchStopDocument> = ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : ({ name: id } as any);

  const doc = await collection.findOne(filter);
  if (!doc) return null;

  return {
    ...doc,
    _id: doc._id.toString(),
    tourDate: doc.tourDate instanceof Date ? doc.tourDate.toISOString() : doc.tourDate,
  };
}

export async function createTorchStop(input: any) {
  const db = await getMongoDatabase();
  const document = buildCreateDocument(input);
  await db.collection<TorchStopDocument>("torchstops").insertOne(document);
  return getTorchStopById(String(document._id));
}

export async function updateTorchStop(id: string, input: TorchStopPayload) {
  const db = await getMongoDatabase();
  const collection = db.collection<TorchStopDocument>("torchstops");

  const filter = idFilter(id);
  const payload = buildPayload(input, false);

  const fields = ["name", "region", "location", "tourDate", "metadata"] as const;

  const changed = Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(input, field))
      .map((field) => [field, payload[field]]),
  );

  await collection.updateOne(filter, {
    $set: { ...changed, updatedAt: new Date() },
  });

  return getTorchStopById(id);
}

export async function deleteTorchStop(id: string) {
  const db = await getMongoDatabase();

  const result = await db
    .collection<TorchStopDocument>("torchstops")
    .deleteOne(idFilter(id));

  return result.deletedCount === 1;
}