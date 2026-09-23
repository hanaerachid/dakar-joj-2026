import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { HeaderBar } from "@/components/header/HeaderBar";

export function BusinessShell() {
  const { t } = useTranslation();
  return (
    <>
      <HeaderBar
        title={t("title")}
        description={t("description")}
      // onReset={handleReset}
      />

      <div className="pt-12">
        <Outlet />
      </div>
    </>
  );
}
