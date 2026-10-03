import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import {
  ChevronLeft,
  Clock9,
  CircleDot,
  Ruler,
  X,
  Globe,
  BadgeCheck,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { getDomain } from "tldts";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { Place } from "../../shared/contracts";
import { useStateContext } from "../state-provider";
import { ManeuverIcon } from "../maneuverIcons";
import { getPlace } from "@/lib/api/places";
import { getMainCategoryColor, getMainCategoryIcon } from "../place-list/place-list-utils";
import { getDirections, clearDirections } from "../../utils/directions";
import { getLocalizedCategory } from "../place-list/categoryTranslations";
import { useModalContext } from "../modal-provider";

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

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "error";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationResult =
  | {
    status: "granted";
    coords: Coordinates;
  }
  | {
    status: "denied" | "error";
  };

type LocationConsentProps = {
  requestLocation: () => Promise<LocationResult>;
  initialStatus: LocationStatus;
  onClose: () => void;
  onContinue: (coords: Coordinates) => void;
};

function LocationConsent({
  requestLocation,
  initialStatus,
  onClose,
  onContinue,
}: LocationConsentProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<LocationStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleRequest = async () => {
    setStatus("requesting");

    const result = await requestLocation();

    setStatus(result.status);

    if (result.status === "granted") {
      onContinue(result.coords);
    }
  };

  if (status === "requesting") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <Spinner className="size-8 text-primary" />

        <div className="space-y-1">
          <p className="font-medium">
            {t(
              "location.requesting",
              "Requesting your location"
            )}
          </p>

          <p className="text-sm text-muted-foreground">
            {t(
              "location.requestingDescription",
              "Please allow location access in your browser."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (status === "granted") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2
          className="size-10 text-green-600"
          aria-hidden="true"
        />

        <div className="space-y-1">
          <p className="font-medium">
            {t(
              "location.granted",
              "Location access granted"
            )}
          </p>

          <p className="text-sm text-muted-foreground">
            {t(
              "location.grantedDescription",
              "Your location will be used to calculate the route."
            )}
          </p>
        </div>
      </div>
    );
  }

  const isDenied = status === "denied";
  const isError = status === "error";

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {isDenied || isError ? (
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
        ) : (
          <MapPin
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
        )}

        <div className="space-y-1">
          <p className="font-medium">
            {isDenied ?
              t("location.denied", "Location access was denied")
              : isError ?
                t("location.error", "We couldn't determine your location")
                : t("location.title", "Use your location?")
            }
          </p>

          <p className="text-sm text-muted-foreground">
            {isDenied ?
              t("location.deniedDescription", "Enable location access in your browser settings, then try again.")
              : isError ?
                t("location.errorDescription", "Please check your location settings and try again.")
                : t("location.description", "We use your location to provide accurate routes.")
            }
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          {t("close", "Close")}
        </Button>

        <Button
          type="button"
          onClick={() => void handleRequest()}
        >
          {isDenied || isError
            ? t("location.tryAgain", "Try again")
            : t("use_my_location", "Use this location")}
        </Button>
      </div>
    </div>
  );
}

