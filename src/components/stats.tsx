import { useTranslation } from "react-i18next";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle
} from "@/components/ui/item";

export const StatsContent = () => {
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
        <h2 className="text-xl text-foreground font-bold uppercase">
          {t("stats.stats", "News")}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        <ItemGroup className="grid grid-cols-2 gap-2" >
          {stats.map((item, index) => (
            <Item key={index} size="sm" variant="muted">
              <ItemContent>
                <ItemDescription className="flex items-center gap-2">
                  <span className="text-3xl font-semibold">{item.value}</span>
                </ItemDescription>
                <ItemTitle>
                  {item.title}
                </ItemTitle>
                <ItemDescription>
                  {item.subtitle}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
