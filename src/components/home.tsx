import { Promo } from "./Promo";
import { Highlights } from "./Highlights";
import { QuickAccess } from "./QuickAccess";
import { StatsSection } from "./StatsSection";
import { useIsMobile } from "@/hooks/use-mobile";

export const HomeContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 pt-2">
      {isMobile && (
        <Promo />
      )}

      <Highlights />

      <QuickAccess />

      <StatsSection />
    </div>
  );
}
