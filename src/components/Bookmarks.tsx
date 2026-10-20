import { useTranslation } from "react-i18next";
import { AnimatedButton } from "./buttons/AnimatedButton";
import mapboxgl from "mapbox-gl";
import type { Zone } from "../shared/contracts";
import type { Polygon, Point, MultiPolygon } from "geojson";
import { Alert, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";

type BookmarksProps = {
  zones: Zone[];
  onZoomTo: (bounds: mapboxgl.LngLatBounds) => void;
} & {
  loading: boolean;
  error: string | null;
};

function getZoneBounds(
  geometry: Polygon | MultiPolygon | Point,
): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds();

  const extendRing = (ring: number[][]) => {
    ring.forEach(([lng, lat]) => {
      bounds.extend([lng, lat]);
    });
  };

  if (geometry.type === "Point") {
    bounds.extend([geometry.coordinates[0], geometry.coordinates[1]]);
    return bounds;
  }

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(extendRing);
  } else {
    geometry.coordinates.forEach((polygon) => {
      polygon.forEach(extendRing);
    });
  }
  console.log("Calculated bounds for zone:", bounds.toArray());
  return bounds;
}

export function Bookmarks({
  zones,
  onZoomTo,
  loading,
  error,
}: BookmarksProps) {
  const { t } = useTranslation();

  if (error) (
    <Alert variant="destructive">
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      {zones.map((zone) => (
        <AnimatedButton
          key={zone.id}
          title={zone.name}
          tooltip={t("actions.zoomto", {
            defaultValue: "Zoom to {{location}}",
            location: zone.name,
          })}
          tooltipSide="bottom"
          onClick={() => onZoomTo(getZoneBounds(zone.location))}
        >
          {/* {zone.location.type} */}
          {zone.name}
        </AnimatedButton>
      ))}

      {loading && <>
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            className="rounded-full h-10 w-32" />
        ))}
      </>}
    </div>
  );
}