import type { Offer } from "../../shared/contracts";
import { apiRequest } from "../apiClient";

export async function listOffers() {
  const response = await apiRequest<{ success: true; data: Offer[] }>("/api/v2/offers");
  return response.data;
}

export async function createOffer(payload: unknown) {
  const response = await apiRequest<{ success: true; data: Offer }>("/api/v2/offers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateOffer(id: string, payload: unknown) {
  const response = await apiRequest<{ success: true; data: Offer }>(
    `/api/v2/offers/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
  return response.data;
}

export async function deleteOffer(id: string) {
  return apiRequest<{ success: true; data: { deleted: true } }>(
    `/api/v2/offers/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
