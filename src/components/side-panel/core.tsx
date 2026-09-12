import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useTranslation } from "react-i18next";
// import { SearchPlacesModal as SearchContent } from "../search/SearchPlacesModal";
import { HomeContent } from "../home";
import { ExplorerContent } from "../explorer";
import { NewsContent } from "../news";
import { StatsContent } from "../stats";
import { EventsContent } from "../events";
import { BusinessContent } from "../business";
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
          className="sticky top-0 z-10 w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <TabsTrigger className="shrink-0 whitespace-nowrap" value="home">{t("tabs.home", "Home")}</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap" value="explorer">{t("tabs.explorer", "Explorer")}</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap" value="events">{t("tabs.events", "Schedule")}</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap" value="stats">{t("tabs.stats", "Stats")}</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap" value="news">{t("tabs.news", "News")}</TabsTrigger>
          <TabsTrigger className="shrink-0 whitespace-nowrap" value="business">{t("tabs.business", "Business")}</TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TabsContent value="home">
            <HomeContent />
          </TabsContent>
          <TabsContent value="explorer">
            <ExplorerContent setPanelOpen={closePanel} />
          </TabsContent>
          <TabsContent value="events">
            <EventsContent />
          </TabsContent>
          <TabsContent value="news">
            <NewsContent />
          </TabsContent>
          <TabsContent value="stats">
            <StatsContent />
          </TabsContent>
          <TabsContent value="business">
            <BusinessContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
