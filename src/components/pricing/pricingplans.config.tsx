import { Award, CheckCircle, Crown, MapPin } from "lucide-react";

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
  },
  essential: {
    label: "Essentiel",
    desc: "A complete and verified listing for the entire campaign.",
    icon: CheckCircle,
    recommended: false,
    features: [
      "Up to 5 photos",
      "Description & opening hours",
      "Website + social media",
      "Verified badge",
      "Priority in your category"
    ],
    price: 25_000,
  },
  premium: {
    label: "Premium",
    desc: "Get ahead and convert during the Games.",
    icon: Crown,
    recommended: true,
    features: [
      "Unlimited photos + 1 video",
      "Pinned at the top of the map",
      "WhatsApp / booking button",
      "View statistics",
      "Premium badge"
    ],
    price: 60_000,
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
  },
};

export type PricingPlan = keyof typeof PRICING_PLANS;
