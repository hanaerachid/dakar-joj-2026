import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, Point, GeoJsonProperties } from "geojson";
import { useTranslation } from "react-i18next";
import { MapManager } from "../../core/MapManager";
import {
  getFeatureCollection,
} from "../../data/firestore/firestorePlaces";
import { getLocalizedCategory } from "../place-list/categoryTranslations";
import {
  getMainCategoryIcon,
  getMainCategoryColor
} from "../place-list/place-list-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item";
import { Empty, EmptyDescription } from "@/components/ui/empty";
// import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner";
import { useStateContext } from "../state-provider";
import { selectPlace } from "../place-selection";

// —— types & helpers ——
type VenueFeature = Feature<Point, GeoJsonProperties>;
type LoadedVenue = VenueFeature & {
  zoneColor?: string;
  __catId?: string;
  __catLabel?: string;
  __zone?: string;
};

let allPlacesPromise: ReturnType<typeof getFeatureCollection> | null = null;

function loadAllPlaces() {
  if (!allPlacesPromise) {
    allPlacesPromise = getFeatureCollection().catch((error) => {
      allPlacesPromise = null;
      throw error;
    });
  }
  return allPlacesPromise;
}

// —— component ——
export function LocalPlacesTab({
  title,
  query,
  // onQueryChange,
}: {
  title: string;
  query: string;
  // onQueryChange: (q: string) => void;
}) {
  const { t } = useTranslation();
  const { isSearchOpen } = useStateContext();
  const mapManager = MapManager.getInstance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);
  const [venues, setVenues] = useState<LoadedVenue[]>([]);
  // load once, first time this tab is shown
  useEffect(() => {
    if (!isSearchOpen) return;

    const search = query.trim();

    // Input is focused, but user hasn't typed anything yet.
    if (!search) {
      setVenues([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (dataLoadedRef.current) return;

    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const { fc } = await loadAllPlaces();

        if (cancelled) return;

        const features = (fc.features || []) as VenueFeature[];

        const all: LoadedVenue[] = features.map((f) => {
          const categoryId = f.properties?.categoryId;
          const zone = f.properties?.zone;

          return {
            ...f,
            properties: { ...f.properties },
            __catId:
              typeof categoryId === "string"
                ? categoryId
                : undefined,
            __zone:
              typeof zone === "string"
                ? zone
                : undefined,
          };
        });

        setVenues(all);
        dataLoadedRef.current = true;
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.message ?? t("local.error.loadPlaces")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [isSearchOpen, query, t]);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return venues;
    return venues.filter((v) => {
      const name =
        (v.properties?.Name as string) ||
        (v.properties?.title as string) ||
        (v.properties?.name as string) ||
        "";
      return (
        name.toLowerCase().includes(t) ||
        v.__zone?.toLowerCase().includes(t) ||
        v.__catId?.toLowerCase().includes(t)
      );
    });
  }, [query, venues]);

  const handleSelect = (v: LoadedVenue) => {
    const map = mapManager.getMap();
    if (!map) return;
    const [lng, lat] = v.geometry.coordinates;
    const title =
      (v.properties?.Name as string) ||
      (v.properties?.title as string) ||
      (v.properties?.name as string) ||
      t("local.untitled");
    const id = v.properties?.id;

    if (typeof id !== "string") return;

    selectPlace({ id, lng, lat, title });

    map.flyTo({ center: [lng, lat], zoom: 14, speed: 1.2 });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xs text-muted-foreground uppercase">
        {title}
      </h2>
      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
          <Spinner />
          <span>{t("local.loading")}</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      ) : filtered.length === 0 ? (
        <Empty>
          <EmptyDescription className="text-sm text-muted-foreground">
            {t("local.noMatches")}
          </EmptyDescription>
        </Empty>
      ) : (
        <ItemGroup className="overflow-y-auto">
          {filtered.map((v, index) => {
            const name =
              (v.properties?.Name as string) ||
              (v.properties?.title as string) ||
              (v.properties?.name as string) ||
              t("local.untitled");
            const mainCategory = v.properties?.mainCategoryId as string | undefined;
            const Icon = getMainCategoryIcon(mainCategory);
            const color = getMainCategoryColor(mainCategory);
            return (
              <Item key={index}
                variant="default"
                size="xs"
                onMouseDown={() => handleSelect(v)}
                className="hover:bg-primary/10 transition cursor-pointer"
              >
                <ItemMedia
                  variant="icon"
                  className="h-9 w-9"
                >
                  <Icon style={{ color: color }} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-sm font-medium">
                    {name}
                  </ItemTitle>
                  <ItemDescription className="text-xs line-clamp-2">
                    {getLocalizedCategory(v.__catId as any, t)}
                  </ItemDescription>
                </ItemContent>
                <ItemContent>
                  <ItemDescription >
                    {v.__zone || ""}
                  </ItemDescription>
                </ItemContent>
                {v.properties?.imageUrl && (
                  <ItemMedia variant="image">
                    <img
                      src={
                        (v.properties?.imageUrl as string) ||
                        undefined
                      }
                      alt={name}
                    />
                  </ItemMedia>
                )}
              </Item>
            );
          })}
        </ItemGroup>
      )}
    </div>
  );
}
