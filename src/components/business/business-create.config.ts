import { type LucideComponent, Car, Hotel, House, Palette, ShoppingBag, Utensils } from "lucide-react";
import { PRICING_PLANS } from "../pricing/pricingplans.config";

export type FieldOption = {
  label: string;
  value: string;
};

export type BaseField = {
  name: string;
  type?: "text" | "number" | "select" | "multi";
  label: string;
  unit?: string;
};

export type OptionsField = BaseField & {
  type: 'multi' | 'select';
  options?: FieldOption[];
}

export type CategoryField = BaseField | OptionsField;

export type BusinessCat = {
  icon: typeof LucideComponent;
  label: string;
  fields: CategoryField[];
};

export type BusinessCategories = Record<string, BusinessCat>;

export const BUSINESS_CATEGORIES: BusinessCategories = {
  hotel: {
    icon: Hotel,
    label: "Hotel",
    fields: [
      { name: "chambres", type: "number", label: "Number of rooms" },
      { name: "pricePerNight", type: "number", label: "Price per night", unit: "FCFA" },
      { name: "capacity", type: "number", label: "Guest capacity" },
      {
        name: "equip",
        type: "multi",
        label: "Amenities",
        options: [
          { label: "Wifi", value: "wifi" },
          { label: "Climatisation", value: "climatisation" },
          { label: "Piscine", value: "piscine" },
          { label: "Petit-déjeuner", value: "petit_dejeuner" },
          { label: "Parking", value: "parking" },
          { label: "Navette", value: "navette" },
          { label: "Restaurant", value: "restaurant" },
        ],
      },
    ],
  },

  appart: {
    icon: House,
    label: "Furnished apartment",
    fields: [
      { name: "pieces", type: "number", label: "Number of rooms" },
      { name: "pricePerNight", type: "number", label: "Price per night" },
      { name: "capacity", type: "number", label: "Sleeping capacity" },
      {
        name: "equip",
        type: "multi",
        label: "Amenities",
        options: [
          { label: "Wifi", value: "wifi" },
          { label: "Climatisation", value: "climatisation" },
          { label: "Cuisine équipée", value: "cuisine_equipee" },
          { label: "Machine à laver", value: "machine_a_laver" },
          { label: "Parking", value: "parking" },
          { label: "Ascenseur", value: "ascenseur" },
        ],
      },
    ],
  },

  resto: {
    icon: Utensils,
    label: "Restaurant",
    fields: [
      {
        name: "cuisine",
        type: "select",
        label: "Cuisine type",
        options: [
          { label: "Sénégalaise", value: "senegalaise" },
          { label: "Africaine", value: "africaine" },
          { label: "Fruits de mer", value: "fruits_de_mer" },
          { label: "Italienne", value: "italienne" },
          { label: "Libanaise", value: "libanaise" },
          { label: "Fusion", value: "fusion" },
          { label: "Fast-food", value: "fast_food" }
        ],
      },
      { name: "averagePrice", type: "number", label: "Average price per cover" },
      {
        name: "options",
        type: "multi",
        label: "Services",
        options: [
          { value: "terrasse", label: "Terrasse" },
          { value: "livraison", label: "Livraison" },
          { value: "reservation", label: "Réservation" },
          { value: "halal", label: "Halal" },
          { value: "vue_mer", label: "Vue mer" },
          { value: "bar", label: "Bar" },
        ],
      },
    ],
  },

  concess: {
    icon: Car,
    label: "Car rental / dealership",
    fields: [
      {
        name: "service",
        type: "select",
        label: "Service",
        options: [
          { label: "Location", value: "location" },
          { label: "Vente", value: "vente" },
          { label: "Location & Vente", value: "location_et_vente" },
        ],
      },
      { name: "brands", type: "text", label: "Brands offered" },
      { name: "dailyPrice", type: "number", label: "Price per day" },
      {
        name: "options",
        type: "multi",
        label: "Options",
        options: [
          { label: "Avec chauffeur", value: "avec_chauffeur" },
          { label: "4x4 disponibles", value: "quatre_x_quatre_disponibles" },
          { label: "Transfert aéroport", value: "transfert_aeroport" },
          { label: "Assurance incluse", value: "assurance_incluse" },
        ],
      },
    ],
  },

  boutique: {
    icon: ShoppingBag,
    label: "Shop",
    fields: [
      { name: "produits", type: "text", label: "Product types" },
      {
        name: "gamme",
        type: "select",
        label: "Price range",
        options: [
          { label: "€ Abordable", value: "abordable" },
          { label: "€€ Milieu de gamme", value: "milieu_de_gamme" },
          { label: "€€€ Premium", value: "premium" },
        ],
      },
      {
        name: "options",
        type: "multi",
        label: "Services",
        options: [
          { label: "Paiement mobile", value: "paiement_mobile" },
          { label: "Livraison", value: "livraison" },
          { label: "Sur-mesure", value: "sur_mesure" },
          { label: "Détaxe touristes", value: "detaxe_touristes" },
        ],
      },
    ],
  },

  galerie: {
    icon: Palette,
    label: "Gallery / Museum",
    fields: [
      { name: "expoType", type: "text", label: "Exhibition types" },
      { name: "entryFees", type: "number", label: "Entry price" },
      { name: "days", type: "text", label: "Opening days" },
    ],
  },
} as const;

export type BusinessCategory = keyof typeof BUSINESS_CATEGORIES;

export const BUSINESS_PLANS = PRICING_PLANS;

export type BusinessPlan = keyof typeof BUSINESS_PLANS;

export const FORM_STEPS = [
  "type",
  "identity",
  "details",
  "media",
  "review",
] as const;