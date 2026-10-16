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
      <span className="hidden sm:inline-block ml-2">{t("common.select_from_map", "Use Map")}</span>
    </Button>
  );
}
