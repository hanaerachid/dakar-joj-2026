import { z } from "zod";
export const sessionUserSchema = z.object({
    uid: z.string(),
    email: z.string().email().nullable().optional(),
    displayName: z.string().nullable().optional(),
    photoURL: z.string().nullable().optional(),
    role: z.string().default("user"),
});
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
export const geoPointSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});
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
    zoneId: z.string().nullable().optional(),
    zone: z.string().nullable().optional(),
    createdAt: z.string().datetime().nullable().optional(),
    updatedAt: z.string().datetime().nullable().optional(),
})
    .passthrough();
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
    zoneId: z.string().nullable().optional(),
    zone: z.string().nullable().optional(),
})
    .passthrough();
export const placeImportSchema = z.object({
    categoryId: z.string(),
    zoneId: z.string().nullable().optional(),
    scope: z.enum(["root", "zone", "all"]).default("zone"),
    items: z.array(placeInputSchema),
    skipDuplicates: z.boolean().default(true),
});
export const uploadResponseSchema = z.object({
    url: z.string().url(),
    path: z.string(),
});
