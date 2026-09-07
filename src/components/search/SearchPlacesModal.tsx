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
import type { CategoryConfig } from "@/types/config";

export const SearchPlaces = ({
  categories,
}: {
  categories: CategoryConfig[];
}) => {
  const { t } = useTranslation();

  const {
    isOpen: modalOpen,
    setIsOpen: setModalOpen,
    setModalContent: setModalContent,
  } = useModalContext();

  const openPanel = () => {
    if (modalOpen) {
      setModalOpen(false);
      return;
    }
    setModalContent({
      title: t("search.title"),
      onClose: () => setModalOpen(false),
      size: "lg",
      children: <SearchPlacesModal setModalOpen={setModalOpen} categories={categories} />,
    });
    setModalOpen(true);
  }

  return (
    <AnimatedButton
      icon={Search}
      title={t("actions.search", "Search Places")}
      tooltip={t("actions.search", "Search Places")}
      isOpen={modalOpen}
      onClick={openPanel}
    />
  )
}

export const SearchPlacesModal = ({
  setModalOpen,
  categories,
}: {
  setModalOpen: (open: boolean) => void;
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
          onPicked={() => setModalOpen(false)}
        />
      </TabsContent>
      <TabsContent value="local">
        <LocalPlacesTab
          categories={categories}
          query={localQuery}
          onQueryChange={setLocalQuery}
          onPicked={() => setModalOpen(false)}
        />
      </TabsContent>
    </Tabs>
  );
}
