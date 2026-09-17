import { apiRequest } from "../apiClient";

export async function createBusinessListing(payload: Record<string, any>) {
  const response = await apiRequest<{ success: true; data: any }>(`/api/v2/business/listings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}
