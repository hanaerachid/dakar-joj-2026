// src/components/PlacesList.tsx
import { useEffect, useMemo, useState } from "react";
import { MapManager } from "../../core/MapManager";
import type { Feature, Point, GeoJsonProperties } from "geojson";
import { AnimatedButton } from "../buttons/AnimatedButton";
import {
  getMainCategoryFeatureCollection,
} from "../../data/firestore/firestorePlaces";
import { PlacesCategoryList } from "./PlacesCategoryList";
import {
  highlightCategoryPlace,
  startBounceSelected,
  stopBounceSelected,
} from "../../core/layers/categoryPoints";
import mapboxgl from "mapbox-gl";
import { CATEGORIES, MAIN_CATEGORIES } from "./place-list-utils";
import { useTranslation } from "react-i18next";
import { withTranslatedCategoryLabels } from "./categoryTranslations";
import { ChevronDown, ChevronRight, Layers2 } from "lucide-react";
import { usePanelContext } from "@/components/panel-provider";
import { useModalContext } from "@/components/modal-provider";
import { useIsMobile } from "@/hooks/use-mobile";

type VenueFeature = Feature<Point, GeoJsonProperties>;
const DEFAULT_VISIBLE_CATS = new Set<string>(["competition"]);
export interface SiteConfig {
  name: string; // zone name
  file: string; // firestore://<zoneId>
  color: string;
}
export interface CategoryConfig {
  id: string;
  label: string;
  mainCategoryId?: string;
  sources?: SiteConfig[];
  categories?: string[];
  hint?: string;
}

type LoadedVenue = VenueFeature & { zoneColor: string };

const collapseVariants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: { type: "tween" as const, duration: 0.2 },
  },
  open: {
    height: "auto",
    opacity: 1,
    transition: { type: "tween" as const, duration: 0.25 },
  },
};

// --- helpers to read category from feature props safely
function getFeatureCategoryId(props: GeoJsonProperties | undefined): string {
  const p = props || {};
  // prefer the Firestore field name used in AddPlaceFull
  const v =
    (p.categoryId as string) ??
    (p.category as string) ??
    (p.cat as string) ??
    (p.type as string) ??
    "";
  return String(v).toLowerCase();
}

export const PlacesList = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen, setPanelContent } = usePanelContext();
  const {
    isOpen: panelOpen,
    setIsOpen: setPanelOpen,
    setModalContent: setModalContent,
  } = useModalContext();

  const openPanel = () => {
    if (!isMobile) {
      if (isOpen) {
        setIsOpen(false);
        return;
      }
      setPanelContent({
        title: null,
        size: "sm",
        children: <PlacesListContent setPanelOpen={setPanelOpen} />,
      });
      setIsOpen(true);
    }

    if (isMobile) {
      if (panelOpen) {
        setPanelOpen(false);
        return;
      }
      setModalContent({
        title: null,
        onClose: () => setPanelOpen(false),
        panelClassName: "sm:max-w-md",
        contentClassName: "relative h-[80vh] sm:h-[680px] px-0 py-0",
        size: "sm",
        children: <PlacesListContent setPanelOpen={setPanelOpen} />,
      });
      setPanelOpen(true);
    }
  }

  return (
    <AnimatedButton
      icon={Layers2}
      isOpen={isOpen}
      title={isOpen ? t("actions.closepanel", "Close Panel") : t("actions.openpanel", "Open Panel")}
      onClick={openPanel}
    />
  );
}

