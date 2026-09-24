// src/admin/places/PlacePreview.tsx

import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { MapPin, XIcon } from "lucide-react";
import type { VenueSport } from "../../../data/sitesMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";

type Props = {
  // visuals
  gradientFrom: string;
  gradientTo: string;
  preview: string | null;

  // branding
  brandTitle: string;
  brandSubtitle: string;
  locationLabel: string;
  shortCode: string;

  // content
  name: string;
  nameFr?: string;
  info: string;
  infoFr?: string;
  address: string;

  // meta
  categoryId: string;
  sports: VenueSport[];

  // links/tags
  tagList: string[];
  website: string;
  socialHandle: string;

  // optional actions for parity with EventVenueCard (noop in preview)
  onClose?: () => void;
  onGetDirections?: () => void;
};

// ---- helpers to match EventVenueCard behavior ----
function normGradient(g0?: string, g1?: string): [string, string] {
  const a = typeof g0 === "string" && g0.length ? g0 : "#12B76A";
  const b = typeof g1 === "string" && g1.length ? g1 : "#0A6B4A";
  return [a, b];
}

export default function PlacePreview({
  gradientFrom,
  gradientTo,
  preview,
  brandTitle,
  brandSubtitle,
  locationLabel,
  shortCode,
  name,
  nameFr,
  info,
  infoFr,
  address,
  categoryId,
  sports,
  tagList,
  website,
  socialHandle,
  onClose,
  onGetDirections,
}: Props) {
  const { t, i18n } = useTranslation();
  const activeLang = i18n.resolvedLanguage || i18n.language || "en";
  const infoText = activeLang.startsWith("fr")
    ? (infoFr ?? "").trim() || info
    : info;
  const nameText = activeLang.startsWith("fr")
    ? (nameFr ?? "").trim() || name
    : name;
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [g0, g1] = normGradient(gradientFrom, gradientTo);
  const sportCount =
    categoryId === "competition"
      ? Array.isArray(sports)
        ? sports.length
        : 0
      : 0;

  return (
    <Card
      size="sm"
      className={cn(
        "w-full relative pt-0 overflow-hidden",
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        disabled inert
        onClick={onClose || (() => { })}
        className="absolute end-2 top-2"
        aria-label="Close"
        title="Preview"
      >
        <XIcon />
      </Button>
      {/* Header gradient with brand + location pill */}
      <CardHeader className="relative p-0 inset-0 z-30 aspect-video" >
        {/* Hero image */}
        {preview ? (
          <img
            src={preview ?? "/v-img/default.jpg"}
            alt={nameText || "cover"}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex items-center z-10 aspect-video w-full justify-center bg-background/10 text-muted-foreground">
            {t("no_image", "No image")}
          </div>
        )}
        <div className="absolute bottom-4 start-4 text-xs leading-tight ">
          {brandTitle && <div className="font-semibold">{brandTitle}</div>}
          {brandSubtitle && (
            <div className="uppercase tracking-wide text-[8px]">
              {brandSubtitle}
            </div>
          )}
        </div>
        {locationLabel && (
          <Badge
            style={{ color: `${g1}` }}
            className="absolute bottom-4 end-4 text-xs flex items-center justify-center bg-white/90 px-2 py-0.5 font-medium"
          >
            <MapPin /> {locationLabel}
          </Badge>
        )}
        <Separator
          className={cn("border-2 border-transparent")}
          style={{
            background: `linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, ${g0}, ${g1}) border-box`,
          }}
        />
      </CardHeader>
      {/* Body */}
      <CardContent>
        <CardTitle>
          {nameText || "EGG TOWER COMPLEX"}
        </CardTitle>

        {(shortCode || sportCount) && (
          <span className="font-sans mt-1 text-xs tracking-widest text-muted-foreground">
            {shortCode ?? ""} {shortCode && " ///// "}{" "}
            {sportCount ? `${String(sportCount).padStart(2, "0")} Sports` : ""}
          </span>
        )}

        {/* Sports strip */}
        {categoryId === "competition" && sports?.length ? (
          <div className="grid grid-cols-6 gap-1 pt-1 pb-2 rounded-2xl">
            {sports.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 pt-2"
                title={s.label}
              >
                {"icon" in s && s.icon ? (
                  <Icon icon={s.icon as string} className="w-6 h-6" />
                ) : (s as any).iconUrl ? (
                  <img
                    src={(s as any).iconUrl}
                    alt={s.label}
                    className="w-6 h-6"
                  />
                ) : (
                  <div className="text-xs font-semibold" />
                )}
                <span className="text-[8px] uppercase text-center w-full font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <CardDescription
          className="font-sans text-[11px] sm:text-xs leading-snug"
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
          className="inline-flex h-auto p-0 text-xs"
        >
          {infoExpanded ? "See less" : "See more"}
        </Button>
        <p className="font-sans text-xs sm:text-sm mt-1 text-muted-foreground">{address}</p>

        {/* Optional site tags */}
        {!!tagList?.length && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tagList.map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs px-2 py-0.5"
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
                className="underline"
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

      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button
          variant="default"
          size="default"
          disabled inert
          onClick={onGetDirections || (() => { })}
          className="flex-1"
          style={{ color: `${g1}` }}
          title="Preview"
        >
          Get Directions
        </Button>
      </CardFooter>
    </Card>
  );
}
