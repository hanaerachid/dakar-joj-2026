import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "cn";
import {
  BriefcaseBusiness,
  Calendar,
  Calendars,
  ChevronRight,
  Flame,
  Map,
  Newspaper,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { MapManager } from "@/core/MapManager";
import { useStateContext } from "@/components/state-provider";

export const QuickAccess = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const mapManager = MapManager.getInstance();

  const {
    setActiveTab,
    torchVisible,
    setTorchVisible,
  } = useStateContext();

  const handleToggleTorch = async () => {
    try {
      setTorchVisible(await mapManager.toggleTorch());
    } catch {
      console.error("Error toggling torch");
      setTorchVisible(false);
    }
  };

  const STARTERS = [
    {
      title: t("home.agenda"),
      description: t("home.agendainfo"),
      available: true,
      color: "#00915a",
      icon: Calendars,
      primaryAction: () => setActiveTab("events"),
      secondaryAction: null,
      secondaryActionLabel: null,
      shortcut: false,
    },
    {
      title: t("home.my_agenda", "My Agenda"),
      available: true,
      icon: Calendar,
      color: "#FFA500",
      active: false,
      primaryAction: () => setActiveTab("events"),
      secondaryAction: null,
      secondaryActionLabel: null,
      shortcut: true,
    },
    {
      title: t("home.maps", "Maps"),
      available: false,
      icon: Map,
      color: "#FFA500",
      active: false,
      primaryAction: () => null,
      secondaryAction: null,
      secondaryActionLabel: null,
      shortcut: true,
    },
    {
      title: t("home.discover"),
      description: t("home.localservices"),
      available: false,
      color: "#b98703",
      icon: Star,
      primaryAction: () => setActiveTab("discover"),
      secondaryAction: null,
      secondaryActionLabel: null,
      shortcut: false,
    },
    {
      title: t("home.torch", "Torch"),
      available: true,
      icon: Flame,
      color: "#FFA500",
      active: torchVisible,
      primaryAction: () => {
        void handleToggleTorch();
        setActiveTab("explorer");
      },
      secondaryAction: null,
      secondaryActionLabel: null,
      shortcut: true,
    },
    {
      title: t("home.news", "News"),
      available: true,
      icon: Newspaper,
      color: "#FFA500",
      active: false,
      primaryAction: () => setActiveTab("news"),
      secondaryAction: null,
      secondaryActionLabel: null,
      shortcut: true,
    },
    {
      title: t("home.business"),
      description: t("home.registerplace"),
      available: true,
      color: "#e03a2f",
      icon: BriefcaseBusiness,
      primaryAction: () => setActiveTab("business"),
      secondaryActionLabel: t("home.pricing", "See plans"),
      secondaryAction: () => navigate("/pricing"),
    },
  ]

  return (

    <div className="flex flex-col gap-3">
      <h2 className="text-xs text-muted-foreground uppercase">
        {t("home.quick_access", "Quick Access")}
      </h2>
      <ItemGroup className="w-full grid grid-cols-[minmax(0,4fr)_1fr_1fr] !gap-1">
        {STARTERS.map((item, index) => (
          <Item
            key={index}
            size="sm"
            variant={item.available ? "outline" : "muted"}
            className={cn(
              "w-full",
              "last:col-span-3",
              !item.shortcut && "relative overflow-hidden",
              item.shortcut
              && "flex-col items-center justify-center",
              item.available
                ? "group hover:bg-primary/10 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            )}
            style={
              (item.available && !item.shortcut) ?
                { backgroundColor: item.color + "10" }
                : (item.available && item.shortcut && item.active) ?
                  { backgroundColor: item.color + "44" }
                  : undefined
            }
            onClick={item.primaryAction}
          >
            <ItemMedia
              variant={item.shortcut ? "icon" : "default"}
              className={cn(
                !item.shortcut && "w-12 h-12",
                !item.shortcut && "-z-10",
                !item.shortcut && "absolute top-1/8 end-0 -translate-x-1/8 -translate-y-1/8"
              )}
            >
              {item.shortcut ? (
                <item.icon
                  className={cn(
                    "w-12 h-12"
                  )}
                  style={item.shortcut ? { color: item.active ? item.color : undefined } : undefined}
                />
              ) : (
                <item.icon
                  className={cn(
                    "w-12 h-12",
                    "text-muted-foreground/20"
                  )}
                  style={{ color: item.color + "50" }}
                />
              )}
            </ItemMedia>

            <ItemContent className="min-w-0">
              <ItemTitle className={cn(
                "text-xs/3.5 tracking-normal font-heading font-semibold",
                !item.shortcut && "max-w-10/12 truncate whitespace-nowrap line-clamp-1 overflow-hidden text-ellipsis",
                item.shortcut ? "text-center" : "text-start",
              )}>
                {item.title}
              </ItemTitle>

              {item.description && (
                <ItemDescription className={cn(
                  "text-xs/3.5",
                  !item.shortcut && "max-w-10/12",
                  item.shortcut ? "text-center" : "text-start",
                )}>
                  {item.description}
                </ItemDescription>
              )}
            </ItemContent>

            {!item.shortcut && item.secondaryAction !== null && item.available && !isSignedIn && (
              <ItemActions>
                <Button
                  className="cursor-pointer"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    item.secondaryAction();
                  }}
                >
                  {item.secondaryActionLabel}
                </Button>
              </ItemActions>
            )}
            {!item.shortcut && item.secondaryAction === null && item.available && (
              <ItemActions className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ItemDescription>
                  <ChevronRight className="w-4 h-4" />
                </ItemDescription>
              </ItemActions>
            )}
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}