import { type Filter, ObjectId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";
import { businessListingSchema } from "../../../shared/contracts.js";
import type z from "zod";

type BusinessListingDocument = { _id: string | ObjectId;[key: string]: any };
type BusinessListingPayload = Record<string, any>;

function idFilter(id: string) {
  if (ObjectId.isValid(id)) {
    return { _id: { $in: [id, new ObjectId(id)] } };
  }
  return { _id: id };
}

function buildPayload(input: any, includeCreatedAt = true) {
  const validatedInput = businessListingSchema.parse(input);

  const payload = {
    ...validatedInput,
    createdAt: new Date(),
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

export async function listBusinessListings() {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const docs = await collection.find({}).sort({ tourDate: 1 }).toArray();

  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    tourDate: doc.tourDate instanceof Date ? doc.tourDate.toISOString() : doc.tourDate,
  }));
}

export async function getBusinessListingById(id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const filter: Filter<BusinessListingDocument> = ObjectId.isValid(id)
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

export async function createBusinessListing(input: any) {
  const db = await getMongoDatabase();
  const document = buildCreateDocument(input);
  const { _id, ...safeBody } = document as any;
  await db.collection<BusinessListingDocument>("listings").insertOne(safeBody);
  return getBusinessListingById(String(document._id));
}

export async function updateBusinessListing(id: string, input: BusinessListingPayload) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const filter = idFilter(id);
  const payload = buildPayload(input, false);

  const fields = Object.keys(businessListingSchema.shape) as Array<
    keyof z.infer<typeof businessListingSchema>
  >;
  const changed = Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(input, field))
      .map((field) => [field, payload[field]]),
  );

  await collection.updateOne(filter, {
    $set: { ...changed, updatedAt: new Date() },
  });

  return getBusinessListingById(id);
}

export async function deleteBusinessListing(id: string) {
  const db = await getMongoDatabase();

  const result = await db
    .collection<BusinessListingDocument>("listings")
    .deleteOne(idFilter(id));

  return result.deletedCount === 1;
}