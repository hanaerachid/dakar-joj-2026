// src/core/BasemapSwitcherContent.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleCheck, Map } from "lucide-react";
import { cn } from "cn";
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
import type { BasemapId } from "../core/map/types";
import { BASEMAPS } from "../config/map.constants";

const BASEMAP_STORAGE_KEY = "active-basemap";

const isBasemapId = (value: string | null): value is BasemapId => {
  return BASEMAPS.some((option) => option.id === value);
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
      {BASEMAPS.map((opt) => {
        const selected = opt.id === active;
        return (
          <Item
            key={opt.id}
            variant="default"
            size="xs"
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
              <ItemTitle className="">
                {t(opt.labelKey, opt.labelFallback)}
              </ItemTitle>
              <ItemDescription className="text-xs ">
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
