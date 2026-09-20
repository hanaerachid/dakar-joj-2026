
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_PLANS } from "../business-create.config";

import { FileField, /*TextField*/ } from "@/components/common/Field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";

export function BusinessMediaStep(
  { title }: { title?: string },
) {
  const { /* control, */ watch, setValue } =
    useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();

  const plan = watch("pack");
  const photos = watch("photos") ?? [];
  const video = watch("videoFile");

  const entitlement = BUSINESS_PLANS[plan];

  // const addPhotos = (files: FileList | null) => {
  //   if (!files) return;

  //   const remaining = Math.max(
  //     0,
  //     entitlement.photos - photos.length,
  //   );

  //   const accepted = Array.from(files)
  //     .filter((file) => file.type.startsWith("image/"))
  //     .slice(0, remaining);

  //   setValue(
  //     "photos",
  //     [...photos, ...accepted],
  //     { shouldValidate: true, shouldDirty: true },
  //   );
  // };

  const removePhoto = (index: number) => {
    setValue(
      "photos",
      photos.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  return (
    <>
      {title &&
        <CardHeader>
          <CardTitle className="font-bold">
            {title}
          </CardTitle>
        </CardHeader>
      }
      <CardContent className="space-y-6">
        <FieldSet>
          <FieldLegend className="w-full font-semibold flex items-center justify-between gap-4">
            <div className="flex-1">
              {t("businessCreate.media.photos", "Photos")}
            </div>
            <Badge variant="ghost" className="shrink-0 text-sm text-muted-foreground">
              {photos.length}
            </Badge>
          </FieldLegend>
          <FieldGroup>
            <FileField
              name="photos"
              label="Photos"
              accept="image/*"
              multiple
              disabled={photos.length >= entitlement.photos}
            // onFilesChange={addPhotos}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((file, index) => {
                const url = URL.createObjectURL(file);

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="space-y-2"
                  >
                    <img
                      src={url}
                      alt={file.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => removePhoto(index)}
                    >
                      {t("common.remove", "Remove")}
                    </Button>
                  </div>
                );
              })}
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className="font-semibold">
            {t(
              "businessCreate.media.video",
              "Presentation video",
            )}
          </FieldLegend>
          <FieldGroup>
            {entitlement.video ? (
              <FileField
                name="videoFile"
                label={t(
                  "businessCreate.media.uploadVideo",
                  "Upload a video",
                )}
                accept="video/*"
                value={video}
              />
            ) : (
              <div className="rounded-lg bg-muted p-4 text-sm">
                {t(
                  "businessCreate.media.videoLocked",
                  "Video is available with Premium and Sponsor plans.",
                )}
              </div>
            )}
          </FieldGroup>
        </FieldSet>
        {/* 
        <FieldSet>
          <FieldLegend className="font-semibold">
            {t(
              "businessCreate.media.tarifs",
              "Affichage des tarifs",
            )}
          </FieldLegend>
          <FieldGroup>
            <TextField
              name="priceTag"
              label={t(
                "businessCreate.media.pricing_tag",
                "Pricing note",
              )}
              placeholder={t(
                "businessCreate.media.pricing_tag_placeholder",
                "e.g. Special event rates",
              )}
            />
          </FieldGroup>
        </FieldSet>
        */}
      </CardContent>
    </>
  );
}