// src/core/BasemapSwitcherModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Asterisk, CarFront, CircleCheck, Map, MoonStar, Mountain, Satellite, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapManager } from "./MapManager";
import { Modal } from "../components/common/Modal";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

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

export function BasemapSwitcherModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [active, setActive] = useState<BasemapId>("mapbox-streets");
  const mgr = MapManager.getInstance();

  const apply = async (id: BasemapId) => {
    setActive(id);
    await mgr.setBasemap(id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("basemap.modal.title", "Map Layers")}
      size="md"
      footer={
        <div className="text-xs text-foreground/50">
          {t(
            "basemap.tip",
            "Tip: you can change the basemap at any time. Your custom layers will reload automatically.",
          )}
        </div>
      }
    >
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
                "w-full rounded-xl transition",
                selected
                  ? "bg-accent shadow ring-1 ring-foreground/5"
                  : "hover:bg-background/50 cursor-pointer",
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
    </Modal>
  );
}
