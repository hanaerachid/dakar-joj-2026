import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { MapManager } from "../../core/MapManager";
import { Item, ItemMedia, ItemTitle } from "../ui/item";
import type { BasemapId } from "../../core/map/types";
import { BASEMAPS } from "../../config/map.constants";

const BASEMAP_STORAGE_KEY = "active-basemap";

const isBasemapId = (value: string | null): value is BasemapId => {
  return BASEMAPS.some((option) => option.id === value);
};

export function BasemapSwitcher() {
  const { t } = useTranslation();
  const [active, setActive] = useState<BasemapId>(() => {
    const saved = localStorage.getItem(BASEMAP_STORAGE_KEY);
    return isBasemapId(saved) ? saved : "mapbox-streets";
  });
  const mgr = MapManager.getInstance();

  const apply = async (id: BasemapId) => {
    setActive(id);
    await mgr.setBasemap(id);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {BASEMAPS.map((opt) => {
        const selected = opt.id === active;
        return (
          <Item
            key={opt.id}
            size="xs"
            variant="muted"
            onClick={() => apply(opt.id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              "transition",
              selected
                ? "bg-primary"
                : "",
            )}
          >
            <ItemMedia variant="image">
              <opt.icon />
            </ItemMedia>
            <ItemTitle
              className={cn(
                "text-center",
                "text-xs/4",
                "line-clamp-2 truncate overflow-hidden text-ellipsis",
              )}
            >
              {t(opt.labelKey, opt.labelFallback)}
            </ItemTitle>
          </Item>
        );
      })}
    </div>
  );
}
