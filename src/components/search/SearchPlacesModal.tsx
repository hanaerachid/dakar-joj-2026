import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatedButton } from "../buttons/AnimatedButton";

import { SidePanel } from "../side-panel/core";
import { usePanelContext } from "@/components/panel-provider";
import { useStateContext } from "@/components/state-provider";
import { GlobalPlacesTab } from "../search/GlobalPlacesTab";
import { LocalPlacesTab } from "../search/LocalPlacesTab";

export const SearchPlaces = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const {
    activeTab,
    setActiveTab,
    isSearchOpen,
    setIsSearchOpen,
  } = useStateContext();

  const {
    isOpen,
    setIsOpen,
    setPanelContent,
  } = usePanelContext();


  const openPanel = () => {
    if (isOpen && activeTab === "explorer") {
      setIsOpen(false);
      if (!isSearchOpen) {
        setIsSearchOpen(false);
        return;
      }
    }
    setActiveTab("explorer");
    setPanelContent({
      title: null,
      showFooter: isMobile ? true : false,
      onClose: () => {
        setIsOpen(false);
        setIsSearchOpen(false)
      },
      size: "lg",
      children: <SidePanel />,
    });
    setIsOpen(true);
    setIsSearchOpen(true);
  }

  return (
    <AnimatedButton
      icon={Search}
      title={t("actions.search", "Search Places")}
      tooltip={t("actions.search", "Search Places")}
      isOpen={isOpen && activeTab === "explorer" && isSearchOpen}
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
