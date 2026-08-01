import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { env } from "./config/env";
import { authRoutes } from "./features/auth/auth.routes";
import { zonesRoutes } from "./features/zones/zones.routes";
import { placesRoutes } from "./features/places/places.routes";
import { uploadRoutes } from "./features/uploads/upload.routes";
import { fail } from "./http/response";
import { HttpError } from "./http/errors";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGIN.split(",").map((value) => value.trim()),
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  await next();
});

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return fail(c, err.status, err.code, err.message, err.details);
  }

  console.error(err);
  return fail(c, 500, "INTERNAL_SERVER_ERROR", "Unexpected server error");
});

app.get("/api/v1/health", (c) => c.json({ success: true, data: { ok: true } }));

app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/zones", zonesRoutes);
app.route("/api/v1/places", placesRoutes);
app.route("/api/v1/uploads", uploadRoutes);

app.get("/api/v1/openapi.json", (c) =>
  c.json({
    openapi: "3.0.3",
    info: { title: "Dakar YOG API", version: "1.0.0" },
    paths: {
      "/api/v1/health": { get: { summary: "Health check" } },
      "/api/v1/auth/me": { get: { summary: "Current session" } },
      "/api/v1/auth/login": { post: { summary: "Login" } },
      "/api/v1/auth/register": { post: { summary: "Register" } },
      "/api/v1/auth/logout": { post: { summary: "Logout" } },
      "/api/v1/auth/reset-password": { post: { summary: "Reset password" } },
      "/api/v1/zones": { get: { summary: "List zones" } },
      "/api/v1/places": { get: { summary: "List places" }, post: { summary: "Create place" } },
      "/api/v1/places/{id}": { get: { summary: "Get place" }, patch: { summary: "Update place" }, delete: { summary: "Delete place" } },
      "/api/v1/places/{id}/duplicate": { post: { summary: "Duplicate place" } },
      "/api/v1/places/import": { post: { summary: "Import places" } },
      "/api/v1/uploads/image": { post: { summary: "Upload image" } },
    },
  }),
);

app.get("/api/v1/docs", swaggerUI({ url: "/api/v1/openapi.json" }));

serve({ fetch: app.fetch, port: env.PORT });

console.log(`Hono API listening on http://localhost:${env.PORT}`);
