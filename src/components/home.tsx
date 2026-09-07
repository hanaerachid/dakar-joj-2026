import { useTranslation } from "react-i18next";
import { BriefcaseBusiness, Calendars, Star } from "lucide-react";
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
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";

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
      <span className="text-4xl font-semibold">{days}</span>
      &nbsp;
      <span className="uppercase text-[#f2b705] text-sm">{t("home.days", "days")}</span>
    </span>
  );
}

export const HomeContent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-4">
        <Card
          className={cn(
            "backdrop-blur-sm bg-gradient-to-b from-[#f2b705]/10 to-[#f2b705]/5",
            "relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']"
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
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xs text-muted-foreground uppercase">
          {t("home.start_with", "Start with...")}
        </h2>
        <ItemGroup className="gap-2" >
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon" >
              <Calendars />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {t("home.agenda")}
              </ItemTitle>
              <ItemDescription>
                {t("home.agendainfo")}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon" >
              <Star />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {t("home.discover")}
              </ItemTitle>
              <ItemDescription>
                {t("home.localservices")}
              </ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon" >
              <BriefcaseBusiness />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {t("home.business")}
              </ItemTitle>
              <ItemDescription>
                {t("home.registerplace")}
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </div>
    </div>
  );
}
