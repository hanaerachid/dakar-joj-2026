import { Award, CheckCircle, Crown, MapPin } from "lucide-react";

export type BusinessCapability =
  | "email"
  | "phone"
  | "website"
  | "SNS"
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
      "1 listing",
      "Position géolocalisée"
    ],
    limitations: [
      "No photo",
      "No contact information"
    ],
    price: 0,
    photos: 0,
    videos: 0,
    capabilities: [] as const satisfies BusinessCapability[],
  },
  essential: {
    label: "Essentiel",
    desc: "A complete and verified listing for the entire campaign.",
    icon: CheckCircle,
    recommended: false,
    features: [
      "All Discover features",
      "Add 1 photo",
      "Display your email address",
      "Priority in your category"
    ],
    limitations: [
      "No phone number",
      "No website",
      "No social media handles",
      "No video"
    ],
    price: 5_000,
    photos: 1,
    videos: 0,
    capabilities: [
      "email",
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
      "3 listings",
      "Add your phone number",
      "Add your website",
      "Add your social media handles",
      "Unlimited photos",
      "2 videos",
      "Pinned at the top of the map",
      "View statistics",
      "Premium badge"
    ],
    limitations: [],
    price: 10_000,
    photos: 99,
    videos: 2,
    capabilities: [
      "email",
      "phone",
      "website",
      "SNS",
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
    videos: 99,
    capabilities: [
      "email",
      "phone",
      "website",
      "SNS",
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
    limitations: []
  },
};

export type PricingPlan = keyof typeof PRICING_PLANS;
