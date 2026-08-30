import { z } from "zod";

export const appRoleSchema = z
  .enum(["standard", "business", "admin", "user"])
  .transform((value) => (value === "user" ? "standard" : value));

export type AppRole = "standard" | "business" | "admin";

export const sessionUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable().optional(),
  displayName: z.string().nullable().optional(),
  photoURL: z.string().nullable().optional(),
  role: appRoleSchema.default("standard"),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const authCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRegisterSchema = authCredentialsSchema.extend({
  displayName: z.string().trim().min(1).max(120).optional(),
});

export const authResetSchema = z.object({
  email: z.string().email(),
});

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  categoryId: z.string(),
  createdAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime().nullable().optional(),
});

export type Zone = z.infer<typeof zoneSchema>;

export const geoPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const mainCategoryIdSchema = z.enum([
  "housing",
  "food_and_drink",
  "mobility",
  "shopping_and_crafts",
  "culture_and_heritage",
  "health",
  "security",
  "services",
  "religion",
  "other",
]);

export const placeSchema = z
  .object({
    id: z.string(),
    name: z.string().default("Untitled"),
    name_fr: z.string().nullable().optional(),
    nameFr: z.string().nullable().optional(),
    location: geoPointSchema.optional(),
    address: z.string().nullable().optional(),
    info: z.string().nullable().optional(),
    info_fr: z.string().nullable().optional(),
    infoFr: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
    tags: z.array(z.string()).default([]),
    pointColor: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    brandTitle: z.string().nullable().optional(),
    brandSubtitle: z.string().nullable().optional(),
    locationLabel: z.string().nullable().optional(),
    shortCode: z.string().nullable().optional(),
    gradientFrom: z.string().nullable().optional(),
    gradientTo: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    socialHandle: z.string().nullable().optional(),
    sportCount: z.number().default(0),
    sports: z.array(z.any()).default([]),
    categoryId: z.string().nullable().optional(),
    mainCategoryId: mainCategoryIdSchema.nullable().optional(),
    zoneId: z.string().nullable().optional(),
    zone: z.string().nullable().optional(),
    createdAt: z.string().datetime().nullable().optional(),
    updatedAt: z.string().datetime().nullable().optional(),
  })
  .passthrough();

export type Place = z.infer<typeof placeSchema>;

export const placeInputSchema = z
  .object({
    name: z.string().min(1),
    name_fr: z.string().nullable().optional(),
    nameFr: z.string().nullable().optional(),
    location: z
      .union([
        geoPointSchema,
        z.object({ lat: z.number(), lng: z.number() }),
      ])
      .optional(),
    address: z.string().nullable().optional(),
    info: z.string().nullable().optional(),
    info_fr: z.string().nullable().optional(),
    infoFr: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
    tags: z.array(z.string()).optional(),
    pointColor: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    brandTitle: z.string().nullable().optional(),
    brandSubtitle: z.string().nullable().optional(),
    locationLabel: z.string().nullable().optional(),
    shortCode: z.string().nullable().optional(),
    gradientFrom: z.string().nullable().optional(),
    gradientTo: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    socialHandle: z.string().nullable().optional(),
    sportCount: z.number().optional(),
    sports: z.array(z.any()).optional(),
    categoryId: z.string().optional(),
    mainCategoryId: mainCategoryIdSchema.optional(),
    zoneId: z.string().nullable().optional(),
    zone: z.string().nullable().optional(),
  })
  .passthrough();

export const placeImportSchema = z.object({
  categoryId: z.string().optional(),
  mainCategoryId: mainCategoryIdSchema.optional(),
  zoneId: z.string().nullable().optional(),
  scope: z.enum(["root", "zone", "all"]).default("zone"),
  items: z.array(placeInputSchema),
  skipDuplicates: z.boolean().default(true),
});

export const newsSchema = z
  .object({
    id: z.string().optional(),
    legacyFirestoreId: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    titleFr: z.string().nullable().optional(),
    titleEs: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    bodyFr: z.string().nullable().optional(),
    bodyEs: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    pinned: z.boolean().nullable().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
    createdAt: z.string().datetime().nullable().optional(),
    updatedAt: z.string().datetime().nullable().optional(),
  })
  .passthrough();

export const eventSchema = z
  .object({
    id: z.string().optional(),
    legacyFirestoreId: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    nameFr: z.string().nullable().optional(),
    day: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    sport: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    venueName: z.string().nullable().optional(),
    venueLocation: z.any().nullable().optional(),
    createdAt: z.string().datetime().nullable().optional(),
    updatedAt: z.string().datetime().nullable().optional(),
  })
  .passthrough();

export const torchSchema = z
  .object({
    id: z.string().optional(),
    legacyFirestoreId: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    location: z.any().nullable().optional(),
    startDate: z.string().datetime().nullable().optional(),
    endDate: z.string().datetime().nullable().optional(),
    publishedAt: z.string().datetime().nullable().optional(),
    createdAt: z.string().datetime().nullable().optional(),
    updatedAt: z.string().datetime().nullable().optional(),
  })
  .passthrough();

export const uploadResponseSchema = z.object({
  url: z.string().url(),
  path: z.string(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;