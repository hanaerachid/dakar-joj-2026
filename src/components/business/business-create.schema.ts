import { z } from "zod";
import { BUSINESS_PLANS } from "./business-create.config";

const optionalText = z.string().optional().default("");

const businessSpecSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
  ]),
);

export const businessCreateSchema = z.object({
  cat: z.enum([
    "hotel",
    "appart",
    "resto",
    "concess",
    "boutique",
    "galerie",
  ]),

  name: z.string().trim().min(1, "Name is required"),

  tel: optionalText,
  wa: optionalText,
  email: z.string().optional().default(""),
  website: optionalText,
  social: optionalText,

  address: optionalText,
  longitude: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  desc: optionalText,
  openHours: optionalText,

  spec: businessSpecSchema.default({}),

  photos: z.array(z.instanceof(File)).default([]),
  videoFile: z.instanceof(File).optional(),

  pack: z.enum([
    "discover",
    "essential",
    "premium",
    "sponsor",
  ]),

  priceTag: optionalText,
}).superRefine((data, ctx) => {

  const plan = BUSINESS_PLANS[data.pack];

  if (plan.photos < 99 && data.photos.length > plan.photos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["photos"],
      message: `This plan allows up to ${plan.photos} photos`,
    });
  }

  if (data.videoFile && !plan.video) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["videoFile"],
      message: "Video requires Premium or Sponsor",
    });
  }
});

export type BusinessCreateValues = z.infer<
  typeof businessCreateSchema
>;

export const defaultBusinessValues: BusinessCreateValues = {
  cat: "hotel",
  name: "",
  tel: "",
  wa: "",
  email: "",
  website: "",
  social: "",
  address: "",
  longitude: null,
  latitude: null,
  desc: "",
  openHours: "",
  spec: {},
  photos: [],
  pack: "discover",
  priceTag: "",
};