// src/core/BasemapSwitcherContent.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Asterisk, CarFront, CircleCheck, Map, MoonStar, Mountain, Satellite, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapManager } from "./MapManager";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { useModalContext } from "@/components/modal-provider";
import { AnimatedButton } from "@/components/buttons/AnimatedButton";

type BasemapId =
  | "mapbox-streets"
  | "mapbox-outdoors"
  | "mapbox-light"
  | "mapbox-dark"
  | "mapbox-satellite"
  | "mapbox-navigation-day"
  | "mapbox-navigation-night";

const OPTIONS: {
  id: BasemapId;
  icon: string | LucideIcon;
  labelKey: string;
  descKey: string;
  // 👇 human fallback shown if i18n key missing
  labelFallback: string;
  descFallback: string;
}[] = [
    {
      id: "mapbox-streets",
      icon: Map,
      labelKey: "basemap.option.mapbox_streets.label",
      descKey: "basemap.option.mapbox_streets.desc",
      labelFallback: "Mapbox Streets",
      descFallback: "Default road map with labels.",
    },
    {
      id: "mapbox-outdoors",
      icon: Mountain,
      labelKey: "basemap.option.mapbox_outdoors.label",
      descKey: "basemap.option.mapbox_outdoors.desc",
      labelFallback: "Outdoors (Mapbox)",
      descFallback: "Terrain-focused map with trails and contours.",
    },
    {
      id: "mapbox-light",
      icon: Sun,
      labelKey: "basemap.option.mapbox_light.label",
      descKey: "basemap.option.mapbox_light.desc",
      labelFallback: "Light (Mapbox)",
      descFallback: "Clean, light basemap for data overlays.",
    },
    {
      id: "mapbox-dark",
      icon: MoonStar,
      labelKey: "basemap.option.mapbox_dark.label",
      descKey: "basemap.option.mapbox_dark.desc",
      labelFallback: "Dark (Mapbox)",
      descFallback: "Dark basemap that makes markers pop.",
    },
    {
      id: "mapbox-satellite",
      icon: Satellite,
      labelKey: "basemap.option.mapbox_satellite.label",
      descKey: "basemap.option.mapbox_satellite.desc",
      labelFallback: "Satellite (Mapbox)",
      descFallback: "Satellite imagery with road overlay.",
    },
    {
      id: "mapbox-navigation-day",
      icon: CarFront,
      labelKey: "basemap.option.mapbox_nav_day.label",
      descKey: "basemap.option.mapbox_nav_day.desc",
      labelFallback: "Navigation Day (Mapbox)",
      descFallback: "High-contrast day style optimized for driving.",
    },
    {
      id: "mapbox-navigation-night",
      icon: Asterisk,
      labelKey: "basemap.option.mapbox_nav_night.label",
      descKey: "basemap.option.mapbox_nav_night.desc",
      labelFallback: "Navigation Night (Mapbox)",
      descFallback: "Night style designed for in-car use.",
    },
  ];

const BASEMAP_STORAGE_KEY = "active-basemap";

const isBasemapId = (value: string | null): value is BasemapId => {
  return OPTIONS.some((option) => option.id === value);
};

export const BaseMapSwitcher = () => {
  const { t } = useTranslation();
  const [layersOpen, setLayersOpen] = useState(false);

  const {
    isOpen,
    setIsOpen,
    setModalContent,
  } = useModalContext();

  const openModal = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setModalContent({
      title: t("basemap.modal.title", "Map Layers"),
      size: "md",
      children: (
        <BasemapSwitcherContent
          isOpen={layersOpen}
          onClose={() => setLayersOpen(false)}
        />
      ),
      footer: (
        <div className="text-xs text-foreground/50">
          {t(
            "basemap.tip",
            "Tip: you can change the basemap at any time. Your custom layers will reload automatically.",
          )}
        </div>
      ),
      onClose: () => setIsOpen(false),
    });
    setIsOpen(true);
  }

  return (
    <AnimatedButton
      icon={Map}
      title={t("actions.basemaps", "Change basemap")}
      onClick={openModal}
    />
  );
}

export function BasemapSwitcherContent({
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [active, setActive] = useState<BasemapId>(() => {
    const saved = localStorage.getItem(BASEMAP_STORAGE_KEY);
    return isBasemapId(saved) ? saved : "mapbox-streets";
  });

  const mgr = MapManager.getInstance();

  const apply = async (id: BasemapId) => {
    setActive(id);
    await mgr.setBasemap(id);
    onClose();
  };

  return (

    <ItemGroup>
      {OPTIONS.map((opt) => {
        const selected = opt.id === active;
        return (
          <Item
            variant="default"
            size="xs"
            key={opt.id}
            onClick={() => apply(opt.id)}
            className={cn(
              "w-full transition",
              selected
                ? "bg-accent shadow ring-1 ring-foreground/5"
                : "c",
            )}
            aria-pressed={selected}
          >
            <ItemMedia
              variant="icon"
              className="rounded-lg bg-background/5 w-9 h-9"
            >
              <opt.icon className="w-5 h-5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="truncate">
                {t(opt.labelKey, opt.labelFallback)}
              </ItemTitle>
              <ItemDescription className="text-xs truncate">
                {t(opt.descKey, opt.descFallback)}
              </ItemDescription>
            </ItemContent>
            <ItemContent>
              {selected && (
                <CircleCheck className="text-primary" />
              )}
            </ItemContent>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