const PlacesListContent = ({ setPanelOpen }: any) => {
  const { t, i18n } = useTranslation();
  const mapManager = MapManager.getInstance();
  const [openMainCategoryId, setOpenMainCategoryId] = useState<string | null>(
    MAIN_CATEGORIES[MAIN_CATEGORIES.length - 1].id,
  );
  const [openCatId, setOpenCatId] = useState<string | null>(CATEGORIES[0].id);
  const translatedCategories = useMemo(
    () => withTranslatedCategoryLabels(CATEGORIES, t),
    [t, i18n.language],
  );

  const translatedMainCategories = useMemo(
    () =>
      withTranslatedCategoryLabels(MAIN_CATEGORIES,t,),
    [t, i18n.language],
  );

  const activeCategory = useMemo(
    () =>
      translatedCategories.find((c) => c.id === openCatId) ??
      translatedCategories[0] ??
      CATEGORIES[0],
    [openCatId, translatedCategories],
  );
  const activeMainCategory = useMemo(
    () =>
      translatedMainCategories.find((main) => main.id === openMainCategoryId) ??
      translatedMainCategories[0],
    [openMainCategoryId],
  );
  const [openZones, setOpenZones] = useState<Record<string, boolean>>({});

  const [venues, setVenues] = useState<LoadedVenue[]>([]);
  const [mainCategoryVenues, setMainCategoryVenues] = useState<LoadedVenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [checkedCats, setCheckedCats] = useState<Record<string, boolean>>(
    Object.fromEntries(
      CATEGORIES.map((c) => [c.id, DEFAULT_VISIBLE_CATS.has(c.id)]),
    ),
  );

  const grouped = useMemo(() => {
    const by: Record<string, LoadedVenue[]> = {};
    for (const v of venues) {
      const zone = (v.properties?.zone as string) ?? "Unknown";
      (by[zone] ||= []).push(v);
    }
    return by;
  }, [venues]);

  const mainCategoryChecked = useMemo(
    () =>
      Object.fromEntries(
        MAIN_CATEGORIES.map((main) => [
          main.id,
          main.categories.length > 0 &&
            main.categories.every((categoryId) => checkedCats[categoryId]),
        ]),
      ),
    [checkedCats],
  );

  useEffect(() => {
    const filtered = mainCategoryVenues.filter((venue) => {
      const categoryId = getFeatureCategoryId(venue.properties);
      if (!categoryId || categoryId === activeCategory.id) return true;
      if (activeCategory.id !== "competition") return false;
      return Number(venue.properties?.sportCount ?? 0) > 0 ||
        (Array.isArray(venue.properties?.sports) && venue.properties.sports.length > 0);
    });
    setVenues(filtered);
    setOpenZones(
      Object.fromEntries(
        [...new Set(filtered.map((venue) => (venue.properties?.zone as string) ?? "Unknown"))]
          .map((zone) => [zone, true]),
      ),
    );
  }, [activeCategory.id, mainCategoryVenues]);

  useEffect(() => {
    let cancelled = false;

    async function fetchForMainCategory(mainCategoryId: string) {
      setLoading(true);
      setLoadError(null);
      setMainCategoryVenues([]);

      try {
        const { fc, color } = await getMainCategoryFeatureCollection(mainCategoryId);
        const all = ((fc.features || []) as VenueFeature[]).map((feature) => ({
          ...feature,
          zoneColor: color,
        }));

        if (cancelled) return;
        setMainCategoryVenues(all);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message ?? "Failed to load venues.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchForMainCategory(activeMainCategory.id);
    return () => {
      cancelled = true;
    };
  }, [activeMainCategory.id]);
  // re-apply emphasis on hot reload / map mount
  useEffect(() => {
    const map = mapManager.getMap();
    if (!map) return;
    Object.entries(checkedCats).forEach(([catId, isChecked]) => {
      setCategoryVisibility(catId, isChecked); // 👈 ensure visibility matches UI
      applyCategoryEmphasis(catId, isChecked);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapManager]);

  useEffect(() => {
    // when category changes, stop current bounce
    const map = mapManager.getMap();
    if (map) stopBounceSelected(map);
  }, [openCatId]);

  // === layer helpers (prefixes must match your style layer ids) ===
  function layerPrefixFor(catId: string): string {
    if (catId === "competition") return "comp-";
    if (catId === "training") return "train-";
    if (catId === "castle") return "castle-";
    if (catId === "hotels") return "hotel-";
    if (catId === "restaurants") return "rest-";
    if (catId === "artworks") return "artworks-";
    if (catId === "attraction") return "attraction-";
    if (catId === "church") return "church-";
    if (catId === "gallery") return "gallery-";
    if (catId === "memorial") return "memorial-";
    if (catId === "mosque") return "mosque-";
    if (catId === "monument") return "monument-";
    if (catId === "museum") return "museum-";
    if (catId === "viewpoints") return "viewpoints-";
    if (catId === "zoo") return "zoo-";
    if (catId === "hospitals") return "hosp-";
    if (catId === "transport") return "trans-";
    if (catId === "police") return "pol-";
    if (catId === "bank") return "ban-";
    if (catId === "atm") return "atm-";
    if (catId === "firestation") return "fires-";
    if (catId === "airport") return "airport-";
    if (catId === "bus") return "bus-";
    if (catId === "ferry") return "ferry-";
    if (catId === "railway") return "railway-";
    return `${catId}-`;
  }

  function getCategoryLayerIds(catId: string): string[] {
    const map = mapManager.getMap();
    if (!map) return [];
    const prefix = layerPrefixFor(catId);
    const style = map.getStyle();
    const layers = style?.layers || [];

    return layers
      .filter((l) => l.id?.startsWith?.(prefix) && l.id.includes("-clustered-"))
      .map((l) => l.id);
  }

  // NEW: only symbol layers for a category (the ones that have the feature ids)
  function getCategorySymbolLayerIds(catId: string): string[] {
    const map = mapManager.getMap();
    if (!map) return [];
    const prefix = layerPrefixFor(catId);
    const style = map.getStyle();
    const layers = style?.layers || [];
    return layers
      .map((l) => l.id)
      .filter(
        (id) =>
          id?.startsWith(prefix) &&
          id?.includes("-clustered-") &&
          id?.endsWith("-symbols"),
      ) as string[];
  }

  function setCategoryVisibility(catId: string, visible: boolean) {
    const map = mapManager.getMap();
    if (!map) return;
    const ids = getCategoryLayerIds(catId);
    for (const id of ids) {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      }
    }
  }

  function applyCategoryEmphasis(catId: string, checked: boolean) {
    const map = mapManager.getMap();
    if (!map) return;
    const layerIds = getCategoryLayerIds(catId);

    const radiusExpr: any = [
      "interpolate",
      ["linear"],
      ["zoom"],
      8,
      checked ? 8 : 4,
      12,
      checked ? 12 : 6,
      16,
      checked ? 18 : 10,
    ];

    for (const layerId of layerIds) {
      if (!map.getLayer(layerId)) continue;
      const type = (map.getStyle().layers || []).find(
        (l) => l.id === layerId,
      )?.type;

      if (type === "circle") {
        map.setPaintProperty(layerId, "circle-radius", radiusExpr);
      }
    }
  }

  // update signature to accept id
  const handleClick = (
    lng: number,
    lat: number,
    title: string,
    id?: string,
  ) => {
    setSelectedTitle(title);
    const map = mapManager.getMap();
    if (map) {
      // Ensure this category is visible
      setCategoryVisibility(activeCategory.id, true);
      setCheckedCats((prev) => ({ ...prev, [activeCategory.id]: true }));

      // Stop any previous bounce right away
      stopBounceSelected(map);

      // If we already have an id from the list, apply immediately
      const apply = (pid: string | null) => {
        if (!pid) return;
        highlightCategoryPlace(map, activeCategory.id, pid);
        startBounceSelected(map, activeCategory.id, pid);
      };
      if (id) apply(id);

      map.flyTo({
        center: [lng, lat],
        // > clusterMaxZoom (14) ensures clusters split so symbols are queryable
        zoom: Math.max(15, map.getZoom()),
        speed: 1.2,
      });

      const once = () => {
        // If no id was supplied, recover it from rendered symbol features now
        if (!id) {
          const recovered = findFeatureIdAt(activeCategory.id, lng, lat);
          apply(recovered);
        }
        openPopupForCategory(activeCategory.id, lng, lat);
        map.off("moveend", once);
      };
      map.on("moveend", once);
    }
    if (window.innerWidth < 768) setPanelOpen(false);
  };

  function handleCategoryCheck(
    checked: boolean,
    catId: string,
  ) {
    setCategoryVisibility(catId, checked);
    applyCategoryEmphasis(catId, checked);

    setCheckedCats((prev) => ({
      ...prev,
      [catId]: checked,
    }));
  }

  function handleMainCategoryCheck(checked: boolean, mainCategoryId: string) {
    const mainCategory = MAIN_CATEGORIES.find((main) => main.id === mainCategoryId);
    if (!mainCategory) return;
    mainCategory.categories.forEach((categoryId) => {
      setCategoryVisibility(categoryId, checked);
      applyCategoryEmphasis(categoryId, checked);
    });
    setCheckedCats((prev) => ({
      ...prev,
      ...Object.fromEntries(mainCategory.categories.map((categoryId) => [categoryId, checked])),
    }));
  }

  // Hit-test near [lng,lat] on the category's symbol layers and pull a usable id
  function findFeatureIdAt(
    catId: string,
    lng: number,
    lat: number,
  ): string | null {
    const map = mapManager.getMap();
    if (!map) return null;

    const pt = map.project([lng, lat]);
    const p1 = new mapboxgl.Point(pt.x - 6, pt.y - 6);
    const p2 = new mapboxgl.Point(pt.x + 6, pt.y + 6);

    const layers = getCategorySymbolLayerIds(catId);
    if (!layers.length) return null;

    const hits = map.queryRenderedFeatures([p1, p2], { layers });
    if (!hits.length) return null;

    const f: any = hits[0];
    // Try a few common locations for the id
    return (
      (f.properties &&
        (f.properties.id || f.properties.docId || f.properties.placeId)) ||
      (f.id as string) ||
      null
    );
  }

  // 🔔 open the correct popup for the active category near [lng,lat]
  function openPopupForCategory(catId: string, lng: number, lat: number) {
    const map = mapManager.getMap();
    if (!map) return;

    const layerIds = getCategoryLayerIds(catId);
    if (layerIds.length === 0) return;

    const pt = map.project([lng, lat]);
    const p1 = new mapboxgl.Point(pt.x - 6, pt.y - 6);
    const p2 = new mapboxgl.Point(pt.x + 6, pt.y + 6);

    const hits = map.queryRenderedFeatures([p1, p2], { layers: layerIds });
    if (hits.length > 0) {
      (map as any).fire("click", { point: pt, lngLat: { lng, lat } });
    }
  }

  const Chevron = ({ open }: { open: boolean }) => (
    <>
      {
        open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )
      }
    </>
  );

  return (
    <PlacesCategoryList
      CATEGORIES={translatedCategories}
      MAIN_CATEGORIES={translatedMainCategories}
      openMainCategoryId={openMainCategoryId}
      setOpenMainCategoryId={setOpenMainCategoryId}
      mainCategoryChecked={mainCategoryChecked}
      handleMainCategoryCheck={handleMainCategoryCheck}
      openCatId={openCatId}
      activeCategory={activeCategory}
      setOpenCatId={setOpenCatId}
      checkedCats={checkedCats}
      handleCategoryCheck={handleCategoryCheck}
      venues={venues}
      Chevron={Chevron}
      collapseVariants={collapseVariants}
      loading={loading}
      loadError={loadError}
      grouped={grouped}
      openZones={openZones}
      setOpenZones={setOpenZones}
      handleClick={handleClick}
      selectedTitle={selectedTitle}
    />
  )
}
