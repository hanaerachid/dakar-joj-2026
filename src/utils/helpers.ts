import { HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/components/business/business-create.config";
import { PRICING_PLANS } from "@/components/pricing/pricingplans.config";

export function getCategoryIcon(
  key: string | undefined
): LucideIcon {
  if (!key || !(key in BUSINESS_CATEGORIES)) {
    return HelpCircle;
  }

  return BUSINESS_CATEGORIES[
    key as keyof typeof BUSINESS_CATEGORIES
  ].icon;
}

export function getPricingPlanInfo(key: string | undefined): {
  label: string;
  icon: LucideIcon;
} {
  if (!key || !(key in PRICING_PLANS)) {
    return {
      label: "Unknown",
      icon: HelpCircle,
    };
  }

  const plan =
    PRICING_PLANS[key as keyof typeof PRICING_PLANS];

  return {
    label: plan.label,
    icon: plan.icon,
  };
}
