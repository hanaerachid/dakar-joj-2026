// src/auth/AuthModal.tsx
// no React hooks needed here
import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { ProfileView } from "./ProfileView";
import { useAuthUser } from "../../auth/hooks/useAuthUser";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

type AuthView = "login" | "register" | "reset" | "profile";

interface Props {
  // view: AuthView;
  // setView: (view: AuthView) => void;
  onClose: () => void;
  initialView?: AuthView;
}

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.98,
  }),
};

export function AuthModal({
  // view = "login",
  // setView,
  onClose,
  initialView = "login",
}: Props) {
  const { user, loading } = useAuthUser();
  const { t } = useTranslation();
  const [view, setView] = useState<AuthView>(initialView);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (user) {
      setDirection(1);
      setView("profile");
    } else {
      setDirection(-1);
      setView(initialView);
    }
  }, [user, initialView]);

  const go = (next: AuthView, dir: 1 | -1) => {
    setDirection(dir);
    setView(next);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {loading ? (
        <div className="grid place-items-center h-full">
          <div className="flex items-center gap-3 text-foreground/90">
            <Spinner /><span>{t("auth.modal.loading")}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Top logo (in flow, not absolute) */}
          {/*
          <div className="flex justify-center shrink-0 py-4 sm:py-5">
            <img
              src="/logo.jpeg"
              alt="Brand"
              className="h-12 sm:h-20 object-contain"
            />
          </div>
          */}
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={view}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full"
            >
              {view === "login" && (
                <LoginForm
                  onRegister={() => go("register", 1)}
                  onForgot={() => go("reset", 1)}
                  onDone={() => go("profile", 1)}
                />
              )}

              {view === "register" && (
                <RegisterForm
                  onLogin={() => go("login", -1)}
                  onDone={() => go("profile", 1)}
                />
              )}

              {view === "reset" && (
                <ResetPasswordForm
                  onLogin={() => go("login", -1)}
                />
              )}

              {view === "profile" && (
                <ProfileView
                  user={user}
                  onClose={onClose}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
