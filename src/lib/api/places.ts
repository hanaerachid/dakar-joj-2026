import { apiRequest } from "../apiClient";
import type { Place, Zone } from "../../shared/contracts";

export async function listZones(categoryId: string) {
  const response = await apiRequest<{ success: true; data: Zone[] }>(
    `/api/v1/zones?categoryId=${encodeURIComponent(categoryId)}`,
  );
  return response.data;
}

export async function listPlaces(params: {
  categoryId?: string;
  zoneId?: string | null;
  scope?: "all" | "zone" | "root";
}) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.zoneId !== undefined && params.zoneId !== null) query.set("zoneId", params.zoneId);
  if (params.scope) query.set("scope", params.scope);
  const response = await apiRequest<{ success: true; data: Place[] }>(`/api/v1/places?${query.toString()}`);
  return response.data;
}

export async function getPlace(id: string, zoneId?: string | null) {
  const query = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
  const response = await apiRequest<{ success: true; data: Place }>(`/api/v1/places/${id}${query}`);
  return response.data;
}

export async function createPlace(payload: unknown) {
  const response = await apiRequest<{ success: true; data: Place }>("/api/v1/places", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updatePlace(id: string, payload: unknown, zoneId?: string | null) {
  const query = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
  const response = await apiRequest<{ success: true; data: Place }>(`/api/v1/places/${id}${query}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deletePlace(id: string, zoneId?: string | null) {
  const query = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
  return apiRequest<{ success: true; data: { deleted: true } }>(`/api/v1/places/${id}${query}`, {
    method: "DELETE",
  });
}

export async function duplicatePlace(id: string, zoneId?: string | null) {
  const query = zoneId ? `?zoneId=${encodeURIComponent(zoneId)}` : "";
  const response = await apiRequest<{ success: true; data: Place }>(`/api/v1/places/${id}/duplicate${query}`, {
    method: "POST",
  });
  return response.data;
}

export async function importPlaces(payload: unknown) {
  const response = await apiRequest<{ success: true; data: { results: Array<{ status: string; id?: string; reason?: string }> } }>(
    "/api/v1/places/import",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}
