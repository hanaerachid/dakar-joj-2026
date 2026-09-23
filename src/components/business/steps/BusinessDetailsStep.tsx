import { useRef } from "react";

import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_CATEGORIES } from "../business-create.config";
import LocationPickerModal from "../../../core/map/LocationPickerModal";
import LocationPickerButton from "../../../core/map/LocationPickerButton";
import { useModalContext } from "@/components/modal-provider";
import { Button } from "@/components/ui/button";
import type { LocationPickerHandle } from "../../../core/map/LocationPickerModal";

import {
  TextField,
  TextAreaField,
  SelectField,
  MultiSelectField,
} from "@/components/common/Field";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BusinessDetailsStep(
  { title }: { title?: string },
) {
  const {
    watch,
    setValue,
  } = useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();

  const category = watch("cat");
  // const spec = watch("spec") ?? {};
  const location = watch("location");

  const config = BUSINESS_CATEGORIES[category];
  const {
    setIsOpen,
    setModalContent,
  } = useModalContext();
  const pickerRef = useRef<LocationPickerHandle>(null);

  const openModal = () => {
    setModalContent({
      title: "Select location",
      size: "lg",

      children: (
        <LocationPickerModal
          ref={pickerRef}
          isOpen={true}
          initialLng={
            location?.coordinates?.[0]
          }
          initialLat={
            location?.coordinates?.[1]
          }
          onClose={() => setIsOpen(false)}
          onSelect={(selectedLat, selectedLng, selectedAddress) => {
            setValue("location", {
              coordinates: [selectedLng, selectedLat],
            }, {
              shouldDirty: true,
              shouldValidate: true,
            });

            if (selectedAddress) {
              setValue("address", selectedAddress, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }

            setIsOpen(false);
          }}
        />
      ),

      footer: (
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => pickerRef.current?.useLocation()}
          >
            Use this location
          </Button>
        </>
      ),

      onClose: () => setIsOpen(false),
    });

    setIsOpen(true);
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
          <FieldLegend className="font-semibold">
            {t(
              "businessCreate.details.location",
              "Location",
            )}
          </FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-1">
            <LocationPickerButton onClick={openModal} />
            <TextField
              name="address"
              label={t(
                "businessCreate.fields.address",
                "Street address",
              )}
              placeholder="Street, avenue, landmark"
            />
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="location.coordinates.0"
                label={t(
                  "businessCreate.fields.longitude",
                  "Longitude",
                )}
                placeholder="Longitude"
                type="number"
                suffix="°"
              />
              <TextField
                name="location.coordinates.1"
                label={t(
                  "businessCreate.fields.latitude",
                  "Latitude",
                )}
                placeholder="Latitude"
                type="number"
                suffix="°"
              />
            </FieldGroup>
            <Alert>
              <AlertDescription>
              {t(
                "businessCreate.details.mapHint",
                "Your location will be precisely placed on the map during validation.",
              )}
              </AlertDescription>
            </Alert>
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