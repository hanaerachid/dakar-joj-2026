// src/pages/MapPage.tsx
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
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
      setModalContent({
        title: null,
        onClose: () => setModalOpen(false),
        size: "lg",
        children: <SidePanel />,
      });
      setModalOpen(true);
      return;
    }

    setPanelContent({
      title: null,
      onClose: () => setIsOpen(false),
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
  const handleClear = () => {
    MapManager.getInstance().clearCurrentRoute();
    //  setRoute(null);
  };

  return (
    <div className="relative w-full h-[100dvh]">
      <HeaderBar
        title={t("title")}
        description={t("description")}
        onReset={handleReset}
      />
      {/* Top-left: Admin link (only if admin) */}

      {/* Sidebar (original) */}
      <div className="flex justify-center items-center flex-col bg-red-300">
        <Sidebar
          longitude={longitude}
          latitude={latitude}
          zoom={zoom}
          onReset={handleReset}
          onClearRoute={handleClear}
        />
      </div>

      {/* The mighty map (original) */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
