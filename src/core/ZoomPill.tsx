import { MapManager } from "./MapManager";
import { cn } from "@/utils/utils";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";

export function ZoomPill({ className = "" }: { className?: string }) {
  const mgr = MapManager.getInstance();

  const handleZoomIn = () => mgr.getMap()?.zoomIn({ duration: 200 });
  const handleZoomOut = () => mgr.getMap()?.zoomOut({ duration: 200 });

  return (
    <ButtonGroup
      aria-label="Map zoom controls"
      aria-orientation="vertical"
      className={cn(
        "inline-flex flex-col items-center justify-center backdrop-blur-md shadow-md shadow-black/10 rounded-xl overflow-hidden",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleZoomIn}
        title="Zoom In"
        className="grid place-items-center h-10 w-10 md:h-10 md:w-10 bg-background/55 hover:bg-background focus-visible:outline focus-visible:outline-blue-500/40"
        aria-label="Zoom In"
      >
        <Plus className="h-5 w-5 md:h-5.5 md:w-5.5" />
      </Button>

      {/* divider */}
      <ButtonGroupSeparator className="w-7 md:w-8" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleZoomOut}
        title="Zoom Out"
        className="grid place-items-center h-10 w-10 md:h-10 md:w-10 bg-background/55 hover:bg-background focus-visible:outline focus-visible:outline-blue-500/40"
        aria-label="Zoom Out"
      >
        <Minus className="h-5 w-5 md:h-5.5 md:w-5.5" />
      </Button>
    </ButtonGroup>
  );
}
