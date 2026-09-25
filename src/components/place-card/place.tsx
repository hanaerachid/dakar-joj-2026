import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Clock9, MapPin, Ruler, X } from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { getPlace } from "@/lib/api/places";
import type { Place } from "../../shared/contracts";
import { useStateContext } from "../state-provider";
import { ManeuverIcon } from "../maneuverIcons";
import { getDirections, clearDirections } from "../../utils/directions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


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

type PlaceDetailsProps = {
  id: any;
};

type PlaceContentProps = {
  place: Place;
  route: RouteSummary;
  onGetDirections: (
    destination: [number, number]
  ) => Promise<void>;
};

export function PlaceDetails({ id }: PlaceDetailsProps) {
  const { t } = useTranslation();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteSummary>(null);
  const {
    setSelectedPlace,
  } = useStateContext()

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const fetchPlace = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getPlace(id);

        if (!cancelled) {
          setPlace(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load place"
          );
          setPlace(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlace();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    clearDirections();
    setSelectedPlace(null);
  };

  const handleGetDirections = async (
    destination: [number, number]
  ) => {
    setRoute(null);

    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const origin: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        try {
          const itinerary = await getDirections(
            origin,
            destination
          );

          setRoute(itinerary);
        } catch (error) {
          console.error("Directions failed:", error);
          toast.error(t("place.details.directions.error", "Failed to calculate directions."));
        }
      },
      () => {
        toast.error(t("place.details.location.unknown_error", "Unable to retrieve your location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  };
  return (
    <div className="relative">
      <div className="absolute top-16 start-2">
        <Button
          size="default"
          variant="secondary"
          className="fixed top-15 start-2 z-50"
          onClick={handleBack}
        >
          <ChevronLeft />
          <span>{t("place.details.back", "Back")}</span>
        </Button>
      </div>
      <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto">
        {loading && <Spinner />}

        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && !place && (
          <Empty>
            <EmptyContent>
              <EmptyDescription>
                {t("place.details.not_found", "Place not found.")}
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        )}

        {!loading && !error && place && (
          <PlaceContent
            place={place}
            route={route}
            onGetDirections={handleGetDirections}
          />
        )}
      </div>
    </div>
  );
}

function PlaceContent({ place, route, onGetDirections }: PlaceContentProps) {
  const {
    title,
    imageUrl,
    name,
    address,
    location,
    locationLabel,
    info,
    infoFr,
    sports,
    brandTitle,
    brandSubtitle,
    tags,
    website,
    socialHandle,
  } = place;
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const infoText = lang.startsWith("fr") ? (infoFr ?? "").trim() || info : info;
  const [infoExpanded, setInfoExpanded] = useState(false);

  useEffect(() => {
    console.log("[EventVenueCard] info props", {
      title,
      lang,
      info,
      infoFr,
      renderedInfo: infoText,
    });
  }, [title, lang, info, infoFr, infoText]);
  return (
    <div className="w-full flex flex-col gap-4 py-2">
      <div className="relative">
        {/* Hero image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full rounded-2xl aspect-video object-cover"
          />
        ) : <div className="mt-10" />}

        <div className="absolute end-2 bottom-2">
          {locationLabel && (
            <Badge
              variant="secondary"
              className="text-xs flex items-center justify-center font-medium"
            >
              <MapPin /> {locationLabel}
            </Badge>
          )}
        </div>
        <div className="absolute start-2 bottom-2 flex items-center justify-between">
          <div className="text-xs leading-tight ">
            {brandTitle && (
              <div className="font-semibold text-center">{brandTitle}</div>
            )}
            {brandSubtitle && (
              <div className="uppercase tracking-wide text-[8px]">
                {brandSubtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">
          {name}
        </h2>

        {/* Sports strip */}
        {sports?.length ? (
          <div className="grid grid-cols-6 gap-1 pt-1 pb-2 rounded-2xl">
            {sports.map((s, i) => (
              <div
                key={i}
                title={s.label}
                className="flex flex-col items-center gap-2 pt-2"
              >
                {s.icon ? (
                  <Icon icon={s.icon} className="w-6 h-6" />
                ) : (s as any).iconUrl ? (
                  <img
                    src={(s as any).iconUrl}
                    alt={s.label}
                    className="w-6 h-6"
                  />
                ) : (
                  <div className="text-xs font-semibold"></div>
                )}
                <span className="text-[8px] uppercase text-center w-full font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {infoText && (
          <>
            <p className="text-sm text-muted-foreground leading-snug"
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
            </p>
            <Button
              type="button"
              variant="link"
              size="xs"
              onClick={() => setInfoExpanded((v) => !v)}
              className="inline-flex h-auto p-0 text-xs"
            >
              {infoExpanded ? t("see_less", "See less") : t("see_more", "See more")}
            </Button></>
        )}

        {address && (
          <p className="mt-1 font-sans text-xs text-muted-foreground sm:text-sm">
            {address}
          </p>
        )}

        {/* Optional site tags */}
        {!!tags?.length && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer links (optional) */}
        {(website || socialHandle) && (
          <div className="flex items-center mt-1 justify-between text-[11px] font-extralight">
            {website && (
              <a
                className="underline font-mono"
                href={website}
                target="_blank"
                rel="noreferrer"
              >
                {website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {socialHandle && <span>{socialHandle}</span>}
          </div>
        )}

        {location && (
          <Iternary
            route={route}
            onGetDirections={onGetDirections}
            destination={[location.longitude, location.latitude]}
          />
        )}
      </div>
    </div>
  );
}

export function Iternary({
  route,
  destination,
  onGetDirections,
}: {
  route: RouteSummary;
  destination: [number, number];
  onGetDirections: (
    destination: [number, number]
  ) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    // Currently open → clear itinerary
    if (isOpen) {
      setIsOpen(false);
      clearDirections();
      return;
    }

    // Currently closed → calculate route
    try {
      setLoading(true);
      await onGetDirections(destination);
    } finally {
      setLoading(false);
    }
  };

  // When the route has been successfully calculated,
  // open the itinerary.
  useEffect(() => {
    if (route?.steps.length) {
      setIsOpen(true);
    }
  }, [route]);

  return (
    <Collapsible
      open={isOpen}
      className="flex w-full flex-col gap-2"
    >
      <CollapsibleTrigger
        render={
          <Button
            className="w-full"
            variant={isOpen ? "outline" : "default"}
            size="default"
            onClick={handleToggle}
            disabled={loading}
          >
            {isOpen && (<X />)}

            <span>
              {loading
                ? t("layer.actions.calculatingRoute", "Getting iternary...")
                : isOpen
                  ? t("layer.actions.clearRoute", "Clear iternary")
                  : t("layer.actions.getDirections", "Get iternary")}
            </span>
          </Button>
        }
      />

      <CollapsibleContent className="flex flex-col gap-2">
        {route && (
          <>
            <div className="mb-2 flex flex-wrap gap-1">
              <Badge variant="outline">
                <Ruler className="w-3 h-3" />
                {(route.distance / 1000).toFixed(2)}{" "}
                {t("layer.route.unit.kilometer")}
              </Badge>

              <Badge variant="outline">
                <Clock9 className="w-3 h-3" />
                {Math.round(route.duration / 60)}{" "}
                {t("layer.route.unit.minute")}
              </Badge>
            </div>

            {route.steps.length > 4 && (
              <span className="text-xs text-muted-foreground">
                {t("layer.route.remainingSteps", {
                  count: route.steps.length - 4,
                })}
              </span>
            )}
          </>
        )}

        <ItemGroup>
          {route?.steps.slice(0, 4).map((s, i) => (
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
      </CollapsibleContent>
    </Collapsible>
  );
}
