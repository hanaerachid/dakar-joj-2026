// src/admin/places/PlaceDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { deletePlace, duplicatePlace, getPlace, updatePlace } from "../../lib/api/places";
import { SITES_META, type VenueSport } from "../../data/sitesMeta";
import { Icon } from "@iconify/react";
import PlacePreview from "../../components/admin/places/PlacePreview";
import { ALL_SPORT_OPTIONS } from "../../data/sports";
import { Section } from "@/components/common/Section";
import { ColorInput } from "@/components/common/ColorInput";
import { TextInput } from "@/components/common/TextInput";

/* ---------- Helpers for root vs zone scoped docs ---------- */
const isRoot = (z?: string | null) => !z || z === "root";

/* ---------- Sports helpers (shared with add page) ---------- */
function uniqSports(list: VenueSport[]): VenueSport[] {
  const seen = new Set<string>();
  const out: VenueSport[] = [];
  for (const s of list) {
    if (!seen.has(s.key)) {
      seen.add(s.key);
      out.push(s);
    }
  }
  return out;
}

/* ---------- Types you already have (kept minimal here) ---------- */
export type Place = {
  id: string;
  name: string;
  name_fr?: string | null;
  nameFr?: string | null;
  location?: { latitude: number; longitude: number } | any;
  address?: string;
  info?: string;
  info_fr?: string | null;
  infoFr?: string | null;
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
  sports?: VenueSport[] | null;
  categoryId?: string;
  zoneId?: string | null;
  createdAt?: any;
  updatedAt?: any;
};

/* ====================================================
   Details Page (now supports root-level places)
   ==================================================== */
