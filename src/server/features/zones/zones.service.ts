import { getAdminFirestore } from "../../firebase/admin.js";
import type { Zone } from "../../../shared/contracts.js";

const DEFAULT_COMP_ZONES = [
  { name: "Dakar", color: "#E91E63" },
  { name: "Diamniadio", color: "#12B76A" },
  { name: "Saly", color: "#FF8C00" },
  { name: "Olympic Village", color: "#ffe100" },
];

function toZone(id: string, data: FirebaseFirestore.DocumentData): Zone {
  return {
    id,
    name: String(data.name ?? "Unnamed Zone"),
    color: String(data.color ?? "#3b82f6"),
    categoryId: String(data.categoryId ?? ""),
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

export async function listZones(categoryId: string) {
  const db = getAdminFirestore();
  const collection = db.collection("zones");
  const snap = await collection.where("categoryId", "==", categoryId).get();

  if (categoryId === "competition" && snap.empty) {
    const batch = db.batch();
    const ts = new Date();
    for (const zone of DEFAULT_COMP_ZONES) {
      const ref = collection.doc();
      batch.set(ref, {
        name: zone.name,
        color: zone.color,
        categoryId,
        createdAt: ts,
        updatedAt: ts,
      });
    }
    await batch.commit();
    const seeded = await collection.where("categoryId", "==", categoryId).get();
    return seeded.docs.map((doc) => toZone(doc.id, doc.data()));
  }

  return snap.docs.map((doc) => toZone(doc.id, doc.data()));
}
