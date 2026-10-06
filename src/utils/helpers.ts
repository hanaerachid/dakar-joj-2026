import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { type LucideIcon, HelpCircle } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/components/business/business-create.config";
import { PRICING_PLANS } from "@/components/pricing/pricingplans.config";
import { ALL_SPORT_OPTIONS } from "@/data/sports";

export function getCategoryIcon(
  key: string | undefined
): LucideIcon {
  if (!key || !(key in BUSINESS_CATEGORIES)) {
    return HelpCircle;
  }

  return BUSINESS_CATEGORIES[
    key as keyof typeof BUSINESS_CATEGORIES
  ].icon;
}

export function getPricingPlanInfo(key: string | undefined): {
  label: string;
  icon: LucideIcon;
} {
  if (!key || !(key in PRICING_PLANS)) {
    return {
      label: "Unknown",
      icon: HelpCircle,
    };
  }

  const plan =
    PRICING_PLANS[key as keyof typeof PRICING_PLANS];

  return {
    label: plan.label,
    icon: plan.icon,
  };
}

export function getSportIcon({ sportId }: { sportId: string }) {
  return ALL_SPORT_OPTIONS.find((sport) => sport.key === sportId)?.icon;
}

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

type DateInput = Date | string | number | null | undefined;

type RelativeTimeUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

function parseDate(value: DateInput): number | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return null;
    }

    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const timestamp = new Date(trimmed).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  return null;
}

function formatRelativeTime(
  diff: number,
  locale: string
): string {
  const absDiff = Math.abs(diff);

  let value: number;
  let unit: RelativeTimeUnit;

  if (absDiff < MINUTE) {
    value = Math.round(diff / SECOND);
    unit = 'second';
  } else if (absDiff < HOUR) {
    value = Math.round(diff / MINUTE);
    unit = 'minute';
  } else if (absDiff < DAY) {
    value = Math.round(diff / HOUR);
    unit = 'hour';
  } else if (absDiff < WEEK) {
    value = Math.round(diff / DAY);
    unit = 'day';
  } else if (absDiff < MONTH) {
    value = Math.round(diff / WEEK);
    unit = 'week';
  } else if (absDiff < YEAR) {
    value = Math.round(diff / MONTH);
    unit = 'month';
  } else {
    value = Math.round(diff / YEAR);
    unit = 'year';
  }

  // Avoid "0 minutes ago" / "in 0 minutes".
  if (value === 0 && diff !== 0) {
    value = diff > 0 ? 1 : -1;
  }

  return new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  }).format(value, unit);
}

function getNextUpdateDelay(diff: number): number {
  const absDiff = Math.abs(diff);

  if (absDiff < MINUTE) {
    return SECOND;
  }

  if (absDiff < HOUR) {
    return 10 * SECOND;
  }

  return MINUTE;
}

export function useRelativeTime() {
  const { i18n } = useTranslation();

  const locale =
    i18n.resolvedLanguage ||
    i18n.language ||
    'en';

  /*
   * Keep the latest locale available to the callback without
   * recreating the callback unnecessarily.
   */
  const localeRef = useRef(locale);

  localeRef.current = locale;

  const getRelativeTime = useCallback(
    (targetDate: DateInput): string => {
      const timestamp = parseDate(targetDate);

      if (timestamp === null) {
        return '';
      }

      const diff = timestamp - Date.now();

      return formatRelativeTime(
        diff,
        localeRef.current
      );
    },
    []
  );

  /**
   * Optional helper for live-updating values.
   *
   * This is useful when you need the hook itself to trigger
   * re-renders as time passes.
   */
  const subscribe = useCallback(
    (
      targetDate: DateInput,
      callback: (value: string) => void
    ) => {
      const timestamp = parseDate(targetDate);

      if (timestamp === null) {
        callback('');
        return () => {};
      }

      let timerId: ReturnType<typeof setTimeout>;

      const update = () => {
        const diff = timestamp - Date.now();

        callback(
          formatRelativeTime(
            diff,
            localeRef.current
          )
        );

        timerId = setTimeout(
          update,
          getNextUpdateDelay(diff)
        );
      };

      update();

      return () => {
        clearTimeout(timerId);
      };
    },
    []
  );

  return {
    getRelativeTime,
    subscribe,
  };
}