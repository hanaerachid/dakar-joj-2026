import { LogoBrand } from "./LogoBrand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ProfileMenu } from "../ProfileMenu";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "@/components/mode-toggle";

type Props = {
  title?: string;
  onReset: () => void;
};

export function HeaderBar({ onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="absolute top-0 start-0 end-0 z-30">
      <div
        className="flex items-center w-full mx-auto gap-2 sm:gap-4
                        backdrop-blur-sm bg-background/70 px-2 sm:px-4 py-1.5 sm:py-2 shadow-md"
      >
        {/* left: logo */}
        <div className="min-w-0 shrink-0">
          <button
            onClick={onReset}
            className="flex items-center justify-center w-16 sm:w-auto"
            aria-label="Logo action"
          >
            <LogoBrand logoSrc="/logo.jpeg" />
          </button>
        </div>

        {/* center: title */}
        <h1 className="font-heading flex-1 min-w-0 px-1 text-sm font-semibold text-foreground/90 text-center leading-tight whitespace-normal break-words sm:px-2 sm:text-lg sm:truncate">
          {t("title")}
        </h1>

        {/* right: flags + profile */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-3">
          <LanguageSwitcher />
          <ModeToggle />
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
}
