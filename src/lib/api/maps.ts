import type { MapProduct } from "../../shared/contracts";
import { apiRequest } from "../apiClient";

export async function listMapProducts() {
  const response = await apiRequest<{ success: true; data: MapProduct[] }>("/api/v2/maps");
  return response.data;
}
