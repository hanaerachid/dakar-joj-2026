// ProfileMenu.tsx
import { useEffect, useState } from "react";
import { AuthModal } from "./auth/AuthModal";
import { auth } from "../auth/firebase";
import { getIdToken } from "../auth/authService";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { useModalContext } from "@/components/modal-provider";
import { useTranslation } from "react-i18next";
import { useAuthUser } from "../auth/hooks/useAuthUser";

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

  useEffect(() => {
    setView(user ? "profile" : initialView);
  }, [user, initialView]);
  const headerTitle = t(TITLE_BY_VIEW[view]);

  {/* AUTH MODAL */ }
  const handleProfileClick = async (e: any) => {
    // 1. Check Authentication
    e.preventDefault();
    e.stopPropagation();
    // console.log(view)
    setModalContent({
      title: headerTitle,
      panelClassName: "sm:max-w-md",
      contentClassName: "relative h-[80vh] sm:h-[680px] px-0 py-0",
      size: "lg",
      children: (
        <AuthModal
          // view={view}
          // setView={setView}
          initialView={view}
        />
      ),
    });
    // if user already signed in, get tokens
    const user = auth.currentUser;
    if (user) {
      try {
        const idToken = await getIdToken(); // short-lived token
        const refreshToken = user.refreshToken; // long-lived token
        console.log("ID Token:", idToken);
        console.log("Refresh Token:", refreshToken);
      } catch (e) {
        console.error("Failed to fetch tokens:", e);
      }
    }
    setIsOpen(true);
    return;
  };

  return (
    <div className="relative flex gap-2">
      {/* Profile Button -> opens AUTH modal */}
      <Avatar
        onClick={handleProfileClick}
        className="h-8 w-8 bg-foreground-100 hover:bg-foreground-200 transition p-1 sm:h-10 sm:w-10"
        title="Profile"
      >
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  );
}
