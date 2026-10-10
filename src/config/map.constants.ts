import type { BasemapId } from "../core/map/types";

import {
  Asterisk,
  CarFront,
  Map,
  MoonStar,
  Mountain,
  Satellite,
  Sun,
  type LucideIcon
} from "lucide-react";

export const USE_DUMMY_LOCATION = false;
export const DUMMY_COORDS: [number, number] = [-17.45, 14.7];

export const LAYER_IDS = {
  routeLayer: "route-layer",
  routeSource: "route-source",
} as const;

export const BASEMAPS: {
  id: BasemapId;
  icon: string | LucideIcon;
  labelKey: string;
  descKey: string;
  // 👇 human fallback shown if i18n key missing
  labelFallback: string;
  descFallback: string;
}[] = [
    {
      id: "mapbox-streets",
      icon: Map,
      labelKey: "basemap.option.mapbox_streets.label",
      descKey: "basemap.option.mapbox_streets.desc",
      labelFallback: "Mapbox Streets",
      descFallback: "Default road map with labels.",
    },
    {
      id: "mapbox-outdoors",
      icon: Mountain,
      labelKey: "basemap.option.mapbox_outdoors.label",
      descKey: "basemap.option.mapbox_outdoors.desc",
      labelFallback: "Outdoors (Mapbox)",
      descFallback: "Terrain-focused map with trails and contours.",
    },
    {
      id: "mapbox-light",
      icon: Sun,
      labelKey: "basemap.option.mapbox_light.label",
      descKey: "basemap.option.mapbox_light.desc",
      labelFallback: "Light (Mapbox)",
      descFallback: "Clean, light basemap for data overlays.",
    },
    {
      id: "mapbox-dark",
      icon: MoonStar,
      labelKey: "basemap.option.mapbox_dark.label",
      descKey: "basemap.option.mapbox_dark.desc",
      labelFallback: "Dark (Mapbox)",
      descFallback: "Dark basemap that makes markers pop.",
    },
    {
      id: "mapbox-satellite",
      icon: Satellite,
      labelKey: "basemap.option.mapbox_satellite.label",
      descKey: "basemap.option.mapbox_satellite.desc",
      labelFallback: "Satellite (Mapbox)",
      descFallback: "Satellite imagery with road overlay.",
    },
    {
      id: "mapbox-navigation-day",
      icon: CarFront,
      labelKey: "basemap.option.mapbox_nav_day.label",
      descKey: "basemap.option.mapbox_nav_day.desc",
      labelFallback: "Navigation Day (Mapbox)",
      descFallback: "High-contrast day style optimized for driving.",
    },
    {
      id: "mapbox-navigation-night",
      icon: Asterisk,
      labelKey: "basemap.option.mapbox_nav_night.label",
      descKey: "basemap.option.mapbox_nav_night.desc",
      labelFallback: "Navigation Night (Mapbox)",
      descFallback: "Night style designed for in-car use.",
    },
  ];
