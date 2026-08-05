import { getAdminFirestore, admin } from "../../firebase/admin.js";
import type { Place } from "../../../shared/contracts.js";

function toIso(value: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue | undefined | null) {
  if (!value || typeof value !== "object" || !("toDate" in value)) return null;
  return (value as FirebaseFirestore.Timestamp).toDate().toISOString();
}

function normalizeLocation(location: any) {
  if (!location) return null;
  if (typeof location.latitude === "number" && typeof location.longitude === "number") {
    return { latitude: location.latitude, longitude: location.longitude };
  }
  if (typeof location.lat === "number" && typeof location.lng === "number") {
    return { latitude: location.lat, longitude: location.lng };
  }
  if (typeof location._lat === "number" && typeof location._long === "number") {
    return { latitude: location._lat, longitude: location._long };
  }
  return null;
}

function serializePlace(id: string, data: FirebaseFirestore.DocumentData, zoneId?: string | null): Place {
  return {
    id,
    name: String(data.name ?? "Untitled"),
    name_fr: data.name_fr ?? data.nameFr ?? null,
    nameFr: data.nameFr ?? null,
    location: normalizeLocation(data.location) ?? undefined,
    address: data.address ?? null,
    info: data.info ?? null,
    info_fr: data.info_fr ?? data.infoFr ?? null,
    infoFr: data.infoFr ?? null,
    rating: typeof data.rating === "number" ? data.rating : null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    pointColor: data.pointColor ?? null,
    imageUrl: data.imageUrl ?? null,
    brandTitle: data.brandTitle ?? null,
    brandSubtitle: data.brandSubtitle ?? null,
    locationLabel: data.locationLabel ?? null,
    shortCode: data.shortCode ?? null,
    gradientFrom: data.gradientFrom ?? null,
    gradientTo: data.gradientTo ?? null,
    website: data.website ?? null,
    socialHandle: data.socialHandle ?? null,
    sportCount: Number(data.sportCount ?? 0),
    sports: Array.isArray(data.sports) ? data.sports : [],
    categoryId: data.categoryId ?? null,
    zoneId: zoneId ?? data.zoneId ?? null,
    zone: data.zone ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function placeCollection(zoneId?: string | null) {
  const db = getAdminFirestore();
  return zoneId ? db.collection("zones").doc(zoneId).collection("places") : db.collection("places");
}

function buildPayload(input: any, zoneId?: string | null) {
  return {
    name: input.name,
    name_fr: input.name_fr ?? input.nameFr ?? null,
    nameFr: input.nameFr ?? null,
    location: input.location ?? null,
    address: input.address ?? null,
    info: input.info ?? null,
    info_fr: input.info_fr ?? input.infoFr ?? null,
    infoFr: input.infoFr ?? null,
    rating: input.rating ?? null,
    tags: Array.isArray(input.tags) ? input.tags : [],
    pointColor: input.pointColor ?? null,
    imageUrl: input.imageUrl ?? null,
    brandTitle: input.brandTitle ?? null,
    brandSubtitle: input.brandSubtitle ?? null,
    locationLabel: input.locationLabel ?? null,
    shortCode: input.shortCode ?? null,
    gradientFrom: input.gradientFrom ?? null,
    gradientTo: input.gradientTo ?? null,
    website: input.website ?? null,
    socialHandle: input.socialHandle ?? null,
    sportCount: input.sportCount ?? (Array.isArray(input.sports) ? input.sports.length : 0),
    sports: Array.isArray(input.sports) ? input.sports : [],
    categoryId: input.categoryId ?? null,
    zoneId: zoneId ?? input.zoneId ?? null,
    zone: input.zone ?? null,
    createdAt: input.createdAt ?? admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

export async function listPlaces(params: {
  categoryId?: string;
  zoneId?: string | null;
  scope?: "all" | "zone" | "root";
}) {
  const { categoryId, zoneId, scope } = params;
  const db = getAdminFirestore();

  if (scope === "all") {
    const [zoneGroupSnap, rootSnap] = await Promise.all([
      db.collectionGroup("places").where("categoryId", "==", categoryId ?? "").get(),
      db.collection("places").where("categoryId", "==", categoryId ?? "").get(),
    ]);

    return [
      ...zoneGroupSnap.docs.map((doc) => {
        const zoneParent = doc.ref.parent.parent?.id ?? null;
        return serializePlace(doc.id, doc.data(), zoneParent);
      }),
      ...rootSnap.docs.map((doc) => serializePlace(doc.id, doc.data(), null)),
    ];
  }

  if (scope === "root" || !zoneId) {
    const snap = await db.collection("places").where("categoryId", "==", categoryId ?? "").get();
    return snap.docs.map((doc) => serializePlace(doc.id, doc.data(), null));
  }

  const snap = await placeCollection(zoneId).get();
  return snap.docs.map((doc) => serializePlace(doc.id, doc.data(), zoneId));
}

export async function getPlace(id: string, zoneId?: string | null) {
  const snap = await placeCollection(zoneId).doc(id).get();
  if (!snap.exists) return null;
  return serializePlace(snap.id, snap.data() as FirebaseFirestore.DocumentData, zoneId);
}

export async function createPlace(input: any, zoneId?: string | null) {
  const ref = await placeCollection(zoneId).add(buildPayload(input, zoneId));
  return getPlace(ref.id, zoneId);
}

export async function updatePlace(id: string, input: any, zoneId?: string | null) {
  const ref = placeCollection(zoneId).doc(id);
  await ref.update(buildPayload(input, zoneId));
  return getPlace(id, zoneId);
}

export async function deletePlace(id: string, zoneId?: string | null) {
  await placeCollection(zoneId).doc(id).delete();
}

export async function duplicatePlace(id: string, zoneId?: string | null) {
  const place = await getPlace(id, zoneId);
  if (!place) return null;
  const ref = await placeCollection(zoneId).add({
    ...place,
    name: `${place.name} (copy)`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return getPlace(ref.id, zoneId);
}
