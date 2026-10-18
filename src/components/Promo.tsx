import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
// import { formatDuration } from "../utils/calendar";
import { useRelativeTime } from "@/utils/helpers";
import { getSportIcon } from "@/utils/helpers";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ALL_SPORT_OPTIONS } from "../data/sports";
import type { BusinessListing } from "@/shared/contracts";
import { listBusinessListings } from "@/lib/api/listings";
import { getMediaUrl } from "@/lib/fileConvert";

type ApiEventsItem = {
  _id: string;
  name: string;
  updatedAt: string;
  startAt: string;
  endAt: string;
  venue: string;
  sport: string;
};

type EventsResponse = {
  success: boolean;
  data: ApiEventsItem[];
};

function Countdown({ targetedDate }: { targetedDate: Date }) {
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


export const SPORT_OPTIONS_BY_KEY = Object.fromEntries(
  ALL_SPORT_OPTIONS.map((sport) => [sport.key, sport])
);

export const Promo = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const { getRelativeTime } = useRelativeTime();
  const [events, setEvents] = useState<ApiEventsItem[]>([]);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [listingError, setListingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const plugin = useRef(
    Autoplay({
      delay: 6000,
      stopOnInteraction: true
    })
  )

  async function loadBusinessListings(
    coordinates?: readonly [number, number],
  ) {
    setListingLoading(true);
    try {
      let items: BusinessListing[] = [];

      items = (await listBusinessListings({
        status: "published",
        verified: true,
      })) as BusinessListing[];

      if (!coordinates) {
      items.sort((a: BusinessListing, b: BusinessListing) => {
        return (a.name || "").localeCompare(b.name || "");
      });
      }

      setBusinessListings(items);
    } finally {
      setListingLoading(false);
    }
  }
  useEffect(() => {
    void loadBusinessListings();
  }, [location]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventLoading(true);
        setError(null);

        const response = await fetch(
          "/api/v2/events?status=published&limit=20"
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const result: EventsResponse = await response.json();

        if (!result.success) {
          throw new Error("Failed to fetch events");
        }

        setEvents(result.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Unable to load events.");
      } finally {
        setEventLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Carousel
      className="relative group w-full overflow-visible"
      orientation="horizontal"
      opts={{
        align: "center",
        loop: true,
      }}
      plugins={[plugin.current, Fade()]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="h-32">
        <CarouselItem className="basis-full">
          <Item
            size="default"
            className={cn(
              "h-full",
              "backdrop-blur-sm bg-gradient-to-b from-[#f2b705]/10 to-[#f2b705]/5",
              "overflow-hidden relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']"
            )}
          >
            <ItemHeader>
              <ItemTitle className="flex items-baseline gap-2">
                <Countdown targetedDate={new Date("2026-10-31T00:00:00")} />
                <Badge variant="secondary" className="uppercase text-xs">
                  31 Oct - 13 Nov 2026
                </Badge>
              </ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>
                {t("home.countdown_description", "Days left until the Dakar 2026 Youth Olympic Games!")}
              </ItemDescription>
            </ItemContent>
          </Item>
        </CarouselItem>

        <CarouselItem className="basis-full">
          <Item
            size="default"
            className={cn(
              "h-full",
              "backdrop-blur-sm",
            )}
          >
            <ItemHeader>
              <ItemTitle>
                <span className="text-2xl font-semibold">
                  {t("pricing.become_partner", "Become a partner")}
                </span>
              </ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>
                {t("pricing.description", "Join us in making the Dakar 2026 Youth Olympic Games a success! Explore partnership opportunities and be part of this exciting event.")}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="secondary"
                size="default"
                onClick={() => navigate("/pricing")}
              >
                {t("pricing.contact_us", "Contact us")}
              </Button>
            </ItemActions>
          </Item>
        </CarouselItem>

        {!error && !eventLoading && (
          <CarouselItem
            // key={index}
            className="basis-full"
          >
            {(events as typeof events).slice(0, 1).map((item, index) => {
              const sport = SPORT_OPTIONS_BY_KEY[item.sport];

              return (
                <Item
                  key={index}
                  size="default"
                  className={cn(
                    "h-full",
                    "group",
                    "backdrop-blur-sm bg-gradient-to-b from-primary/10 to-primary/5",
                  )}
                >
                  <ItemContent className="min-w-0 flex-1">
                    <ItemTitle
                      className="min-w-0 truncate overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {item.name}
                    </ItemTitle>
                    <ItemDescription
                      className="min-w-0 truncate overflow-hidden text-ellipsis whitespace-nowrap"
                      title={getRelativeTime(new Date(item.startAt))}
                    >
                      {new Date(item.startAt).toLocaleDateString(lang, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {/*
                      {" • "}
                      {formatDuration(item.startAt, item.endAt, lang)}
                      */}
                    </ItemDescription>
                  </ItemContent>

                  {sport?.icon && (
                    <ItemMedia variant="default">
                      <Icon
                        className="w-12 h-12"
                        icon={getSportIcon({ sportId: item.sport }) || "mdi:help"}
                      />
                    </ItemMedia>
                  )}
                  <ItemFooter className="shrink-0">
                    <ItemDescription className="text-xs">
                      {item.venue}
                    </ItemDescription>
                  </ItemFooter>

                </Item>
              );
            })}
          </CarouselItem>
        )}

        {!listingError && businessListings
          .filter(
            (item) =>
              item.pack === "sponsor"
          )
          .map((item, index) => {
            return (
              <CarouselItem
                key={index}
                className="basis-full"
              >
                <ListingCard
                  item={item}
                />
              </CarouselItem>
            );
          })}

      </CarouselContent>

      <div className=" z-1000 absolute hidden group-hover:flex right-0 -top-4 items-center gap-1">
        <CarouselPrevious size="icon-sm" variant="secondary" className="static translate-x-0 translate-y-0" />
        <CarouselNext size="icon-sm" variant="secondary" className="static translate-x-0 translate-y-0" />
      </div>
    </Carousel>
  )
}

const ListingCard = ({
  item,
}: {
  item: BusinessListing;
}) => {
  const { t } = useTranslation();
  return (
    <Item
      variant="default"
      size="default"
      className={cn(
        // "h-full",
        "backdrop-blur-sm",
      )}
    >
      <ItemMedia
        variant="image"
        className="aspect-square w-16 sm:w-24 h-full shrink-0"
      >
        {item.photos && item.photos.length > 0 ? (
          <img
            src={getMediaUrl(item.photos[0])}
            alt={item.name}
            className="aspect-square object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center z-10 aspect-square w-full justify-center bg-background/50 text-foreground/30">
            {t("no_image", "No image")}
          </div>
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <span className="text-2xl font-semibold">
            {item.name}
          </span>
        </ItemTitle>
        <ItemDescription className="text-sm line-clamp-2">
          {item.desc}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
