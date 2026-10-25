import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { motion } from "framer-motion";
import {
  Plus,
} from "lucide-react";

import { getMediaUrl } from "@/lib/fileConvert";
import { getItinerary } from "@/lib/api/itinerary";
import { listBusinessListings } from "@/lib/api/listings";
import type { BusinessListing } from "@/shared/contracts";
import { getFriendlyCategoryName } from "@/utils/key-translations";
import { ALL_SPORT_OPTIONS } from "../data/sports";

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
  EmptyContent,
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

import { useModalContext } from "@/components/modal-provider";
import { useStateContext } from "@/components/state-provider";
import { LocationConsent } from "@/components/LocationConsent";
const MotionItem = motion(Item)

type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

type LocationResult =
  | {
    status: "granted";
    coords: Coordinates;
  }
  | {
    status: "denied" | "error";
  };

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ListingRoute = {
  duration: number;
  distance: number;
};

export const SPORT_OPTIONS_BY_KEY = Object.fromEntries(
  ALL_SPORT_OPTIONS.map((sport) => [sport.key, sport])
);

export const Highlights = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [listingRoutes, setListingRoutes] = useState<Record<string, ListingRoute>>({});

  const { setIsOpen, setModalContent } = useModalContext();
  const { setActiveTab, setSelectedPlace } = useStateContext();
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const openBusinessListing = (listing: BusinessListing) => {
    if (!listing._id) return;

    const [lng, lat] = listing.location.coordinates;
    setSelectedPlace({
      id: listing._id,
      lng,
      lat,
      title: listing.name,
      type: "business",
      listing,
    });
  };

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
          const coords = {
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
          console.warn("Geolocation error:", err);

          if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
            setLocationStatus("denied");
          } else {
            setLocationStatus("error");
          }
          resolve(
            {
              status: err.code === GeolocationPositionError.PERMISSION_DENIED
                ? "denied"
                : "error",
            }
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

      items = (await listBusinessListings({
        ...(coordinates
          ? { location: `${coordinates[0]},${coordinates[1]}` }
          : {}),
        status: "published",
        verified: true,
      })) as BusinessListing[];

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
    <div className="space-y-2">

      <h2 className="text-xs tracking-tight text-muted-foreground font-semibold uppercase">
        {t("home.around_me", "Around Me")}
      </h2>

    <Collapsible
      open={open}
      onOpenChange={handleOpenChange}
      className="flex flex-col gap-2"
    >
      {!open && !loading && businessListings.length === 0 && (
        <Empty className="p-6">
          <EmptyHeader>
            <EmptyDescription>
              {t("home.highlighted_businesses", "Highlighted businesses appear here.")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveTab("pro");
              }}
            >
              {t("home.add_your_business", "Show your business here")}
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {!open && loading && businessListings.length === 0 && (
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
          </div>
          <CarouselPrevious
            size="icon-sm"
            variant="secondary"
            className={cn(
              "left-0",
              !canScrollPrev && "hidden"
            )}
          />
          <CarouselNext
            size="icon-sm"
            variant="secondary"
            className={cn(
              "right-0",
              !canScrollNext && "hidden"
            )}
          />
        </Carousel>
      )}

      {!open && businessListings.length > 0 && (
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

            {!loading && businessListings.length > 0 && (
              <CarouselContent className="-ml-1 select-none">
                {!loading && businessListings
                    .filter((item) => item.pack !== "discover")
                    .sort((a, b) => {
                      const order: Record<string, number> = {
                        sponsor: 0,
                        premium: 1,
                        business: 2,
                        starter: 3,
                      };

                      return (order[a.pack] ?? Infinity) - (order[b.pack] ?? Infinity);
                    })
                    .map((item, index) => {

                    return (
                      <CarouselItem
                        key={index}
                        className="basis-2/5 pl-1"
                      >
                        <ListingCard
                          item={item}
                          openBusinessListing={openBusinessListing}
                          listingRoutes={listingRoutes}
                          locationStatus={locationStatus}
                        />
                      </CarouselItem>
                    )
                  })}
              </CarouselContent>
            )}
          </div>

          <CarouselPrevious
            size="icon-sm"
            variant="secondary"
            className={cn(
              "left-0",
              !canScrollPrev && "hidden"
            )}
          />
          <CarouselNext
            size="icon-sm"
            variant="secondary"
            className={cn(
              "right-0",
              !canScrollNext && "hidden"
            )}
          />
        </Carousel>
      )}

      <CollapsibleContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
          {!loading && businessListings
              .filter((item) => item.pack !== "discover")
              .sort((a, b) => {
                const order: Record<string, number> = {
                  sponsor: 0,
                  premium: 1,
                  business: 2,
                  starter: 3,
                };

                return (order[a.pack] ?? Infinity) - (order[b.pack] ?? Infinity);
              })
            .map((item, index) => {
              return (
                <div
                  key={index}
                  className="basis-1/2 pl-0 lg:basis-1/3"
                >
                  <ListingCard
                    item={item}
                    openBusinessListing={openBusinessListing}
                    listingRoutes={listingRoutes}
                    locationStatus={locationStatus}
                  />
                </div>
              )
            })}

          <div className="basis-1/2 pl-0 lg:basis-1/3">
            <MotionItem
              size="sm"
              variant="muted"
              whileTap={{ scale: 0.9, rotate: -6 }}
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18, mass: 0.9 }}
              className={cn(
                "group relative aspect-square overflow-hidden",
                "flex flex-col items-center justify-center gap-2",
                "cursor-pointer",
                "bg-muted/10 hover:bg-muted transition-colors duration-300",
                "bg-[radial-gradient(var(--card)_1px,transparent_1px)] [background-size:8px_8px]",
                "border border-border",
              )}
              onClick={() => {
                setActiveTab("pro");
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
            </MotionItem>
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
    </div> 
  )
}

