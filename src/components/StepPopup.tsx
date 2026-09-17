import { Icon } from "@iconify/react/dist/iconify.js";
import { ManeuverIcon } from "./maneuverIcons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "cn";
import { Road } from "lucide-react";

export type StepPopupProps = {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  name?: string; // road name
  congestion?: "unknown" | "low" | "moderate" | "heavy" | "severe";
  maneuver?: { type?: string; modifier?: string; exit?: number };
};

const badgeColor: Record<NonNullable<StepPopupProps["congestion"]>, string> = {
  unknown: "bg-white",
  low: "bg-green-200 text-green-800",
  moderate: "bg-yellow-200 text-yellow-800",
  heavy: "bg-orange-200 text-orange-800",
  severe: "bg-red-200 text-red-800",
};

const fmtKm = (m: number) => (m / 1000).toFixed(2) + " km";
const fmtMin = (s: number) => Math.round(s / 60) + " min";
const congestionLabel: Record<
  NonNullable<StepPopupProps["congestion"]>,
  string
> = {
  unknown: "-",
  low: "Low",
  moderate: "Moderate",
  heavy: "Heavy",
  severe: "Severe",
};
export function StepPopup({
  instruction,
  distance,
  duration,
  name,
  congestion = "unknown",
  maneuver,
}: StepPopupProps) {
  return (
    <Card className="w-[190px] sm:w-[240px] backdrop-blur">
      <CardHeader>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/25 grid place-items-center">
          {/* <span className="text-xs font-bold text-emerald-600">→</span> */}
          <ManeuverIcon
            type={maneuver?.type}
            modifier={maneuver?.modifier}
            exit={maneuver?.exit}
            className="w-3 h-3 sm:w-4 sm:h-4 text-primary"
          />
        </div>
        <CardTitle className="text-[12px] sm:text-sm font-semibold leading-snug">
          {instruction}
        </CardTitle>
      </CardHeader>
      {name && (
        <CardContent>
          <CardDescription>
            <div className="flex items-center gap-1">
              <Road className="w-3 h-3" />
              <span className="font-medium">{name}</span>
            </div>
          </CardDescription>
        </CardContent>
      )}
      <CardFooter className="sm:text-xs">
        <div className="flex items-center justify-between gap-1">
          <Badge
            variant="outline"
            className="font-medium"
          >
            {fmtKm(distance)}
          </Badge>
          <Badge
            variant="outline"
            className="font-medium"
          >
            {fmtMin(duration)}
          </Badge>
          <Badge
            variant="default"
            className={cn(
              "flex items-center gap-1 capitalize",
              badgeColor[congestion]
            )}
            title="Traffic"
          >
            <Icon
              icon="emojione-v1:vertical-traffic-light"
              className="w-3.5 h-3.5"
            />
            {congestionLabel[congestion]}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
