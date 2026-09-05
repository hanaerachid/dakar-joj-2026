import type { CategoryConfig } from "./PlacesList";

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "competition",
    label: "Competition Sites",
    sources: []
  },
  {
    id: "hotels",
    label: "Hotels",
    sources: []
  },
  {
    id: "restaurants",
    label: "Restaurants",
    sources: []
  },
  {
    id: "artworks",
    label: "Artworks",
    sources: []
  },
  {
    id: "hospitals",
    label: "Hospitals",
    sources: []
  },
  {
    id: "transport",
    label: "Transportation",
    sources: [] 
  },
  {
    id: "police",
    label: "Police",
    sources: []
  },
  {
    id: "attraction",
    label: "Attraction",
    sources: [],
    hint: "Attraction places will appear here soon.",
  },
  {
    id: "castle",
    label: "Castle",
    sources: [],
    hint: "Castle locations will be listed here.",
  },
  {
    id: "church",
    label: "Church",
    sources: [],
    hint: "Church locations will be listed here.",
  },
  {
    id: "gallery",
    label: "Gallery",
    sources: [],
    hint: "Gallery locations will be listed here.",
  },
  {
    id: "memorial",
    label: "Memorial",
    sources: [],
    hint: "Memorial locations will be listed here.",
  },
  {
    id: "monument",
    label: "Monument",
    sources: [],
    hint: "Monument locations will be listed here.",
  },
  {
    id: "mosque",
    label: "Mosque",
    sources: [],
    hint: "Mosque locations will be listed here.",
  },
  {
    id: "museum",
    label: "Museum",
    sources: [],
    hint: "Museum locations will be listed here.",
  },
  {
    id: "viewpoints",
    label: "Viewpoints",
    sources: [],
    hint: "Viewpoints locations will be listed here.",
  },
  {
    id: "zoo",
    label: "Zoo",
    sources: [],
    hint: "Zoo locations will be listed here.",
  },
  {
    id: "bank",
    label: "Bank",
    sources: [],
    hint: "Bank locations will be listed here.",
  },
  {
    id: "atm",
    label: "ATM",
    sources: [],
    hint: "ATM locations will be listed here.",
  },
  {
    id: "firestation",
    label: "Fire Station",
    sources: [],
    hint: "Fire station locations will be listed here.",
  },
  {
    id: "embassy",
    label: "Embassy",
    sources: [],
    hint: "Embassy locations will be listed here.",
  },
  {
    id: "consulate",
    label: "Consulate",
    sources: [],
    hint: "Consulate locations will be listed here.",
  },
  {
    id: "airport",
    label: "Airport",
    sources: [],
    hint: "Airport locations will be listed here.",
  },
  {
    id: "bus",
    label: "Bus Station",
    sources: [],
    hint: "Bus Station locations will be listed here.",
  },
  {
    id: "ferry",
    label: "Ferry",
    sources: [],
    hint: "Ferry locations will be listed here.",
  },
  {
    id: "railway",
    label: "Railway",
    sources: [],
    hint: "Railway locations will be listed here.",
  },
];

export const MAIN_CATEGORIES = [
  { id: "sports", label: "Sports", categories: ["competition"] },
  { id: "housing", label: "Housing", categories: ["hotels"] },
  { id: "food_and_drink", label: "Food & Drink", categories: ["restaurants"] },
  { id: "mobility", label: "Mobility", categories: ["transport", "airport", "bus", "ferry", "railway"] },
  { id: "shopping_and_crafts", label: "Shopping & Crafts", categories: [] },
  { id: "culture_and_heritage", label: "Culture & Heritage", categories: ["artworks", "attraction", "castle", "gallery", "memorial", "monument", "museum", "viewpoints", "zoo"] },
  { id: "health", label: "Health", categories: ["hospitals"] },
  { id: "security", label: "Security", categories: ["police"] },
  { id: "services", label: "Services", categories: ["bank", "atm", "firestation", "embassy", "consulate"] },
  { id: "religion", label: "Religion", categories: ["church", "mosque"] },
  { id: "other", label: "Other", categories: ["other"] },
] as const;
