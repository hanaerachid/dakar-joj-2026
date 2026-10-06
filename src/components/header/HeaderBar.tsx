import { cn } from "cn";
import { LogoBrand } from "./LogoBrand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ProfileMenu } from "../ProfileMenu";
import { ModeToggle } from "@/components/mode-toggle";
import { InstallPWAButton } from "@/components/InstallButton";

type Props = {
  title?: string;
  description?: string;
  onReset?: () => void;
  children?: React.ReactNode;
  showLogo?: boolean;
  backButton?: React.ReactNode;
  showLogin?: boolean;
};

export function HeaderBar({
  showLogo = true,
  showLogin = true,
  backButton,
  title,
  description,
  onReset,
  children
}: Props) {

  return (
    <header className="absolute top-0 start-0 end-0 z-20 w-full max-w-full overflow-hidden">
      <div
        className={cn(
          "flex items-center w-full min-w-0 mx-auto gap-2 sm:gap-4 bg-background/80 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2 shadow-md",
          "relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']"
        )}
      >
        {/* Back button */}
        {backButton && (
          <div className="min-w-0 shrink-0">
            {backButton}
          </div>
        )}

        <div className="flex-1 min-w-0 flex items-center justify-start gap-1">
        {/* logo */}
        {showLogo && (
          <div className="min-w-0 shrink-0">
            <button
              onClick={onReset}
              className="flex items-center justify-center w-16 sm:w-auto"
              aria-label="Logo action"
            >
              <LogoBrand logoSrc="/logo.jpeg" />
            </button>
          </div>
        )}

          {/* title */}
        <div className="flex-1 min-w-0 hidden md:block">
          <h1 className="font-heading text-xs font-bold text-foreground uppercase leading-tight sm:px-2 sm:text-base line-clamp-1">
            {title}
          </h1>

          <p className="font-sans text-xs font-normal text-muted-foreground uppercase leading-tight sm:px-2 sm:text-base line-clamp-1">
            {description}
          </p>
        </div>
        </div>

        {children}

        <InstallPWAButton />

        {/* right: flags + profile */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-3">
          <LanguageSwitcher />
          <ModeToggle />
          {showLogin && (
          <ProfileMenu />
          )}
        </div>
      </div>
    </header>
  );
}
