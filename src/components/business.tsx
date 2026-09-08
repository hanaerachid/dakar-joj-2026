import { useTranslation } from "react-i18next";
import {
  ItemGroup,
} from "@/components/ui/item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export const BusinessContent = () => {
  const { t } = useTranslation();
  const plans = [
    {
      title: t("business.discover", "Discover"),
      value: t("business.free", "Free"),
      subtitle: t("business.your_profile_on_the_map", "Votre fiche sur la carte"),
    },
    {
      title: t("business.show", "Show"),
      value: `25 000 F/${t("business.month", "month")}`,
      subtitle: t("business.photos_and_best_position", "Photos et meilleure position"),
    },
    {
      title: t("business.premium", "Premium"),
      value: `60 000 F/${t("business.month", "month")}`,
      subtitle: t("business.maximum_visibility", "Visibilité maximale"),
    },
  ]


  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-[#f2b705] uppercase">
          {t("business.listbusiness", "List your business")}
        </p>
        <h2 className="text-xl text-foreground font-bold uppercase">
          {t("business.businesses", "Businesses")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("business.business_description", "Hotels, restaurants, shops, car dealerships, museums, galleries — join the official visitor map.")}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xs text-muted-foreground uppercase">
          {t("business.selectplan", "Choose your plan")}
        </h2>
        <ItemGroup className="flex flex-col gap-2" >
          {plans.map((item, index) => (
            <Card key={index} size="sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-1">
                  <span
                    className="text-lg text-muted-foreground font-bold uppercase"
                  >
                    {item.title}
                  </span>
                  <span className="text-xs text-[#f2b705] font-semibold">{item.value}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {item.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                </p>
              </CardContent>
            </Card>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
