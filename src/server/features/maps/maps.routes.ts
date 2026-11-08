import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import { requireAdmin } from "../../middleware/auth.js";
import { mapProductInputSchema } from "../../../shared/contracts.js";
import {
  createMapProduct,
  deleteMapProduct,
  getMapProduct,
  listMapProducts,
  updateMapProduct,
} from "./maps.service.js";

export const mapsRoutes = new Hono();

mapsRoutes.get("/", async (c) =>
  ok(c, await listMapProducts(c.get("user")?.role === "admin")),
);

mapsRoutes.get("/:id", async (c) => {
  const product = await getMapProduct(c.req.param("id"), c.get("user")?.role === "admin");
  return product ? ok(c, product) : fail(c, 404, "NOT_FOUND", "Map product not found");
});

mapsRoutes.post("/", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const product = await createMapProduct(mapProductInputSchema.parse(await c.req.json()));
  return ok(c, product, 201);
});

mapsRoutes.patch("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const product = await updateMapProduct(
    c.req.param("id"),
    mapProductInputSchema.partial().parse(await c.req.json()),
  );
  return product ? ok(c, product) : fail(c, 404, "NOT_FOUND", "Map product not found");
});

mapsRoutes.delete("/:id", async (c) => {
  const denied = requireAdmin(c);
  if (denied) return denied;
  const deleted = await deleteMapProduct(c.req.param("id"));
  return deleted
    ? ok(c, { deleted: true })
    : fail(c, 404, "NOT_FOUND", "Map product not found");
});
