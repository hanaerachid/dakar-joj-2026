import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import { attachSessionUser } from "../../middleware/auth.js";
import { requireAdmin } from "../../middleware/auth.js";
import { placeImportSchema, placeInputSchema } from "../../../shared/contracts.js";
import {
  createPlace,
  deletePlace,
  duplicatePlace,
  getPlace,
  listPlaces,
  updatePlace,
} from "./places.service.js";

export const placesRoutes = new Hono();

placesRoutes.use("*", attachSessionUser);

placesRoutes.get("/", async (c) => {
  const places = await listPlaces({
    categoryId: c.req.query("categoryId") ?? undefined,
    zoneId: c.req.query("zoneId") ?? null,
    scope: (c.req.query("scope") as any) ?? "zone",
  });
  return ok(c, places);
});

placesRoutes.get("/:id", async (c) => {
  const zoneId = c.req.query("zoneId") ?? null;
  const place = await getPlace(c.req.param("id"), zoneId);
  if (!place) return fail(c, 404, "NOT_FOUND", "Place not found");
  return ok(c, place);
});

placesRoutes.post("/", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = placeInputSchema.parse(await c.req.json());
  const place = await createPlace(body, body.zoneId ?? null);
  return ok(c, place, 201);
});

placesRoutes.patch("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = placeInputSchema.partial().parse(await c.req.json());
  const zoneId = c.req.query("zoneId") ?? null;
  const place = await updatePlace(c.req.param("id"), body, zoneId);
  return ok(c, place);
});

placesRoutes.delete("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const zoneId = c.req.query("zoneId") ?? null;
  await deletePlace(c.req.param("id"), zoneId);
  return ok(c, { deleted: true });
});

placesRoutes.post("/:id/duplicate", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const zoneId = c.req.query("zoneId") ?? null;
  const place = await duplicatePlace(c.req.param("id"), zoneId);
  if (!place) return fail(c, 404, "NOT_FOUND", "Place not found");
  return ok(c, place, 201);
});

placesRoutes.post("/import", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;

  const body = placeImportSchema.parse(await c.req.json());
  const results: Array<{ status: string; id?: string; reason?: string }> = [];

  for (const item of body.items) {
    const place = placeInputSchema.parse({
      ...item,
      categoryId: body.categoryId,
      zoneId: item.zoneId ?? body.zoneId,
    });
    const created = await createPlace(place, place.zoneId ?? body.zoneId ?? null);
    results.push({ status: "created", id: created?.id });
  }

  return ok(c, { results });
});
