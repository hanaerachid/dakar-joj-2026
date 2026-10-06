import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function InstallPWAButton() {
  const { t } = useTranslation();
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={install}
    >
      <Download />
      {t("install_app", "Install app")}
    </Button>
  );
}
