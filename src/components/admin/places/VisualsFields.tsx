import { ColorInput } from "@/components/common/ColorInput";
import { Field, FieldLabel } from "@/components/ui/field";

type Props = {
  gradientFrom: string;
  setGradientFrom: (v: string) => void;
  gradientTo: string;
  setGradientTo: (v: string) => void;

  imageUrl: string;
  setImageUrl: (v: string) => void;
};

/**
 * Matches the exact UI and behavior of the original inline Visuals block.
 * We mirror the "Field" + "ColorInput" UX using the same classes so nothing changes visually.
 */
export default function VisualsFields({
  gradientFrom,
  setGradientFrom,
  gradientTo,
  setGradientTo,
  imageUrl,
  setImageUrl,
}: Props) {
  const gradientStyle = {
    background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
  };

  return (
    <>
      {/* Gradient pickers */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Field: Gradient from */}
        <Field className="grid gap-1.5">
          <FieldLabel
            htmlFor="gradFrom"
          >
            Gradient from
          </FieldLabel>
          <ColorInput
            id="gradFrom"
            value={gradientFrom}
            onChange={setGradientFrom}
          />
        </Field>

        {/* Field: Gradient to */}
        <Field className="grid gap-1.5">
          <FieldLabel htmlFor="gradTo">
            Gradient to
          </FieldLabel>
          <ColorInput
            id="gradTo"
            value={gradientTo}
            onChange={setGradientTo}
          />
        </Field>
      </div>

      {/* Live gradient preview */}
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-40 rounded-full border"
          style={gradientStyle}
          aria-label="Gradient preview"
        />
        <span className="text-xs text-muted-foreground">Live gradient preview</span>
      </div>

      {/* Cover image URL */}
      <Field className="grid gap-1.5">
        <FieldLabel htmlFor="imageUrl">
          Cover image
        </FieldLabel>
        <input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt="preview"
            className="object-cover mt-2 max-h-44 w-auto rounded-xl border shadow-sm"
          />
        )}
      </Field>
    </>
  );
}
