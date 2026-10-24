// src/pages/MapPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "cn";
import {
  Compass,
  Home,
  Newspaper,
  Calendar,
  Briefcase,
} from "lucide-react";
import { MapManager } from "../../core/MapManager";
import { Sidebar } from "../../components/Sidebar";
import { HeaderBar } from "../../components/header/HeaderBar";
import { getInitialZoom } from "../../utils/mapConfig";
import { useTranslation } from "react-i18next";
import { useNavbarContext } from "@/components/navbar-provider";
import { usePanelContext } from "@/components/panel-provider";
import { useStateContext } from "@/components/state-provider";
import { SidePanel } from "@/components/side-panel/core";
import { Promo } from "@/components/Promo";
import { Item, ItemContent } from "@/components/ui/item";
import type { BottomNavigationItem } from "@/components/BottomBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bookmarks } from "@/components/Bookmarks";
import { listZones } from "@/lib/api/zones";
import type { Zone } from "@/shared/contracts";

const Countdown = ({ targetedDate }: { targetedDate: Date }) => {
  const { t } = useTranslation();
  const targetDate = targetedDate.getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft <= 0) {
    return <span>{t("home.event_is_here", "The event is here!")}</span>;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div>
      <span className="uppercase text-[#f2b705] text-base font-mono font-semibold">{t("home.d", "d")}</span>
      &minus;
      <span className="text-[#f2b705] text-base font-mono font-semibold">{days}</span>
    </div>
  );
}

