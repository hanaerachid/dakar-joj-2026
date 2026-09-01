import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useRole } from "../../auth/hooks/useRole";
import { UserShield } from "lucide-react";
import { useTranslation } from "react-i18next";

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
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent">
              {t("auth.login.submit", "Log in")}
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background transition hover:opacity-90">
              {t("auth.register.submit", "Register")}
            </button>
          </SignUpButton>
        </div>
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
