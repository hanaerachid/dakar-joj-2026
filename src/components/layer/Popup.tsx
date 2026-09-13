// src/components/map/VenuePopup.tsx (or wherever your VenuePopup lives)
import React, { useEffect, useState } from "react";
import type { VenueSport } from "../../data/sitesMeta";
import DefaultVenueCard from "./DefaultVenueCard";
import { MapManager } from "../../core/MapManager";
import type { RouteDetails } from "../../core/map/types";
import { toast } from "sonner";
import { extractDirectionsMessage } from "../../utils/error";
import { useTranslation } from "react-i18next";

export interface PopupProps {
  title: string;
  titleFr?: string;
  zone: string;
  info: string;
  infoFr?: string;
  imageUrl?: string;
  address?: string;
  date?: number;
  tags?: string[] | string;
  coordinates?: [number, number];
  onClose: () => void;

  // 🔽 NEW
  categoryId?: string;

  // existing “event/brand” bits
  brandTitle?: string;
  brandSubtitle?: string;
  locationLabel?: string;
  shortCode?: string;
  sportCount?: number;
  sports?: VenueSport[];
  gradient?: [string, string];
  website?: string;
  socialHandle?: string;
}

function normTags(v?: string[] | string): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const deriveLangCode = (lng?: string) => (lng ?? "en").split("-")[0] || "en";

export const Popup: React.FC<PopupProps> = ({
  title,
  titleFr,
  zone,
  info,
  infoFr,
  imageUrl,
  address,
  date,
  tags,
  coordinates,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const [langCode, setLangCode] = useState(() =>
    deriveLangCode(i18n.resolvedLanguage || i18n.language),
  );
  const [route, setRoute] = useState<{
    distance: number;
    duration: number;
    steps: {
      instruction: string;
      location: [number, number];
      distance: number;
      duration: number;
      name?: string;
      maneuver?: { type?: string; modifier?: string; exit?: number };
    }[];
  } | null>(null);
  const resolvedAddress =
    address && address.trim().length
      ? address
      : undefined;

  const normalizedTags = normTags(tags);
  const tagsArr = normalizedTags.length ? normalizedTags : undefined;

  const handleGetDirections = () => {
    // reset previous route
    setRoute(null);

    if (!coordinates) {
      toast.error(t("layer.errors.noCoordinates"));
      return;
    }
    if (!("geolocation" in navigator)) {
      toast.error(t("layer.errors.geolocationUnsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const origin: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        try {
          // 🧭 draw + get details immediately (MapManager now returns details)
          const details =
            (await MapManager.getInstance().showRouteToVenue(
              origin,
              coordinates,
            )) || null;
          if (details) {
            setRoute(details);
            return;
          }

          // fast fallback: small polling window (up to ~600ms)
          let tries = 0;
          const tick = () => {
            tries++;
            const d = MapManager.getInstance().getLastRouteDetails?.();
            if (d) {
              setRoute(d as RouteDetails);
              return;
            }
            if (tries < 6) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        } catch (e) {
          console.error("Directions failed:", e);
          const msg = extractDirectionsMessage(e);
          toast.error(t("layer.errors.directionsUnavailable"), {
            description: msg,
          });
        }
      },
      () => {
        toast.error(t("layer.errors.locationUnavailable"));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  };

  const handleClear = () => {
    MapManager.getInstance().clearCurrentRoute();
    setRoute(null);
  };

  const [infoOverride, setInfoOverride] = useState<"en" | "fr" | null>(null);

  const langRaw = i18n.resolvedLanguage || i18n.language || "en";
  const activeInfoLang = infoOverride ?? langCode;
  const titleLocalized =
    activeInfoLang === "fr" ? (titleFr ?? "").trim() || title : title;
  const infoLocalized =
    activeInfoLang === "fr" ? (infoFr ?? "").trim() || info : info;

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLangCode(deriveLangCode(lng));
    };
    i18n.on("languageChanged", handleLangChange);
    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, [i18n]);

  useEffect(() => {
    setInfoOverride(null);
  }, [langCode, info, infoFr]);

  useEffect(() => {
    // Debug payload from backend to verify translations
    console.log("[VenuePopup] info payload", {
      title,
      titleFr,
      titleLocalized,
      langRaw,
      langCode,
      info,
      infoFr,
      infoOverride,
      activeInfoLang,
      infoLocalized,
    });
  }, [
    title,
    titleFr,
    titleLocalized,
    langRaw,
    langCode,
    info,
    infoFr,
    infoOverride,
    activeInfoLang,
    infoLocalized,
  ]);

  return (
    <DefaultVenueCard
      key={`default-${activeInfoLang}`}
      title={titleLocalized}
      zone={zone}
      info={infoLocalized}
      infoFr={infoFr}
      imageUrl={imageUrl}
      address={resolvedAddress}
      date={date}
      tags={tagsArr}
      route={route}
      onGetDirections={handleGetDirections}
      onClose={onClose}
      onClear={handleClear}
    />
  );

};
