import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

function AnimatedCounter({ value, duration = 1.5, delay = 0 }: {
  value: number | string;
  duration?: number;
  delay?: number;
}) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const stringValue = String(value);

  // 1. Check if the incoming number has decimals
  const hasDecimals = stringValue.includes(".");
  const decimalMatches = stringValue.match(/\.([0-9]+)/);
  const decimalPlaces = decimalMatches ? decimalMatches[1].length : 0;

  // 2. Extract just the numbers for Framer Motion to animate
  const numericValue = parseFloat(stringValue.replace(/[^0-9.]/g, "")) || 0;

  // 3. Initialize motion value at 0
  const count = useMotionValue(0);

  // 4. Format the number back into a localized string on every frame
  const formatted = useTransform(count, (latest) => {
    const options = {
      minimumFractionDigits: hasDecimals ? decimalPlaces : 0,
      maximumFractionDigits: hasDecimals ? decimalPlaces : 0,
    };

    const formattedNumber = latest.toLocaleString(lang, options);

    // Re-attach prefixes or suffixes safely
    if (stringValue.includes("$")) return `$${formattedNumber}`;
    if (stringValue.includes("%")) return `${formattedNumber}%`;
    if (stringValue.includes("+")) return `+${formattedNumber}`;

    return formattedNumber;
  });

  useEffect(() => {
    // 5. Run the framer-motion animation loop
    const controls = animate(count, numericValue, {
      duration: duration,
      delay: delay,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [numericValue, duration, delay, count]);

  return <motion.span>{formatted}</motion.span>;
}

export const StatsSection = () => {
  const { t } = useTranslation();
  const stats = [
    {
      title: t("stats.competition_sites", "Competition Sites"),
      value: 8,
      subtitle: "",
    },
    {
      title: t("stats.competition_sports", "Competition Sports"),
      value: 25,
      subtitle: t("stats.competition_sports_engagement", ""),
    },
    {
      title: t("stats.delegations", "Delegations (NOCs)"),
      value: 200,
      subtitle: "",
    },
    {
      title: t("stats.athletes", "Athletes"),
      value: 2700,
      subtitle: "",
    },
    {
      title: t("stats.cities", "Competition Cities"),
      value: 3,
      subtitle: t("stats.cities_list", "Dakar · Diamniadio · Saly"),
    },
    {
      title: t("stats.capacity", "Estimated Capacity"),
      value: 20000,
      subtitle: "",
    },
  ]

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[#f2b705] uppercase">
          {t("stats.gamesinnumers", "The Games in numbers")}
        </p>
        {/*
        <h2 className="text-xl text-foreground font-bold uppercase">
          {t("stats.stats", "News")}
        </h2>
        */}
      </div>
      <div className="flex flex-col gap-4">
        <ItemGroup className="grid grid-cols-2 gap-2" >
          {stats.map((item, index) => (
            <Item
              key={index}
              size="xs"
              variant="muted"
              className="overflow-hidden flex-col items-start justify-start"
            >
              <ItemContent>
                <ItemDescription className="flex items-center gap-2">
                  <span className="text-4xl md:text-5xl">
                    <AnimatedCounter value={item.value} />
                  </span>
                </ItemDescription>
                <ItemTitle>
                  {item.title}
                </ItemTitle>
                <ItemDescription>
                  <span className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </span>
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
