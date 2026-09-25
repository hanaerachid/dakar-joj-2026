// utils/directions.ts

import { MapManager } from "../core/MapManager";

export type RouteStep = {
  instruction: string;
  location: [number, number];
  distance: number;
  duration: number;
  name?: string;
  maneuver?: {
    type?: string;
    modifier?: string;
    exit?: number;
  };
};

export type RouteDetails = {
  distance: number;
  duration: number;
  steps: RouteStep[];
};

export async function getDirections(
  origin: [number, number],
  destination: [number, number],
): Promise<RouteDetails | null> {
  try {
    const route = await MapManager.getInstance().showRouteToVenue(
      origin,
      destination,
    );

    return route ?? null;
  } catch (error) {
    console.error("Failed to calculate itinerary:", error);
    throw error;
  }
}