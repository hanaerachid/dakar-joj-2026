import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useRole } from "../../auth/hooks/useRole";
import { ChevronDown, UserRoundPlus, UserShield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ClerkAuthControls() {
  const hasClerkConfig = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { role, loading } = useRole();

  if (!hasClerkConfig) {
    return null;
  }

  return (
    <>
      <SignedOut>
        <ButtonGroup>
          {!isMobile && (
          <SignUpButton mode="modal">
            <Button
              size="default"
              variant="default"
              aria-label={t("auth.register.submit", "Sign up")}
            >
              {t("auth.register.submit", "Sign up")}
            </Button>
          </SignUpButton>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size={isMobile ? "default" : "icon"}
                  variant="default"
                  aria-label={t("auth.accountOptions", "Account options")}
                >
                  {isMobile ? (
                    <>
                    <UserRoundPlus />
                    <span className="sr-only">
                      {t("auth.account", "Account")}
                    </span>
                    </>
                  ) : (
                    <span className="sr-only">
                      {t("auth.accountOptions", "Account options")}
                    </span>
                  )}
                  <ChevronDown />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {isMobile && (
              <SignUpButton mode="modal">
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                >
                  {t("auth.register.submit", "Sign up")}
                </DropdownMenuItem>
              </SignUpButton>
              )}
              <SignInButton mode="modal">
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                >
                  {t("auth.login.submit", "Log in")}
                </DropdownMenuItem>
              </SignInButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </SignedOut>

      <SignedIn>
        <UserButton afterSignOutUrl="/" >
          <UserButton.MenuItems>
            {!loading && role === "admin" && (
              <UserButton.Link
                label={t("admin_panel", "Admin Panel")}
                labelIcon={<UserShield className="w-4 h-4" />}
                href="/admin"
              />
            )}
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </>
  );
}
