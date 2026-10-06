import type { Feature, Point } from "geojson";
import type { BusinessListing } from "@/shared/contracts";

export type BusinessListingWithVerification = BusinessListing & { verified?: boolean };

export type BusinessListingFeature = Feature<Point, {
  id: string;
  title: string;
  categoryId: "business";
  businessListing: string;
}>;

export function isVerifiedBusinessListing(listing: BusinessListingWithVerification) {
  return listing.verified === true;
}

export function businessListingToFeature(
  listing: BusinessListingWithVerification,
): BusinessListingFeature | null {
  const [lng, lat] = listing.location.coordinates;
  if (!listing._id || !Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lng, lat] },
    properties: {
      id: listing._id,
      title: listing.name,
      categoryId: "business",
      businessListing: JSON.stringify(listing),
    },
  };
}
