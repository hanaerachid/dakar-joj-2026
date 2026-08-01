// src/admin/places/PlacesListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deletePlace, listPlaces, listZones } from "../../lib/api/places";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CATEGORIES } from "../../components/place-list/place-list-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/common/Section";
import { Field } from "@/components/common/Field";

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
  const [categoryId, setCategoryId] = useState("competition");
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
        (p.tags || []).some((t) => t.toLowerCase().includes(q)),
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
      <div className="mb-6 rounded-2xl border border-black/5 bg-background/70 backdrop-blur p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          {/* Title + subtitle */}
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
              <Icon
                icon="mdi:map-marker-radius-outline"
                className="h-5 w-5 text-blue-600"
              />
              <span className="truncate">Places</span>
            </h2>
            <p className="mt-0.5 text-sm text-foreground/70 truncate">
              Browse and manage places within a zone or across all zones.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/admin/places/import")}
              className="h-10 rounded-xl bg-primary shadow-md inline-flex items-center gap-2"
            >
              <Icon icon="mdi:file-upload-outline" className="h-5 w-5" />
              <span>Import places</span>
            </Button>

            <Button
              onClick={() => navigate("/admin/places/new")}
              className="h-10 rounded-xl bg-primary shadow-md inline-flex items-center gap-2"
            >
              <Icon icon="mdi:plus" className="h-5 w-5" />
              <span>New place</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Section title="Filters">
        <div className="grid gap-4 md:grid-cols-4">
          <Field id="category" label="Category" required>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full rounded-2xl border border-foreground/30 bg-background/80 px-3 text-sm shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="zone"
            label="Zone"
            hint={
              zonesLoading
                ? "Loading zones…"
                : zones.length === 0
                  ? "No zones for this category — showing root collection."
                  : undefined
            }
          >
            <select
              id="zone"
              disabled={zonesLoading || zones.length === 0}
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="h-10 w-full rounded-2xl border border-foreground/30 bg-background/80 px-3 text-sm shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            >
              {/* All zones option when zones exist */}
              {zones.length > 0 && (
                <option value={ALL_ZONES}>(All zones)</option>
              )}
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
              {/* Root-only fallback when there are no zones (disabled select anyway) */}
            </select>
          </Field>

          <Field id="search" label="Search">
            <Input
              id="search"
              placeholder="Name, address, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>

          <Field id="sort" label="Sort by">
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="h-10 w-full rounded-2xl border border-foreground/30 bg-background/80 px-3 text-sm shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="updated">Last updated</option>
              <option value="name">Name (A→Z)</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && (
          <div className="col-span-full grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-foreground/30/60 bg-background/60 backdrop-blur-md shadow-sm"
              >
                <div className="h-2 w-full bg-foreground/30" />
                <div className="h-44 w-full animate-pulse bg-foreground/20" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/20" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-foreground/20" />
                  <div className="h-8 w-full animate-pulse rounded bg-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-foreground/30/60 bg-background/70 p-8 text-center text-sm text-foreground/50 shadow-sm">
            No places found.
          </div>
        )}

        {!loading &&
          filtered.map((p) => {
            const linkZone =
              (p.zoneId ?? null) ||
              (zoneId && zoneId !== ALL_ZONES ? zoneId : null);
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-3xl border border-foreground/30/60 bg-background/70 backdrop-blur-md shadow-sm transition hover:shadow-lg"
              >
                {/* thin gradient strip */}
                <div
                  className="h-2 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${p.gradientFrom || "#e5e7eb"
                      }, ${p.gradientTo || "#d1d5db"})`,
                  }}
                />

                {/* image */}
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-background/50 text-foreground/30">
                    No image
                  </div>
                )}

                {/* body */}
                <div className="p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full border border-foreground/30"
                      style={{ background: p.pointColor || "#9ca3af" }}
                    />
                    <h4 className="font-semibold leading-tight text-foreground/90">
                      {p.name}
                    </h4>
                  </div>

                  {p.location && (
                    <p className="text-xs text-foreground/50">
                      {p.location.latitude?.toFixed?.(5)} •{" "}
                      {p.location.longitude?.toFixed?.(5)}
                    </p>
                  )}

                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.tags.map((t, i) => (
                        <Badge key={i}>{t}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-foreground/50">
                      {p.updatedAt?.toDate
                        ? new Date(p.updatedAt.toDate()).toLocaleString()
                        : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/places/${linkZone ?? "root"}/${p.id}`}
                        className="text-sm font-medium text-foreground/90 underline-offset-2 hover:underline"
                      >
                        View / Edit
                      </Link>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteForPlace(p)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
