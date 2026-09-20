import { apiRequest } from "../apiClient";
import type { BusinessListing } from "@/shared/contracts";

type ListingResponse = { success: true; data: BusinessListing };
type ListingListResponse = { success: true; data: BusinessListing[] };

export async function listBusinessListings() {
  const response = await apiRequest<ListingListResponse>(`/api/v2/business/listings`);
  return response.data;
}

export async function getBusinessListing(id: string) {
  const response = await apiRequest<ListingResponse>(
    `/api/v2/business/listings/${id}`,
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
