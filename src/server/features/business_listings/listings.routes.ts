import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import {
  listBusinessListings,
  getBusinessListingById,
  createBusinessListing,
  updateBusinessListing,
  deleteBusinessListing
} from "./listings.service.js";
import { requireAdmin } from "../../middleware/auth.js";
import { businessListingSchema } from "../../../shared/contracts.js";

export const listingRoutes = new Hono();

listingRoutes.get("/", async (c) => {

  const listings = await listBusinessListings();

  return ok(c, listings);
});

listingRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const listing = await getBusinessListingById(id);

  if (!listing) {
    return fail(c, 404, "NOT_FOUND", "Business listing not found");
  }

  return ok(c, listing);
});

listingRoutes.post("/", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = businessListingSchema.parse(await c.req.json());

  const businessListing = await createBusinessListing(body);

  return ok(c, businessListing, 201);
});

listingRoutes.patch("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = businessListingSchema.partial().parse(await c.req.json());
  const listing = await updateBusinessListing(c.req.param("id"), body);
  return ok(c, listing);
});

listingRoutes.delete("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  await deleteBusinessListing(c.req.param("id"));
  return ok(c, { deleted: true });
});