import { useTranslation } from "react-i18next"
import { Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { BasemapSwitcher } from "@/components/header/BasemapSwitcher"
import { LanguageSwitcher } from "@/components/header/LanguageSwitcher"
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher"

export function SettingsDialog() {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings", "Settings")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground font-medium uppercase">
              {t("theme", "Theme")}
            </h3>

            <ThemeSwitcher />
          </div>

          {/* Language */}
          <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground font-medium uppercase">
              {t("language", "Language")}
            </h3>

            <LanguageSwitcher />
          </div>

          {/* Basemap */}
          <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground font-medium uppercase">
              {t("basemap", "Basemap")}
            </h3>

            <BasemapSwitcher />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}