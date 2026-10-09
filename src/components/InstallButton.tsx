import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useIsMobile } from "@/hooks/use-mobile";

export function InstallButton() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={isMobile ? "icon" : "default"}
      onClick={install}
    >
      <Download />
      <span className={isMobile ? "sr-only" : ""}>
        {t("install_app", "Install app")}
      </span>
    </Button>
  );
}
