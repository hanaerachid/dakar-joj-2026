import { TextInput } from "@/components/common/TextInput";
import { Field, FieldLabel } from "@/components/ui/field";

type Props = {
  brandTitle: string;
  setBrandTitle: (v: string) => void;
  brandSubtitle: string;
  setBrandSubtitle: (v: string) => void;
  locationLabel: string;
  setLocationLabel: (v: string) => void;
  shortCode: string;
  setShortCode: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  socialHandle: string;
  setSocialHandle: (v: string) => void;
};

/**
 * Matches the exact UI and behavior of the original inline block that used <Field> and <TextInput>.
 * We recreate the same structure/classes so nothing changes visually.
 */
export default function BrandingFields({
  brandTitle,
  setBrandTitle,
  brandSubtitle,
  setBrandSubtitle,
  locationLabel,
  setLocationLabel,
  shortCode,
  setShortCode,
  website,
  setWebsite,
  socialHandle,
  setSocialHandle,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Brand title */}
      <Field className="grid gap-1.5">
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

      {/* Brand subtitle */}
      <Field className="grid gap-1.5">
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

      {/* Location label */}
      <Field className="grid gap-1.5">
        <FieldLabel htmlFor="locationLabel">
          Location label
        </FieldLabel>
        <TextInput
          id="locationLabel"
          placeholder="Diamniadio"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
        />
      </Field>

      {/* Short code */}
      <Field className="grid gap-1.5">
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

      {/* Website */}
      <Field className="grid gap-1.5">
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

      {/* Social handle */}
      <Field className="grid gap-1.5">
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
  );
}
