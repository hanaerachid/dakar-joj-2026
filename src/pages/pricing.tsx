import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { cn } from "cn";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function PricingPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const currentPlan = user?.publicMetadata?.plan;

  const currentPlanId: keyof typeof PRICING_PLANS =
    typeof currentPlan === "string" && currentPlan in PRICING_PLANS
      ? (currentPlan as keyof typeof PRICING_PLANS)
      : "discover";

  const getPlanAction = (
    planId: keyof typeof PRICING_PLANS,
  ) => {

    if (isSignedIn) {
      if (planId === currentPlanId && isSignedIn) {
        return {
          label: t("pricing.manage_business", "Open dashboard"),
          action: () => navigate("/business"),
          disabled: false,
          variant: "default" as const,
        };
      }

      if (planId === "discover") {
        return {
          label: t("pricing.downgrade_to_discover", "Downgrade to Discover"),
          action: (e: any) => {
            e.stopPropagation();
            window.open(
              `mailto:francisehemba2021@gmail.com?subject=Downgrade%20to%20${planId}%20Plan&body=Hello,%0D%0A%0D%0AI%20would%20like%20to%20downgrade%20to%20the%20${planId}%20plan.%0D%0A%0D%0AThank%20you!`
            );
          },
          disabled: false,
          variant: "ghost" as const,
        };
      }

    }
    if (!isSignedIn && planId === "discover") {
      return {
        label: t("pricing.start", "Start"),
        action: () => navigate("/business"),
        disabled: false,
        variant: "outline" as const,
      };
    }

    return {
      label: t("pricing.contact_us", "Contact us"),
      action: (e: any) => {
        e.stopPropagation();
        window.open(
          `mailto:francisehemba2021@gmail.com?subject=Upgrade%20to%20${planId}%20Plan&body=Hello,%0D%0A%0D%0AI%20would%20like%20to%20upgrade%20to%20the%20${planId}%20plan.%0D%0A%0D%0AThank%20you!`
        );
      },
      disabled: false,
      variant: "outline" as const,
    };
  };

  const checkIsCurrentPlan = (planId: keyof typeof PRICING_PLANS) => (isSignedIn && planId === currentPlanId);

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
        <div className="mx-auto w-full max-w-7xl space-y-6">
          {/* Header */}
          <div className="mb-12 flex-col items-center items-start justify-between gap-3">
            <h2 className="text-xl text-center font-bold tracking-tight">Un pass unique pour toute la campagne</h2>
            <p className="mt-1 text-sm text-center text-foreground/70">
              Payez une fois : votre visibilité court jusqu'à la clôture des Jeux, le 13 novembre 2026. Plus vous vous engagez tôt, moins vous payez.
            </p>
          </div>
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(PRICING_PLANS).map(
              ([key, item]) => {
                const planId = key as keyof typeof PRICING_PLANS;
                const action = getPlanAction(planId);
                const isCurrentPlan = checkIsCurrentPlan(planId);
                return (
                  <Card
                    key={key}
                    size="sm"
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
                    <CardContent className="w-full">
                      <Button
                        type="button"
                        disabled={action.disabled}
                        inert={action.disabled}
                        variant={action.variant}
                        className={cn(
                          "w-full",
                          action.disabled ? "cursor-not-allowed" : "cursor-pointer"
                        )}
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    </CardContent>
                    <CardContent className="flex-1 divide-y divide-solid">
                      {item.features.map((element, index) => (
                        <CardDescription
                          key={index}
                          className={cn(
                            "flex justfiy-start gap-2 py-2 text-sm text-foreground",
                          )}
                        >
                          <Check className={cn(
                            "w-4 h-4",
                            item.recommended ? "text-foreground" : "text-primary"
                          )} />
                          <span>
                            {element}
                          </span>
                        </CardDescription>
                      ))}
                      {item.limitations.map((element, index) => (
                        <CardDescription
                          key={index}
                          className={cn(
                            "flex justfiy-start gap-2 py-2 text-sm text-muted-foreground",
                          )}
                        >
                          <X className={cn(
                            "w-4 h-4",
                            item.recommended ? "text-primary-foreground" : "text-destructive"
                          )} />
                          <span>
                            {element}
                          </span>
                        </CardDescription>
                      ))}
                    </CardContent>
                    <CardFooter className="w-full">
                      {isCurrentPlan && (
                        <p className="text-xs text-muted-foreground">
                          {t("pricing.current_plan", "Current Plan")}
                        </p>
                      )}
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