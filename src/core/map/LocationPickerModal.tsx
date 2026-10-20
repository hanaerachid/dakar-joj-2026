import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

// Quick default marker fix for bundlers (Vite/CRA) that don't auto-load Leaflet images
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type LocationPickerHandle = {
  useLocation: () => Promise<void>;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number, address?: string) => void;
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

// Sub-component to pan map view when coordinates change programmatically
function MapUpdater({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

// Standalone API utility functions outside component render cycle
async function geocode(
  query: string,
  signal: AbortSignal
): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    countrycodes: "sn",
    format: "jsonv2",
    limit: "6",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      signal,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  return response.json();
}

async function reverseGeocode(lat: number, lon: number): Promise<string | undefined> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.display_name as string | undefined;
  } catch {
    return undefined;
  }
}

const LocationPickerModal = forwardRef<LocationPickerHandle, Props>(function LocationPickerModal(
  { isOpen, onClose, onSelect, initialLat, initialLng },
  ref
) {
  const DEFAULT = useMemo(() => ({ lat: 14.6928, lng: -17.4467, zoom: 13 }), []);
  const [lat, setLat] = useState<number>(initialLat ?? DEFAULT.lat);
  const [lng, setLng] = useState<number>(initialLng ?? DEFAULT.lng);
  const [zoom] = useState<number>(DEFAULT.zoom);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pickedAddress, setPickedAddress] = useState<string | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // reset when opened
    setLat(initialLat ?? DEFAULT.lat);
    setLng(initialLng ?? DEFAULT.lng);
    setQuery("");
    setResults([]);
    setPickedAddress(undefined);
  }, [isOpen, initialLat, initialLng, DEFAULT]);

  // Debounced geocoding effect with AbortController
  useEffect(() => {
    const searchQuery = query.trim();

    if (searchQuery.length < 3) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    setOpen(true);

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      try {
        const locations = await geocode(searchQuery, controller.signal);
        if (!controller.signal.aborted) {
          setResults(locations);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Location search failed:", error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback((location: SearchResult) => {
    const newLat = Number(location.lat);
    const newLng = Number(location.lon);
    setLat(newLat);
    setLng(newLng);
    setPickedAddress(location.display_name);
    setQuery(location.display_name);
    setResults([]);
    setLoading(false);
    setOpen(false);
  }, []);

  const setPos = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setPickedAddress(undefined);
  }, []);

  const handleUseThisLocation = useCallback(async () => {
    // try to get a readable address
    const addr = pickedAddress ?? (await reverseGeocode(lat, lng));
    onSelect(lat, lng, addr);
    onClose();
  }, [lat, lng, pickedAddress, onClose, onSelect]);

  useImperativeHandle(
    ref,
    () => ({
      useLocation: handleUseThisLocation,
    }),
    [handleUseThisLocation]
  );

  if (!isOpen) return null;

  const showPopover = open && query.trim().length >= 3;

  return (
      <div className="w-full overflow-hidden">
      {/* Search */}
      <div className="pb-2 w-full">
        <Popover open={showPopover} onOpenChange={setOpen}>
          <PopoverTrigger render={<div className="w-full" />}>
        <InputGroup>
          <InputGroupInput
                ref={inputRef}
                className="text-md sm:text-sm"
            type="search"
            placeholder="Search in Senegal (stadium, address, landmark)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 3) setOpen(true);
            }}
            autoComplete="off"
            aria-label="Search for a location in Senegal"
            aria-busy={loading}
            />
          <InputGroupAddon>
            {loading ? (
              <Spinner aria-label="Searching locations" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </InputGroupAddon>
        </InputGroup>

          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            className="w-[var(--anchor-width)] p-0"
          >
            <Command shouldFilter={false}>
              <CommandList className="max-h-64">
                {loading ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground" role="status">
                    Searching locations…
                  </div>
                ) : results.length === 0 ? (
                  <CommandEmpty>No locations found.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Locations">
                    {results.map((location) => (
                      <CommandItem
                        key={`${location.lat}-${location.lon}`}
                        value={location.display_name}
                        onSelect={() => handleSelect(location)}
                        className="cursor-pointer"
                      >
                        <span className="line-clamp-2">{location.display_name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
              <MapUpdater lat={lat} lng={lng} zoom={zoom} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            <ClickHandler setPos={setPos} />
            <LocateButton setPos={setPos} />
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

function LocateButton({ setPos }: { setPos: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);

    map.locate({ setView: true, maxZoom: 16 });

    map.once("locationfound", (e) => {
      setPos(e.latlng.lat, e.latlng.lng);
      setLocating(false);
    });

    map.once("locationerror", (err) => {
      alert("Could not access your location: " + err.message);
      setLocating(false);
    });
  };

  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-9 w-9"
        onClick={handleLocate}
        disabled={locating}
        title="Find my location"
      >
        {locating ? (
          <Spinner />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}