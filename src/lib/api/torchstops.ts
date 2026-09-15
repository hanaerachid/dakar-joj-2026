import { apiRequest } from "../apiClient";
import type { TorchStop } from "../../shared/contracts";

export async function listTorchStops() {
  const query = new URLSearchParams();
  const response = await apiRequest<{ success: true; data: TorchStop[] }>(`/api/v2/torch?${query.toString()}`);
  return response.data;
}

export async function getTorchStop(id: string | undefined) {
  const response = await apiRequest<{ success: true; data: TorchStop }>(`/api/v2/torch/${id}`);
  return response.data;
}

export async function createTorchStop(payload: {
  name: string;
  region: string;
  location: {
    type?: "Point";
    coordinates: [number, number];
  };
  tourDate: Date | string;
  metadata: {
    phase: string;
    description: string;
    isMajorStop?: boolean;
  };
}) {
  const response = await apiRequest<{ success: true; data: TorchStop }>(`/api/v2/torch`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function updateTorchStop(id: string | undefined, payload: unknown) {
  const response = await apiRequest<{ success: true; data: TorchStop }>(`/api/v2/torch/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function deleteTorchStop(id: string | undefined) {
  return apiRequest<{ success: true; data: { deleted: true } }>(`/api/v2/torch/${id}`, {
    method: "DELETE",
  });
}
