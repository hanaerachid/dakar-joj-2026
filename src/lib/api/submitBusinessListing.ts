import { apiRequest } from "../apiClient";

export async function createBusinessListing(payload: FormData) {
  const response = await apiRequest<{ success: true; data: any }>(`/api/business/listings`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}
