import { Hono } from "hono";
import { fail, ok } from "../../http/response.js";
import { getContentItem, listContentCollection } from "./content.service.js";

export const contentRoutes = new Hono();

const getList = async (c: any, collection: "news" | "events") => {
  const requestedStatus = c.req.query("status");
  const status = requestedStatus === "all" ? undefined : requestedStatus ?? "published";
  const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
  const items = await listContentCollection(collection, {
    status,
    limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit as number, 250)) : 100,
  });
  return ok(c, items);
};

contentRoutes.get("/news", async (c) => getList(c, "news"));
contentRoutes.get("/news/:id", async (c) => {
  const item = await getContentItem("news", c.req.param("id"));
  if (!item) return fail(c, 404, "NOT_FOUND", "News item not found");
  return ok(c, item);
});

contentRoutes.get("/events", async (c) => getList(c, "events"));
contentRoutes.get("/events/:id", async (c) => {
  const item = await getContentItem("events", c.req.param("id"));
  if (!item) return fail(c, 404, "NOT_FOUND", "Event not found");
  return ok(c, item);
});