const ListingCard = ({
  item,
  openBusinessListing,
  listingRoutes,
  locationStatus,
}: {
  item: BusinessListing;
  openBusinessListing: (listing: BusinessListing) => void;
  listingRoutes: Record<string, ListingRoute>;
  locationStatus: LocationStatus;
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";

  return (
    <MotionItem
      size="sm"
      variant="muted"
      whileTap={{ scale: 0.9, rotate: -6 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 18, mass: 0.9 }}
      onClick={() => openBusinessListing(item)}
      className={cn(
        "group relative aspect-square overflow-hidden",
        "cursor-pointer",
        "ring ring-border/10 hover:ring-border/20 transition-colors duration-300",
        // "before:absolute before:transitiona-all before:duration-1000 before:opacity-70 before:-inset-px before:bg-gradient-to-r before:from-[#44BCFF] before:via-[#FF44EC] before:to-[#FF675E] before:blur-lg before:group-hover:opacity-100 before:group-hover:-inset-1 before:group-hover:duration-200 before:animate-tilt",
        // Add glow to premium and sponsor listings
        // (item.pack === "sponsor") && "border border-[var(--accent-color-3)]",
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
        className={cn(
          "size-full absolute inset-0 object-cover",
          "group-hover:scale-105 transition-transform",
          "[mask-image:linear-gradient(to_top,transparent,#000_50%)]",
        )}
        style={{
          backgroundImage: `url(${getMediaUrl(item.photos[0])})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <ItemContent
        className="flex-col justify-end absolute h-1/2 bottom-0 left-0 right-0 p-2"
      >
        {item.pack === "sponsor" && (
          <Badge
            variant="secondary"
            className={cn(
              "text-[9px]/3.5 tracking-normal text-[var(--accent-color-3)] font-heading font-normal uppercase"
            )}
          >
            {t("plans.sponsor", "Sponsor")}
          </Badge>
        )}
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
    </MotionItem>
  )
}
