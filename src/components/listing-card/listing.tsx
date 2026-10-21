import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import {
  Check,
  Clock9,
  Copy,
  ExternalLink,
  Globe,
  BadgeCheck,
  MapPin,
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
} from "lucide-react";
import { getDomain } from "tldts";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import type { BusinessListing } from "../../shared/contracts";
import { useStateContext } from "../state-provider";
import { getFriendlyCategoryName } from "@/utils/key-translations";
import { getMediaUrl } from "@/lib/fileConvert";
import { useClipboard } from "use-clipboard-copy";

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

export function BusinessDetails({ listing }: { listing: unknown }) {
  const { t } = useTranslation();
  const business = listing as BusinessListing | null;
  const { setSelectedPlace } = useStateContext();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  if (!business) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyDescription>
            {t("place.details.not_found", "Business not found.")}
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="relative flex flex-col gap-2">
      <div className="absolute top-16 start-3">
        <Button
          size="icon"
          variant="secondary"
          className="fixed top-16 start-3 z-50"
          onClick={() => setSelectedPlace(null)}
        >
          <ArrowLeft />
          <span className="sr-only">{t("place.details.back", "Back")}</span>
        </Button>
      </div>

      <div className="w-full h-full flex flex-col items-stretch justify-center overflow-y-auto">
        <div className="w-full flex flex-col gap-2 py-2">
          <div className="relative w-full rounded-2xl overflow-hidden">
            {business.photos?.[0] ? (
              <div className="relative space-y-2">
                <Carousel className="w-full" setApi={setApi}>
                  <CarouselContent>
                    {business.photos.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="absolute bottom-0 bg-gradient-to-t from-background to-transparent w-full h-1/4 aspect-video object-cover" />
                        <img
                          alt={business.name}
                          className="size-full rounded-2xl aspect-video object-cover"
                          src={getMediaUrl(image)}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                <Carousel className="w-full">
                  <div className="mask-x-from-90%">
                    <CarouselContent className="my-1 flex">
                      {business.photos.map((image, index) => (
                        <CarouselItem
                          className={cn(
                            "basis-1/4 cursor-pointer transition-opacity",
                            current === index + 1 ? "opacity-100" : "opacity-50"
                          )}
                          key={index}
                          onClick={() => handleThumbClick(index)}
                        >
                          <img
                            alt={business.name}
                            className="size-full rounded-2xl aspect-video object-cover"
                            src={getMediaUrl(image)}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </div>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            ) : (
              <div className="mt-20" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="flex-1 text-xl/6">{business.name}</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm/7 font-extralight text-muted-foreground">
                {getFriendlyCategoryName(business.cat, t)}
              </span>
            </div>

            <Separator />
          </div>

          {business.desc && (
            <div>
              <p className="text-sm/7 text-foreground/60 leading-snug">
                {business.desc}
              </p>
            </div>
          )}

          <ItemGroup className="flex flex-col !gap-0.5">
            {business.address && (
              <ListItem
                value={business.address}
                icon={<MapPin />}
                copiable
              />
            )}

            {business.tel && (
              <ListItem
                value={business.tel}
                icon={<Phone />}
                copiable
                link={`tel:${business.tel}`}
              />
            )}

            {business.email && (
              <ListItem
                value={business.email}
                icon={<Mail />}
                copiable
                link={`mailto:${business.email}`}
              />
            )}

            {business.wa && (
              <ListItem
                value={business.wa}
                icon={<MessageCircle />}
                copiable
                link={`https://wa.me/${business.wa}`}
              />
            )}

            {business.website && (
              <ListItem
                value={getDomain(business.website)}
                icon={<Globe />}
                copiable
                external
                link={business.website}
              />
            )}

            {business.social && (
              <ListItem
                value={business.social}
                icon={<BadgeCheck />}
                copiable
              />
            )}

            {business.openHours && (
              <ListItem
                value={business.openHours}
                icon={<Clock9 />}
              />
            )}
          </ItemGroup>
        </div>
      </div>
    </div>
  );
}

const ListItem = ({
  value,
  icon,
  copiable = false,
  external = false,
  link,
}: {
  value: string | null;
  icon: React.ReactNode;
  copiable?: boolean;
  external?: boolean;
  link?: string;
}) => {
  const clipboard = useClipboard();
  const { t } = useTranslation();

  const handleCopy = () => {
    clipboard.copy(value);
  };

  const handleNavigate = () => {
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Item
      size="xs"
      variant="default"
      className="group items-start"
    >
      <ItemMedia variant="icon">{icon}</ItemMedia>

      <ItemContent>
        <ItemDescription
          className={cn(
            "break-all",
            external && "underline cursor-pointer"
          )}
          onClick={external && link ? handleNavigate : undefined}
        >
          {value}
        </ItemDescription>
      </ItemContent>

      {(copiable || (external && link)) && (
        <ItemActions>
          {copiable && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={handleCopy}
              className="sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
              aria-label={t("common.copy", "Copy")}
            >
              {clipboard.copied ? <Check /> : <Copy />}
            </Button>
          )}

          {external && link && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={handleNavigate}
              aria-label={t("common.navigate", "Navigate")}
            >
              <ExternalLink />
            </Button>
          )}
        </ItemActions>
      )}
    </Item>
  );
}
