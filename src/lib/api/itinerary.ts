// lib/api/itinerary.ts

import { apiRequest } from "../apiClient";

export interface ItineraryRequest {
  coordinates: [number, number][];
  profile: "driving-car" | "cycling-regular" | "foot-walking";
  format: "json";
}

export interface ItineraryResponse {
  routes: Array<{
    summary: {
      duration: number;
      distance: number;
    };
  }>;
}

export async function getItinerary(
  payload: ItineraryRequest
): Promise<ItineraryResponse> {
  const response = await apiRequest<{
    success: true;
    data: ItineraryResponse;
  }>("/api/v2/itinerary", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
}
