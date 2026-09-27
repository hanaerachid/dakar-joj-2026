import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import { fetchUrlMetadata } from "./metadata.service.js";

export const metadataRoutes = new Hono();

metadataRoutes.get("/", async (c) => {
  const url = c.req.query("url");

  if (!url) {
    return fail(c, 400, "MISSING_URL", "Missing url parameter");
  }

  try {
    new URL(url);
  } catch {
    return fail(c, 400, "INVALID_URL", "Invalid URL");
  }

  try {
    const metadata = await fetchUrlMetadata(url);
    return ok(c, metadata);
  } catch (error) {
    console.error("Failed to fetch URL metadata:", error);
    return fail(c, 500, "SERVER_ERROR", "Server error");
  }
});
