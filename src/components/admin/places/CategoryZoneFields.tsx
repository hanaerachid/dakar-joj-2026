import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type Zone = { id: string; name: string; color: string; categoryId: string };

type Props = {
  categoryId: string;
  setCategoryId: (v: string) => void;
  CATEGORIES: { id: string; label: string }[];
  zonesLoading: boolean;
  hasFallback: boolean;
  zoneId: string;
  setZoneId: (v: string) => void;
  zonesPrimary: Zone[];
  zonesFallback: Zone[];
};

export default function CategoryZoneFields({
  categoryId,
  setCategoryId,
  CATEGORIES,
  zonesLoading,
  hasFallback,
  zoneId,
  setZoneId,
  zonesPrimary,
  zonesFallback,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="category" >
          Category
        </FieldLabel>
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
        <FieldLabel htmlFor="zone" >
          Zone
        </FieldLabel>
        <Select
          disabled={zonesLoading}
          value={zoneId}
          onValueChange={(value) => {
            if (value !== null) {
              setZoneId(value)
            }
          }}
        >
          <SelectTrigger
            id="zone"
            className="w-full"
          >
            <SelectValue>
              {zonesPrimary.find((z) => z.id === zoneId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">(No zone)</SelectItem>
            {/* Primary zones (for the selected category) */}
            {zonesPrimary.length > 0 && (
              <SelectGroup>
                <SelectLabel>Zones for this category</SelectLabel>
                {zonesPrimary.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}

            {/* Fallback zones from Competition */}
            {zonesFallback.length > 0 && (
              <SelectGroup>
                <SelectLabel>Competition zones</SelectLabel>
                {zonesFallback.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
        <FieldDescription>
          {
            zonesLoading
              ? "Loading zones…"
              : hasFallback
                ? "No zones in this category — showing Competition zones so you can still attach one."
                : "Optional. You can save without a zone."
          }
        </FieldDescription>
      </Field>
    </div>
  );
}
