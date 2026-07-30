// src/auth/AuthModal.tsx
// no React hooks needed here
import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { ProfileView } from "./ProfileView";
import { useAuthUser } from "../../auth/hooks/useAuthUser";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

type AuthView = "login" | "register" | "reset" | "profile";

export function AuthModal({
  // view = "login",
  // setView,
  initialView = "login",
}: {
  // view: AuthView;
  // setView: (view: AuthView) => void;
  initialView?: AuthView;
}) {
  const { user, loading } = useAuthUser();
  const { t } = useTranslation();
  const [view, setView] = useState<AuthView>(initialView);

  useEffect(() => {
    setView(user ? "profile" : initialView);
  }, [user, initialView]);
  return (
    <div className="relative h-full" >
      {loading ? (
        <div className="grid place-items-center h-full">
          <div className="flex items-center gap-3 text-foreground/90">
            <Spinner /><span>{t("auth.modal.loading")}</span>
          </div>
        </div>
      ) : (
        // NEW: column layout — logo in normal flow, panes fill the rest
        <div className="flex h-full flex-col">
          {/* Top logo (in flow, not absolute) */}
          <div className="flex justify-center shrink-0 py-4 sm:py-5">
            <img
              src="/logo.jpeg"
              alt="Brand"
              className="h-12 sm:h-20 object-contain"
            />
          </div>

          {/* Panes area fills remaining height; slide between absolute panels */}
          <div className="relative flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {/* LOGIN */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                view === "login"
                  ? "translate-x-0 opacity-100"
                  : view === "register"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              } ${view === "profile" ? "translate-x-full opacity-0" : ""}`}
            >
              <LoginForm
                onRegister={() => setView("register")}
                onForgot={() => setView("reset")}
                onDone={() => setView("profile")}
              />
            </div>

            {/* REGISTER */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                view === "register"
                  ? "translate-x-0 opacity-100"
                  : view === "reset"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              } ${view === "profile" ? "translate-x-full opacity-0" : ""}`}
            >
              <RegisterForm
                onLogin={() => setView("login")}
                onDone={() => setView("profile")}
              />
            </div>

            {/* RESET */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                view === "reset"
                  ? "translate-x-0 opacity-100"
                  : view === "login"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              } ${view === "profile" ? "translate-x-full opacity-0" : ""}`}
            >
              <ResetPasswordForm onLogin={() => setView("login")} />
            </div>

            {/* PROFILE */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                view === "profile"
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0"
              }`}
            >
              <ProfileView user={user} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
