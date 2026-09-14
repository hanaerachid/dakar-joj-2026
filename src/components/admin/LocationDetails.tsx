import { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { TextInput } from "../common/TextInput";
import { Section } from "../common/Section";
import LocationPickerModal from "../../core/map/LocationPickerModal";
import LocationPickerButton from "../../core/map/LocationPickerButton";

type Props = {
  lat: number | "";
  setLat: (v: number | "") => void;
  lng: number | "";
  setLng: (v: number | "") => void;
  region: string;
  setRegion: (v: string) => void;
};

export default function LocationDetails(props: Props) {
  const {
    lat,
    setLat,
    lng,
    setLng,
    region,
    setRegion,
  } = props;

  const [mapOpen, setMapOpen] = useState(false);

  return (
    <>
      <Section title="Location details">
        <div className="grid gap-4 sm:grid-cols-1">
          <Field>
            <FieldLabel htmlFor="region">
              Stop region
            </FieldLabel>
            <TextInput
              id="region"
              placeholder="e.g. Dakar"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </Field>
        </div>
        {/* Row 1.1:  lat, lng + map picker */}
        <div className="flex items-center gap-3">
          <div className="flex-1 grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="lat">
                Latitude
              </FieldLabel>
              <TextInput
                id="lat"
                type="number"
                step="any"
                placeholder="14.6928"
                value={lat as any}
                onChange={(e) =>
                  setLat(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="lng">
                Longitude
              </FieldLabel>
              <TextInput
                id="lng"
                type="number"
                step="any"
                placeholder="-17.4467"
                value={lng as any}
                onChange={(e) =>
                  setLng(
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                className="flex-1"
              />
            </Field>
          </div>
          <LocationPickerButton onClick={() => setMapOpen(true)} />
        </div>

      </Section>

      {/* Modal lives here so the component stays self-contained */}
      <LocationPickerModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={typeof lat === "number" ? lat : undefined}
        initialLng={typeof lng === "number" ? lng : undefined}
        onSelect={(selLat, selLng) => {
          setLat(selLat);
          setLng(selLng);
        }}
      />
    </>
  );
}
