import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";

// Default Leaflet marker icon
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 1. Allow latitude and longitude to be undefined in the type definition
type Props = {
  latitude: number | undefined;
  longitude: number | undefined;
  zoom?: number;
  height?: string;
};

// Update the map when coordinates or zoom change
function MapUpdater({
  latitude,
  longitude,
  zoom,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], zoom, {
      animate: false,
    });
  }, [map, latitude, longitude, zoom]);

  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  zoom = 21,
  height = "420px",
}: Props) {
  // Validate coordinates
  if (
    latitude === undefined ||
    longitude === undefined ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyDescription>
            Invalid latitude or longitude.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div
      className="w-full overflow-hidden z-50"
      style={{ height }}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{
          height: "100%",
          width: "100%"
        }}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater
          latitude={latitude}
          longitude={longitude}
          zoom={zoom}
        />

        <Marker
          position={[latitude, longitude]}
          icon={defaultIcon}
          interactive={false}
        />
      </MapContainer>
    </div>
  );
}