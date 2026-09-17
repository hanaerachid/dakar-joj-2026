import { useTranslation } from "react-i18next";
import {
  ItemGroup,
} from "@/components/ui/item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PRICING_PLANS } from "./pricing/pricingplans.config";

export const BusinessContent = () => {
  const { t } = useTranslation();

  const formatPrice = (price: number) =>
    price === 0
      ? t("businessCreate.plan.free", "Free")
      : `${price.toLocaleString()} FCFA`;

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
          {Object.entries(PRICING_PLANS).map(
            ([key, item]) => {
              return (
                <Card key={key} size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-1">
                      <span
                        className="text-lg text-muted-foreground font-bold uppercase"
                      >
                        {item.label}
                      </span>
                      <span className="text-xs text-[#f2b705] font-semibold">
                        {formatPrice(item.price)}
                      </span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                    </p>
                  </CardContent>
                </Card>
              )
            })}
        </ItemGroup>
      </div>
    </div>
  );
}
