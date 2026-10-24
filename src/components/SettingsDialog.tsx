import { useTranslation } from "react-i18next"
import { ExternalLink, Settings } from "lucide-react"

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

interface SettingsDialogProps {
  basemapSwitcher: boolean;
}

export function SettingsDialog({
  basemapSwitcher = false,
}: SettingsDialogProps) {
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
          {basemapSwitcher &&
          <>
          <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground font-medium uppercase">
              {t("common.basemaps", "Basemap")}
            </h3>

            <BasemapSwitcher />
          </div>
          </>
          }
          <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground font-medium uppercase">
              {t("common.useful_links", "Useful Links")}
            </h3>

            <a href='https://terangamap.com/terms' target='_blank' rel='noopener noreferrer'>
              <span className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:underline">
                <span>
                  {t("common.tos", "Terms of Use")}
                </span>
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}