import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type RouteStep = {
  instruction: string;
  location: [number, number];
  distance: number;
  duration: number;
  name?: string;
  maneuver?: { type?: string; modifier?: string; exit?: number };
};

export type RouteSummary = {
  distance: number;
  duration: number;
  steps: RouteStep[];
} | null;

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "error";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationResult =
  | {
    status: "granted";
    coords: Coordinates;
  }
  | {
    status: "denied" | "error";
  };

type LocationConsentProps = {
  requestLocation: () => Promise<LocationResult>;
  initialStatus: LocationStatus;
  onClose: () => void;
  onContinue: (coords: Coordinates) => void;
};

export const LocationConsent = ({
  requestLocation,
  initialStatus,
  onClose,
  onContinue,
}: LocationConsentProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<LocationStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleRequest = async () => {
    setStatus("requesting");

    const result = await requestLocation();

    setStatus(result.status);

    if (result.status === "granted") {
      onContinue(result.coords);
    }
  };

  if (status === "requesting") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <Spinner className="size-8 text-primary" />

        <div className="space-y-1">
          <p className="font-medium">
            {t(
              "location.requesting",
              "Requesting your location"
            )}
          </p>

          <p className="text-sm text-muted-foreground">
            {t(
              "location.requestingDescription",
              "Please allow location access in your browser."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (status === "granted") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CheckCircle2
          className="size-10 text-green-600"
          aria-hidden="true"
        />

        <div className="space-y-1">
          <p className="font-medium">
            {t(
              "location.granted",
              "Location access granted"
            )}
          </p>

          <p className="text-sm text-muted-foreground">
            {t(
              "location.grantedDescription",
              "Your location will be used to calculate the route."
            )}
          </p>
        </div>
      </div>
    );
  }

  const isDenied = status === "denied";
  const isError = status === "error";

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {isDenied || isError ? (
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
        ) : (
          <MapPin
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
        )}

        <div className="space-y-1">
          <p className="font-medium">
            {isDenied ?
              t("location.denied", "Location access was denied")
              : isError ?
                t("location.error", "We couldn't determine your location")
                : t("location.title", "Use your location?")
            }
          </p>

          <p className="text-sm text-muted-foreground">
            {isDenied ?
              t("location.deniedDescription", "Enable location access in your browser settings, then try again.")
              : isError ?
                t("location.errorDescription", "Please check your location settings and try again.")
                : t("location.description", "We use your location to provide accurate routes and show relevant businesses and listings around you.")
            }
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          {t("close", "Close")}
        </Button>

        <Button
          type="button"
          onClick={() => void handleRequest()}
        >
          {isDenied || isError
            ? t("location.tryAgain", "Try again")
            : t("use_my_location", "Use this location")}
        </Button>
      </div>
    </div>
  );
}

