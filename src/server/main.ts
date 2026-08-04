import "dotenv/config";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { env } from "./config/env";
import { authRoutes } from "./features/auth/auth.routes";
import { zonesRoutes } from "./features/zones/zones.routes";
import { placesRoutes } from "./features/places/places.routes";
import { uploadRoutes } from "./features/uploads/upload.routes";
import { fail } from "./http/response";
import { HttpError } from "./http/errors";
import { placeSchema, sessionUserSchema, zoneSchema } from "../shared/contracts";

const app = new OpenAPIHono();

const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

const importResultsSchema = z.object({
  results: z.array(
    z.object({
      status: z.string(),
      id: z.string().optional(),
      reason: z.string().optional(),
    }),
  ),
});

const loginSchema = z.object({
  email: z.string().email().openapi({
    example: "user@example.com",
    description: "User email address",
  }),
  password: z.string().min(1).openapi({
    example: "********",
    description: "User password",
  }),
});

const registerSchema = z.object({
  displayName: z.string().min(1).openapi({
    example: "John Doe",
  }),
  email: z.string().email().openapi({
    example: "user@example.com",
  }),
  password: z.string().min(8).openapi({
    example: "********",
  }),
});

const resetPasswordSchema = z.object({
  email: z.string().email().openapi({
    example: "user@example.com",
    description: "Email address associated with the account",
  }),
});

// const scopeSchema = z.enum(["all", "zone", "root"]);

const categoryIdSchema = z.enum([
  "competition",
  "training",
  "hotels",
  "restaurants",
  "artworks",
  "hospitals",
  "transport",
  "police",
  "attraction",
  "castle",
  "church",
  "gallery",
  "memorial",
  "monument",
  "mosque",
  "museum",
  "viewpoints",
  "zoo",
  "bank",
  "atm",
  "firestation",
  "embassy",
  "consulate",
  "airport",
  "bus",
  "ferry",
  "railway",
]);

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

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/api/v1/health",
  summary: "Health check",
  responses: {
    200: {
      description: "API health response",
      content: {
        "application/json": {
          schema: apiSuccessSchema(z.object({ ok: z.literal(true) })),
        },
      },
    },
  },
});

app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/zones", zonesRoutes);
app.route("/api/v1/places", placesRoutes);
app.route("/api/v1/uploads", uploadRoutes);

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/api/v1/auth/me",
  summary: "Current session",
  responses: {
    200: {
      description: "Current authenticated session or null",
      content: {
        "application/json": {
          schema: apiSuccessSchema(sessionUserSchema.nullable()),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/login",
  summary: "Login",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authenticated user",
      content: {
        "application/json": {
          schema: apiSuccessSchema(sessionUserSchema),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/register",
  summary: "Register",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created user",
      content: {
        "application/json": {
          schema: apiSuccessSchema(sessionUserSchema),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/logout",
  summary: "Logout",
  responses: {
    200: {
      description: "Logout confirmation",
      content: {
        "application/json": {
          schema: apiSuccessSchema(z.object({ success: z.literal(true) })),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/auth/reset-password",
  summary: "Reset password",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password reset confirmation",
      content: {
        "application/json": {
          schema: apiSuccessSchema(z.object({ sent: z.literal(true) })),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/api/v1/auth/verify",
  summary: "Verify session",
  responses: {
    200: {
      description: "Current authenticated session or null",
      content: {
        "application/json": {
          schema: apiSuccessSchema(sessionUserSchema.nullable()),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/api/v1/zones",
  summary: "List zones",
  responses: {
    200: {
      description: "Zones list",
      content: {
        "application/json": {
          schema: apiSuccessSchema(z.array(zoneSchema)),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/api/v1/places",
  summary: "List places",
  request: {
    query: z.object({
      // scope: scopeSchema.openapi({
      //   description: "Place scope",
      //   example: "all",
      // }),
      categoryId: categoryIdSchema.openapi({
        description: "Category ID",
        example: "competition",
      }),
    }),
  },
  responses: {
    200: {
      description: "Places list",
      content: {
        "application/json": {
          schema: apiSuccessSchema(z.array(placeSchema)),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "get",
  path: "/api/v1/places/{id}",
  summary: "Get place",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Place details",
      content: {
        "application/json": {
          schema: apiSuccessSchema(placeSchema),
        },
      },
    },
    404: {
      description: "Place not found",
      content: {
        "application/json": {
          schema: apiErrorSchema,
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/places",
  summary: "Create place",
  responses: {
    201: {
      description: "Created place",
      content: {
        "application/json": {
          schema: apiSuccessSchema(placeSchema),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "patch",
  path: "/api/v1/places/{id}",
  summary: "Update place",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Updated place",
      content: {
        "application/json": {
          schema: apiSuccessSchema(placeSchema),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "delete",
  path: "/api/v1/places/{id}",
  summary: "Delete place",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Deletion confirmation",
      content: {
        "application/json": {
          schema: apiSuccessSchema(z.object({ deleted: z.literal(true) })),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/places/{id}/duplicate",
  summary: "Duplicate place",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    201: {
      description: "Duplicated place",
      content: {
        "application/json": {
          schema: apiSuccessSchema(placeSchema),
        },
      },
    },
    404: {
      description: "Place not found",
      content: {
        "application/json": {
          schema: apiErrorSchema,
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/places/import",
  summary: "Import places",
  responses: {
    200: {
      description: "Import results",
      content: {
        "application/json": {
          schema: apiSuccessSchema(importResultsSchema),
        },
      },
    },
  },
});

app.openAPIRegistry.registerPath({
  method: "post",
  path: "/api/v1/uploads/image",
  summary: "Upload image",
  responses: {
    200: {
      description: "Uploaded image metadata",
      content: {
        "application/json": {
          schema: apiSuccessSchema(
            z.object({
              url: z.string().url(),
              path: z.string(),
              bucket: z.string(),
              production: z.boolean(),
            }),
          ),
        },
      },
    },
  },
});

app.doc("/api/v1/openapi.json", {
  openapi: "3.0.3",
  info: { title: "Dakar YOG API", version: "1.0.0" },
});

app.get("/api/v1/docs", swaggerUI({ url: "/api/v1/openapi.json" }));

serve({ fetch: app.fetch, port: env.PORT });

console.log(`Hono API listening on http://localhost:${env.PORT}`);
