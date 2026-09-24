// src/admin/places/PlacesListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePlace, listPlaces, listZones } from "../../lib/api/places";
import { CATEGORIES } from "../../components/place-list/place-list-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/common/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUp, MoreVertical, Pencil, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/utils";

/* ---------------- Types ---------------- */
export type Zone = {
  id: string;
  name: string;
  color: string;
  categoryId: string;
};
export type Place = {
  id: string;
  name: string;
  location?: { latitude: number; longitude: number } | any;
  address?: string | null;
  info?: string | null;
  rating?: number | null;
  tags?: string[];
  pointColor?: string;
  imageUrl?: string | null;
  brandTitle?: string | null;
  brandSubtitle?: string | null;
  locationLabel?: string | null;
  shortCode?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  website?: string | null;
  socialHandle?: string | null;
  sportCount?: number;
  categoryId?: string;
  zoneId?: string | null; // ensure present for linking/deleting
  createdAt?: any;
  updatedAt?: any;
};

const ALL_ZONES = "__ALL__";

async function fetchZones(categoryId: string) {
  return (await listZones(categoryId)) as Zone[];
}

/* --------------- Page --------------- */
export function PlacesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<string>("competition");
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState(""); // "" => root-only; ALL_ZONES => all zoned + root
  const [zonesLoading, setZonesLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "name">("updated");

  // load zones for the chosen category
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setZonesLoading(true);
        let list = await fetchZones(categoryId);
        if (ignore) return;
        setZones(list);
        // default to "All zones" when zones exist; otherwise root-only view
        setZoneId((prev) => {
          if (list.length === 0) return "";
          // preserve ALL if already selected; else default to ALL
          return prev && prev !== "" ? prev : ALL_ZONES;
        });
      } finally {
        setZonesLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [categoryId]);

  async function loadPlaces(currentZoneId: string) {
    setLoading(true);
    try {
      let items: Place[] = [];

      // (A) ALL ZONES: use collectionGroup for every /zones/*/places + merge root /places
      if (currentZoneId === ALL_ZONES) {
        items = (await listPlaces({ categoryId, scope: "all" })) as Place[];
      }
      // (B) SPECIFIC ZONE: only that zone’s subcollection
      else if (currentZoneId) {
        items = (await listPlaces({
          categoryId,
          zoneId: currentZoneId,
          scope: "zone",
        })) as Place[];
      }
      // (C) ROOT-ONLY (categories without zones, e.g., Hotels)
      else {
        items = (await listPlaces({ categoryId, scope: "root" })) as Place[];
      }

      // sort
      items.sort((a: any, b: any) => {
        if (sort === "updated") {
          const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          if (bt !== at) return bt - at;
        }
        return (a.name || "").localeCompare(b.name || "");
      });

      setPlaces(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlaces(zoneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, sort, categoryId]); // reload when category changes too

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return places;
    return places.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.address || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [places, search]);

  async function handleDeleteForPlace(p: Place) {
    if (!confirm("Delete this place? This cannot be undone.")) return;
    await deletePlace(p.id, p.zoneId ?? undefined);
    await loadPlaces(zoneId);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Top bar */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          {/* Title + subtitle */}
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
              <span className="truncate">Places</span>
            </h2>
            <p className="mt-0.5 text-sm text-foreground/70 truncate">
              Browse and manage places within a zone or across all zones.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/places/import")}
              className="inline-flex items-center gap-2"
            >
              <FileUp />
              <span>Import places</span>
            </Button>

            <Button
              variant="default"
              onClick={() => navigate("/admin/places/new")}
              className="inline-flex items-center gap-2"
            >
              <Plus />
              <span>New place</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
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
              <SelectTrigger id="category" className="w-full">
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
              <SelectTrigger id="zone" className="w-full">
                <SelectValue>
                  {zoneId === ALL_ZONES
                    ? "(All zones)"
                    : zones.find((z) => z.id === zoneId)?.name}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {zones.length > 0 && (
                  <SelectItem value={ALL_ZONES}>(All zones)</SelectItem>
                )}

                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              {zonesLoading
                ? "Loading zones…"
                : zones.length === 0
                  ? "No zones for this category — showing root collection."
                  : undefined}
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
              <SelectTrigger id="sort" className="w-full">
                <SelectValue>
                  {sort === "updated" ? "Last updated" : "Name (A→Z)"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="updated">Last updated</SelectItem>
                <SelectItem value="name">Name (A→Z)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      {/* Cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading && (
          <div className="col-span-full grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

        {!loading && filtered.length === 0 && (
          <Empty className="col-span-full border border-foreground/30 p-8 text-foreground/50 shadow-sm">
            <EmptyHeader>
              <EmptyDescription className="text-center text-sm text-foreground/50">
                No places found
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="default"
                onClick={() => navigate("/admin/places/new")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>New place</span>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!loading &&
          filtered.map((p) => {
            const linkZone =
              (p.zoneId ?? null) ||
              (zoneId && zoneId !== ALL_ZONES ? zoneId : null);
            return (
              <Card
                key={p.id}
                size="sm"
                className={cn(
                  "relative mx-auto w-full max-w-sm pt-0 overflow-hidden"
                )}
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
                      onClick={() => handleDeleteForPlace(p)}
                    >
                      {t("delete", "Delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <CardHeader className="p-0 gap-0">
                  {/* image */}
                  {p.imageUrl ? (
                    <>
                      <div className="absolute bg-gradient-to-b from-background/80 to-transparent w-full aspect-video object-cover" />
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full aspect-video object-cover"
                        loading="lazy"
                      />
                    </>
                  ) : (
                    <div className="flex items-center z-10 aspect-video w-full justify-center bg-background/50 text-foreground/30">
                      {t("no_image", "No image")}
                    </div>
                  )}
                  <Separator
                    className={cn("border-2 border-transparent")}
                    style={{
                      background: `linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo}) border-box`,
                    }}
                  />
                </CardHeader>

                {/* body */}
                <CardHeader className="inline-block">
                  <CardTitle className="inline-block relative">
                    <span className=" font-semibold leading-tight text-foreground/90">
                      {p.name}
                    </span>
                    <svg
                      className="absolute -bottom-0.5 w-full max-h-1.5"
                      viewBox="0 0 55 5"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <path
                        style={{ fill: p.pointColor || "#9ca3af" }}

                        d="M0.652466 4.00002C15.8925 2.66668 48.0351 0.400018 54.6853 2.00002"
                        stroke-width="2"
                      />
                    </svg>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {p.address && (
                    <CardDescription className="text-sm">
                      {p.address}
                    </CardDescription>
                  )}

                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.tags.map((t, i) => (
                        <Badge variant="secondary" key={i}>
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-1 flex items-end justify-between">
                  <div className="text-xs text-foreground/50">
                    {p.updatedAt?.toDate
                      ? new Date(p.updatedAt.toDate()).toLocaleString()
                      : ""}
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      navigate(`/admin/places/${linkZone ?? "root"}/${p.id}`)
                    }
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
