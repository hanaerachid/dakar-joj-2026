import { Button } from "@/components/ui/button";
import { Map, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  onClick: () => void;
};

export default function LocationPickerButton({ onClick }: Props) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      onClick={onClick}
      title="Pick on map"
      aria-label="Pick on map"
      className="shrink-0 rounded-full"
    >
      <Map />
      <span className="hidden sm:inline-block">{t("common.select_from_map", "Use Map")}</span>
    </Button>
  );
}

export function MeLocaliserButton({ onClick }: Props) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      onClick={onClick}
      title="Use current location"
      aria-label="Use current location"
      className="shrink-0 rounded-full"
    >
      <MapPin />
      <span className="hidden sm:inline-block">{t("common.use_current_location", "Use current location")}</span>
    </Button>
  );
}
