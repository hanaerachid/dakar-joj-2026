import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
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
      title="Use my location"
      aria-label="Use my location"
      className="shrink-0 rounded-full"
    >
      <Map />
      <span className="hidden sm:inline-block">{t("common.use_my_location", "Use my location")}</span>
    </Button>
  );
}
