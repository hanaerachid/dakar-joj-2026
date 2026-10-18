import {
  AppWindow,
  Award,
  BadgeCheck,
  BarChart3,
  Building2,
  ChartNoAxesCombined,
  CheckCircle,
  Clock,
  Crown,
  FileText,
  Globe,
  Image,
  MapPin,
  Megaphone,
  Phone,
  Star,
  Store,
  Target,
  TrendingUp,
  Video
} from "lucide-react";

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
    color: "var(--accent-color-4)",
    recommended: false,
    features: [
      {
        title: "Fiche d'établissement",
        icon: Building2,
        description: "Nom et catégorie de votre établissement",
      },
      {
        title: "Position sur la carte",
        icon: MapPin,
        description: "Localisez votre établissement sur la carte",
      },
      {
        title: "1 photo",
        icon: Image,
        description: "Ajoutez une photo à votre fiche",
      },
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
  starter: {
    label: "Starter",
    desc: "Petites entreprises",
    icon: CheckCircle,
    color: "var(--accent-color-2)",
    recommended: false,
    features: [
      {
        title: "Téléphone, Email et WhatsApp",
        icon: Phone,
        description: "Facilitez le contact avec vos clients",
      },
      {
        title: "Horaire et itinéraire",
        icon: Clock,
        description: "Affichez vos horaires et indiquez comment vous trouver",
      },
      {
        title: "Description de l'établissement",
        icon: FileText,
        description: "Présentez votre activité et vos services",
      },
      {
        title: "Jusqu'à 3 photos",
        icon: Image,
        description: "Mettez en valeur votre établissement",
      },
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
      {
        title: "5 photos et 1 vidéo",
        icon: Video,
        description: "Enrichissez votre fiche avec du contenu visuel",
      },
      {
        title: "Site web et réseaux sociaux",
        icon: Globe,
        description: "Redirigez vos visiteurs vers vos plateformes",
      },
      {
        title: "Priorité dans votre catégorie",
        icon: Star,
        description: "Améliorez votre visibilité dans les résultats",
      },
      {
        title: "Statistiques de visibilité",
        icon: BarChart3,
        description: "Suivez les performances de votre fiche",
      },
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
      {
        title: "Jusqu'à 5 établissements",
        icon: Store,
        description: "Gérez plusieurs établissements depuis un seul compte",
      },
      {
        title: "10 photos et 2 vidéos",
        icon: Image,
        description: "Présentez vos établissements en détail",
      },
      {
        title: "Mise en avant sur la carte et l'accueil",
        icon: TrendingUp,
        description: "Bénéficiez d'une visibilité renforcée",
      },
      {
        title: "Badge Premium et statistiques avancées",
        icon: BadgeCheck,
        description: "Affichez votre statut Premium et analysez vos résultats",
      },
    ],
    limitations: [
    ],
    price: 10_000,
    old_price: 15_000,
    offer_deadline: "2026-12-31T23:59:59Z",
    photos: 10,
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
    desc: "Chaque visiteur qui cherche un lieu, un événement ou un itinéraire voit votre marque. Une visibilité locale, ciblée et mesurable.",
    icon: Award,
    color: "var(--accent-color-2)",
    recommended: false,
    features: [
      {
        title: "Bannière sur la carte",
        icon: Megaphone,
        description: "Mettez votre marque en avant sur la carte",
      },
      {
        title: "Logo en page d'accueil",
        icon: AppWindow,
        description: "Renforcez votre présence dès la page d'accueil",
      },
      {
        title: "Campagne sur mesure",
        icon: Target,
        description: "Profitez d'une campagne adaptée à vos objectifs",
      },
      {
        title: "Résultats mesurés",
        icon: ChartNoAxesCombined,
        description: "Mesurez l'impact de votre campagne publicitaire",
      },
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
