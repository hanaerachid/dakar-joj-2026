import { ColorInput } from "@/components/common/ColorInput";
import { Field, FieldLabel } from "@/components/ui/field";

type Props = {
  gradientFrom: string;
  setGradientFrom: (v: string) => void;
  gradientTo: string;
  setGradientTo: (v: string) => void;

  file: File | null;
  setFile: (f: File | null) => void;
  uploadPct: number;
  preview: string | null;
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
  file,
  setFile,
  uploadPct,
  preview,
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

      {/* Cover image */}
      <Field className="grid gap-1.5">
        <FieldLabel htmlFor="image">
          Cover image
        </FieldLabel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <div className="text-xs text-gray-600">
              {uploadPct > 0 && uploadPct < 100
                ? `Uploading ${uploadPct}%…`
                : "Ready to upload"}
            </div>
          )}
        </div>
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="object-cover mt-2 max-h-44 w-auto rounded-xl border shadow-sm"
          />
        )}
      </Field>
    </>
  );
}
