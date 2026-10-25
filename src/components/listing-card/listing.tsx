import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { useUser, useClerk } from "@clerk/clerk-react";
import Fade from "embla-carousel-fade";
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
  Unlock,
} from "lucide-react";
import { getDomain } from "tldts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useStateContext } from "../state-provider";
import { getFriendlyCategoryName } from "@/utils/key-translations";
import { getMediaUrl } from "@/lib/fileConvert";
import { useClipboard } from "use-clipboard-copy";
import { useImageStatus } from "@/hooks/use-image-status";
import type { BusinessListing } from "../../shared/contracts";
import { BUSINESS_CATEGORIES } from "../business/business-create.config";
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

function PlaceMedia({
  image,
  placeName,
  category,
}: {
  image: BusinessListing["photos"][number];
  placeName: string;
  category: string;
}) {
  const { t } = useTranslation();
  const imageUrl = getMediaUrl(image);
  const status = useImageStatus(imageUrl);

  if (status === "loading") {
    return <Skeleton className="group relative aspect-video overflow-hidden" />;
  }

  if (status !== "loaded") return null;

  return (
    <Item
      variant="muted"
      className="group relative aspect-video overflow-hidden"
    >
      <ItemMedia
        variant="default"
        className={cn(
          "size-full absolute inset-0 object-cover",
          "[mask-image:linear-gradient(to_top,transparent,#000_50%)]",
        )}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <ItemContent
        className={cn(
          "flex-col justify-end",
          "absolute h-1/2 bottom-0 left-0 right-0 p-2.5",
        )}
      >
        <ItemTitle
          title={placeName}
          className={cn(
            "w-full overflow-hidden text-ellipsis",
            "text-xl/6 tracking-normal text-foreground font-heading font-extralight",
          )}
        >
          {placeName}
        </ItemTitle>

        <div className="flex items-center gap-1.5">
          <span className="text-sm/5 font-extralight text-muted-foreground">
            {getFriendlyCategoryName(category, t)}
          </span>
        </div>
      </ItemContent>
    </Item>
  );
}

