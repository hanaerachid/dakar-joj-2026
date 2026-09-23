import { LogoBrand } from "./LogoBrand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ProfileMenu } from "../ProfileMenu";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "cn";

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
    <div className="absolute top-0 start-0 end-0 z-20">
      <div
        className={cn("flex items-center w-full mx-auto gap-2 sm:gap-4 backdrop-blur-sm bg-background/90 px-2 sm:px-4 py-1.5 sm:py-2 shadow-md",
          "relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']")}
      >
        {/* Back button */}
        {backButton && (
          <div className="min-w-0 shrink-0">
            {backButton}
          </div>
        )}

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

        {/* center: title */}
        <div className=" flex-1 min-w-0 px-1 ">
          <h1 className="font-heading text-xs font-bold text-foreground text-center uppercase leading-tight sm:px-2 sm:text-lg line-clamp-2">
            {title}
          </h1>
          <p className="font-sans text-xs font-normal text-muted-foreground text-center uppercase leading-tight sm:px-2 sm:text-lg line-clamp-2">
            {description}
          </p>
        </div>
        {children}

        {/* right: flags + profile */}
        <div className="flex items-center gap-2 shrink-0 sm:gap-3">
          <LanguageSwitcher />
          <ModeToggle />
          {showLogin && (
          <ProfileMenu />
          )}
        </div>
      </div>
    </div>
  );
}
