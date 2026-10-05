import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { HomeContent } from "../home";
import { ExplorerContent } from "../explorer";
import { NewsContent } from "../news";
import { EventsContent } from "../events";
import { BusinessContent } from "../business";
import { usePanelContext } from "@/components/panel-provider";
import { useModalContext } from "@/components/modal-provider";
import { useStateContext } from "@/components/state-provider";
// import { SearchPlacesModal as SearchContent } from "../search/SearchPlacesModal";

export const SidePanel = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useStateContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [scrollProgress, setScrollProgress] = useState({
    left: false,
    right: false,
  });

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
      setScrollProgress({
        left: scrollLeft > 1,
        right: scrollLeft + clientWidth < scrollWidth - 1,
      });
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      checkScrollButtons()
      container.addEventListener("scroll", checkScrollButtons)
      window.addEventListener("resize", checkScrollButtons)

      return () => {
        container.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [])

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
        className="w-full flex min-h-0 flex-1"
      >
        <div className="relative">
          {/* Left scroll button - hidden on mobile */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex",
              !canScrollLeft && "cursor-not-allowed",
            )}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ChevronLeft />
          </Button>

          {/* Right scroll button - hidden on mobile */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex",
              !canScrollRight && "cursor-not-allowed",
            )}
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ChevronRight />
          </Button>

          {/* Scrollable tabs container */}
          <div className="md:px-10">
            <div
              ref={scrollContainerRef}
              className={cn("overflow-x-auto scrollbar-hide",
                "overflow-x-auto scrollbar-none",
                scrollProgress.left && scrollProgress.right &&
                "[mask-image:linear-gradient(to_right,transparent,#000_24px,#000_calc(100%-24px),transparent)]",
                !scrollProgress.left && scrollProgress.right &&
                "[mask-image:linear-gradient(to_right,#000_0,#000_calc(100%-24px),transparent)]",
                scrollProgress.left && !scrollProgress.right &&
                "[mask-image:linear-gradient(to_right,transparent,#000_24px,#000_100%)]",
              )}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <TabsList
                variant="line"
                className={cn(
                  "sticky top-0 z-10 w-max inline-flex items-center justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
              >
                <TabsTrigger
                  className={cn(
                    "shrink-0 whitespace-nowrap",
                  )}
                  value="home"
                >
                  {t("tabs.home", "Home")}
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    "shrink-0 whitespace-nowrap",
                  )}
                  value="explorer"
                >
                  {t("tabs.explorer", "Explorer")}
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    "shrink-0 whitespace-nowrap",
                  )}
                  value="events"
                >
                  {t("tabs.events", "Schedule")}
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    "shrink-0 whitespace-nowrap",
                  )}
                  value="news"
                >
                  {t("tabs.news", "News")}
                </TabsTrigger>
                <TabsTrigger
                  className={cn(
                    "shrink-0 whitespace-nowrap",
                  )}
                  value="business"
                >
                  {t("tabs.business", "Business")}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>
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
          <TabsContent value="business">
            <BusinessContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
