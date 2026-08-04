// src/components/search/GlobalPlacesTab.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapManager } from "../../core/MapManager";
import { MAPBOX_ACCESS_TOKEN } from "../../utils/mapConfig";
import { X, SearchIcon, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { Field, FieldDescription } from "@/components/ui/field";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "../ui/alert";

type MbFeature = {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
};

export function GlobalPlacesTab({
  query,
  onQueryChange,
  onPicked,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onPicked: () => void;
}) {
  const { t } = useTranslation();
  const [results, setResults] = useState<MbFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const placeholder = t("search.placeholder.global");
  const tipText = t("search.tip.global");

  const mgr = MapManager.getInstance();
  const map = mgr.getMap();
  const proximity = useMemo(() => {
    const c = map?.getCenter();
    return c ? `${c.lng},${c.lat}` : undefined;
  }, [map]);

  // Debounced search against Mapbox Geocoding API
  useEffect(() => {
    if (!query?.trim()) {
      setResults([]);
      setErr(null);
      return;
    }

    setLoading(true);
    setErr(null);

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query,
          )}.json`,
        );
        url.searchParams.set("access_token", MAPBOX_ACCESS_TOKEN);
        url.searchParams.set("autocomplete", "true");
        url.searchParams.set("limit", "8");
        url.searchParams.set("language", navigator.language || "en");
        // global search (no country filter); but bias near map center if we have one
        if (proximity) url.searchParams.set("proximity", proximity);
        // show mostly useful types; tweak as you wish
        url.searchParams.set(
          "types",
          "poi,address,place,locality,neighborhood",
        );

        const res = await fetch(url.toString(), { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults((data.features || []) as MbFeature[]);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setErr("Unable to search right now.");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(handle);
      abortRef.current?.abort();
    };
  }, [query, proximity]);

  const handlePick = (f: MbFeature) => {
    const center = f.center as [number, number];
    const m = map || mgr.getMap();
    if (center && m) {
      m.flyTo({ center, zoom: 14, speed: 1.2 });
    }
    onPicked(); // close modal (or advance flow)
  };

  return (
    <div className="space-y-3">
      {/* Input */}
      <Field className="py-2">
        <InputGroup className="flex items-center gap-2">
          <InputGroupAddon>
            <SearchIcon className="w-4 h-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoFocus
          />
          {!!query && (
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              onClick={() => onQueryChange("")}
              aria-label="Clear"
            >
              <X />
            </InputGroupButton>
          )}
        </InputGroup>
        {!query && (
          <FieldDescription>
            {tipText}
          </FieldDescription>
        )}
      </Field>

      {/* Results (inside modal) */}
      <div className="rounded-xl overflow-hidden">
        <div className="max-h-72 overflow-auto space-y-4 rounded-xl">
          {/* States */}

          {query && loading && (
            <div className="flex justify-center items-center gap-2 text-muted-foreground">
              <Spinner />
              <span className="text-sm">Searching…</span>
            </div>
          )}

          {query && !loading && err && (
            <Alert variant="destructive">
              <AlertDescription>
                {err}
              </AlertDescription>
            </Alert>
          )}

          {query && !loading && !err && results.length === 0 && (
            <Empty>
              <EmptyDescription className="text-sm text-muted-foreground">
                No results.
              </EmptyDescription>
            </Empty>
          )}
          {results.length > 0 && !loading && (
            <div className="space-y-1">
              {/* List */}
              {results.map((f) => (
                <Item
                  key={f.id}
                  variant="default"
                  size="xs"
                  onClick={() => handlePick(f)}
                  className="w-full hover:bg-background/50 cursor-pointer"
                >
                  <ItemMedia className="h-9 w-9 bg-muted-background">
                    <MapPin />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="text-sm font-medium truncate">
                      {f.text}
                    </ItemTitle>
                    <ItemDescription className="text-xs line-clamp-2">
                      {f.place_name}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </div>
          )}
        </div>

        {/* Mapbox credit (required by TOS) */}
        <div className="px-3 py-2 text-xs text-muted-foreground text-end">
          Powered by Mapbox
        </div>
      </div>
    </div>
  );
}
