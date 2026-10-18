import { useRef, useState } from "react";

import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_CATEGORIES } from "../business-create.config";
import LocationPickerModal, { type LocationPickerHandle } from "../../../core/map/LocationPickerModal";
import LocationPickerButton, { MeLocaliserButton } from "../../../core/map/LocationPickerButton";
import { useModalContext } from "@/components/modal-provider";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  TextField,
  SelectField,
  MultiSelectField,
} from "@/components/common/Field";
import { LocationConsent } from "@/components/LocationConsent";

type ReverseGeocodeResponse = {
  features?: Array<{
    properties?: {
      full_address?: string;
      place_formatted?: string;
      name?: string;
    };
  }>;
};

type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

type LocationResult =
  | {
    status: "granted";
    coords: Coordinates;
  }
  | {
    status: "denied" | "error";
  };

type Coordinates = {
  latitude: number;
  longitude: number;
};

export function BusinessDetailsStep(
  { title }: { title?: string },
) {
  const {
    watch,
    setValue,
  } = useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const category = watch("cat");
  // const spec = watch("spec") ?? {};
  const location = watch("location");

  const config = BUSINESS_CATEGORIES[category];
  const {
    setIsOpen,
    setModalContent,
  } = useModalContext();
  const pickerRef = useRef<LocationPickerHandle>(null);

  const getLocation = (): Promise<LocationResult> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationStatus("error");
        resolve({ status: "error" });
        return;
      }

      setLocationStatus("requesting");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          setLocationStatus("granted");

          resolve({ status: "granted", coords });
        },
        (err) => {
          console.warn("Geolocation error:", err);

          const denied =
            err.code === GeolocationPositionError.PERMISSION_DENIED;

          setLocationStatus(denied ? "denied" : "error");

          resolve({
            status: denied ? "denied" : "error",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        },
      );
    });

  async function reverseGeocode(
    coords: Coordinates,
  ): Promise<string | null> {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      throw new Error("Mapbox access token is missing.");
    }

    const params = new URLSearchParams({
      latitude: String(coords.latitude),
      longitude: String(coords.longitude),
      access_token: token,
    });

    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/reverse?${params}`,
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed.");
    }

    const data =
      (await response.json()) as ReverseGeocodeResponse;

    const feature = data.features?.[0];

    return (
      feature?.properties?.full_address ??
      feature?.properties?.place_formatted ??
      feature?.properties?.name ??
      null
    );
  }

  const handleUseMyLocation = () => {
    setModalContent({
      title: t("location.consent.title", "Use your location"),
      size: "md",
      children: (
        <LocationConsent
          requestLocation={getLocation}
          initialStatus={locationStatus}
          onContinue={async () => {
            const result = await getLocation();

            if (result.status !== "granted") {
              return;
            }

            try {
              const address = await reverseGeocode(result.coords);

              setValue(
                "location",
                {
                  coordinates: [
                    result.coords.longitude,
                    result.coords.latitude,
                  ],
                },
                {
                  shouldDirty: true,
                  shouldValidate: true,
                },
              );

              if (address) {
                setValue("address", address, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }

              setIsOpen(false);
            } catch (error) {
              console.error("Could not resolve the address:", error);
              // Keep the modal open and display an error if possible.
            }
          }}
          onClose={() => setIsOpen(false)}
        />
      ),
      onConfirm: () => void getLocation(),
      onClose: () => {
        setIsOpen(false);
      },
      footer: null,
    });

    setIsOpen(true);
  };
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
            <div className="flex items-end justify-between gap-2">
              <TextField
                name="address"
                label={t(
                  "businessCreate.fields.address",
                  "Street address",
                )}
                placeholder="Street, avenue, landmark"
              />
              <MeLocaliserButton onClick={handleUseMyLocation} />
              <LocationPickerButton onClick={openModal} />
            </div>
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