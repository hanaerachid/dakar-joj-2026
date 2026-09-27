import { Hono } from "hono";
import { fail, ok } from "../../http/response.js";
import {
  getNewsItem,
  listNews
} from "./news.service.js";

export const newsRoutes = new Hono();

newsRoutes.get("/", async (c) => {
  const requestedStatus = c.req.query("status");

  const status = requestedStatus === "all" ? undefined : requestedStatus ?? "published";

  const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;

  const items = await listNews({
    status,
    limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit as number, 250)) : 100,
  });

  return ok(c, items);
});

newsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const item = await getNewsItem(id);

  if (!item) {
    return fail(c, 404, "NOT_FOUND", "News item not found");
  }

  return ok(c, item);
});
