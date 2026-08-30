// ProfileMenu.tsx
import { useEffect, useState } from "react";
import { AuthModal } from "./auth/AuthModal";
import { getIdToken } from "../auth/authService";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useModalContext } from "@/components/modal-provider";
import { useTranslation } from "react-i18next";
import { useAuthUser } from "../auth/hooks/useAuthUser";
import { UserIcon } from "lucide-react";
import { ClerkAuthControls } from "./auth/ClerkAuthControls";

type AuthView = "login" | "register" | "reset" | "profile";

const TITLE_BY_VIEW: Record<AuthView, string> = {
  login: "auth.modal.title.login",
  register: "auth.modal.title.register",
  reset: "auth.modal.title.reset",
  profile: "auth.modal.title.profile",
};

const initialView: AuthView = "login";

export function ProfileMenu() {
  const { setIsOpen, setModalContent } = useModalContext();
  const { t } = useTranslation();

  const { user } = useAuthUser();
  const [view, setView] = useState<AuthView>(initialView);
  const hasClerkConfig = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  const photoURL = user?.photoURL ?? "";

  useEffect(() => {
    setView(user ? "profile" : initialView);
  }, [user]);

  const headerTitle = t(TITLE_BY_VIEW[view]);

  const handleProfileClick = async (e: any) => {
    if (hasClerkConfig) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setModalContent({
      title: headerTitle,
      panelClassName: "sm:max-w-md",
      contentClassName: "relative h-[80vh] sm:h-[680px] px-0 py-0",
      size: "lg",
      children: (
        <AuthModal
          onClose={() => setIsOpen(false)}
          initialView={view}
        />
      ),
    });
    if (user) {
      try {
        const idToken = await getIdToken();
        console.log("ID Token:", idToken);
      } catch (e) {
        console.error("Failed to fetch tokens:", e);
      }
    }
    setIsOpen(true);
  };

  if (hasClerkConfig) {
    return (
      <div className="relative flex items-center gap-2">
        <ClerkAuthControls />
      </div>
    );
  }

  return (
    <div className="relative flex gap-2">
      <Avatar
        onClick={handleProfileClick}
        className="h-8 w-8 bg-foreground-100 transition sm:h-10 sm:w-10"
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
    </div>
  );
}
