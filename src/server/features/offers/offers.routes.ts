import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import { requireAdmin } from "../../middleware/auth.js";
import { offerInputSchema } from "../../../shared/contracts.js";
import {
  createOffer,
  deleteOffer,
  getOffer,
  listOffers,
  updateOffer,
} from "./offers.service.js";

export const offersRoutes = new Hono();

offersRoutes.get("/", async (c) => ok(c, await listOffers(c.get("user")?.role === "admin")));

offersRoutes.get("/:id", async (c) => {
  const offer = await getOffer(c.req.param("id"), c.get("user")?.role === "admin");
  return offer ? ok(c, offer) : fail(c, 404, "NOT_FOUND", "Offer not found");
});

offersRoutes.post("/", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const offer = await createOffer(offerInputSchema.parse(await c.req.json()));
  return ok(c, offer, 201);
});

offersRoutes.patch("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const offer = await updateOffer(
    c.req.param("id"),
    offerInputSchema.partial().parse(await c.req.json()),
  );
  return offer ? ok(c, offer) : fail(c, 404, "NOT_FOUND", "Offer not found");
});

offersRoutes.delete("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const deleted = await deleteOffer(c.req.param("id"));
  return deleted
    ? ok(c, { deleted: true })
    : fail(c, 404, "NOT_FOUND", "Offer not found");
});
