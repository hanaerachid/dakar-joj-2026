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
  location: z.object({coordinates: z.tuple([z.number(),z.number(),]).optional()}),
  desc: optionalText,
  openHours: optionalText,

  spec: businessSpecSchema.default({}),

  photos: z.array(z.instanceof(File)).default([]),
  videos: z.array(z.instanceof(File)).default([]),

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

  if (plan.videos < 99 && data.videos.length > plan.videos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["videos"],
      message: `This plan allows up to ${plan.videos} videos`,
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
  location: {
    coordinates: undefined,
  },
  desc: "",
  openHours: "",
  spec: {},
  photos: [],
  videos: [],
  pack: "discover",
  priceTag: "",
};