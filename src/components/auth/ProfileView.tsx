// src/auth/ProfileView.tsx
import type { User } from "firebase/auth";
import { signOut } from "../../auth/authService";
import { Link } from "react-router-dom";
import { useRole } from "../../auth/hooks/useRole";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { UserIcon } from "lucide-react";

export function ProfileView({
  user,
  onClose,
}: {
  user: User | null;
  onClose: () => void;
}) {
  const { role, loading } = useRole();
  const displayName = user?.displayName ?? "";
  const email = user?.email ?? "";
  const photoURL = user?.photoURL ?? "";
  const { t } = useTranslation();

  async function handleLogout() {
    await signOut();
    // onClose();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">

        <Avatar
          className="h-16 w-16 bg-foreground-100 hover:bg-foreground-200 transition"
          title="Profile"
        >
          {photoURL ? (
            <AvatarImage src={photoURL} alt="avatar" />
          ) : (
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Basic info */}
        <div>
          <h6 className="text-lg font-semibold">
            {displayName || email || t("auth.profile.fallbackName")}
          </h6>
          {email && <p className="font-mono text-sm text-foreground/80">{email}</p>}
        </div>
        {!loading && role === "admin" && (
          <div className="w-full flex justify-center items-center">
            <Link
              to="/admin"
            >
              {t("auth.profile.adminCta")}
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4">
        <ButtonGroup orientation="vertical" className="w-full">
          <Button
            variant="default"
            onClick={handleLogout}
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {t("auth.profile.logout")}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {t("auth.profile.close")}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
