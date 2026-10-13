import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import type { BusinessCreateValues } from "../business-create.schema";
import { getFriendlyCategoryName } from "@/utils/key-translations";
import LocationMap from "@/core/map/LocationMap";
import { getCategoryIcon } from "@/utils/helpers";

export function ReviewStep({ title }: { title?: string }) {
  const { watch } = useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();
  const values = watch();

  return (
    <>
      {title &&
        <CardHeader>
          <CardTitle className="font-bold">
            {title}
          </CardTitle>
        </CardHeader>
      }
      <CardContent className="space-y-6">
        <ReviewGroup title={t("businessCreate.review.business", "Business")}>
          <ReviewRow icon={getCategoryIcon(values.cat)} label="Category" value={getFriendlyCategoryName(values.cat, t)} />
          <ReviewRow label="Name" value={values.name} />
          {values.desc && <ReviewRow label="Description" value={values.desc} />}
          {values.address && <ReviewRow label="Address" value={values.address} />}

          <div className="grid grid-cols-2 gap-2">
            <ReviewRow label="Longitude" value={values.location.coordinates?.[0]?.toFixed(4).toString() || "-"} />
            <ReviewRow label="Latitude" value={values.location.coordinates?.[1]?.toFixed(4).toString() || "-"} />
          </div>

          <ReviewCard>
            <LocationMap
              longitude={values.location.coordinates?.[0]}
              latitude={values.location.coordinates?.[1]}
            />
          </ReviewCard>
        </ReviewGroup>

        {(values.tel || values.email || values.website || values.social || values.wa) && (
          <ReviewGroup title={t("businessCreate.review.contact", "Contact")}>
            {values.tel && <ReviewRow label="Phone" value={values.tel} />}
            {values.email && <ReviewRow label="Email" value={values.email} />}
            {values.website && <ReviewRow label="Website" value={values.website} />}
            {values.social && <ReviewRow label="Social" value={values.social} />}
            {values.wa && <ReviewRow label="WhatsApp" value={values.wa} />}
          </ReviewGroup>
        )}

        <ReviewGroup title={t("businessCreate.review.media", "Media")}>
          <ReviewRow label="Photos" value={`${values.photos.length}`} />
          <ReviewRow label="Videos" value={values.videos.length.toString() || "-"} />
        </ReviewGroup>
      </CardContent>
    </>
  );
}

function ReviewGroup(
  {
    title,
    children
  }:
    {
      title: string;
      children: ReactNode
    }
) {
  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        {title}
      </h3>
      <div className="columns-1 sm:columns-2 gap-4">
        {children}
      </div>
    </section>
  );
}

const ReviewCard = (
  { children }:
    { children: ReactNode }
) => {
  return (
    <Item
      className="overflow-hidden p-0"
      variant="outline"
    >
      <ItemContent>
        {children}
      </ItemContent>
    </Item>
  )
}

function ReviewRow(
  {
    icon: Icon,
    label,
    value
  }:
    {
      icon?: LucideIcon;
      label: string;
      value: string
    }) {
  return (
    <Item
      className="break-inside-avoid mb-4"
      variant="muted"
      size="xs"
    >
      {Icon && (
        <ItemMedia variant="icon">
          <Icon />
        </ItemMedia>
      )}
      <ItemContent className={cn(
        "overflow-hidden",
      )}>
        <ItemTitle className={cn(
          "select-none text-xs/5 tracking-tight text-muted-foreground font-heading uppercase",
        )}>
          {label}
        </ItemTitle>

        <ItemDescription className={cn(
          "text-sm/5 text-foreground font-medium",
        )}>
          {value}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
