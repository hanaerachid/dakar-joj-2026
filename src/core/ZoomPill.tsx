import { MapManager } from "./MapManager";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/utils/utils";

export function ZoomPill({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const mgr = MapManager.getInstance();

  const handleZoomIn = () => mgr.getMap()?.zoomIn({ duration: 200 });
  const handleZoomOut = () => mgr.getMap()?.zoomOut({ duration: 200 });

  return (
    <ButtonGroup
      orientation="vertical"
      aria-label="Map zoom controls"
      aria-orientation="vertical"
      className={cn(
        "backdrop-blur-md shadow-lg shadow-black/10 rounded-3xl overflow-hidden",
        `outline-none ring-1 ring-black/5 focus-visible:ring-2 focus-visible:ring-primary/40`,
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleZoomIn}
              aria-label="Zoom In"
            >
              <Plus className="h-5 w-5 md:h-5.5 md:w-5.5" />
            </Button>
          }
        >
        </TooltipTrigger>
        {/* Tooltip (desktop only) */}
        <TooltipContent
          className="hidden md:block z-50 pointer-events-none text-xs font-medium shadow-lg backdrop-blur"
          side="right"
          sideOffset={12}
          align="center"
        >
          {t("zoom_in", "Zoom In")}
        </TooltipContent>
      </Tooltip>
      {/* divider */}
      <ButtonGroupSeparator orientation="horizontal" className="w-7 md:w-8" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleZoomOut}
              aria-label="Zoom Out"
            >
              <Minus className="h-5 w-5 md:h-5.5 md:w-5.5" />
            </Button>
          }
        >
        </TooltipTrigger>
        {/* Tooltip (desktop only) */}
        <TooltipContent
          className="hidden md:block z-50 pointer-events-none text-xs font-medium shadow-lg backdrop-blur"
          side="right"
          sideOffset={12}
          align="center"
        >
          {t("zoom_out", "Zoom Out")}
        </TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
}
