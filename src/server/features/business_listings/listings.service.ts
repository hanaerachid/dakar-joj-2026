import { type Filter, ObjectId } from "mongodb";
import { getMongoDatabase } from "../../mongodb/client.js";
import { businessListingSchema } from "../../../shared/contracts.js";
import type { SessionUser } from "../../../shared/contracts.js";
import type z from "zod";
import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

type BusinessListingDocument = { _id: string | ObjectId;[key: string]: any };
type BusinessListingPayload = Record<string, any>;

function idFilter(id: string) {
  if (ObjectId.isValid(id)) {
    return { _id: { $in: [id, new ObjectId(id)] } };
  }
  return { _id: id };
}

export type ListingActor = Pick<SessionUser, "uid" | "role">;
type ListingCoordinates = readonly [latitude: number, longitude: number];

export function buildListingFilter(
  id: string,
  actor?: ListingActor,
): Filter<BusinessListingDocument> {
  const idFilterValue = idFilter(id);

  // Admins can access everything.
  if (actor?.role === "admin") {
    return idFilterValue as Filter<BusinessListingDocument>;
  }

  // Anonymous users can only access verified listings.
  if (!actor) {
    return {
      ...idFilterValue,
      verified: true,
    } as Filter<BusinessListingDocument>;
  }

  // Authenticated users can access:
  // - their own listings, regardless of verification
  // - other people's verified listings
  return {
    ...idFilterValue,
    $or: [
      { ownerId: actor.uid },
      { verified: true },
    ],
  } as Filter<BusinessListingDocument>;
}

export function buildListingListFilter(
  actor?: ListingActor,
): Filter<BusinessListingDocument> {
  // Admins can see everything.
  if (actor?.role === "admin") {
    return {};
  }

  // Anonymous users: verified listings only.
  if (!actor) {
    return {
      verified: true,
    };
  }

  // Authenticated users:
  // their own listings OR any verified listing.
  return {
    $or: [
      { ownerId: actor.uid },
      { verified: true },
    ],
  };
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

function distanceInMeters(
  from: ListingCoordinates,
  to: readonly [longitude: number, latitude: number],
) {
  const earthRadius = 6371000;
  const [fromLatitude, fromLongitude] = from.map((value) => (value * Math.PI) / 180);
  const [toLongitude, toLatitude] = to.map((value) => (value * Math.PI) / 180);
  const latitudeDelta = toLatitude - fromLatitude;
  const longitudeDelta = toLongitude - fromLongitude;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export async function listBusinessListings(
  actor?: ListingActor,
  coordinates?: ListingCoordinates,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");
  const isAdmin = actor?.role === "admin";

  const filter = buildListingListFilter(actor);
  const docs = await collection.find(filter).toArray();

  if (coordinates) {
    docs.sort((a, b) => {
      const aCoordinates = a.location?.coordinates;
      const bCoordinates = b.location?.coordinates;
      const aDistance =
        Array.isArray(aCoordinates) && aCoordinates.length >= 2
          ? distanceInMeters(coordinates, [aCoordinates[0], aCoordinates[1]])
          : Number.POSITIVE_INFINITY;
      const bDistance =
        Array.isArray(bCoordinates) && bCoordinates.length >= 2
          ? distanceInMeters(coordinates, [bCoordinates[0], bCoordinates[1]])
          : Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    });
  }

  // Only admins can retrieve owner information.
  if (isAdmin) {
  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  }));
  }

  const ownerIds = [
    ...new Set(
      docs
        .map((doc) => doc.ownerId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const users = await Promise.all(
    ownerIds.map((id) => clerk.users.getUser(id))
  );

  const owners = new Map(
    users.map((user) => [
      user.id,
      {
        id: user.id,
        name:
          [user.firstName, user.lastName]
            .filter(Boolean)
            .join(" ") ||
          user.username ||
          "Unknown",
        imageUrl: user.imageUrl,
      },
    ])
  );

  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    owner: doc.ownerId
      ? owners.get(doc.ownerId) ?? null
      : null,
  }));
}

export async function getBusinessListingById(
  id: string,
  actor?: ListingActor,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const identifierFilter: Filter<BusinessListingDocument> =
    ObjectId.isValid(id)
      ? { _id: { $in: [id, new ObjectId(id)] } }
      : ({ name: id } as Filter<BusinessListingDocument>);

  const filter = {
    ...identifierFilter,
    ...buildListingListFilterForSingleListing(actor),
  } as Filter<BusinessListingDocument>;

  const doc = await collection.findOne(filter);

  if (!doc) return null;

  return {
    ...doc,
    _id: doc._id.toString(),
  };
}

function buildListingListFilterForSingleListing(
  actor?: ListingActor,
): Filter<BusinessListingDocument> {
  if (actor?.role === "admin") {
    return {};
  }

  if (!actor) {
    return {
      verified: true,
    };
  }

  return {
    $or: [
      { ownerId: actor.uid },
      { verified: true },
    ],
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

export async function setListingVerified(
  listingId: string,
  verified: boolean,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<BusinessListingDocument>("listings");

  const result = await collection.updateOne(
    { _id: listingId },
    {
      $set: {
        verified,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return null;
  }

  return {
    verified,
  };
}