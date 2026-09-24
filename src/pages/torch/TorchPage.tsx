// src/pages/torch/TorchPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, MoreVertical, Pencil, Plus } from "lucide-react";
import {
  listTorchStops,
  deleteTorchStop,
  createTorchStop,
  getTorchStop,
  updateTorchStop,
} from "../../lib/api/torchstops";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
// import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { DateTimePicker } from "@/components/date-time-picker";
import { Section } from "@/components/common/Section";

import BasicDetails from "@/components/admin/BasicDetails";
import LocationDetails from "@/components/admin/LocationDetails";

/* ---------------- Types ---------------- */
export type TorchStop = {
  _id: string;
  name: string;
  location?:
    | {
        type: string;
        coordinates: number[];
      }
    | any;
  region?: string | null;
  tourDate: Date | string;
  metadata?: {
    phase: string | null;
    description: string | null;
    isMajorStop: boolean;
  } | null;
  updatedAt?: Date | any;
};

/* --------------- Page --------------- */
export function TorchPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [loading, setLoading] = useState(false);
  const [torchStops, setTorchStops] = useState<TorchStop[]>([]);
  // const [search, setSearch] = useState("");
  // const [sort, setSort] = useState<"updated" | "name">("updated");

  async function loadTorchStops() {
    setLoading(true);
    try {
      let items: TorchStop[] = [];

      items = (await listTorchStops()) as TorchStop[];

      // sort
      items.sort((a: any, b: any) => {
        // if (sort === "updated") {
        //   const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        //   const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        //   if (bt !== at) return bt - at;
        // }
        return (a.name || "").localeCompare(b.name || "");
      });

      setTorchStops(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTorchStops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteTorchStop(t: TorchStop) {
    if (!confirm("Delete this torch stop? This cannot be undone.")) return;
    await deleteTorchStop(t._id);
    await loadTorchStops();
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {/* Top bar */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          {/* Title + subtitle */}
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
              <span className="truncate">
                {t("torchstops.title", "Torch Stops")}
              </span>
            </h2>
            <p className="mt-0.5 text-sm text-foreground/70 truncate">
              {t("torchstops.description", "Browse and manage torch stops.")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={() => navigate("/admin/torch/new")}
              className="inline-flex items-center gap-2"
            >
              <Plus />
              <span>{t("torchstops.new")}</span>
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

        {!loading && torchStops.length === 0 && (
          <Empty className="col-span-full border border-foreground/30 p-8 text-foreground/50 shadow-sm">
            <EmptyHeader>
              <EmptyDescription className="text-center text-sm text-foreground/50">
                {t("torchstops.empty", "No torch stops found")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="default"
                onClick={() => navigate("/admin/torch/new")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>{t("torchstops.new")}</span>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!loading &&
          torchStops.map((item, index) => {
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
                        <span className="sr-only">
                          {t("open_actions", "Open actions")}
                        </span>
                      </Button>
                    }
                  />

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteTorchStop(item)}
                    >
                      {t("delete", "Delete")}
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
                  {item.metadata?.description && (
                    <CardDescription>
                      {item.metadata?.description}
                    </CardDescription>
                  )}

                  {item.tourDate && (
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

                  {item.location && (
                    <CardDescription className="text-xs font-mono">
                      {item.location.coordinates[0]?.toFixed?.(5)} •{" "}
                      {item.location.coordinates[1]?.toFixed?.(5)}
                    </CardDescription>
                  )}
                </CardContent>
                <CardFooter className="flex-1 flex items-end justify-between">
                  <div className="text-xs text-foreground/50">
                    {item.updatedAt?.toDate
                      ? new Date(item.updatedAt.toDate()).toLocaleString()
                      : ""}
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate(`/admin/torch/${item._id}`)}
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

export function AddTorchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // base fields
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("");
  const [isMajorStop, setIsMajorStop] = useState(false);
  const [tourDate, setTourDate] = useState<Date | undefined>(undefined);
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [region, setRegion] = useState("");
  const [info, setInfo] = useState("");

  // UX state
  const [saving, setSaving] = useState(false);

  const canSave = !!name && lat !== "" && lng !== "" && !saving;

  // const gradientStyle = useMemo(
  //   () => ({
  //     background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
  //   }),
  //   [gradientFrom, gradientTo],
  // );

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const docRef = await createTorchStop({
        name,
        region: region || "",
        location: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        tourDate: tourDate || new Date(),
        metadata: {
          phase: phase || "",
          description: info || "",
          isMajorStop: isMajorStop,
        },
      });

      console.info("Torch stop created:", docRef);
      toast.success(
        t("torchstops.stopcreate.sucess", "Torch stop created successfully")
      );
      window.scrollTo({ top: 0, behavior: "smooth" });

      // reset form
      setName("");
      setIsMajorStop(false);
      setTourDate(undefined);
      setPhase("");
      setRegion("");
      setLat(0);
      setLng(0);
      setInfo("");
    } catch (e) {
      console.error(e);
      toast.error(
        t(
          "torchstops.stopcreate.error",
          "Failed to create torch stop. Check your permissions/rules and try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
            {t("back", "Back")}
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {t("torchstops.newtorch.title", "Add a Torch Stop")}
            </h2>
            <p className="mt-1 text-sm text-foreground/70">
              {t(
                "torchstops.newtorch.description",
                "Create a new torch stop and add it to the map."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form column - left */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Details */}
          <BasicDetails
            name={name}
            setName={setName}
            isMajorStop={isMajorStop}
            setIsMajorStop={setIsMajorStop}
            tourDate={tourDate}
            setTourDate={setTourDate}
            phase={phase}
            setPhase={setPhase}
            info={info}
            setInfo={setInfo}
          />

          {/* Location Details */}
          <LocationDetails
            lat={lat}
            setLat={setLat}
            lng={lng}
            setLng={setLng}
            region={region}
            setRegion={setRegion}
          />

          {/* Actions */}
          <ButtonGroup className="flex items-center gap-3 pt-2">
            <Button variant="default" onClick={onSave} disabled={!canSave}>
              {saving
                ? t("torchstops.save.saving", "Saving…")
                : t("torchstops.save.create", "Create torch stop")}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setName("");
                setRegion("");
                setPhase("");
                setIsMajorStop(false);
                setTourDate(undefined);
                setLat("");
                setLng("");
                setInfo("");
              }}
            >
              {t("torchstops.reset", "Reset")}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}

export function EditTorchPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const params = useParams();
  const torchStopId = params.torchStopId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState("");
  const [isMajorStop, setIsMajorStop] = useState(false);
  const [tourDate, setTourDate] = useState<Date | undefined>(undefined);
  const [region, setRegion] = useState("");

  const canSave =
    !!torchStopId && !!name && lat !== "" && lng !== "" && !saving;

  /* ---------- Load ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getTorchStop(torchStopId);
        if (!snap) {
          toast.error(t("torchstops.notfound", "Torch stop not found."));
          return;
        }
        const d = snap as TorchStop;

        setName(d.name || "");
        setLat(d.location.coordinates?.[1] ?? "");
        setLng(d.location.coordinates?.[0] ?? "");
        setDescription(d.metadata?.description || "");
        setPhase(d.metadata?.phase || "");
        setIsMajorStop(d.metadata?.isMajorStop || false);
        setTourDate(d.tourDate ? new Date(d.tourDate) : undefined);
        setRegion(d.region || "");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [torchStopId]);

  /* ---------- Save ---------- */
  async function onSave() {
    setSaving(true);
    try {
      await updateTorchStop(torchStopId, {
        name,
        location: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        metadata: {
          description: description || null,
          phase: phase || null,
          isMajorStop: isMajorStop,
        },
        tourDate: tourDate || null,
        region: region || null,
      });
      toast.success(t("torchstops.stopupdate.success", "Changes saved."));
    } catch (e) {
      console.error(e);

      toast.error(t("torchstops.stopupdate.error", "Failed to save changes."));
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete / Duplicate ---------- */
  async function onDelete() {
    if (
      !confirm(
        t(
          "torchstops.delete.confirm",
          "Delete this place? This cannot be undone."
        )
      )
    )
      return;
    await deleteTorchStop(torchStopId);
    navigate("/admin/torch");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 mx-auto max-w-5xl p-6 text-sm text-foreground/70">
        <Spinner />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {t("torchstops.edittorch.title", "Edit place")}
            </h2>
            <p className="mt-1 text-sm text-foreground/70">
              {t(
                "torchstops.edittorch.description",
                "Update details, visuals, links"
              )}
              {/* {isRoot(zoneParam) ? "" : " — zone-scoped"}. */}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            {saving
              ? t("torchstops.save.saving", "Saving…")
              : t("torchstops.save.edit", "Save changes")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          <Section title={t("torchstops.basic.title", "Basic details")}>
            <div className="grid gap-4 sm:grid-cols-1">
              <Field>
                <FieldLabel htmlFor="name">
                  {t("torchstops.fields.name", "Stop name")}
                </FieldLabel>
                <Input
                  required
                  id="name"
                  placeholder="e.g. Iba Mar Diop Stadium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              <Field>
                <FieldLabel htmlFor="phase">
                  {t("torchstops.fields.phase", "Stop phase")}
                </FieldLabel>
                <Input
                  id="phase"
                  placeholder="e.g. Phase 1"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="info">
                {t("torchstops.fields.info", "Description")}
              </FieldLabel>
              <Textarea
                id="info"
                placeholder="Historic multi-use stadium in Dakar."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FieldDescription>
                Short description shown in the card/popup.
              </FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="isMajorStop"
                checked={isMajorStop}
                onCheckedChange={(checked) => setIsMajorStop(!!checked)}
              />
              <FieldLabel htmlFor="isMajorStop">
                {t("torchstops.fields.isMajorStop", "Major Stop")}
              </FieldLabel>
            </Field>

            <Field>
              <FieldLabel htmlFor="tourDate">
                {t("torchstops.fields.tourDate", "Tour Date")}
              </FieldLabel>
              <DateTimePicker
                // id="tourDate"
                date={tourDate}
                setDate={setTourDate}
              />
            </Field>
          </Section>

          <Section title={t("torchstops.location.title", "Location details")}>
            <div className="grid gap-4 sm:grid-cols-1">
              <Field>
                <FieldLabel htmlFor="region">
                  {t("torchstops.fields.region", "Stop region")}
                </FieldLabel>
                <Input
                  id="region"
                  placeholder="e.g. Dakar"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="lng">
                  {t("torchstops.fields.lat", "Latitude")}
                </FieldLabel>
                <Input
                  required
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="14.6928"
                  value={lat as any}
                  onChange={(e) =>
                    setLat(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lng">
                  {t("torchstops.fields.lng", "Longitude")}
                </FieldLabel>
                <Input
                  required
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="-17.4467"
                  value={lng as any}
                  onChange={(e) =>
                    setLng(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                />
              </Field>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
