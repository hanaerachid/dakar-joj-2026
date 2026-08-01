import { Hono } from "hono";
import { ok } from "../../http/response";
import { listZones } from "./zones.service";

export const zonesRoutes = new Hono();

zonesRoutes.get("/", async (c) => {
  const categoryId = c.req.query("categoryId") ?? "competition";
  const zones = await listZones(categoryId);
  return ok(c, zones);
});