export default function MapPage() {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapManager = MapManager.getInstance();
  const [longitude, setLongitude] = useState(-74.0242);
  const [latitude, setLatitude] = useState(40.6941);
  const [zoom, setZoom] = useState(() => getInitialZoom());
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const isMobile = useIsMobile();
  const {
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
    selectedPlace,
  } = useStateContext();
  const { setPanelContent, isOpen, setIsOpen } = usePanelContext();
  const { setNavbarContent } = useNavbarContext();

  const openNavigationPanel = (tab: string) => {
    setActiveTab(tab);
    setPanelContent({
      title: null,
      onClose: () => setIsOpen(false),
      children: <SidePanel />,
    });
    setIsOpen(true);
  };

  const navigationItems: BottomNavigationItem[] = useMemo(() => [
    {
      key: "home",
      label: t("tabs.home", "Home"),
      icon: Home,
      action: () => {
        openNavigationPanel("home");
      },
    },
    {
      key: "explorer",
      label: t("tabs.explorer", "Explorer"),
      icon: Compass,
      action: () => {
        setIsSearchOpen(false);
        openNavigationPanel("explorer");
      },
    },
    {
      key: "events",
      label: t("tabs.events", "Events"),
      icon: Calendar,
      action: () => {
        openNavigationPanel("events");
      },
    },
    {
      key: "news",
      label: t("tabs.news", "News"),
      icon: Newspaper,
      action: () => {
        openNavigationPanel("news");
      },
    },
    {
      key: "business",
      label: t("tabs.business", "Business"),
      icon: Briefcase,
      action: () => {
        openNavigationPanel("business");
      },
    },
  ], []);

  useEffect(() => {
    if (!selectedPlace) return;
    if (isMobile) {
      setPanelContent({
        title: null,
        onClose: () => {
          setIsOpen(false)
        },
        size: "lg",
        children: <SidePanel />,
      });
      setIsOpen(true);
      return;
    }

    setPanelContent({
      title: null,
      onClose: () => {
        setIsOpen(false)
      },
      children: <SidePanel />,
    });
    setIsOpen(true);
  }, [
    isMobile,
    selectedPlace,
    setIsOpen,
    setPanelContent,
  ]);

  useEffect(() => {
    if (!mapReady || !selectedPlace) return;

    const longitude = selectedPlace.lng;
    const latitude = selectedPlace.lat;
    if (typeof longitude !== "number" || typeof latitude !== "number") return;

    const map = mapManager.getMap();
    if (!map) return;

    mapManager.flyTo({
      center: [longitude, latitude],
      zoom: Math.max(15, map.getZoom()),
      speed: 1.2,
    });
  }, [mapManager, mapReady, selectedPlace]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: mapboxgl.Map;
    try {
      map = mapManager.initMap(mapContainerRef.current);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Failed to initialize WebGL")
      ) {
        console.warn("WebGL initialization failed:", error);
        return;
      }

      throw error;
    }

    setMapReady(true);

    const onMove = () => {
      const center = map.getCenter();
      setLongitude(center.lng);
      setLatitude(center.lat);
      setZoom(map.getZoom());
    };

    map.on("move", onMove);

    return () => {
      map.off("move", onMove);
      mapManager.destroyMap();
    };
  }, [mapManager]);

  useEffect(() => {
    if (!isMobile) {
      setPanelContent({
        title: null,
        onClose: () => setIsOpen(false),
        children: <SidePanel />,
      });

      setIsOpen(true);
    }
  }, [
    isMobile,
    setPanelContent,
    setIsOpen,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadZones() {
      try {
        setLoading(true);
        setError(null);

        const result = await listZones(
          {categoryId: "competition"},
        );

        setZones(result);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load zones",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadZones();

    return () => controller.abort();
  }, []);

  const handleReset = () => mapManager.resetView();
  const handleZoomTo = (bounds: mapboxgl.LngLatBounds) => mapManager.zoomTo(bounds);

  const activeNavigationKey = !isOpen
    ? ""
    : activeTab === "explorer"
      ? isSearchOpen
        ? "search"
        : "explorer"
      : activeTab;

  useEffect(() => {
    setNavbarContent({
      items: navigationItems,
      activeKey: activeNavigationKey,
    })
  }, [
    setNavbarContent,
    activeTab,
    activeNavigationKey,
    isOpen,
    navigationItems,
  ]);

  return (
    <div className="relative w-full h-[100dvh]">
      <HeaderBar
      // title={t("title")}
      // description={t("description")}
        onReset={handleReset}
      >
        <Item
          size="xs"
          variant="outline"
          className={cn(
            "flex items-center py-1.25",
            "w-fit bg-gradient-to-b from-[#f2b705]/10 to-[#f2b705]/5",
          )}
        >
          <ItemContent>
            <Countdown targetedDate={new Date("2026-10-31T00:00:00")} />
          </ItemContent>

          <ItemContent className="hidden sm:flex">
            <span className="uppercase text-muted-foreground text-xs">
              31 Oct - 13 Nov
            </span>
          </ItemContent>
        </Item>
      </HeaderBar>
      {/* Top-left: Admin link (only if admin) */}

      <div className={cn(
        "z-50",
        "absolute top-14 md:top-18 start-2 end-20 md:translate-x-1/4",
        "w-full max-w-sm mx-auto",
      )}>
        <Bookmarks
          loading={loading}
          error={error}
          zones={zones}
          onZoomTo={handleZoomTo}
        />
      </div>

      <div className={cn(
        "pointer-events-none",
        "z-50",
        "absolute right-3 top-1/2 -translate-y-64",
        "md:right-4 md:top-1/2 md:-translate-y-1/2",
        "sm:bottom-3 sm:top-auto sm:-translate-y-0 ",
      )}>
        <Sidebar
          longitude={longitude}
          latitude={latitude}
          zoom={zoom}
          onReset={handleReset}
        />
      </div>

      {/* The mighty map (original) */}
      <div ref={mapContainerRef} className="w-full h-full" />

      <div className={cn(
        "fixed bottom-8 left-0 right-0 translate-x-1/4",
        "w-full max-w-lg mx-auto",
        "rounded-xl border bg-background/80 backdrop-blur-md shadow-lg"
      )}>
        {!isMobile && (
          <Promo />
        )}
      </div>
    </div>
  );
}
