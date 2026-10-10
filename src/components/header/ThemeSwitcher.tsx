import { useTranslation } from "react-i18next";
import { Monitor, Moon, Sun } from "lucide-react"

import { ButtonGroup } from "@/components/ui/button-group"
import { useTheme } from "../theme-provider";
import { Button } from "../ui/button";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme()

  return (
    <ButtonGroup>
      <Button
        type="button"
        variant={theme === "light" ? "default" : "outline"}
        size="default"
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
        <span>{t("light", "Light")}</span>
      </Button>

      <Button
        type="button"
        variant={theme === "dark" ? "default" : "outline"}
        size="default"
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
        <span>{t("dark", "Dark")}</span>
      </Button>

      <Button
        type="button"
        variant={theme === "system" ? "default" : "outline"}
        size="default"
        aria-label="System theme"
        aria-pressed={theme === "system"}
        onClick={() => setTheme("system")}
      >
        <Monitor className="h-4 w-4" />
        <span>{t("system", "System")}</span>
      </Button>
    </ButtonGroup>
  );
}
