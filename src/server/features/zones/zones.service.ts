import { getMongoDatabase } from "../../mongodb/client.js";
import type { Zone } from "../../../shared/contracts.js";

const DEFAULT_COMP_ZONES = [
  { name: "Dakar", color: "#E91E63" },
  { name: "Diamniadio", color: "#12B76A" },
  { name: "Saly", color: "#FF8C00" },
  { name: "Olympic Village", color: "#ffe100" },
];

function toZone(id: string, data: Record<string, any>): Zone {
  return {
    id,
    name: String(data.name ?? "Unnamed Zone"),
    color: String(data.color ?? "#3b82f6"),
    categoryId: String(data.categoryId ?? ""),
    createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt ?? null,
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt ?? null,
  };
}

export async function listZones(categoryId: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<any>("zones");
  const snap = await collection.find({ categoryId }).toArray();

  if (categoryId === "competition" && snap.length === 0) {
    const ts = new Date();
    await collection.insertMany(DEFAULT_COMP_ZONES.map((zone) => {
      const id = crypto.randomUUID();
      return {
        _id: id,
        _firestorePath: `zones/${id}`,
        name: zone.name,
        color: zone.color,
        categoryId,
        createdAt: ts,
        updatedAt: ts,
      };
    }));
    const seeded = await collection.find({ categoryId }).toArray();
    return seeded.map((doc) => toZone(String(doc._id), doc));
  }

  return snap.map((doc) => toZone(String(doc._id), doc));
}
