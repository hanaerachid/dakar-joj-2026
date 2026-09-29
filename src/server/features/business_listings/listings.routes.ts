import { Hono } from "hono";
import type { Context } from "hono";
import { ok, fail } from "../../http/response.js";
import {
  listBusinessListings,
  getBusinessListingById,
  createBusinessListing,
  updateBusinessListing,
  deleteBusinessListing,
  setListingVerified
} from "./listings.service.js";
import { requireAuth } from "../../middleware/auth.js";
import { businessListingSchema } from "../../../shared/contracts.js";

export const listingRoutes = new Hono();

function unauthorized(c: Context) {
  return c.json(
    {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    },
    401,
  );
}

listingRoutes.get("/", async (c) => {
  const user = c.get("user");
  const location = c.req.query("location");

  if (location !== undefined && !/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(location)) {
    return fail(c, 400, "BAD_REQUEST", "location must be in the format lat,lon");
  }

  const coordinates = location?.split(",").map(Number) as
    | [number, number]
    | undefined;
  if (
    coordinates &&
    (coordinates[0] < -90 ||
      coordinates[0] > 90 ||
      coordinates[1] < -180 ||
      coordinates[1] > 180)
  ) {
    return fail(c, 400, "BAD_REQUEST", "location coordinates are out of range");
  }

  const listings = await listBusinessListings(user, coordinates);

  return ok(c, listings);
});

listingRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const listing = await getBusinessListingById(id, user);

  if (!listing) {
    return fail(c, 404, "NOT_FOUND", "Business listing not found");
  }

  return ok(c, listing);
});

listingRoutes.post("/", async (c) => {
  const denied = requireAuth(c);
  if (denied) return denied;
  const user = c.get("user");
  if (!user) return unauthorized(c);

  const body = businessListingSchema.parse(await c.req.json());

  const businessListing = await createBusinessListing(body, user);

  return ok(c, businessListing, 201);
});

listingRoutes.patch("/:id", async (c) => {
  const denied = requireAuth(c);
  if (denied) return denied;
  const user = c.get("user");
  if (!user) return unauthorized(c);

  const body = businessListingSchema.partial().parse(await c.req.json());
  const listing = await updateBusinessListing(c.req.param("id"), body, user);
  if (!listing) {
    return fail(c, 404, "NOT_FOUND", "Business listing not found");
  }
  return ok(c, listing);
});

listingRoutes.delete("/:id", async (c) => {
  const denied = requireAuth(c);
  if (denied) return denied;
  const user = c.get("user");
  if (!user) return unauthorized(c);

  const deleted = await deleteBusinessListing(c.req.param("id"), user);
  if (!deleted) {
    return fail(c, 404, "NOT_FOUND", "Business listing not found");
  }
  return ok(c, { deleted: true });
});

listingRoutes.patch("/listings/:id/verify", async (c) => {
  const denied = requireAuth(c);
  if (denied) return denied;

  const listingId = c.req.param("id");

  const body = await c.req.json<{
    verified: boolean;
  }>();

  if (typeof body.verified !== "boolean") {
    return fail(c, 400, "BAD_REQUEST", "verified must be a boolean");
  }

  try {
    const result = await setListingVerified(
      listingId,
      body.verified,
    );

    if (!result) {
      return fail(c, 404, "NOT_FOUND", "Listing not found");
    }

    return ok(c, result);
  } catch (error) {
    console.error("Failed to update listing verification:", error);

    return fail(c, 500, "INTERNAL_SERVER_ERROR", "Failed to update listing");
  }
});
