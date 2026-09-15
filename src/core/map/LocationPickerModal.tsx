import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";

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

export type LocationPickerHandle = {
  useLocation: () => Promise<void>;
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

const LocationPickerModal = forwardRef<LocationPickerHandle, Props>(function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialLat,
  initialLng,
}, ref) {
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

  useImperativeHandle(ref, () => ({
    useLocation: handleUseThisLocation,
  }), [lat, lng, onClose, onSelect, pickedAddress]);

  function setPos(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    setPickedAddress(undefined); // reset; will be derived on confirm
  }

  if (!isOpen) return null;

  return (
      <div className="w-full overflow-hidden">
      {/* Search */}
      <div className="pb-2">
        <InputGroup>
          <InputGroupInput
            type="search"
            placeholder="Search in Senegal (stadium, address, landmark)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") geocode(query);
            }}
          />
          <InputGroupButton
            variant="default"
            onClick={() => geocode(query)}
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </InputGroupButton>
        </InputGroup>

        {results.length > 0 && (
          <ItemGroup
            className="mt-2 max-h-44 overflow-auto"
          >
            {results.map((r, i) => {
              const latNum = parseFloat(r.lat);
              const lonNum = parseFloat(r.lon);
              return (
                <Item
                  variant="outline"
                  className="cursor-pointer"
                  key={i}
                  onClick={() => {
                    setLat(latNum);
                    setLng(lonNum);
                    setPickedAddress(r.display_name);
                    setResults([]);
                  }}
                >
                  <ItemContent>
                    <ItemTitle>

                      {r.display_name}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </div>

        {/* Map */}
        <div className="pb-4">
          <div className="h-[420px] w-full overflow-hidden rounded-xl">
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
          <div className="mt-3 text-xs text-muted-foreground">
            Tip: Click on the map or drag the marker to fine-tune the position.
          </div>
        </div>

      </div>
  );
});

LocationPickerModal.displayName = "LocationPickerModal";

export default LocationPickerModal;
