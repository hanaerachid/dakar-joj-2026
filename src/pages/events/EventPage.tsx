// src/pages/events/EventPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, MoreVertical } from "lucide-react";

import { listEvents, deleteEvent } from "../../lib/api/events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- Types ---------------- */
export type Event = {
  _id: string;
  name: string;
  location?:
    | {
        type?: string;
        coordinates: number[];
      }
    | any;
  region?: string | null;
  sport?: string | null;
  status?: string | null;
  datetime: Date | string;
  venue?: string | null;
  updatedAt?: Date | any;
};

/* --------------- Page --------------- */
export function EventPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  // const [search, setSearch] = useState("");
  // const [sort, setSort] = useState<"updated" | "name">("updated");

  async function loadEvents() {
    setLoading(true);
    try {
      let items: Event[] = [];

      items = (await listEvents()) as Event[];

      // sort
      items.sort((a: any, b: any) => {
        // if (sort === "updated") {
        //   const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        //   const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        //   if (bt !== at) return bt - at;
        // }
        return (a.name || "").localeCompare(b.name || "");
      });

      setEvents(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteEvent(t: Event) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    await deleteEvent(t._id);
    await loadEvents();
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Top bar */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          {/* Title + subtitle */}
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
              <span className="truncate">Events</span>
            </h2>
            <p className="mt-0.5 text-sm text-foreground/70 truncate">
              Browse and manage events.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              disabled
              inert
              onClick={() => navigate("/admin/events/new")}
              className="inline-flex items-center gap-2"
            >
              <Plus />
              <span>New event</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {/* <Section title="Filters">
        <div className="grid gap-4 md:grid-cols-6">

          <Field className="md:col-span-3">
            <FieldLabel htmlFor="search">Search</FieldLabel>
            <Input
              id="search"
              placeholder="Name, address, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select
              value={categoryId}
              onValueChange={(value) => {
                if (value !== null) {
                  setCategoryId(value);
                }
              }}
            >
              <SelectTrigger
                id="category"
                className="w-full"
              >
                <SelectValue>
                  {CATEGORIES.find((c) => c.id === categoryId)?.label}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="zone">Zone</FieldLabel>
            <Select
              value={zoneId}
              onValueChange={(value) => {
                if (value !== null) {
                  setZoneId(value);
                }
              }}
              disabled={zonesLoading || zones.length === 0}
            >
              <SelectTrigger
                id="zone"
                className="w-full"
              >
                <SelectValue>
                  {zoneId === ALL_ZONES
                    ? "(All zones)"
                    : zones.find((z) => z.id === zoneId)?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {zones.length > 0 && (
                  <SelectItem value={ALL_ZONES}>
                    (All zones)
                  </SelectItem>
                )}

                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              {
                zonesLoading
                  ? "Loading zones…"
                  : zones.length === 0
                    ? "No zones for this category — showing root collection."
                    : undefined
              }
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="sort">Sort by</FieldLabel>
            <Select
              value={sort}
              onValueChange={(value) => {
                if (value !== null) {
                  setSort(value as any);
                }
              }}
            >
              <SelectTrigger
                id="sort"
                className="w-full"
              >
                <SelectValue>
                  {sort === "updated" ? "Last updated" : "Name (A→Z)"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="updated">
                  Last updated
                </SelectItem>
                <SelectItem value="name">
                  Name (A→Z)
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section> */}

      {/* Cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && (
          <div className="col-span-full grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="overflow-hidden rounded-3xl">
                <Skeleton className="w-full aspect-video bg-foreground/20" />
                <Skeleton className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/2 rounded bg-foreground/20" />
                  <Skeleton className="h-3 w-2/3 rounded bg-foreground/20" />
                  <Skeleton className="h-8 w-full rounded bg-foreground/20" />
                </Skeleton>
              </Skeleton>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <Empty className="col-span-full border border-foreground/30 p-8 text-foreground/50 shadow-sm">
            <EmptyHeader>
              <EmptyDescription className="text-center text-sm text-foreground/50">
                No events found
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="default"
                disabled
                inert
                onClick={() => navigate("/admin/events/new")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>New event</span>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!loading &&
          events.map((item, index) => {
            return (
              <Card
                key={index}
                size="sm"
                className="relative mx-auto w-full max-w-sm"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="absolute end-4 top-4 z-20"
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("more_actions", "More actions")}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        <MoreVertical />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    }
                  />

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      // disabled
                      // aria-disabled
                      onClick={() => handleDeleteEvent(item)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* body */}
                <CardHeader>
                  <CardTitle className="font-semibold leading-tight text-foreground/90">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.venue && (
                    <CardDescription>{item.venue}</CardDescription>
                  )}

                  {item.datetime && (
                    <CardDescription>
                      {new Date(item.updatedAt).toLocaleDateString(lang, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  )}
                </CardContent>
                <CardFooter className="w-full flex-1 flex-col items-end gap-2">
                  <div className="text-xs text-muted-foreground">
                    {item.updatedAt?.toDate
                      ? new Date(item.updatedAt.toDate()).toLocaleString()
                      : ""}
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                    inert
                    onClick={() => navigate(`/admin/events/${item._id}`)}
                  >
                    <Pencil />
                    <span>{t("edit", "Edit")}</span>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
