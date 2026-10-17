import { apiRequest } from "../apiClient";
import type { Zone } from "../../shared/contracts";

export async function listZones(
  params: {
    categoryId?: string;
  }) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set("categoryId", params.categoryId);

  const response = await apiRequest<{ success: true; data: Zone[] }>(`/api/v1/zones?${query.toString()}`);

  return response.data;
}
