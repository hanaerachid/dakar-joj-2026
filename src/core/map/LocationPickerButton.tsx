import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
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
      <MapPin />
      <span>{t("select_from_map", "Pick location")}</span>
    </Button>
  );
}
