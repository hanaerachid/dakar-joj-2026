// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "cn";
import { MapManager } from "../../core/MapManager";
import { Sidebar } from "../../components/Sidebar";
import { HeaderBar } from "../../components/header/HeaderBar";
import { getInitialZoom } from "../../utils/mapConfig";
import { useTranslation } from "react-i18next";
import { usePanelContext } from "@/components/panel-provider";
import { useModalContext } from "@/components/modal-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidePanel } from "@/components/side-panel/core";
import { useStateContext } from "@/components/state-provider";
import { Item, ItemContent } from "@/components/ui/item";

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapManager = MapManager.getInstance();
  const [longitude, setLongitude] = useState(-74.0242);
  const [latitude, setLatitude] = useState(40.6941);
  const [zoom, setZoom] = useState(() => getInitialZoom());
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { selectedPlace, setActiveTab } = useStateContext();
  const { setPanelContent, setIsOpen } = usePanelContext();
  const { setModalContent, setIsOpen: setModalOpen } = useModalContext();

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
    const map = mapManager.initMap(mapContainerRef.current);

    const openExplorer = () => {
      setActiveTab("home");

      if (!isMobile) {
        setPanelContent({
          title: null,
          onClose: () => setIsOpen(false),
          children: <SidePanel />,
        });
        setIsOpen(true);
        return;
      }
    };

    const onMove = () => {
      const center = map.getCenter();
      setLongitude(center.lng);
      setLatitude(center.lat);
      setZoom(map.getZoom());
    };

    map.on("move", onMove);
    if (map.loaded()) {
      openExplorer();
    } else {
      map.once("load", openExplorer);
    }
    return () => {
      map.off("move", onMove);
      map.off("load", openExplorer);
      mapManager.destroyMap();
    };
  }, [isMobile, mapManager]);
  const handleReset = () => mapManager.resetView();

  return (
    <div className="relative w-full h-[100dvh]">
      <HeaderBar
        title={t("title")}
        description={t("description")}
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

          <ItemContent>
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
