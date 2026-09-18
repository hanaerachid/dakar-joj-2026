import { apiRequest } from "../apiClient";

export async function listBusinessListings() {
  const response = await apiRequest<{ success: true; data: any }>(`/api/v2/business/listings`);
  return response.data;
}

export async function createBusinessListing(payload: Record<string, any>) {
  const response = await apiRequest<{ success: true; data: any }>(`/api/v2/business/listings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteBusinessListing(id: string | undefined) {
  return apiRequest<{ success: true; data: { deleted: true } }>(`/api/v2/business/listings/${id}`, {
    method: "DELETE",
  });
}
