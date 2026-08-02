import { useState } from "react";
import { Modal } from "../common/Modal";
import { TabBar } from "../common/TabBar";
import { GlobalPlacesTab } from "./GlobalPlacesTab";
import { LocalPlacesTab } from "./LocalPlacesTab";
import { useTranslation } from "react-i18next";

export interface SiteConfig {
  name: string;
  file: string; // firestore://<zoneId>
  color: string;
}
export interface CategoryConfig {
  id: string;
  label: string;
  sources: SiteConfig[];
  hint?: string;
}

export function SearchPlacesModal({
  isOpen,
  onClose,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryConfig[];
}) {
  // default = "Search Anywhere"
  const [active, setActive] = useState<"global" | "local">("global");
  const { t } = useTranslation();

  // keep per-tab state here so it survives open/close
  const [globalQuery, setGlobalQuery] = useState("");
  const [localQuery, setLocalQuery] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("search.title")}
      size="lg"
      panelClassName="sm:max-w-2xl md:max-w-3xl"
    >
      {/* Tabs */}
      <TabBar
        tabs={[
          { id: "global", label: t("search.tab.global") },
          { id: "local", label: t("search.tab.local") },
        ]}
        activeId={active}
        onChange={(id) => setActive(id as "global" | "local")}
      />

      {/* Body */}
      {active === "global" ? (
        <GlobalPlacesTab
          query={globalQuery}
          onQueryChange={setGlobalQuery}
          onPicked={() => onClose()}
        />
      ) : (
        <LocalPlacesTab
          categories={categories}
          query={localQuery}
          onQueryChange={setLocalQuery}
          onPicked={() => onClose()}
        />
      )}
    </Modal>
  );
}
