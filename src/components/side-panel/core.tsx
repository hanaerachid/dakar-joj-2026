import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useTranslation } from "react-i18next";
import { PlacesListContent as ExplorerContent } from "../place-list/PlacesList";
import { SearchPlacesModal as SearchContent } from "../search/SearchPlacesModal";
import { HomeContent } from "../home";
import { usePanelContext } from "@/components/panel-provider";
import { useModalContext } from "@/components/modal-provider";
import { useStateContext } from "@/components/state-provider";

export const SidePanel = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useStateContext();

  const {
    setIsOpen: setPanelOpen
  } = usePanelContext();
  const {
    isOpen: modalOpen,
    setIsOpen: setModalOpen
  } = useModalContext();

  const closePanel = modalOpen ? setModalOpen : setPanelOpen;

  return (
    <div className="flex h-full flex-col">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList
          variant="line"
          className="sticky top-0 z-10"
        >
          <TabsTrigger value="home">{t("tabs.home", "Home")}</TabsTrigger>
          <TabsTrigger value="explorer">{t("tabs.explorer", "Explorer")}</TabsTrigger>
          <TabsTrigger value="search">{t("tabs.search", "Search")}</TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="home">
            <HomeContent />
          </TabsContent>
          <TabsContent value="explorer">
            <ExplorerContent setPanelOpen={closePanel} />
          </TabsContent>
          <TabsContent value="search">
            <SearchContent setPanelOpen={closePanel} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
