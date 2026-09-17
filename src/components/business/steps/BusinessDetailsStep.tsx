
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_CATEGORIES } from "../business-create.config";

import {
  TextField,
  TextAreaField,
  SelectField,
  MultiSelectField,
} from "@/components/common/Field";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";

export function BusinessDetailsStep(
  { title }: { title?: string },
) {
  const { watch, /*control*/ } =
    useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();

  const category = watch("cat");
  // const spec = watch("spec") ?? {};

  const config = BUSINESS_CATEGORIES[category];

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
          <FieldLegend className="font-semibold">
            {t(
              "businessCreate.details.location",
              "Location",
            )}
          </FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-1">
            <TextField
              name="address"
              label={t(
                "businessCreate.fields.address",
                "Street address",
              )}
              placeholder="Street, avenue, landmark"
            />
          </FieldGroup>
          <FieldGroup>
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              {t(
                "businessCreate.details.mapHint",
                "Your location will be precisely placed on the map during validation.",
              )}
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend className="font-semibold">
            {t(
              "businessCreate.details.categoryDetails",
              "Business-specific details",
            )}
          </FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => {
              const fieldName = `spec.${field.name}`;

              const label = t(
                `businessCreate.spec.${field.name}`,
                field.label,
              );

              if (field.type === "select") {
                return (
                  <SelectField
                    key={field.name}
                    name={fieldName}
                    label={label}
                    options={
                      "options" in field && field.options
                        ? [...field.options]
                        : []
                    }
                  />
                );
              }

              if (field.type === "multi") {
                return (
                  <MultiSelectField
                    key={field.name}
                    name={fieldName}
                    label={label}
                    options={
                      "options" in field && field.options
                        ? [...field.options]
                        : []
                    }
                  />
                );
              }

              return (
                <TextField
                  key={field.name}
                  type={field.type}
                  name={fieldName}
                  label={label}
                  placeholder={field.label}
                  suffix={field.unit}
                />
              );
            })}
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldGroup>
            <TextAreaField
              name="desc"
              label={t(
                "businessCreate.fields.desc",
                "Description",
              )}
              placeholder={t(
                "businessCreate.fields.descPlaceholder",
                "Describe your business and its main advantages...",
              )}
            />

            <TextField
              name="openHours"
              label={t(
                "businessCreate.fields.open_hours",
                "Opening hours",
              )}
              placeholder="e.g. 8 AM – 10 PM"
            />
          </FieldGroup>
        </FieldSet>
      </CardContent>
    </>
  );
}