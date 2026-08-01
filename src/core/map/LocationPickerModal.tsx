import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

// Quick default marker fix for bundlers (Vite/CRA) that don't auto-load Leaflet images
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address?: string) => void;

  /** Optional initial values (will default to Dakar/Senegal focus) */
  initialLat?: number;
  initialLng?: number;
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function ClickHandler({
  setPos,
}: {
  setPos: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      setPos(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialLat,
  initialLng,
}: Props) {
  // Senegal focus (Dakar-ish): 14.6928, -17.4467
  const DEFAULT = useMemo(() => ({ lat: 14.6928, lng: -17.4467, zoom: 6 }), []);
  const [lat, setLat] = useState<number>(initialLat ?? DEFAULT.lat);
  const [lng, setLng] = useState<number>(initialLng ?? DEFAULT.lng);
  const [zoom] = useState<number>(DEFAULT.zoom);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickedAddress, setPickedAddress] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isOpen) return;
    // reset when opened
    setLat(initialLat ?? DEFAULT.lat);
    setLng(initialLng ?? DEFAULT.lng);
    setQuery("");
    setResults([]);
    setPickedAddress(undefined);
  }, [isOpen, initialLat, initialLng, DEFAULT.lat, DEFAULT.lng]);

  async function geocode(q: string) {
    if (!q.trim()) return setResults([]);
    try {
      setLoading(true);
      // Bias search to Senegal (countrycodes=sn). You can adjust language/limit as needed.
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=sn&q=${encodeURIComponent(
        q.trim(),
      )}`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });
      const data = (await res.json()) as SearchResult[];
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function reverseGeocode(lat: number, lon: number) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.display_name as string | undefined;
    } catch {
      return undefined;
    }
  }

  async function handleUseThisLocation() {
    // try to get a readable address
    const addr = pickedAddress ?? (await reverseGeocode(lat, lng));
    onSelect(lat, lng, addr);
    onClose();
  }

  function setPos(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    setPickedAddress(undefined); // reset; will be derived on confirm
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative z-[101] w-full max-w-3xl overflow-hidden rounded-2xl bg-background/90 backdrop-blur-md shadow-2xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="text-base font-semibold text-foreground/90">
            Pick location on map
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="focus:outline-none focus:ring-2 focus:ring-zinc-300"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon />
          </Button>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="flex gap-2">
            <input
              className="h-10 w-full rounded-full bg-background/80 px-4 text-sm shadow-sm outline-none ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-zinc-300"
              placeholder="Search in Senegal (stadium, address, landmark)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") geocode(query);
              }}
            />
            <Button
              className="shrink-0 rounded-full px-4 text-sm h-10 shadow-sm transition"
              onClick={() => geocode(query)}
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-2 max-h-44 overflow-auto rounded-xl bg-background/90 backdrop-blur ring-1 ring-zinc-200 shadow-sm divide-y divide-zinc-100">
              {results.map((r, i) => {
                const latNum = parseFloat(r.lat);
                const lonNum = parseFloat(r.lon);
                return (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 text-sm"
                    onClick={() => {
                      setLat(latNum);
                      setLng(lonNum);
                      setPickedAddress(r.display_name);
                      setResults([]);
                    }}
                  >
                    {r.display_name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="px-5 pb-4">
          <div className="h-[420px] w-full overflow-hidden rounded-2xl ring-1 ring-zinc-200 shadow-sm">
            <MapContainer
              center={[lat, lng]}
              zoom={zoom}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler setPos={setPos} />
              <Marker
                position={[lat, lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const m = e.target as L.Marker;
                    const p = m.getLatLng();
                    setPos(p.lat, p.lng);
                  },
                }}
                icon={defaultIcon}
              />
            </MapContainer>
          </div>
          <div className="mt-3 text-xs text-foreground/70">
            Tip: Click on the map or drag the marker to fine-tune the position.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <Button
            variant="outline"
            className="rounded-full px-4 py-2 text-sm ring-1 ring-zinc-200"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="rounded-full px-4 py-2 text-sm shadow-sm"
            onClick={handleUseThisLocation}
          >
            Use this location
          </Button>
        </div>
      </div>
    </div>
  );
}
