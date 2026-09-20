import { PRICING_PLANS, type BusinessCapability, type PricingPlan } from "../pricing/pricingplans.config";
import type { BusinessCreateValues } from "./business-create.schema";

export function hasBusinessCapability(
  plan: PricingPlan,
  capability: BusinessCapability,
) {
  return (PRICING_PLANS[plan].capabilities as readonly BusinessCapability[]).includes(capability);
}

export function sanitizeBusinessValues(values: BusinessCreateValues) {
  const plan = PRICING_PLANS[values.pack as PricingPlan];
  const capabilities = new Set(plan.capabilities);

  return {
    ...values,
    email: capabilities.has("email") ? values.email ?? "" : "",
    website: capabilities.has("website") ? values.website ?? "" : "",
    social: capabilities.has("socialMedia") ? values.social ?? "" : "",
    wa: capabilities.has("whatsapp") ? values.wa ?? "" : "",
    photos: Number.isFinite(plan.photos)
      ? (values.photos ?? []).slice(0, plan.photos)
      : values.photos ?? [],
    videoFile: plan.video ? values.videoFile : undefined,
  };
}