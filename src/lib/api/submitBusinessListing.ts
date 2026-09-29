import { apiRequest } from "../apiClient";
import type { BusinessListing } from "@/shared/contracts";

type ListingResponse = { success: true; data: BusinessListing };
type ListingListResponse = { success: true; data: BusinessListing[] };

export type BusinessListingQueryParams = {
  location?: string | readonly [number, number];
};

function withListingQuery(
  path: string,
  params?: BusinessListingQueryParams,
) {
  if (!params?.location) return path;

  const location =
    typeof params.location === "string"
      ? params.location
      : `${params.location[0]},${params.location[1]}`;
  const query = new URLSearchParams({ location });
  return `${path}?${query.toString()}`;
}

export async function listBusinessListings(params?: BusinessListingQueryParams) {
  const response = await apiRequest<ListingListResponse>(
    withListingQuery(`/api/v2/business/listings`, params),
  );
  return response.data;
}

export async function getBusinessListing(
  id: string,
  params?: BusinessListingQueryParams,
) {
  const response = await apiRequest<ListingResponse>(
    withListingQuery(`/api/v2/business/listings/${id}`, params),
  );
  return response.data;
}

export async function createBusinessListing(payload: Record<string, unknown>) {
  const response = await apiRequest<ListingResponse>(`/api/v2/business/listings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateBusinessListing(id: string | undefined, payload: unknown) {
  const response = await apiRequest<ListingResponse>(`/api/v2/business/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteBusinessListing(id: string | undefined) {
  return apiRequest<{ success: true; data: { deleted: true } }>(`/api/v2/business/listings/${id}`, {
    method: "DELETE",
  });
}

export async function setListingVerified(
  id: string,
  verified: boolean,
) {
  const response = await apiRequest<{ success: true; data: { deleted: true } }>(`/api/v2/business/listings/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ verified }),
  });
  return response.data;
}
