import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SignIn } from "@clerk/clerk-react";

import { HeaderBar } from "../components/header/HeaderBar";

export function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/admin";

  return (
    <>
      <HeaderBar
        title={t("title")}
        description={t("description")}
        showLogin={false}
      />

      <div className="pt-24 pb-8">
        <div className="flex items-center justify-center mx-auto w-full max-w-7xl">
          <SignIn forceRedirectUrl={redirectUrl} />
        </div>
      </div>
    </>
  );
}