// src/core/layers/competitionSites.ts
import { Map as MapboxMap } from "mapbox-gl";
import { addOrSetSource } from "../map/utils";
import { selectPlace } from "../../components/place-selection";
import {
  getZonesForCategory,
  getZoneFeatureCollection,
} from "../../data/firestore/firestorePlaces";

type LayerClickEvent = mapboxgl.MapMouseEvent & {
  features?: Array<
    GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>
  >;
};

export async function addCompetitionSitesLayer(map: MapboxMap) {
  const zones = await getZonesForCategory("competition");

  for (const z of zones) {
    const zoneId = z.file.replace("firestore://", "");
    const sourceId = `comp-${z.name.toLowerCase()}-sites`;
    const layerId = `${sourceId}-points`;

    const { fc, color } = await getZoneFeatureCollection(zoneId);
    if (!fc.features.length) continue;

    addOrSetSource(map, sourceId, fc);

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "coalesce",
            ["get", "pointColor"],
            z.color || color || "#3b82f6",
            "#3b82f6",
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      });

      map.on("click", layerId, (e: LayerClickEvent) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;

        const coords = feature.geometry.coordinates as [number, number];
        const props = (feature.properties || {}) as Record<string, any>;

        const title =
          (props["title"] as string) ||
          (props["Name"] as string) ||
          (props["Nom"] as string) ||
          "Unknown Venue";
        const id = props["id"] || props["docId"] || props["placeId"];
        if (typeof id !== "string") return;

        selectPlace({ id, lng: coords[0], lat: coords[1], title });
        map.easeTo({ center: coords, zoom: Math.max(map.getZoom(), 15) });
      });

      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    } else {
      addOrSetSource(map, sourceId, fc);
    }
  }
}
