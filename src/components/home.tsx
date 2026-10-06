import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { getMediaUrl } from "@/lib/fileConvert";
import { getFriendlyCategoryName } from "@/utils/key-translations";
import {
  CheckCircle2,
  MapPin,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useModalContext } from "@/components/modal-provider";
import { useStateContext } from "@/components/state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Promo } from "./Promo";
import { QuickAccess } from "./QuickAccess";
import { StatsSection } from "./StatsSection";

import {
  listBusinessListings,
} from "@/lib/api/listings";
import type { BusinessListing } from "@/shared/contracts";
import { getItinerary } from "@/lib/api/itinerary";

type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ListingRoute = {
  duration: number;
  distance: number;
};

type LocationConsentProps = {
  requestLocation: () => Promise<Exclude<LocationStatus, "idle" | "requesting">>;
  initialStatus: LocationStatus;
  onClose: () => void;
  onContinue: () => void;
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
    setStatus(await requestLocation());
  };

  if (status === "requesting") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <Spinner className="size-8 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">
            {t("location.requesting", "Requesting your location")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("location.requestingDescription", "Please allow location access in your browser.")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "granted") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-medium">
            {t("location.granted", "Location access granted")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("location.grantedDescription", "We will show listings closest to you.")}
          </p>
        </div>
        <Button type="button" onClick={onContinue}>
          {t("location.showListings", "Show nearby listings")}
        </Button>
      </div>
    );
  }

  const isDenied = status === "denied";
  const isError = status === "error";

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {isDenied || isError ? (
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        )}
        <div className="space-y-1">
          <p className="font-medium">
            {isDenied
              ? t("location.denied", "Location access was denied")
              : isError
                ? t("location.error", "We couldn't determine your location")
                : t("location.title", "Use your location?")}
          </p>
          <p className="text-sm text-muted-foreground">
            {isDenied
              ? t("location.deniedDescription", "Enable location access in your browser settings, then try again.")
              : isError
                ? t("location.errorDescription", "Please check your location settings and try again.")
                : t("location.description", "We use your location to show relevant businesses and listings around you.")}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("close", "Close")}
        </Button>
        <Button type="button" onClick={() => void handleRequest()}>
          {isDenied || isError
            ? t("location.tryAgain", "Try again")
            : t("use_my_location", "Use this location")}
        </Button>
      </div>
    </div>
  );
}

