import { Hono } from "hono";
import type { Context } from "hono";
import { ok, fail } from "../../http/response.js";
import {
  listBusinessListings,
  getBusinessListingById,
  createBusinessListing,
  updateBusinessListing,
  deleteBusinessListing
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
  const denied = requireAuth(c);
  if (denied) return denied;
  const user = c.get("user");
  if (!user) return unauthorized(c);

  const listings = await listBusinessListings(user);

  return ok(c, listings);
});

listingRoutes.get("/:id", async (c) => {
  const denied = requireAuth(c);
  if (denied) return denied;
  const user = c.get("user");
  if (!user) return unauthorized(c);

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