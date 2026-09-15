// src/pages/torch/TorchPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import {
  listTorchStops,
  deleteTorchStop,
  createTorchStop
} from "../../lib/api/torchstops";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Section } from "@/components/common/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
// import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import BasicDetails from "@/components/admin/BasicDetails";
import LocationDetails from "@/components/admin/LocationDetails";

/* ---------------- Types ---------------- */
export type TorchStop = {
  _id: string;
  name: string;
  location?: {
    type: string;
    coordinates: number[]
  } | any;
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
              <span className="truncate">Torch Stops</span>
            </h2>
            <p className="mt-0.5 text-sm text-foreground/70 truncate">
              Browse and manage torch stops.
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
              <span>New torch stop</span>
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
              <Skeleton
                key={i}
                className="overflow-hidden rounded-3xl"
              >
                <Skeleton className="h-2 w-full bg-foreground/30" />
                <Skeleton className="h-44 w-full bg-foreground/20" />
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
                No torch stops found
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="default"
                disabled
                onClick={() => navigate("/admin/torch/new")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>New torch stop</span>
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
                className="mx-auto w-full max-w-sm"
              >

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

                  {item.location && (
                    <p className="text-xs text-foreground/50">
                      {item.location.coordinates[0]?.toFixed?.(5)} •{" "}
                      {item.location.coordinates[1]?.toFixed?.(5)}
                    </p>
                  )}

                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="text-xs text-foreground/50">
                    {item.updatedAt?.toDate
                      ? new Date(item.updatedAt.toDate()).toLocaleString()
                      : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      disabled
                      onClick={() => navigate(`/admin/torch/${item._id}`)}
                    >
                      <span>View / Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTorchStop(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

/* ---------------------------------------------
   AddTorchPage component
--------------------------------------------- */
export function AddTorchPage() {
  const navigate = useNavigate();

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
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    msg: string;
  } | null>(null);

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
    setToast(null);
    try {
      const docRef = await createTorchStop({
        name,
        region: region || "",
        location: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)]
        },
        tourDate: tourDate || new Date(),
        metadata: {
          phase: phase || "",
          description: info || "",
          isMajorStop: isMajorStop,
        },
      });

      setToast({ kind: "success", msg: "Torch stop created 🎉" });
      console.info("Torch stop created:", docRef);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // reset form
      setName("");
      setIsMajorStop(false);
      setTourDate(undefined);
      setPhase("");
      setLat(0);
      setLng(0);
      setInfo("");
    } catch (e) {
      console.error(e);
      setToast({
        kind: "error",
        msg: "Failed to create torch stop. Check your permissions/rules and try again.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Add a Torch Stop</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Create a new torch stop and add it to the map.
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm shadow-sm ${toast.kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
        >
          {toast.msg}
        </div>
      )}

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
            <Button
              variant="default"
              onClick={onSave} disabled={!canSave}>
              {saving ? "Saving…" : "Create torch stop"}
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
              Reset
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
