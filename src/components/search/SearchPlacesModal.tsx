import { useState } from "react";
import { GlobalPlacesTab } from "./GlobalPlacesTab";
import { LocalPlacesTab } from "./LocalPlacesTab";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnimatedButton } from "../buttons/AnimatedButton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { useModalContext } from "@/components/modal-provider";

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

export const SearchPlaces = ({
  categories,
}: {
  categories: CategoryConfig[];
}) => {
  const { t } = useTranslation();

  const {
    isOpen: panelOpen,
    setIsOpen: setPanelOpen,
    setModalContent: setModalContent,
  } = useModalContext();

  const openPanel = () => {
    if (panelOpen) {
      setPanelOpen(false);
      return;
    }
    setModalContent({
      title: t("search.title"),
      onClose: () => setPanelOpen(false),
      panelClassName: "sm:max-w-2xl md:max-w-3xl",
      size: "lg",
      children: <SearchPlacesModal setPanelOpen={setPanelOpen} categories={categories} />,
    });
    setPanelOpen(true);
  }
  return (
    <AnimatedButton
      icon={Search}
      title="Search Places"
      tooltip="Search"
      onClick={openPanel}
    />
  )
}

export const SearchPlacesModal = ({
  setPanelOpen,
  categories,
}: {
  setPanelOpen: (open: boolean) => void;
  categories: CategoryConfig[];
}) => {
  // default = "Search Anywhere"
  const { t } = useTranslation();

  // keep per-tab state here so it survives open/close
  const [globalQuery, setGlobalQuery] = useState("");
  const [localQuery, setLocalQuery] = useState("");

  return (
    <Tabs defaultValue="global">
      <TabsList variant="default">
        <TabsTrigger value="global">{t("search.tab.global")}</TabsTrigger>
        <TabsTrigger value="local">{t("search.tab.local")}</TabsTrigger>
      </TabsList>
      {/* Body */}
      <TabsContent value="global">
        <GlobalPlacesTab
          query={globalQuery}
          onQueryChange={setGlobalQuery}
          onPicked={() => setPanelOpen(false)}
        />
      </TabsContent>
      <TabsContent value="local">
        <LocalPlacesTab
          categories={categories}
          query={localQuery}
          onQueryChange={setLocalQuery}
          onPicked={() => setPanelOpen(false)}
        />
      </TabsContent>
    </Tabs>
  );
}
