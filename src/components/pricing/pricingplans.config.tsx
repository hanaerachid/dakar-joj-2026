import { Award, CheckCircle, Crown, MapPin } from "lucide-react";

export type BusinessCapability =
  | "email"
  | "website"
  | "socialMedia"
  | "whatsapp"
  | "booking"
  | "statistics"
  | "banner"
  | "sponsoredStory"
  | "verified"
  | "priority"
  | "pinned"
  | "featured"
  | "advancedAnalytics"
  | "dedicatedSupport";

export const PRICING_PLANS = {
  discover: {
    label: "Découverte",
    desc: "Être présent sur la carte des JOJ.",
    icon: MapPin,
    recommended: false,
    features: [
      "Fiche sur la carte Dakar 2026",
      "1 photo",
      "E-mail",
      "Position géolocalisée"
    ],
    price: 0,
    photos: 1,
    video: false,
    capabilities: ["email"] as const satisfies BusinessCapability[],
  },
  essential: {
    label: "Essentiel",
    desc: "A complete and verified listing for the entire campaign.",
    icon: CheckCircle,
    recommended: false,
    features: [
      "All Discover features",
      "Up to 5 photos",
      "Email, Website and social media",
      "Verified badge",
      "Priority in your category"
    ],
    price: 25_000,
    photos: 5,
    video: false,
    capabilities: [
      "email",
      "website",
      "socialMedia",
      "verified",
      "priority",
    ] as const satisfies BusinessCapability[],
  },
  premium: {
    label: "Premium",
    desc: "Get ahead and convert during the Games.",
    icon: Crown,
    recommended: true,
    features: [
      "All Essential features",
      "Unlimited photos",
      "Pinned at the top of the map",
      "WhatsApp / booking button",
      "View statistics",
      "Premium badge"
    ],
    price: 60_000,
    photos: 99,
    video: true,
    capabilities: [
      "email",
      "website",
      "socialMedia",
      "whatsapp",
      "booking",
      "statistics",
      "verified",
      "priority",
      "pinned",
    ] as const satisfies BusinessCapability[],
  },
  sponsor: {
    label: "Sponsor Officiel",
    desc: "The showcase under the map, seen by everyone.",
    icon: Award,
    recommended: false,
    features: [
      "All Premium features",
      "Banner ad under the map",
      "Featured on homepage",
      "Sponsored story",
      "Advanced analytics + dedicated support"
    ],
    price: 250_000,
    photos: 99,
    video: true,
    capabilities: [
      "email",
      "website",
      "socialMedia",
      "whatsapp",
      "booking",
      "statistics",
      "verified",
      "priority",
      "pinned",
      "banner",
      "featured",
      "sponsoredStory",
      "advancedAnalytics",
      "dedicatedSupport",
    ] as const satisfies BusinessCapability[],
  },
};

export type PricingPlan = keyof typeof PRICING_PLANS;
