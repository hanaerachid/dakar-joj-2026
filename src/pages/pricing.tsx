import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { HeaderBar } from "../components/header/HeaderBar";
import { PRICING_PLANS } from "../components/pricing/pricingplans.config";
import { cn } from "cn";
import { Button } from "@/components/common/Button";

export function PricingPage() {
  const { t } = useTranslation();

  const formatPrice = (price: number) =>
    price === 0
      ? t("businessCreate.plan.free", "Free")
      : `${price.toLocaleString()} FCFA`;

  return (
    <>
      <HeaderBar
        title={t("title")}
        description={t("description")}
      />
      <div className="pt-24 pb-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {/* Header */}
          <div className="mb-12 flex-col items-center items-start justify-between gap-3">
            <h2 className="text-xl text-center font-bold tracking-tight">Un pass unique pour toute la campagne</h2>
            <p className="mt-1 text-sm text-center text-foreground/70">
              Payez une fois : votre visibilité court jusqu'à la clôture des Jeux, le 13 novembre 2026. Plus vous vous engagez tôt, moins vous payez.
            </p>
          </div>
          <ItemGroup className="grid gap-3 grid-cols-1 sm:grid-cols-4">
            {Object.entries(PRICING_PLANS).map(
              ([key, item]) => {
                return (
                  <Item
                    key={key}
                    variant="outline"
                    className={cn(
                      "flex-col items-start",
                      "overflow-hidden relative before:absolute before:top-0 before:left-0 before:right-0 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']",
                      item.recommended ? "before:text-xs before:text-center before:font-bold before:uppercase before:h-6 before:content-['Recommended']" : "before:h-1 before:content-['']",
                      item.recommended && "bg-primary/5 border-primary ring-1 ring-primary",
                      item.recommended && "scale-105",
                    )}
                  >
                    <ItemMedia variant="icon"
                      className={cn(
                        "rounded-lg w-8 h-8",
                        "bg-primary/10"
                      )}
                    >
                      <item.icon
                        className={cn("w-6 h-6")}
                      />
                    </ItemMedia>
                    <ItemContent className="space-y-2">
                      <ItemTitle className="text-sm font-semibold">
                        {t(
                          `businessCreate.plans.${key}`,
                          item.label,
                        )}
                      </ItemTitle>
                      <ItemDescription className="text-sm text-muted-foreground">
                        {t(
                          `businessCreate.plans.${key}`,
                          item.desc,
                        )}
                      </ItemDescription>
                      <ItemDescription className="text-2xl font-bold text-foreground">
                        {formatPrice(item.price)}
                        <div>

                          {item.price > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">
                              pour toute la saison
                            </span>
                          )}
                        </div>
                      </ItemDescription>
                    </ItemContent>
                    <ItemContent>
                      {item.features.map((feature, index) => (
                        <ItemDescription
                          key={index}
                          className="flex justfiy-start gap-2 text-sm text-foreground"
                        >
                          <Check className="w-4 h-4 text-primary" />
                          <span>
                            {feature}
                          </span>
                        </ItemDescription>
                      ))}
                    </ItemContent>
                    <ItemActions className="w-full">
                      <Button
                        type="button"
                        disabled
                        variant="outline"
                        className="w-full"
                      >
                        Select
                      </Button>
                    </ItemActions>

                  </Item>
                );
              },
            )}
          </ItemGroup>
        </div>
      </div>
    </>
  );
}