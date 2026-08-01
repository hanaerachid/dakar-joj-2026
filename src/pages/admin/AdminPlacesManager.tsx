// src/admin/AdminPlacesManager.tsx
import { useEffect, useState } from "react";
import { useRole } from "../../auth/hooks/useRole";
import { createPlace, deletePlace, listPlaces, listZones, updatePlace } from "../../lib/api/places";

type Zone = { id: string; name: string; color: string };
type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
};

export function AdminPlacesManager() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  const [categoryId, setCategoryId] = useState("competition");
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [form, setForm] = useState<Partial<Place>>({
    name: "",
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    (async () => {
      const z = (await listZones(categoryId)) as Zone[];
      setZones(z);
      setZoneId(z[0]?.id || "");
    })();
  }, [categoryId]);

  useEffect(() => {
    if (!zoneId) return;
    (async () => {
      const ps = await listPlaces({ zoneId, scope: "zone" });
      setPlaces(
        ps.map((p) => {
          const lat = p.location?.latitude ?? 0;
          const lng = p.location?.longitude ?? 0;
          return { id: p.id, name: p.name, lat, lng, address: p.address ?? undefined };
        }),
      );
    })();
  }, [zoneId]);

  if (!isAdmin) return <div className="p-4">You need admin access.</div>;

  const add = async () => {
    await createPlace({
      name: form.name,
      location: {
        latitude: Number(form.lat ?? 0),
        longitude: Number(form.lng ?? 0),
      },
      address: form.address ?? null,
      categoryId,
      zoneId,
    });
    setForm({ name: "", lat: 0, lng: 0, address: "" });
  };

  const save = async (id: string, patch: Partial<Place>) => {
    await updatePlace(id, {
      ...(patch.name ? { name: patch.name } : {}),
      ...(patch.address !== undefined ? { address: patch.address } : {}),
      ...(patch.lat !== undefined && patch.lng !== undefined
        ? {
            location: {
              latitude: Number(patch.lat),
              longitude: Number(patch.lng),
            },
          }
        : {}),
      zoneId,
      categoryId,
    });
  };

  const remove = async (id: string) => {
    await deletePlace(id, zoneId);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="competition">Competition</option>
          <option value="hotels">Hotels</option>
          <option value="restaurants">Restaurants</option>
          <option value="artworks">Art Works</option>
          <option value="attraction">Attraction</option>
          <option value="castle">Castle</option>
          <option value="church">Church</option>
          <option value="gallery">Gallery</option>
          <option value="museum">Museum</option>
          <option value="viewpoints">Viewpoints</option>
          <option value="zoo">Zoo</option>
          <option value="memorial">Memorial</option>
          <option value="monument">Monument</option>
          <option value="mosque">Mosque</option>
          <option value="hospitals">Hospitals</option>
          <option value="transport">Transportation</option>
          <option value="police">Police</option>
          <option value="bank">Bank</option>
          <option value="atm">ATM</option>
          <option value="firestation">Fire Station</option>
          <option value="embassy">Embassy</option>
          <option value="consulate">Consulate</option>
          <option value="airport">Airport</option>
          <option value="bus">Bus</option>
          <option value="ferry">Ferry</option>
          <option value="railway">Railway</option>
        </select>
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded p-3 space-y-2">
        <div className="font-medium">Add place</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Name"
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Lat"
            type="number"
            step="any"
            value={form.lat ?? 0}
            onChange={(e) =>
              setForm((f) => ({ ...f, lat: parseFloat(e.target.value) }))
            }
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Lng"
            type="number"
            step="any"
            value={form.lng ?? 0}
            onChange={(e) =>
              setForm((f) => ({ ...f, lng: parseFloat(e.target.value) }))
            }
          />
          <input
            className="border rounded px-2 py-1"
            placeholder="Address"
            value={form.address || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
        </div>
        <button
          onClick={add}
          className="rounded bg-black text-white px-3 py-1.5"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {places.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-2 border rounded p-2"
          >
            <input
              defaultValue={p.name}
              className="border rounded px-2 py-1"
              onBlur={(e) => save(p.id, { name: e.target.value })}
            />
            <input
              defaultValue={p.lat}
              type="number"
              step="any"
              className="border rounded px-2 py-1 w-28"
              onBlur={(e) =>
                save(p.id, { lat: parseFloat(e.target.value), lng: p.lng })
              }
            />
            <input
              defaultValue={p.lng}
              type="number"
              step="any"
              className="border rounded px-2 py-1 w-28"
              onBlur={(e) =>
                save(p.id, { lng: parseFloat(e.target.value), lat: p.lat })
              }
            />
            <input
              defaultValue={p.address}
              className="border rounded px-2 py-1 flex-1"
              onBlur={(e) => save(p.id, { address: e.target.value })}
            />
            <button
              onClick={() => remove(p.id)}
              className="ml-auto rounded border px-2 py-1 text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
