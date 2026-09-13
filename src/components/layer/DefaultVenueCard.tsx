import React, { useState } from "react";
import { Clock9, Ruler, Star, X } from "lucide-react";
import { ManeuverIcon } from "../maneuverIcons";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components//ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Item, ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemDescription } from "../ui/item";

type RouteStep = {
  instruction: string;
  location: [number, number];
  distance: number;
  duration: number;
  name?: string;
  maneuver?: { type?: string; modifier?: string; exit?: number };
};

export type RouteSummary = {
  distance: number;
  duration: number;
  steps: RouteStep[];
} | null;

type Props = {
  title: string;
  zone: string;
  info: string;
  infoFr?: string;
  imageUrl?: string;
  address: string | undefined;
  date: string | undefined;
  tags: string[] | undefined;
  route: RouteSummary;
  onGetDirections: () => void;
  onClose: () => void;
  onClear: () => void;
};

const DefaultVenueCard: React.FC<Props> = ({
  title,
  zone,
  info,
  infoFr,
  imageUrl,
  address,
  date,
  tags,
  route,
  onGetDirections,
  onClose,
  onClear,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const infoText = lang.startsWith("fr")
    ? (infoFr ?? "").trim() || info
    : info;
  const [infoExpanded, setInfoExpanded] = useState(false);

  return (
    <Card
      size="sm"
      className="relative w-[82vw] max-w-[320px] sm:w-[450px] sm:max-w-none shadow-xl pt-0 overflow-hidden"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className="absolute end-4 top-4 w-8 h-8 flex items-center justify-center z-20"
        aria-label={t("layer.actions.close")}
      >
        <X />
      </Button>
      <CardHeader className="p-0 gap-0">
        {/* Optional hero image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full object-cover"
          />
        ) : null}

        {/* Header: icon + zone tag */}
        <div
          className="px-3 pt-2.5 sm:pt-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="text-xs uppercase opacity-90 tracking-wide">
                {zone === "Unassigned" ? "" : zone}
              </div>
              <h3 className="flex-1 text-base sm:text-lg font-semibold">{title}</h3>
              {date && (
                <Badge className="text-[11px] sm:text-sm bg-yellow-400 text-black px-2 py-2 rounded-full">
                  <Star className="w-3.5 h-3.5 text-black" /> {new Date(date).toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric" })}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      {/* Body */}
      <CardContent>
        <div>
          {infoText && (
            <>
              <CardDescription
                className="font-sans text-[11px] sm:text-sm leading-snug text-foreground"
                style={
                  infoExpanded
                    ? undefined
                    : {
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
                }
              >
                {infoText}
              </CardDescription>
              <Button
                type="button"
                variant="link"
                size="xs"
                onClick={() => setInfoExpanded((v) => !v)}
                className="mb-2 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
              >
                {infoExpanded ? "See less" : "See more"}
              </Button>
            </>
          )}

          {address && <p className="font-sans text-xs sm:text-sm mt-1 text-muted-foreground">{address}</p>}

          {!!tags?.length && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs px-2 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Route summary (conditionally rendered) */}
          {route && (
            <>
              <div className="mb-2 flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                >
                  <Ruler className="w-3 h-3" />
                  {(route.distance / 1000).toFixed(2)}{" "}
                  {t("layer.route.unit.kilometer")}
                </Badge>
                <Badge
                  variant="outline"
                >
                  <Clock9 className="w-3 h-3" />
                  {Math.round(route.duration / 60)}{" "}
                  {t("layer.route.unit.minute")}
                </Badge>
              </div>

              <ItemGroup className="overflow-y-auto max-h-40 sm:max-h-56">
                {route.steps.slice(0, 4).map((s, i) => (
                  <Item key={i} size="xs">
                    <ItemMedia
                      variant="icon"
                      className="w-5 h-5 rounded-full bg-primary/25"
                    >
                      <ManeuverIcon
                        type={s.maneuver?.type}
                        modifier={s.maneuver?.modifier}
                        exit={s.maneuver?.exit}
                        className="w-3.5 h-3.5 text-primary"
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-sm leading-snug">
                        {s.instruction}
                      </ItemTitle>
                    </ItemContent>
                    <ItemContent>
                      <ItemDescription className="text-xs text-muted-foreground">
                        ({(s.distance / 1000).toFixed(1)}{" "}
                        {t("layer.route.unit.kilometer")})
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
              {route.steps.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  {t("layer.route.remainingSteps", {
                    count: route.steps.length - 4,
                  })}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="default"
          onClick={onGetDirections}
          className="flex-1"
        >
          {t("layer.actions.getDirections")}
        </Button>
        {route && (
          <Button
            variant="outline"
            onClick={onClear}
            className="w-fit transition"
          >
            {t("layer.actions.clearRoute")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DefaultVenueCard;
