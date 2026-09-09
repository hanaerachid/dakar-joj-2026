import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useRole } from "../../auth/hooks/useRole";
import { ChevronDown, UserShield } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { role, loading } = useRole();

  if (!hasClerkConfig) {
    return null;
  }

  return (
    <>
      <SignedOut>
        <ButtonGroup>
          <SignUpButton mode="modal">
            <Button className="rounded-s-full">
              {t("auth.register.submit", "Sign up")}
            </Button>
          </SignUpButton>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                size="icon"
                className="rounded-e-full"
                aria-label={t("auth.accountOptions", "Account options")}
              >
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                label={t("admin", "Admin")}
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
