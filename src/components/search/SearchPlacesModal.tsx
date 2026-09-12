import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedButton } from "../buttons/AnimatedButton";

import { SidePanel } from "../side-panel/core";
import { usePanelContext } from "@/components/panel-provider";
import { useModalContext } from "@/components/modal-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStateContext } from "@/components/state-provider";
import { GlobalPlacesTab } from "../search/GlobalPlacesTab";
import { LocalPlacesTab } from "../search/LocalPlacesTab";

export const SearchPlaces = () => {
  const { t } = useTranslation();

  const {
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
  } = useStateContext();

  const {
    isOpen: panelOpen,
    setIsOpen: setPanelOpen,
    setPanelContent: setPanelContent,
  } = usePanelContext();

  const isMobile = useIsMobile();
  const {
    isOpen: modalOpen,
    setIsOpen: setModalOpen,
    setModalContent,
  } = useModalContext();

  const openPanel = () => {
    if (!isMobile) {
      if (panelOpen && isSearchOpen && activeTab === "explorer") {
        setPanelOpen(false);
        return;
      }
      setActiveTab("explorer");
      setPanelContent({
        title: null,
        onClose: () => {
          setPanelOpen(false);
          setIsSearchOpen(false)
        },
        size: "lg",
        children: <SidePanel />,
      });
      setPanelOpen(true);
      setIsSearchOpen(true);
    }

    if (isMobile) {
      if (modalOpen && isSearchOpen && activeTab === "explorer") {
        setModalOpen(false);
        setIsSearchOpen(false);
        return;
      }
      setActiveTab("explorer");
      setModalContent({
        title: null,
        onClose: () => {
          setModalOpen(false);
          setIsSearchOpen(false)
        },
        size: "lg",
        children: <SidePanel />,
      });
      setModalOpen(true);
      setIsSearchOpen(true);
    }
  }

  return (
    <AnimatedButton
      icon={Search}
      title={t("actions.search", "Search Places")}
      tooltip={t("actions.search", "Search Places")}
      isOpen={panelOpen && activeTab === "explorer" && isSearchOpen}
      onClick={openPanel}
    />
  )
}

export const SearchPlacesModal = ({
  query,
  // setQuery,
}: {
  query: string;
  // setQuery: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <LocalPlacesTab
        title={t("search.tab.local", "Local")}
        query={query}
      // onQueryChange={setLocalQuery}
      />
      <GlobalPlacesTab
        title={t("search.tab.global", "Global")}
        query={query}
      // onQueryChange={setGlobalQuery}
      />
    </div>
  );
};
