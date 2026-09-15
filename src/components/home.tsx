import { useTranslation } from "react-i18next";
import {
  BriefcaseBusiness,
  Calendar,
  Calendars,
  ChevronRight,
  Flame,
  Map,
  Newspaper,
  Star
} from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { useStateContext } from "./state-provider";
import { MapManager } from "../core/MapManager";

export default function Countdown({ targetedDate }: { targetedDate: Date }) {
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
    <span>
      <span className="text-5xl font-semibold">{days}</span>
      &nbsp;
      <span className="uppercase text-[#f2b705] text-sm">{t("home.days", "days")}</span>
    </span>
  );
}

export const HomeContent = () => {
  const { t } = useTranslation();
  const {
    setActiveTab,
  } = useStateContext();
  const mapManager = MapManager.getInstance();

  const STARTERS = [
    {
      title: t("home.agenda"),
      description: t("home.agendainfo"),
      available: true,
      color: "#00915a",
      icon: Calendars,
      onClick: () => setActiveTab("events"),
    },
    {
      title: t("home.discover"),
      description: t("home.localservices"),
      available: false,
      color: "#b98703",
      icon: Star,
      onClick: () => setActiveTab("discover"),
    },
    {
      title: t("home.business"),
      description: t("home.registerplace"),
      available: true,
      color: "#e03a2f",
      icon: BriefcaseBusiness,
      onClick: () => setActiveTab("business"),
    },
  ]

  const SHORTCUTS = [
    {
      title: t("home.my_agenda", "My Agenda"),
      available: true,
      icon: Calendar,
      color: "#FFA500",
      active: false,
      onClick: () => setActiveTab("events"),
    },
    {
      title: t("home.maps", "Maps"),
      available: false,
      icon: Map,
      color: "#FFA500",
      active: false,
      onClick: () => null,
    },
    {
      title: t("home.torch", "Torch"),
      available: true,
      icon: Flame,
      color: "#FFA500",
      active: mapManager.isTorchVisible(),
      onClick: () => void mapManager.toggleTorch(),
    },
    {
      title: t("home.news", "News"),
      available: true,
      icon: Newspaper,
      color: "#FFA500",
      active: false,
      onClick: () => setActiveTab("news"),
    },
  ]

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-4">
        <Card
          size="sm"
          className={cn(
            "backdrop-blur-sm bg-gradient-to-b from-[#f2b705]/10 to-[#f2b705]/5",
            "overflow-hidden relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']"
          )}
        >
          <CardHeader>
            <CardTitle>
              <Countdown targetedDate={new Date("2026-10-31T00:00:00")} />
            </CardTitle>
            <CardDescription>
              {t("home.countdown_description", "Days left until the Dakar 2026 Youth Olympic Games!")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Badge variant="secondary" className="uppercase text-xs">
              31 Oct - 13 Nov 2026
            </Badge>
          </CardFooter>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xs text-muted-foreground uppercase">
          {t("home.start_with", "Start with...")}
        </h2>
        <ItemGroup>
          {STARTERS.map((item, index) => (
            <>
              <Item
                key={index} size="sm"
                variant={item.available ? "outline" : "muted"}
                className={cn(
                  item.available ? "group hover:bg-primary/25 cursor-pointer" : "cursor-not-allowed"
                )}
                onClick={item.onClick}
              >
                <ItemMedia
                  className={cn("rounded-lg w-8 h-8")}
                  style={{ backgroundColor: item.color }}
                  variant="icon"
                >
                  <item.icon
                    className={cn("w-6 h-6")}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {item.title}
                  </ItemTitle>
                  <ItemDescription>
                    {item.description}
                  </ItemDescription>
                </ItemContent>
                {item.available && (
                  <ItemContent className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ItemDescription>
                      <ChevronRight className="w-4 h-4" />
                    </ItemDescription>
                  </ItemContent>
                )}
              </Item>
            </>
          ))}
        </ItemGroup>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xs text-muted-foreground uppercase">
          {t("home.quick_access", "Quick access")}
        </h2>
        <ItemGroup className="grid grid-cols-2 gap-2" >

          {SHORTCUTS.map((item, index) => (
            <Item
              key={index}
              size="xs"
              variant={item.available ? "outline" : "muted"}
              className={item.available ? "hover:bg-primary/25 cursor-pointer" : "cursor-not-allowed"}
              onClick={item.onClick}
            >
              <ItemMedia variant="icon" >
                <item.icon
                  style={{ color: item.active ? item.color : undefined }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {item.title}
                </ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
