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
  | "verified"
  | "priority"
  | "pinned"
  | "featured"
  | "advancedAnalytics"
  | "dedicatedSupport";

export const PRICING_PLANS = {
  discover: {
    label: "Découverte",
    desc: "Pour commencer",
    icon: MapPin,
    color: "var(--accent-color-1)",
    recommended: false,
    features: [
      "Fiche d'établissement (nom, catégorie)",
      "Position sur la carte",
      "1 photo",
    ],
    limitations: [
    ],
    price: 0,
    old_price: 0,
    offer_deadline: "2026-11-13T23:59:59Z",
    photos: 1,
    videos: 0,
    listings: 1,
    capabilities: [] as const satisfies BusinessCapability[],
  },
  essential: {
    label: "Starter",
    desc: "Petites entreprises",
    icon: CheckCircle,
    color: "var(--accent-color-2)",
    recommended: false,
    features: [
      "Téléphone, Email et WhatsApp",
      "Horaire et itinéraire",
      "Description de l'établissement",
      "Jusqu'à 3 photos",
    ],
    limitations: [
    ],
    price: 2_500,
    old_price: 5_000,
    offer_deadline: "2026-11-13T23:59:59Z",
    photos: 3,
    videos: 0,
    listings: 1,
    capabilities: [
      "phone",
      "whatsapp",
      "email",
      "verified",
      "priority",
    ] as const satisfies BusinessCapability[],
  },
  business: {
    label: "Business",
    desc: "",
    icon: CheckCircle,
    color: "var(--accent-color-1)",
    recommended: true,
    features: [
      "5 photos et 1 vidéo",
      "Site web et réseaux sociaux",
      "Priorité dans votre catégorie",
      "Statistiques de visibilité",
    ],
    limitations: [
    ],
    price: 5_000,
    old_price: 10_000,
    offer_deadline: "2026-12-31T23:59:59Z",
    photos: 5,
    videos: 1,
    listings: 2,
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
  premium: {
    label: "Premium",
    desc: "Get the most out of your presence during the Games.",
    icon: Crown,
    color: "var(--accent-color-3)",
    recommended: false,
    features: [
      "Jusqu'à 5 etablissements",
      "Photos illimitées* et 2 vidéos",
      "Mis en avant sur la carte et l'accueil",
      "Badge Premium et statistiques avancées",
    ],
    limitations: [
    ],
    price: 10_000,
    old_price: 15_000,
    offer_deadline: "2026-12-31T23:59:59Z",
    photos: 99,
    videos: 2,
    listings: 5,
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
    color: "var(--accent-color-2)",
    recommended: false,
    features: [
      "All Premium features",
      "Banner ad under the map",
      "Featured on homepage",
      "Advanced analytics",
      "Dedicated support",
    ],
    price: Infinity,
    old_price: Infinity,
    offer_deadline: undefined,
    listings: 99,
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
      "advancedAnalytics",
      "dedicatedSupport",
    ] as const satisfies BusinessCapability[],
    limitations: []
  },
};

export type PricingPlan = keyof typeof PRICING_PLANS;
