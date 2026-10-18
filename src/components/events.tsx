import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import { cn } from "cn";
import { AlertCircle, CalendarPlus, CalendarX, Check, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@iconify/react";
import {
  getCalendarUrl,
  // formatDuration,
} from "../utils/calendar";
import {
  addEventToCalendar,
  listCalendarEvents,
  hasEventInCalendar,
  removeEventFromCalendar
} from "../lib/api/events";
import { ALL_SPORT_OPTIONS } from "../data/sports";
import { getSportIcon, useRelativeTime } from "@/utils/helpers";
import type { Event } from "@/shared/contracts";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useStateContext } from "@/components/state-provider";
import { useModalContext } from "@/components/modal-provider";
import { toast } from "sonner";

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

export const SPORT_OPTIONS_BY_KEY = Object.fromEntries(
  ALL_SPORT_OPTIONS.map((sport) => [sport.key, sport])
);

export const EventsContent = () => {
  const { t } = useTranslation();
  const { eventCategory, setEventCategory } = useStateContext();
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <p className="text-xs text-[#f2b705] uppercase">
          {t("events.live_and_upcoming", "Live & upcoming")}
        </p>

        <h2 className="text-xl text-foreground font-bold uppercase">
          {t("events.plan_your_games", "Plan your Games")}
        </h2>
      </div>

      <ToggleGroup
        multiple={false}
        value={[eventCategory]}
        onValueChange={(value) => {
          if (value.length > 0) {
            setEventCategory(value[0]);
          }
        }}
        className="w-full"
      >
        <ToggleGroupItem value="public" className="flex-1">
          {t("tabs.events", "Schedule")}
        </ToggleGroupItem>
        <ToggleGroupItem value="personal" className="flex-1">
          {t("tabs.calendar", "My Agenda")}
        </ToggleGroupItem>
      </ToggleGroup>

      {eventCategory === "personal" ? <PersonalEvents /> : <PublicEvents />}

      <Item onClick={() => window.open("https://tickets.dakar2026.org/ticketing", "_blank")}
        variant="outline"
        className="w-full sticky rounded-xl p-4 bg-primary/90 backdrop-blur-sm min-h-12 bottom-0 cursor-pointer">
        <ItemContent>
          <ItemTitle className="text-sm text-primary-foreground">
            {t("visit_tickets_website", "Get your tickets now")}
          </ItemTitle>
        </ItemContent>
        <ItemContent className="text-primary-foreground">
          <ExternalLink className="w-4 h-4 text-primary-foreground" />
        </ItemContent>
      </Item>
    </div>
  )
}

