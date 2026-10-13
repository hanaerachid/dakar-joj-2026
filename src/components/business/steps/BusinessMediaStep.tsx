
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ImageOff, VideoIcon, X } from "lucide-react";
import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_PLANS } from "../business-create.config";
import { FileField, /*TextField*/ } from "@/components/common/Field";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageStatus } from "@/hooks/use-image-status";

export function BusinessMediaStep(
  { title }: { title?: string },
) {
  const { /* control, */ watch, setValue } =
    useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();

  const plan = watch("pack");
  const photos = watch("photos") ?? [];
  const videos = watch("videos") ?? [];

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

  const removeVideo = (index: number) => {
    setValue(
      "videos",
      videos.filter((_, i) => i !== index),
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
              {photos.length} {"/"} {entitlement.photos}
            </Badge>
          </FieldLegend>
          <FieldGroup>
            {entitlement.photos && entitlement.photos > 0 ? (
              <>
                <FileField
                  name="photos"
                  label="Photos"
                  accept="image/*"
                  multiple
                  disabled={photos.length >= entitlement.photos}
                // onFilesChange={addPhotos}
                />

                <AttachmentGroup className="w-full">
                  {photos.map((file, index) => {
                    const url = URL.createObjectURL(file);

                    return (
                      <Attachment key={file.name} size="default" orientation="vertical">
                        <AttachmentMedia variant="image">
                          <ImageAttachmentMedia
                            src={url}
                            alt={file.name}
                          />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{file.name}</AttachmentTitle>
                          <AttachmentDescription>{file.size} bytes</AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                          <AttachmentAction
                            variant="secondary"
                            size="icon-sm"
                            onClick={() => removePhoto(index)}
                          >
                            <X />
                            <span className="sr-only">{t("common.remove", "Remove")}</span>
                          </AttachmentAction>
                        </AttachmentActions>
                        <AttachmentTrigger
                          render={
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${file.name}`}
                            />
                          }
                        />
                      </Attachment>
                    )
                  })}
                </AttachmentGroup>
              </>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-sm">
                {t(
                  "businessCreate.media.photoLocked",
                  "Upgrade to upload Photos.",
                )}
              </div>
            )}
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className="w-full font-semibold flex items-center justify-between gap-4">
            <div className="flex-1">
              {t(
                "businessCreate.media.video",
                "Presentation video",
              )}
            </div>
            <Badge variant="ghost" className="shrink-0 text-sm text-muted-foreground">
              {videos.length} {"/"} {entitlement.videos}
            </Badge>
          </FieldLegend>
          <FieldGroup>
            {entitlement.videos && entitlement.videos > 0 ? (<>
              <FileField
                name="videos"
                label={t(
                  "businessCreate.media.uploadVideo",
                  "Upload a video",
                )}
                accept="video/*"
                multiple
                disabled={videos.length >= entitlement.videos}
              // value={videos}
              />

              <AttachmentGroup className="w-full">
                {videos.map((file, index) => {
                  const url = URL.createObjectURL(file);

                  return (
                    <Attachment key={file.name} size="default" orientation="vertical">
                      <AttachmentMedia variant="icon">
                        <VideoIcon />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{file.name}</AttachmentTitle>
                        <AttachmentDescription>{file.size} bytes</AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          variant="secondary"
                          size="icon-sm"
                          onClick={() => removeVideo(index)}
                        >
                          <X />
                          <span className="sr-only">{t("common.remove", "Remove")}</span>
                        </AttachmentAction>
                      </AttachmentActions>
                      <AttachmentTrigger
                        render={
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${file.name}`}
                          />
                        }
                      />
                    </Attachment>
                  )
                })}
              </AttachmentGroup>
            </>) : (
              <div className="rounded-lg bg-muted p-4 text-sm">
                {t(
                  "businessCreate.media.videoLocked",
                  "Upgrade to upload videos.",
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


export function ImageAttachmentMedia({
  src,
  alt,
}: any) {
  const status = useImageStatus(src);

  if (status === "loading") {
    return (
      <Skeleton className="flex items-center justify-center" />
    );
  }

  if (status === "error") {
    return (
      <div
        role="img"
        aria-label={`Unable to display ${alt}`}
        className="flex items-center justify-center"
      >
        <ImageOff />
      </div>
    );
  }

  return <img src={src} alt={alt} />;
}