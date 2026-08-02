import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function LocationPickerButton({ onClick }: Props) {
  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      onClick={onClick}
      title="Pick on map"
      aria-label="Pick on map"
      className="shrink-0 rounded-full"
    >
      <MapPin />
    </Button>
  );
}
