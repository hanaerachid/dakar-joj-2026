import { Outlet } from "react-router-dom";

import { HeaderBar } from "@/components/header/HeaderBar";

export function BusinessShell() {

  return (
    <>
      <HeaderBar
      // title={t("title")}
      // description={t("description")}
      // onReset={handleReset}
      />

      <div className="pt-12">
        <Outlet />
      </div>
    </>
  );
}
