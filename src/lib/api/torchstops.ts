import { apiRequest } from "../apiClient";
import type { TorchStop } from "../../shared/contracts";

export async function listTorchStops() {
  const query = new URLSearchParams();
  const response = await apiRequest<{ success: true; data: TorchStop[] }>(`/api/v2/torch?${query.toString()}`);
  return response.data;
}

export async function deleteTorchStop(id: string) {
  return apiRequest<{ success: true; data: { deleted: true } }>(`/api/v2/torch/${id}`, {
    method: "DELETE",
  });
}