export const PublicEvents = () => {
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [events, setEvents] = useState<ApiEventsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [trackedEventIds, setTrackedEventIds] = useState<Set<string>>(
    () => new Set()
  );
  const { setIsOpen, setModalContent } = useModalContext();

  const { getRelativeTime } = useRelativeTime();

  async function handleAddToCalendar(event: ApiEventsItem) {
    if (!isSignedIn)
      return (
        <Navigate to={`/sign-in`} replace />
      );

    setLoadingEventId(event._id);

    try {
      window.open(
        getCalendarUrl(event),
        "google-calendar",
        [
          `width=${600}`,
          `height=${700}`,
          `left=${200}`,
          `top=${100}`,
          "popup=yes",
          "noopener,noreferrer",
        ].join(",")
      );

      await addEventToCalendar(event);

      setTrackedEventIds((prev) => {
        const next = new Set(prev);
        next.add(event._id);
        return next;
      });
    } catch (error) {
      console.error("Failed to track calendar addition:", error);
    } finally {
      setLoadingEventId(null);
    }
  }

  const handleRemoveFromCalendar = async (event: ApiEventsItem) => {
    setModalContent({
      title: t("events.delete_confirmation_title", "Delete this event from your calendar?"),
      size: "md",
      children: (
        <p>{t("events.delete_confirmation_message", "This removes the event from your app calendar only.")}</p>
      ),
      onClose: () => {
        setIsOpen(false);
      },
      footer: ((
        <>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {t("cancel", "Cancel")}
          </Button>

          <Button
            variant="default"
            onClick={async () => {
              setEvents((current) =>
                current.filter((event) => event._id !== event._id)
              );
              setIsOpen(false);
              setLoadingEventId(event._id);

              try {
                await removeEventFromCalendar(event._id);
                setTrackedEventIds((prev) => {
                  const next = new Set(prev);
                  next.delete(event._id);
                  return next;
                });

              } catch (error) {
                console.error("Failed to delete event from calendar:", error);
                setError(t("calendar.remove_error", "Unable to remove this event from your calendar."));
                toast.error(
                  t("events.event_deletion_failure", "Failed to remove the event from your calendar.")
                );
              } finally {
                setLoadingEventId(null);
              }
            }}
          >
            {t("confirm", "Confirm")}
          </Button>
        </>
      )),
    });

    setIsOpen(true);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!user || !events.length) {
      setTrackedEventIds(new Set());
      return;
    }

    let cancelled = false;
    Promise.all(events.map(async (event) => [event._id, await hasEventInCalendar(event._id)] as const))
      .then((tracked) => {
        if (cancelled) return;
        setTrackedEventIds(new Set(tracked.filter(([, isTracked]) => isTracked).map(([id]) => id)));
      })
      .catch(() => {
        if (!cancelled) setTrackedEventIds(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [events, user]);

  const groups = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfDayAfterTomorrow = new Date(startOfTomorrow);
    startOfDayAfterTomorrow.setDate(
      startOfDayAfterTomorrow.getDate() + 1,
    );

    const grouped = {
      earlier: [] as typeof events,
      happening: [] as typeof events,
      today: [] as typeof events,
      tomorrow: [] as typeof events,
      later: [] as typeof events,
    };

    for (const event of events) {
      const start = new Date(event.startAt);
      const end = new Date(event.endAt);

      // Event has completely finished.
      if (end <= now) {
        grouped.earlier.push(event);
        continue;
      }

      // Event is currently happening.
      if (start <= now && now < end) {
        grouped.happening.push(event);
        continue;
      }

      // Event hasn't started yet.
      if (start < startOfTomorrow) {
        grouped.today.push(event);
      } else if (start < startOfDayAfterTomorrow) {
        grouped.tomorrow.push(event);
      } else {
        grouped.later.push(event);
      }
    }

    const sortByStart = (
      a: (typeof events)[number],
      b: (typeof events)[number],
    ) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime();

    grouped.earlier.sort(
      (a, b) =>
        new Date(b.endAt).getTime() - new Date(a.endAt).getTime(),
    );

    grouped.happening.sort(sortByStart);
    grouped.today.sort(sortByStart);
    grouped.tomorrow.sort(sortByStart);
    grouped.later.sort(sortByStart);

    return grouped;
  }, [events]);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="overflow-hidden h-16 rounded-3xl"
            />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive" >
          <AlertCircle />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {[
            [t("events.happening", "Happening now"), groups.happening],
            [t("events.today", "Today"), groups.today],
            [t("events.tomorrow", "Tomorrow"), groups.tomorrow],
            [t("events.later", "Later"), groups.later],
          ].map(([label, items]) => {
            if (!items.length) return null;

            return (
              <div
                className="space-y-3"
                key={label as string}>
                <h2 className="text-xs text-muted-foreground uppercase">
                  {label as string}
                </h2>

                <ItemGroup className="gap-2">
                  {(items as typeof events).map((item, index) => {
                    const sport = SPORT_OPTIONS_BY_KEY[item.sport];
                    const isLoading = loadingEventId === item._id;
                    const tracked = trackedEventIds.has(item._id);

                    return (
                      <Item
                        key={index}
                        size="xs"
                        variant="outline"
                        className="group hover:bg-accent"
                      >
                        {sport?.icon && (
                          <ItemMedia
                            variant="default"
                            className="w-7 h-7"
                          >
                            <Icon
                              className="w-6 h-6"
                              icon={getSportIcon({ sportId: item.sport }) || "mdi:help"}
                            />
                          </ItemMedia>
                        )}
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
                        <ItemContent className="shrink-0">
                          <ItemDescription className="text-xs">
                            {item.venue}
                          </ItemDescription>
                        </ItemContent>
                        <ItemFooter
                          className={cn(
                            "shrink-0",
                            "hidden opacity-0",
                            "group-hover:flex group-hover:opacity-100 transition-opacity duration-300",
                            (tracked || isLoading) ? "flex opacity-100" : "",
                          )}
                        >
                          <CalendarButton
                            isLoading={isLoading}
                            tracked={tracked}
                            handleAddToCalendar={() => handleAddToCalendar(item)}
                            handleRemoveFromCalendar={() => void handleRemoveFromCalendar(item)}
                          />
                        </ItemFooter>
                      </Item>
                    );
                  })}
                </ItemGroup>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

export const PersonalEvents = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { setIsOpen, setModalContent } = useModalContext();

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    listCalendarEvents()
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch(() => {
        if (!cancelled) setError(t("calendar.load_error", "Unable to load your calendar."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [t, user]);

  const openSignIn = () => {
    navigate(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
  };

  const removeEvent = async (event: Event) => {
    if (!event._id) return;
    // const confirmed = window.confirm(
    //   t(
    //     "calendar.remove_warning",
    //     "This removes the event from your app calendar only. It does not delete the event from Google Calendar. Continue?",
    //   ),
    // );
    // if (!confirmed) return;
    setModalContent({
      title: t("events.delete_confirmation_title", "Delete this event from your calendar?"),
      size: "md",
      children: (
        <p>{t("events.delete_confirmation_message", "Are you sure?")}</p>
      ),
      onClose: () => {
        setIsOpen(false);
      },
      footer: ((
        <>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {t("cancel", "Cancel")}
          </Button>

          <Button
            variant="default"
            onClick={async () => {
              setEvents((current) =>
                current.filter((event) => event._id !== event._id)
              );
              setIsOpen(false);
              try {
                await removeEventFromCalendar(event._id as any);
                setEvents((current) => current.filter((item) => item._id !== event._id));
              } catch (error) {
                console.error("Failed to delete event from calendar:", error);
                setError(t("calendar.remove_error", "Unable to remove this event from your calendar."));
                toast.error(
                  t("events.event_deletion_failure", "Failed to remove the event from your calendar.")
                );
              } finally {
                setRemovingId(event._id as any);
              }
            }}
          >
            {t("confirm", "Confirm")}
          </Button>
        </>
      )),
    });

    setIsOpen(true);
  };

  if (!isLoaded) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (!user) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("calendar.sign_in_title", "Your calendar")}</EmptyTitle>
          <EmptyDescription>
            {t("calendar.sign_in_description", "Sign in to view and manage events saved to your calendar.")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={openSignIn}>{t("auth.login.submit", "Log in")}</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}
        </div>
      )}

      {!loading && !error && !events.length && (
        <Empty>
          <EmptyDescription>{t("calendar.empty", "No events saved yet.")}</EmptyDescription>
        </Empty>
      )}

      {!loading && events.length > 0 && (
        <ItemGroup className="gap-2">
          {events.map((event) => (
            <Item key={event._id} variant="outline" size="xs">
              <ItemContent className="min-w-0">
                <ItemTitle className="truncate">{event.name}</ItemTitle>
                <ItemDescription className="truncate">
                  {event.startAt
                    ? new Date(event.startAt).toLocaleDateString(i18n.resolvedLanguage || i18n.language, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : event.venue}
                </ItemDescription>
              </ItemContent>
              <Button
                variant="ghost"
                size="icon"
                disabled={!event._id || removingId === event._id}
                onClick={() => void removeEvent(event)}
                aria-label={t("calendar.remove", "Remove from calendar")}
              >
                <CalendarX />
              </Button>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  );
}

const CalendarButton = ({
  isLoading,
  tracked,
  handleAddToCalendar,
  handleRemoveFromCalendar,
}: {
  isLoading: boolean;
  tracked: boolean;
  handleAddToCalendar: () => void;
  handleRemoveFromCalendar: () => void;
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const addLabel = t("calendar.add_to_calendar", "Add to Calendar");

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        aria-label={t("calendar.adding_to_calendar", "Adding...")}
      >
        <Spinner />
      </Button>
    );
  }

  if (tracked) {
    return (
      <div
        className="inline-flex items-center gap-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          variant="ghost"
          size="default"
          disabled
          className="cursor-default"
        >
          <Check />
          <span>{t("calendar.added_to_calendar", "Added")}</span>
        </Button>

        {isHovered && (
          <Button
            variant="destructive"
            size="icon"
            onClick={handleRemoveFromCalendar}
            aria-label={t(
              "calendar.remove_from_calendar",
              "Remove from calendar",
            )}
          >
            <CalendarX />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className="inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="default"
        size="icon"
        className="w-auto overflow-hidden transition-[padding] duration-200 ease-in-out"
        style={{
          paddingInline: isHovered ? "12px" : "8px",
        }}
        onClick={handleAddToCalendar}
        aria-label={addLabel}
      >
        <CalendarPlus className="shrink-0" />

        <span
          className={cn(
            "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-200 ease-in-out",
            isHovered
              ? "ml-2 max-w-[200px] opacity-100"
              : "ml-0 max-w-0 opacity-0",
          )}
        >
          {addLabel}
        </span>
      </Button>
    </div>
  );
};