export function PlaceDetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const zoneParam = params.zoneId; // may be "root"
  const placeId = params.placeId!;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // core fields
  const [name, setName] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [address, setAddress] = useState("");
  const [info, setInfo] = useState("");
  const [infoFr, setInfoFr] = useState("");
  const [rating, setRating] = useState<number | "">("");
  const [tags, setTags] = useState<string>("");
  const [pointColor, setPointColor] = useState("#2962FF");
  const [imageUrl, setImageUrl] = useState("");

  // branding/meta
  const [brandTitle, setBrandTitle] = useState("");
  const [brandSubtitle, setBrandSubtitle] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [gradientFrom, setGradientFrom] = useState("#12B76A");
  const [gradientTo, setGradientTo] = useState("#0A6B4A");
  const [website, setWebsite] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  // classification (for save + preview)
  const [categoryId, setCategoryId] = useState<string>("competition"); // fetched
  const [zoneIdInDoc, setZoneIdInDoc] = useState<string | null>(null); // fetched

  // competition-only
  const [sports, setSports] = useState<VenueSport[]>([]);


  const canSave = !!placeId && !!name && lat !== "" && lng !== "" && !saving;

  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
    }),
    [gradientFrom, gradientTo],
  );

  /* ---------- Load ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getPlace(placeId, isRoot(zoneParam) ? null : zoneParam!);
        if (!snap) {
          toast.error("Place not found.");
          return;
        }
        const d = snap as Place;

        setCategoryId(d.categoryId || "competition");
        setZoneIdInDoc(d.zoneId ?? (isRoot(zoneParam) ? null : zoneParam!));

        setName(d.name || "");
        setNameFr(d.name_fr || (d as any).name_fr || (d as any).nameFr || "");
        const la = d.location?.latitude ?? (d as any).location?._lat ?? null;
        const lo = d.location?.longitude ?? (d as any).location?._long ?? null;
        setLat(la ?? "");
        setLng(lo ?? "");
        setAddress(d.address || "");
        setInfo(d.info || "");
        setInfoFr(
          d.info_fr || (d as any).info_fr || (d as any).infoFr || "",
        );
        setRating(d.rating ?? "");
        setTags((d.tags || []).join(", "));
        setPointColor(d.pointColor || "#2962FF");
        setImageUrl(d.imageUrl || "");
        setBrandTitle(d.brandTitle || "");
        setBrandSubtitle(d.brandSubtitle || "");
        setLocationLabel(d.locationLabel || "");
        setShortCode(d.shortCode || "");
        setGradientFrom(d.gradientFrom || "#12B76A");
        setGradientTo(d.gradientTo || "#0A6B4A");
        setWebsite(d.website || "");
        setSocialHandle(d.socialHandle || "");

        const incomingSports = (d.sports as VenueSport[] | null) ?? [];
        if (incomingSports.length) {
          setSports(incomingSports);
        } else if ((d.categoryId || "competition") === "competition") {
          // optional auto-suggest from SITES_META when empty
          const zname = zoneIdInDoc ? zoneIdInDoc : d.locationLabel || "";
          const zoneMeta = (SITES_META as any)[zname] || {};
          const key = Object.keys(zoneMeta).find(
            (k) => k.toLowerCase() === (d.name || "").toLowerCase(),
          );
          if (key && Array.isArray(zoneMeta[key]?.sports))
            setSports(zoneMeta[key].sports);
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneParam, placeId]);

  /* ---------- Save ---------- */
  async function onSave() {
    setSaving(true);
    try {
      await updatePlace(placeId, {
        name,
        name_fr: nameFr || null,
        location: { latitude: Number(lat), longitude: Number(lng) },
        address: address || null,
        info: info || null,
        info_fr: infoFr || null,
        rating: rating === "" ? null : Number(rating),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        pointColor: pointColor || null,
        imageUrl: imageUrl.trim() || null,
        brandTitle: brandTitle || null,
        brandSubtitle: brandSubtitle || null,
        locationLabel: locationLabel || null,
        shortCode: shortCode || null,
        gradientFrom: gradientFrom || null,
        gradientTo: gradientTo || null,
        website: website || null,
        socialHandle: socialHandle || null,

        // keep classification on doc
        categoryId: categoryId || "competition",
        zoneId: isRoot(zoneParam) ? null : zoneParam!,

        // competition extras
        sports: categoryId === "competition" ? sports : [],
        sportCount: categoryId === "competition" ? sports.length : 0,

      });

      toast.success("Changes saved.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Delete / Duplicate ---------- */
  async function onDelete() {
    if (!confirm("Delete this place? This cannot be undone.")) return;
    await deletePlace(placeId, isRoot(zoneParam) ? null : zoneParam!);
    navigate("/admin/places");
  }

  async function duplicate() {
    await duplicatePlace(placeId, isRoot(zoneParam) ? null : zoneParam!);
    navigate(-1);
  }

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tags],
  );

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
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Edit place</h2>
            <p className="mt-1 text-sm text-foreground/70">
              Update details, visuals, links
              {isRoot(zoneParam) ? "" : " — zone-scoped"}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={duplicate}>
            Duplicate
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic */}
          <Section title="Basic details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">
                  Place name
                </FieldLabel>
                <TextInput
                  id="name"
                  required
                  placeholder="e.g. Iba Mar Diop Stadium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nameFr">
                  Place name (French)
                </FieldLabel>
                <TextInput
                  id="nameFr"
                  placeholder="Nom en français…"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="lat">
                  Latitude
                </FieldLabel>
                <TextInput
                  id="lat"
                  required
                  type="number"
                  step="any"
                  placeholder="14.6928"
                  value={lat as any}
                  onChange={(e) =>
                    setLat(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lng">
                  Longitude
                </FieldLabel>
                <TextInput
                  id="lng"
                  required
                  type="number"
                  step="any"
                  placeholder="-17.4467"
                  value={lng as any}
                  onChange={(e) =>
                    setLng(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                />
              </Field>
            </div>

            {/* Category (read-only text for now; you can swap to a <select> if you want) */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="category">
                  Category
                </FieldLabel>
                <TextInput
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="locationLabel">
                  Location label
                </FieldLabel>
                <TextInput
                  id="locationLabel"
                  placeholder="Location label"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="shortCode">
                  Short code
                </FieldLabel>
                <TextInput
                  id="shortCode"
                  placeholder="DEX"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">
                Address
              </FieldLabel>
              <TextInput
                id="address"
                placeholder="Street, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="info">
                About / Info
              </FieldLabel>
              <Textarea
                id="info"
                placeholder="Short description…"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="infoFr">
                About / Info (French)
              </FieldLabel>
              <Textarea
                id="infoFr"
                placeholder="Description en français…"
                value={infoFr}
                onChange={(e) => setInfoFr(e.target.value)}
              />
              <FieldDescription>
                Displayed when the app language is FR.
              </FieldDescription>
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="rating">
                  Rating (0–5)
                </FieldLabel>
                <TextInput
                  id="rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  placeholder="4.6"
                  value={rating as any}
                  onChange={(e) =>
                    setRating(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="tags">
                  Tags
                </FieldLabel>
                <TextInput
                  id="tags"
                  placeholder="Stadium, Sports, Events"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="pointColor">
                  Point color
                </FieldLabel>
                <ColorInput value={pointColor} onChange={setPointColor} />
              </Field>
            </div>
          </Section>

          {/* Competition Sports */}
          {categoryId === "competition" && (
            <Section
              title="Competition Sports"
              desc="Select all sports hosted at this venue."
            >
              {ALL_SPORT_OPTIONS.length === 0 ? (
                <Empty>
                  <EmptyContent>
                    <EmptyDescription>
                      No sport options found in site meta.
                    </EmptyDescription>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {ALL_SPORT_OPTIONS.map((s) => {
                    const checked = sports.some((x) => x.key === s.key);
                    return (
                      <label
                        key={s.key}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setSports((prev) =>
                              e.target.checked
                                ? uniqSports([...prev, s])
                                : prev.filter((x) => x.key !== s.key),
                            )
                          }
                        />
                        <span className="inline-flex items-center gap-2">
                          {s.icon ? (
                            <Icon icon={s.icon} width={18} height={18} />
                          ) : null}
                          <span className="font-medium">{s.label}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {sports.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {sports.map((s) => (
                    <Badge
                      key={s.key}
                      className="inline-flex items-center gap-2 px-4 py-2 text-base"
                    >
                      {s.icon ? (
                        <Icon icon={s.icon} width={14} height={14} />
                      ) : null}
                      {s.label}
                    </Badge>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Visuals & Media */}
          <Section title="Visuals & Media" desc="Gradient and cover image.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="gradFrom">
                  Gradient from
                </FieldLabel>
                <ColorInput value={gradientFrom} onChange={setGradientFrom} />
              </Field>
              <Field>
                <FieldLabel htmlFor="gradTo">
                  Gradient to
                </FieldLabel>
                <ColorInput value={gradientTo} onChange={setGradientTo} />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-40 rounded-full border"
                style={gradientStyle}
                aria-label="Gradient preview"
              />
              <span className="text-xs text-muted-foreground">
                Live gradient preview
              </span>
            </div>

            <Field>
              <FieldLabel htmlFor="imageUrl">
                Cover image URL
              </FieldLabel>
              <div className="flex flex-col gap-3">
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
                {imageUrl && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setImageUrl("")}
                  >
                    Remove current
                  </Button>
                )}
              </div>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="cover"
                  className="object-cover mt-2 max-h-44 w-auto rounded-x3l border shadow-sm"
                />
              ) : null}
            </Field>
          </Section>

          {/* Branding & Links */}
          <Section title="Branding & Links">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="brandTitle">
                  Brand title
                </FieldLabel>
                <TextInput
                  id="brandTitle"
                  placeholder="DAKAR 2026"
                  value={brandTitle}
                  onChange={(e) => setBrandTitle(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="brandSubtitle">
                  Brand subtitle
                </FieldLabel>
                <TextInput
                  id="brandSubtitle"
                  placeholder="YOUTH OLYMPIC GAMES"
                  value={brandSubtitle}
                  onChange={(e) => setBrandSubtitle(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="website">
                  Website
                </FieldLabel>
                <TextInput
                  id="website"
                  placeholder="https://www.dakar2026.org"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="social">
                  Social handle
                </FieldLabel>
                <TextInput
                  id="social"
                  placeholder="@jojdakar2026"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                />
              </Field>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20 self-start">
          <Section
            title="Live Preview"
            desc="How this card might look in the app."
          >
            <div className="space-y-4">
              <PlacePreview
                gradientFrom={gradientFrom}
                gradientTo={gradientTo}
                preview={imageUrl || null}
                brandTitle={brandTitle}
                brandSubtitle={brandSubtitle}
                locationLabel={locationLabel}
                shortCode={shortCode}
                name={name}
                nameFr={nameFr}
                info={info}
                infoFr={infoFr}
                address={address}
                categoryId={categoryId}
                sports={sports}
                tagList={tagList}
                website={website}
                socialHandle={socialHandle}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