export const HomeContent = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [loading, setLoading] = useState(true);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [listingRoutes, setListingRoutes] = useState<Record<string, ListingRoute>>({});

  const { setIsOpen, setModalContent } = useModalContext();
  const { setActiveTab } = useStateContext();
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const getLocation = () =>
    new Promise<Exclude<LocationStatus, "idle" | "requesting">>((resolve) => {
      if (!("geolocation" in navigator)) {
        setLocationStatus("error");
        resolve("error");
        return;
      }

      setLocationStatus("requesting");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          setLocation(coords);
          setLocationStatus("granted");
          resolve("granted");
        },
        (err) => {
          console.warn("Geolocation error:", err);

          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            setLocationStatus("denied");
          } else {
            setLocationStatus("error");
          }
          resolve(
            err.code === GeolocationPositionError.PERMISSION_DENIED
              ? "denied"
              : "error",
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        },
      );
    });

  useEffect(() => {
    let permissionStatus: PermissionStatus | undefined;

    const updatePermissionStatus = () => {
      if (!permissionStatus) return;

      if (permissionStatus.state === "granted") {
        setLocationStatus("granted");
        void getLocation();
      } else if (permissionStatus.state === "denied") {
        setLocationStatus("denied");
      } else {
        setLocationStatus("idle");
      }
    };

    if (!("permissions" in navigator)) return;

    void navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        permissionStatus = result;
        updatePermissionStatus();
        permissionStatus.addEventListener("change", updatePermissionStatus);
      })
      .catch(() => {
        // Browsers that do not expose geolocation permission state use the
        // normal request flow when the user opens the location prompt.
      });

    return () => {
      permissionStatus?.removeEventListener("change", updatePermissionStatus);
    };
    // The permission state is intentionally checked only when this screen mounts.
  }, []);

  useEffect(() => {
    if (!location || locationStatus !== "granted") {
      setListingRoutes({});
      return;
    }

    if (businessListings.length === 0) {
      return;
    }

    const getEtas = async () => {
      if (!location || locationStatus !== "granted") return;

      setListingRoutes({});

      await Promise.all(
        businessListings.flatMap((listing) => {
          if (!listing._id) return [];

          return getItinerary({
            coordinates: [
              [location.longitude, location.latitude],
              listing.location.coordinates,
            ],
            profile: "driving-car",
            format: "json",
          })
            .then((itinerary) => {
              const route = itinerary.routes[0]?.summary;
              if (!route) return;

              setListingRoutes((currentRoutes) => ({
                ...currentRoutes,
                [listing._id!]: route,
              }));
            })
            .catch((error) => {
              console.warn(`Could not calculate route for listing ${listing._id}:`, error);
            });
        })
      );
    };

    void getEtas();
  }, [location, locationStatus, businessListings]);

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    update()

    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  const handleOpenChange = (nextOpen: boolean) => {
    // Opening: allow it immediately
    if (!nextOpen) {
      setOpen(false);
      return;
    }
    // Already have permission → open immediately
    if (locationStatus === "granted" && location) {
      setOpen(true);
      return;
    }

    setModalContent({
      title: t("location.title", "Use your location?"),
      size: "md",
      children: (
        <LocationConsent
          requestLocation={getLocation}
          initialStatus={locationStatus}
          onClose={() => setIsOpen(false)}
          onContinue={() => {
            setIsOpen(false);
            setOpen(true);
          }}
        />
      ),
      onConfirm: () => void getLocation(),
      onClose: () => {
        setIsOpen(false);
      },
      footer: null,
    });

    setIsOpen(true);
  };

  async function loadBusinessListings(
    coordinates?: readonly [number, number],
  ) {
    setLoading(true);
    try {
      let items: BusinessListing[] = [];

      items = (await listBusinessListings(
        coordinates
          ? { location: `${coordinates[0]},${coordinates[1]}` }
          : undefined,
      )) as BusinessListing[];

      if (!coordinates) {
      items.sort((a: BusinessListing, b: BusinessListing) => {
        // if (sort === "updated") {
        //   const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        //   const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        //   if (bt !== at) return bt - at;
        // }
        return (a.name || "").localeCompare(b.name || "");
      });
      }

      setBusinessListings(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBusinessListings(
      location ? [location.latitude, location.longitude] : undefined,
    );
  }, [location]);

  return (
    <div className="flex flex-col gap-4 py-4">
      <Promo />
      <Collapsible
        open={open}
        onOpenChange={handleOpenChange}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-1 w-full">
          <h2 className="text-xs text-muted-foreground uppercase">
            {t("home.around_me", "Around Me")}
          </h2>
        </div>

        {!loading && businessListings.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyDescription>
                {t("highlighted_businesses", "Highlighted businesses will appear here.")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!open && (
          <Carousel
            setApi={setApi}
            className="w-full relative"
            orientation="horizontal"
            opts={{
              align: "start",
            }}
            >
            <div
              className={cn(
                "relative",
                canScrollPrev && canScrollNext &&
                "[mask-image:linear-gradient(to_right,transparent,#000_48px,#000_calc(100%-48px),transparent)]",
                !canScrollPrev && canScrollNext &&
                "[mask-image:linear-gradient(to_right,#000,#000_calc(100%-48px),transparent)]",
                canScrollPrev && !canScrollNext &&
                "[mask-image:linear-gradient(to_right,transparent,#000_48px,#000)]",
              )}
            >
            {loading && (
            <CarouselContent className="-ml-1 select-none">
              {[...Array(3)].map((_, i) => (
                <CarouselItem
                  key={i}
                  className="basis-2/5 pl-1"
                >
                  <Skeleton className="aspect-square overflow-hidden rounded-3xl p-4 space-y-3" >
                    <Skeleton className="h-4 w-1/2 rounded bg-foreground/20" />
                    <Skeleton className="h-3 w-2/3 rounded bg-foreground/20" />
                    <Skeleton className="h-8 w-full rounded bg-foreground/20" />
                  </Skeleton>
                </CarouselItem>
              ))}
            </CarouselContent>
            )}

            {!open && !loading && businessListings.length > 0 && (
            <CarouselContent className="-ml-1 select-none">
              {!loading && businessListings
                .filter(
                  (item) =>
                    item.pack !== "discover" &&
                    item.pack !== "essential"
                )
                .sort((a, b) => {
                  if (a.pack === "sponsor") return -1;
                  if (b.pack === "sponsor") return 1;
                  return 0;
                }).map((item, index) => {

                return (
                  <CarouselItem
                    key={index}
                    className="basis-2/5 pl-1"
                  >
                    <Item
                      size="sm"
                      variant="muted"
                      className={cn(
                        "group relative aspect-square overflow-hidden",
                      )}
                    >
                      <Badge
                        variant="secondary"
                        className={cn(
                          "absolute start-1.5 top-1.5 z-20",
                          "text-[9px] uppercase"
                        )}
                      >
                        {getFriendlyCategoryName(item.cat, t)}
                      </Badge>
                      <ItemMedia variant="default" className="h-full absolute inset-0"
                        style={{
                          backgroundImage: `url(${getMediaUrl(item.photos[0])})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      />
                      <ItemContent className="flex-col justify-end absolute h-1/2 bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2">
                        <ItemTitle
                          title={item.name}
                          className={cn(
                            "w-full line-clamp-1 overflow-hidden text-ellipsis",
                            "text-xs/3.5 tracking-normal font-heading font-normal"
                          )}
                        >
                          {item.name}
                        </ItemTitle>
                        {locationStatus === "granted" && listingRoutes[item._id ?? ""] && (
                          <ItemDescription className="text-xs/3.5">
                            {new Intl.NumberFormat(lang).format(
                              Math.round(listingRoutes[item._id ?? ""].duration / 60),
                            )} {t("home.minutes_short", "min")}
                            {" • "}
                            {new Intl.NumberFormat(lang, {
                              maximumFractionDigits: 1,
                            }).format(listingRoutes[item._id ?? ""].distance / 1000)} {t("home.kilometers_short", "km")}
                          </ItemDescription>
                        )}
                      </ItemContent>
                    </Item>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            )}
            </div>

            <CarouselPrevious size="icon-sm" variant="secondary" className="left-0" />
            <CarouselNext size="icon-sm" variant="secondary" className="right-0" />
          </Carousel>
        )}

        <CollapsibleContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
            {!loading && businessListings
              .filter(
                (item) =>
                  item.pack !== "discover" &&
                  item.pack !== "essential"
              )
              .sort((a, b) => {
                if (a.pack === "sponsor") return -1;
                if (b.pack === "sponsor") return 1;
                return 0;
              })
              .map((item, index) => {
                return (
                <div
                  key={index}
                  className="basis-1/2 pl-0 lg:basis-1/3"
                >
                  <Item
                    key={index}
                    size="sm"
                    variant="muted"
                    className={cn(
                      "group relative aspect-square overflow-hidden",
                    )}
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "absolute start-1.5 top-1.5 z-20",
                        "text-[9px] uppercase"
                      )}
                    >
                      {getFriendlyCategoryName(item.cat, t)}
                    </Badge>
                    <ItemMedia
                      variant="default"
                      className="h-full absolute inset-0"
                      style={{
                        backgroundImage: `url(${getMediaUrl(item.photos[0])})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    <ItemContent
                      className="flex-col justify-end absolute h-1/2 bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2"
                    >
                      <ItemTitle
                        title={item.name}
                        className={cn(
                          "w-full line-clamp-1 overflow-hidden text-ellipsis",
                          "text-xs/3.5 tracking-normal font-heading font-normal"
                        )}
                      >
                        {item.name}
                      </ItemTitle>
                      {locationStatus === "granted" && listingRoutes[item._id ?? ""] && (
                        <ItemDescription className="text-xs/3.5">
                          {new Intl.NumberFormat(lang).format(
                            Math.round(listingRoutes[item._id ?? ""].duration / 60),
                          )} {t("home.minutes_short", "min")}
                          {" • "}
                          {new Intl.NumberFormat(lang, {
                            maximumFractionDigits: 1,
                          }).format(listingRoutes[item._id ?? ""].distance / 1000)} {t("home.kilometers_short", "km")}
                        </ItemDescription>
                      )}
                    </ItemContent>
                  </Item>
                </div>
              )
            })}

            <div className="basis-1/2 pl-0 lg:basis-1/3">
              <Item
                size="sm"
                variant="muted"
                className={cn(
                  "group relative aspect-square overflow-hidden",
                  "flex flex-col items-center justify-center gap-2",
                  "hover:bg-primary/10 cursor-pointer"
                )}
                onClick={() => {
                  setActiveTab("business");
                }}
              >
                <ItemMedia
                  variant="default"
                  className={cn(
                    "w-12 h-12",
                    "-z-10",
                    "absolute top-1/3 -translate-x-0 -translate-y-1/2"
                  )}
                >
                  <Plus
                    className={cn(
                      "w-12 h-12",
                      "text-muted-foreground/20"
                    )}
                  />
                </ItemMedia>
                <ItemContent
                  className="flex-col justify-end absolute h-full bottom-0 left-0 right-0 p-2"
                >
                  <ItemTitle
                    className={cn(
                      "w-full line-clamp-2 overflow-hidden text-ellipsis",
                      "text-center text-xs/3.5 tracking-normal font-heading font-normal"
                    )}
                  >
                    {t("home.add_your_business", "Show your business here")}
                  </ItemTitle>
                </ItemContent>
              </Item>
            </div>
          </div>
        </CollapsibleContent>
        <CollapsibleTrigger
          render={
            <Button
              className="w-full"
              variant="link"
              size="xs"
            >
              {!open
                ? t("see_more_relevant_listings", "See more relevant listings")
                : t("see_less", "See less")}
            </Button>
          }
        />
      </Collapsible>

      <QuickAccess />

      <StatsSection />
    </div>
  );
}
