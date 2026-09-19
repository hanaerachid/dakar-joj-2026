import { type Filter, ObjectId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";
import { businessListingSchema } from "../../../shared/contracts.js";
import type { SessionUser } from "../../../shared/contracts.js";
import type z from "zod";

type BusinessListingDocument = { _id: string | ObjectId;[key: string]: any };
type BusinessListingPayload = Record<string, any>;

function idFilter(id: string) {
  if (ObjectId.isValid(id)) {
    return { _id: { $in: [id, new ObjectId(id)] } };
  }
  return { _id: id };
}

export type ListingActor = Pick<SessionUser, "uid" | "role">;

export function buildListingFilter(
  id: string,
  actor: ListingActor,
): Filter<BusinessListingDocument> {
  const ownershipFilter = actor.role === "admin" ? {} : { ownerId: actor.uid };
  return {
    ...idFilter(id),
    ...ownershipFilter,
  } as Filter<BusinessListingDocument>;
}

export function buildListingListFilter(
  actor: ListingActor,
): Filter<BusinessListingDocument> {
  return actor.role === "admin" ? {} : { ownerId: actor.uid };
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

export async function listBusinessListings(actor: ListingActor) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const filter = buildListingListFilter(actor);
  const docs = await collection.find(filter).sort({ tourDate: 1 }).toArray();

  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    tourDate: doc.tourDate instanceof Date ? doc.tourDate.toISOString() : doc.tourDate,
  }));
}

export async function getBusinessListingById(id: string, actor: ListingActor) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const identifierFilter: Filter<BusinessListingDocument> = ObjectId.isValid(id)
    ? { _id: { $in: [id, new ObjectId(id)] } }
    : ({ name: id } as any);
  const filter = {
    ...identifierFilter,
    ...buildListingListFilter(actor),
  } as Filter<BusinessListingDocument>;

  const doc = await collection.findOne(filter);
  if (!doc) return null;

  return {
    ...doc,
    _id: doc._id.toString(),
    tourDate: doc.tourDate instanceof Date ? doc.tourDate.toISOString() : doc.tourDate,
  };
}

export async function createBusinessListing(input: any, actor: ListingActor) {
  const db = await getMongoDatabase();
  const document = {
    ...buildCreateDocument(input),
    ownerId: actor.uid,
  };
  await db.collection<BusinessListingDocument>("listings").insertOne(document);
  return getBusinessListingById(String(document._id), actor);
}

export async function updateBusinessListing(
  id: string,
  input: BusinessListingPayload,
  actor: ListingActor,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const filter = buildListingFilter(id, actor);
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

  return getBusinessListingById(id, actor);
}

export async function deleteBusinessListing(id: string, actor: ListingActor) {
  const db = await getMongoDatabase();

  const result = await db
    .collection<BusinessListingDocument>("listings")
    .deleteOne(buildListingFilter(id, actor));

  return result.deletedCount === 1;
}