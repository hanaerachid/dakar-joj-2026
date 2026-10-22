import { Promo as PromoSection } from "./Promo";
import { Highlights as HighlightsSection } from "./Highlights";
import { QuickAccess as QuickAccessSection } from "./QuickAccess";
import { Stats as StatsSection } from "./StatsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { scrollReveal } from "@/components/ScrollReveal";

const Promo = scrollReveal(PromoSection);
const Highlights = scrollReveal(HighlightsSection);
const QuickAccess = scrollReveal(QuickAccessSection);
const Stats = scrollReveal(StatsSection);

export const HomeContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-5 pt-2">
      {isMobile && (
        <Promo />
      )}

      <Highlights />

      <QuickAccess />

      <Stats />
    </div>
  );
}
