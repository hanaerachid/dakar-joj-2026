import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessCreateValues } from "../business-create.schema";

export function ReviewStep({ title }: { title?: string }) {
  const { watch } = useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();
  const values = watch();

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
        <ReviewGroup title={t("businessCreate.review.business", "Business")}>
          <ReviewRow label="Name" value={values.name} />
          <ReviewRow label="Category" value={values.cat} />
          <ReviewRow label="Longitude" value={values.longitude?.toString() || "-"} />
          <ReviewRow label="Latitude" value={values.latitude?.toString() || "-"} />
          <ReviewRow label="Address" value={values.address || "-"} />
          <ReviewRow label="Description" value={values.desc || "-"} />
        </ReviewGroup>
        <ReviewGroup title={t("businessCreate.review.contact", "Contact")}>
          <ReviewRow label="Phone" value={values.tel || "-"} />
          <ReviewRow label="Email" value={values.email || "-"} />
          {values.website && <ReviewRow label="Website" value={values.website} />}
          {values.social && <ReviewRow label="Social" value={values.social} />}
          {values.wa && <ReviewRow label="WhatsApp" value={values.wa} />}
        </ReviewGroup>
        <ReviewGroup title={t("businessCreate.review.media", "Media")}>
          <ReviewRow label="Photos" value={`${values.photos.length}`} />
          <ReviewRow label="Video" value={values.videoFile?.name || "-"} />
        </ReviewGroup>
      </CardContent>
    </>
  );
}

function ReviewGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3"><h3 className="font-semibold">{title}</h3><div className="space-y-2">{children}</div></section>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;
}