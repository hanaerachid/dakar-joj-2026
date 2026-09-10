import { type Filter, ObjectId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";

export interface TorchStopDocument {
  _id: ObjectId;
  name: string;
  region: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  tourDate: Date;
  metadata?: {
    phase?: string;
    description?: string;
    isMajorStop?: boolean;
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
    tourDate: doc.tourDate.toISOString(),
  };
}