// ProfileMenu.tsx
import { useEffect, useState } from "react";
import { AuthModal } from "./auth/AuthModal";
import { getIdToken } from "../auth/authService";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useModalContext } from "@/components/modal-provider";
import { useTranslation } from "react-i18next";
import { useAuthUser } from "../auth/hooks/useAuthUser";
import { UserIcon } from "lucide-react";

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

  const photoURL = user?.photoURL ?? "";

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
          onClose={() => setIsOpen(false)}
          initialView={view}
        />
      ),
    });
    if (user) {
      try {
        const idToken = await getIdToken(); // short-lived token
        console.log("ID Token:", idToken);
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