export function PlaceDetails({ id }: PlaceDetailsProps) {
  const { t } = useTranslation();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteSummary>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const { setSelectedPlace } = useStateContext();
  const { setModalContent, setIsOpen } = useModalContext();

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
    setRoute(null);
    setSelectedPlace(null);
  };

  /*
   * Get browser location
   */
  const getLocation = (): Promise<LocationResult> =>
    new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setLocationStatus("error");

        resolve({
          status: "error",
        });

        return;
      }

      setLocationStatus("requesting");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          setLocation(coords);
          setLocationStatus("granted");

          resolve({
            status: "granted",
            coords,
          });
        },
        (err) => {
          console.warn(
            "Geolocation error:",
            err
          );

          const status =
            err.code ===
              GeolocationPositionError.PERMISSION_DENIED
              ? "denied"
              : "error";

          setLocationStatus(status);

          resolve({
            status,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        }
      );
    });

  /*
   * Calculate route
   */
  const calculateDirections = async (
    origin: Coordinates,
    destination: [number, number]
  ) => {
    setRoute(null);

    try {
      /*
       * IMPORTANT:
       *
       * destination is [longitude, latitude].
       *
       * This assumes your directions utility also expects
       * [longitude, latitude].
       */
      const itinerary = await getDirections(
        [
          origin.longitude,
          origin.latitude,
        ],
        destination
      );

      setRoute(itinerary);
    } catch (error) {
      console.error(
        "Directions failed:",
        error
      );

      toast.error(
        t(
          "place.details.directions.error",
          "Failed to calculate directions."
        )
      );
    }
  };

  /*
   * Get directions
   */
  const handleGetDirections = async (
    destination: [number, number]
  ) => {
    setRoute(null);

    /*
     * We already have the user's location.
     * No permission modal is necessary.
     */
    if (
      locationStatus === "granted" &&
      location
    ) {
      await calculateDirections(
        location,
        destination
      );

      return;
    }

    /*
     * Ask for location.
     */
    setModalContent({
      title: t(
        "location.title",
        "Use your location?"
      ),

      size: "md",

      children: (
        <LocationConsent
          requestLocation={getLocation}
          initialStatus={locationStatus}
          onClose={() =>
            setIsOpen(false)
          }
          onContinue={async (coords) => {
            setIsOpen(false);

            await calculateDirections(
              coords,
              destination
            );
          }}
        />
      ),

      onClose: () => {
        setIsOpen(false);
      },

      footer: null,
    });

    setIsOpen(true);
  };

  return (
    <div className="relative flex flex-col gap-2">
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
    name,
    nameFr,
    imageUrl,
    mainCategoryId,
    categoryId,
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
  const nameText = lang.startsWith("fr") ? (nameFr ?? "").trim() || name : name;
  const infoText = lang.startsWith("fr") ? (infoFr ?? "").trim() || info : info;
  const [infoExpanded, setInfoExpanded] = useState(false);

  const mainCategory = mainCategoryId as string | undefined;
  const CatIcon = getMainCategoryIcon(mainCategory);
  const color = getMainCategoryColor(mainCategory);

  return (
    <div className="w-full flex flex-col gap-2 py-2">
      <div className="relative w-full rounded-2xl overflow-hidden">
        {/* Hero image */}
        {imageUrl ? (
          <>
            <div className="absolute bottom-0 bg-gradient-to-t from-background to-transparent w-full h-1/4 aspect-video object-cover" />
            <img
              src={imageUrl}
              alt={nameText}
              loading="lazy"
              className="w-full rounded-2xl aspect-video object-cover"
            />
          </>
        ) : <div className="mt-20" />}

        <div className={cn(
          "absolute start-2 bottom-2 flex items-center justify-between",
          "flex flex-col items-center justify-center gap-0.25"
        )}>
          {brandTitle && (
            <div className="text-foreground/90 font-light tracking-wider text-sm/3 text-center uppercase">{brandTitle}</div>
          )}

          {brandSubtitle && (
            <div className="text-foreground/90 font-light tracking-tighter text-[8px]/3 text-center uppercase">
              {brandSubtitle}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="flex-1 text-xl/6">
              {nameText}
            </h2>

            {locationLabel && (
              <Badge
                variant="secondary"
                className="flex items-center justify-center gap-0.5 text-muted-foreground"
              >
                <CircleDot />

                <span className="text-[11px] tracking-tight leading-tight font-mono uppercase">
                  {locationLabel}
                </span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <CatIcon
              className="w-3.75 h-3.75"
              style={{ color: color }}
            />

            {/* {getCategoryIcon(categoryId)} */}
            <span className="text-sm/7 font-extralight text-muted-foreground">
              {getLocalizedCategory(categoryId as any, t)}
            </span>
          </div>
          <Separator />
        </div>

        {location && (
          <Iternary
            route={route}
            onGetDirections={onGetDirections}
            destination={[location.longitude, location.latitude]}
          />
        )}

        {/* Sports strip */}
        {sports?.length ? (
          <div className="grid grid-cols-6 gap-1">
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
          <div>
            <p className="text-sm/7 text-foreground/60 leading-snug"
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
            </Button>
          </div>
        )}

        {/* Optional site tags */}
        {!!tags?.length && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs px-2 py-1 uppercase"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <ItemGroup className="flex flex-col !gap-0.5">
          {address && (
            <Item size="xs" variant="default">
              <ItemMedia variant="icon">
                <MapPin />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>
                  <span className="text-sm">
                    {address}
                  </span>

                </ItemDescription>
              </ItemContent>
            </Item>
          )}

          {website && (
            <Item size="xs" variant="default">
              <ItemMedia variant="icon">
                <Globe />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>
                  <a
                    className="underline text-sm font-mono"
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {getDomain(website)}
                  </a>
                </ItemDescription>
              </ItemContent>
            </Item>
          )}

          {socialHandle && (
            <Item size="xs" variant="default">
              <ItemMedia variant="icon">
                <BadgeCheck />
              </ItemMedia>
              <ItemContent>
                <ItemDescription>
                  <span className="text-sm font-mono">
                    {socialHandle}
                  </span>
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
        </ItemGroup>
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
