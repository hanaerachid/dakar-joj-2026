// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from "react";
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
import { useModalContext } from "@/components/modal-provider";
import { useNavbarContext } from "@/components/navbar-provider";
import { usePanelContext } from "@/components/panel-provider";
import { useStateContext } from "@/components/state-provider";
import { SidePanel } from "@/components/side-panel/core";
import { Item, ItemContent } from "@/components/ui/item";
import type { BottomNavigationItem } from "@/components/BottomBar";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const { selectedPlace, activeTab, setActiveTab } = useStateContext();
  const { setPanelContent, isOpen, setIsOpen } = usePanelContext();
  const { setModalContent, setIsOpen: setModalOpen } = useModalContext();
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

  const navigationItems: BottomNavigationItem[] = [
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
  ];

  useEffect(() => {
    if (!selectedPlace) return;

    setActiveTab("explorer");
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
    setActiveTab,
    setIsOpen,
    setModalContent,
    setModalOpen,
    setPanelContent,
  ]);

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
    setActiveTab("home");

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
    setActiveTab,
    setPanelContent,
    setIsOpen,
  ]);

  const handleReset = () => mapManager.resetView();

  useEffect(() => {
    setNavbarContent({
      items: navigationItems,
      activeKey: isOpen ? activeTab : "",
    })
  }, [setNavbarContent, activeTab, isOpen]);

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

      {/* Sidebar (original) */}
      <div className="flex justify-center items-center flex-col bg-red-300">
        <Sidebar
          longitude={longitude}
          latitude={latitude}
          zoom={zoom}
          onReset={handleReset}
        />
      </div>

      {/* The mighty map (original) */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