export function BusinessDetails({ listing }: { listing: unknown }) {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useUser();
  const { redirectToSignIn } = useClerk();
  const business = listing as BusinessListing | null;
  const { setSelectedPlace } = useStateContext();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { setIsOpen, setModalContent } = useModalContext();

  const handleRequireSignIn = () => {
    setModalContent({
      title: t("auth.sign_in_required", "Sign in required"),
      size: "md",
      children: (
        <p>
          {t(
            "place.contact_sign_in_message",
            "You need to sign in to view this business's contact information. Would you like to sign in now?"
          )}
        </p>
      ),
      onClose: () => {
        setIsOpen(false);
      },
      footer: (
        <>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t("common.cancel", "Cancel")}
          </Button>

          <Button
            variant="default"
            onClick={() => {
              void redirectToSignIn();
              setIsOpen(false);
            }}
          >
            {t("auth.sign_in", "Sign in")}
          </Button>
        </>
      ),
    });

    setIsOpen(true);
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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

  const handleThumbClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );
  const category = BUSINESS_CATEGORIES[business.cat as keyof typeof BUSINESS_CATEGORIES];

  return (
    <div className="relative flex flex-col gap-2">
      <div className="absolute top-16 start-3">
        <Button
          size="icon"
          variant="secondary"
          className="fixed max-sm:top-8 top-16 start-3 z-50"
          onClick={() => setSelectedPlace(null)}
        >
          <ArrowLeft />
          <span className="sr-only">{t("place.details.back", "Back")}</span>
        </Button>
      </div>

      <div className="w-full h-full flex flex-col items-stretch justify-center overflow-y-auto">
        <div className="w-full flex flex-col gap-2 py-2">
          <div className="relative w-full rounded-2xl overflow-hidden">
            {business.photos.length > 0 ? (
              <div className="relative space-y-1">
                <Carousel
                  className="relative w-full"
                  setApi={setApi}
                  plugins={[Fade()]}
                >
                  <CarouselContent>
                    {business.photos.map((image, index) => {
                      return (
                        <CarouselItem className="overflow-hidden" key={index}>
                          <PlaceMedia
                            image={image}
                            placeName={business.name}
                            category={business.cat}
                          />
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                </Carousel>

                {business.photos.length > 1 && (
                <Carousel
                  orientation="horizontal"
                  className="w-full"
                >
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
                )}
              </div>
            ) : (
              <Item
                variant="muted"
                className={cn(
                  "group relative aspect-[16/6] overflow-hidden",
                )}
              >
                <ItemContent
                  className={cn(
                    "flex-col justify-end",
                    "absolute h-1/2 bottom-0 left-0 right-0 p-2.5",
                  )}
                >
                  <ItemTitle
                    title={business.name}
                    className={cn(
                      "w-full line-clamp-2 overflow-hidden text-ellipsis",
                      "text-xl/6 tracking-normal text-foreground font-heading font-extralight"
                    )}
                  >
                    {business.name}
                  </ItemTitle>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm/5 font-extralight text-muted-foreground">
                      {getFriendlyCategoryName(business.cat, t)}
                    </span>
                  </div>
                </ItemContent>
              </Item>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Tabs
            defaultValue="description"
            className="w-full"
          >
            <TabsList
              variant="line"
              className="w-full"
            >
              <TabsTrigger value="description" className="w-full">
                {t("place.description", "Description")}
              </TabsTrigger>
              <TabsTrigger value="contact" className="w-full">
                {t("place.contact", "Contact")}
              </TabsTrigger>
              <TabsTrigger value="details" className="w-full">
                {t("place.details", "Details")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="w-full">
              {business.desc && (
                <div className="p-1">
                  <p className="text-sm/7 text-muted-foreground leading-snug">
                    {business.desc}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="details" className="w-full">
              {business.spec && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {category?.fields.map((field) => {
                      const value = business.spec?.[field.name as keyof typeof business.spec];

                      if (!Array.isArray(value) || value.length === 0) return null;

                      return value.map((item, index) => {
                        const options = "options" in field ? field.options : undefined;

                        const option = options?.find(
                          (option) => option.value === item
                        );

                        return (
                          <Badge
                            key={`${field.name}-${index}`}
                            variant="outline"
                            className="px-3 py-3"
                          >
                            {option?.label ?? String(item)}
                          </Badge>
                        );
                      });
                    })}
                  </div>

                  {/* Scalar values as list items */}
                  {category?.fields.map((field) => {
                    const value = business.spec?.[field.name as keyof typeof business.spec];

                    if (value == null || value === "" || Array.isArray(value)) {
                      return null;
                    }

                    const options = "options" in field ? field.options : undefined;
                    const option = options?.find(
                      (option) => option.value === value
                    );

                    return (
                      <ListItem
                        key={field.name}
                        label={field.label}
                        value={`${option?.label ?? String(value)}${field.unit ? ` ${field.unit}` : ""}`}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
            <TabsContent value="contact" className="w-full">
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
                    isAuthGuarded={!isLoaded || !isSignedIn}
                    onRequireSignIn={handleRequireSignIn}
                    value={business.tel}
                    icon={<Phone />}
                    copiable
                    link={`tel:${business.tel}`}
                  />
                )}

                {business.email && (
                  <ListItem
                    isAuthGuarded={!isLoaded || !isSignedIn}
                    onRequireSignIn={handleRequireSignIn}
                    value={business.email}
                    icon={<Mail />}
                    copiable
                    link={`mailto:${business.email}`}
                  />
                )}

                {business.wa && (
                  <ListItem
                    isAuthGuarded={!isLoaded || !isSignedIn}
                    onRequireSignIn={handleRequireSignIn}
                    value={business.wa}
                    icon={<MessageCircle />}
                    copiable
                    link={`https://wa.me/${business.wa}`}
                  />
                )}

                {business.website && (
                  <ListItem
                    isAuthGuarded={!isLoaded || !isSignedIn}
                    onRequireSignIn={handleRequireSignIn}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const ListItem = ({
  isAuthGuarded = false,
  onRequireSignIn,
  label,
  value,
  icon,
  copiable = false,
  external = false,
  link,
}: {
  isAuthGuarded?: boolean;
  onRequireSignIn?: () => void;
  label?: string | null;
  value: string | null;
  icon?: React.ReactNode;
  copiable?: boolean;
  external?: boolean;
  link?: string;
}) => {
  const clipboard = useClipboard();
  const { t } = useTranslation();

  const requireSignIn = () => {
    if (isAuthGuarded) {
      onRequireSignIn?.();
      return true;
    }

    return false;
  };

  const handleCopy = () => {
    if (requireSignIn() || !value) return;
    clipboard.copy(value);
  };

  const handleNavigate = () => {
    if (requireSignIn() || !link) return;

    if (link.startsWith("tel:") || link.startsWith("mailto:")) {
      window.location.href = link;
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  };

  const maskedValue = (() => {
    if (!value) return "";

    if (external) return t("auth.sign_in_to_reveal_website", "Sign in to view website");

    if (link?.startsWith("mailto:")) {
      const [name, domain] = value.split("@");
      return domain
        ? `${name.slice(0, 1)}***@${domain}`
        : t("auth.sign_in_to_reveal_email", "Sign in to view email");
    }

    if (
      link?.startsWith("tel:") ||
      link?.startsWith("https://wa.me/")
    ) {
      const digits = value.replace(/\D/g, "");
      const local = digits.startsWith("221")
        ? digits.slice(3)
        : digits;

      return local.length === 9
        ? `+221 ${local.slice(0, 2)} *** ** ${local.slice(-2)}`
        : t("auth.sign_in_to_reveal_number", "Sign in to view number");
    }

    return value;
  })();

  return (
    <Item
      size="xs"
      variant="default"
      className="group items-start px-1"
    >
      <ItemMedia variant="icon">{icon}</ItemMedia>

      <ItemContent>
        {label && (
          <ItemTitle className="text-[10px]/4 tracking-tight uppercase">
            {label}
          </ItemTitle>
        )}
        <ItemDescription className="break-all">
          {isAuthGuarded ? (
            <>
              <span>
                {maskedValue}{" "}
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={onRequireSignIn}
              >
                <Unlock />
                <span>{t("auth.unlock", "Unlock")}</span>
              </Button>
            </>
          ) : external ? (
            <Button
              type="button"
              variant="link"
              className="underline"
              onClick={handleNavigate}
            >
              {value}
            </Button>
          ) : (
            value
          )}
        </ItemDescription>
      </ItemContent>

      {(copiable || (external && link)) && (
        <ItemActions>
          {copiable && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={!value}
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
