import { useTranslation } from "react-i18next";
import { useUser } from "@clerk/clerk-react";
import { cn } from "cn";
import { Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { HeaderBar } from "../components/header/HeaderBar";
import { PRICING_PLANS } from "../components/pricing/pricingplans.config";
import { Badge } from "@/components/ui/badge";

export function PricingPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const currentPlan = user?.publicMetadata?.plan;

  const currentPlanId: keyof typeof PRICING_PLANS =
    typeof currentPlan === "string" && currentPlan in PRICING_PLANS
      ? (currentPlan as keyof typeof PRICING_PLANS)
      : "discover";

  const getPlanAction = (
    planId: keyof typeof PRICING_PLANS,
  ) => {
    if (planId === currentPlanId) {
      return {
        label: t("pricing.current_plan", "Current Plan"),
        disabled: true,
        variant: "ghost" as const,
      };
    }

    if (planId === "discover") {
      return {
        label: t("pricing.downgrade_to_discover", "Downgrade to Discover"),
        disabled: true,
        variant: "default" as const,
      };
    }

    return {
      label: t("pricing.upgrade", "Upgrade"),
      disabled: true,
      variant: "default" as const,
    };
  };

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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-4">
            {Object.entries(PRICING_PLANS).map(
              ([key, item]) => {
                const planId = key as keyof typeof PRICING_PLANS;
                const action = getPlanAction(planId);
                return (
                  <Card
                    key={key}
                    className={cn(
                      "flex-col items-start",
                      item.recommended && "bg-gradient-to-br dark:from-blue-500 dark:to-blue-900 from-blue-100 to-blue-500",
                      "overflow-visible relative before:absolute before:top-0 before:left-0 before:right-0 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']",
                      // item.recommended ? "before:text-xs before:text-center before:font-bold before:uppercase before:h-6 before:content-['Recommended']" : "before:h-1 before:content-['']",
                      // item.recommended && "bg-primary/5 border-primary ring-1 ring-primary",
                    )}
                  >
                    {item.recommended && (
                      <div className="absolute left-0 right-0 flex justify-center -top-4 z-10">
                        <Badge
                          variant="default"
                          render={
                            <span className="px-4 py-4 text-sm tracking-tight font-semibold uppercase shadow-lg">
                              {t("pricing.recommended", "Recommended")}
                            </span>
                          }
                        >
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <item.icon
                        className={cn("w-10 h-10",
                          "rounded-lg p-2 bg-primary/5"
                        )}
                      />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <CardTitle className="text-sm font-semibold">
                        {t(
                          `businessCreate.plans.${key}`,
                          item.label,
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t(
                          `businessCreate.plans.${key}`,
                          item.desc,
                        )}
                      </CardDescription>
                      <CardDescription className="text-2xl font-bold text-foreground">
                        {formatPrice(item.price)}
                        <div>

                          {item.price > 0 && (
                            <span className="text-sm font-normal text-muted-foreground">
                              pour toute la saison
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </CardContent>
                    <CardContent className="flex-1">
                      {item.features.map((feature, index) => (
                        <CardDescription
                          key={index}
                          className="flex justfiy-start gap-2 text-sm text-foreground"
                        >
                          <Check className="w-4 h-4 text-primary" />
                          <span>
                            {feature}
                          </span>
                        </CardDescription>
                      ))}
                    </CardContent>
                    <CardFooter className="flex-col items-end w-full">
                      <Button
                        type="button"
                        disabled={action.disabled}
                        inert={action.disabled}
                        variant={action.variant}
                        className="w-full"
                      // onClick={() => {
                      //   if (planId !== currentPlanId) {
                      //     navigate(`/pricing/${planId}`);
                      //   }
                      // }}
                      >
                        {action.label}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              },
            )}
          </div>
        </div>
      </div>
    </>
  );
}