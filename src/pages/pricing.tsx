import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
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
import { cancelMySubscription, confirmPayment, createPaymentCheckout, getMySubscription } from "../lib/api/payments";
import { toast } from "sonner";

export function PricingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  function formatNumber(
    value: number,
    lang: string,
    maximumFractionDigits = 2
  ): string {
    return new Intl.NumberFormat(lang, {
      maximumFractionDigits,
    }).format(value);
  }
  const [subscription, setSubscription] = useState<{ plan: string; status: string } | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const token = new URLSearchParams(window.location.search).get("token");
    const load = async () => {
      if (token) await confirmPayment(token);
      setSubscription(await getMySubscription());
    };
    void load().catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load payment status"));
  }, [isSignedIn]);

  const currentPlan = subscription?.plan;

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
          label: t("pricing.manage_business", "Manage your businessdashboard"),
          action: () => navigate("/business"),
          disabled: false,
          variant: "default" as const,
        };
      }

      if (planId === "discover") {
        return {
          label: t("pricing.downgrade_to_discover", "Downgrade to Discover"),
          action: async () => {
            if (!confirm(t("pricing.cancel_confirm", "Cancel your current plan?"))) return;
            try {
              setSubscription(await cancelMySubscription());
              toast.success(t("pricing.cancelled", "Plan canceled"));
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to cancel plan");
            }
          },
          disabled: false,
          variant: "ghost" as const,
        };
      }

    }
    if (!isSignedIn && planId === "discover") {
      return {
        label: t("pricing.add", "Add for free"),
        action: () => navigate("/business"),
        disabled: false,
        variant: "outline" as const,
      };
    }

    return {
      label: planId === "sponsor" ? t("pricing.become_partner", "Become a partner") : t("pricing.choose", "Purchase"),
      action: async () => {
        if (planId === "sponsor") { window.location.href = "mailto:francisehemba2021@gmail.com?subject=Sponsor%20plan"; return; }
        try {
          const { checkoutUrl } = await createPaymentCheckout(planId);
          window.location.assign(checkoutUrl);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Unable to start payment");
        }
      },
      disabled: false,
      variant: "outline" as const,
    };
  };

  const checkIsCurrentPlan = (planId: keyof typeof PRICING_PLANS) => (isSignedIn && planId === currentPlanId && subscription?.status !== "canceled");

  const formatPrice = (price: number) =>
    price === 0
      ? t("businessCreate.plan.free", "Free")
      : price === Infinity ? t("businessCreate.plan.custom", "Custom")
        : (<>
          {formatNumber(price, lang)} <span className="text-xs font-medium">FCFA</span>
        </>);

  return (
    <>
      <HeaderBar
      // title={t("title")}
      // description={t("description")}
      />
      <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-7xl px-4 pt-16 pb-8 space-y-6">
        {/* Header */}
        <div className="mb-12 flex-col items-center items-start justify-between gap-3">
          <h2 className="text-xl text-center font-bold tracking-tight">{t("pricing.title", "A single pass for the entire campaign")}</h2>
          <p className="mt-1 text-sm text-center text-foreground/70">
            {t("pricing.description", "Pay once: your visibility lasts until the closing of the Games, on November 13, 2026. The earlier you commit, the less you pay.")}
          </p>
        </div>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*:last-child]:col-span-full">
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
                    "overflow-visible relative before:absolute before:top-0 before:left-0 before:right-0 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']",
                    // item.recommended ? "before:text-xs before:text-center before:font-bold before:uppercase before:h-6 before:content-['Recommended']" : "before:h-1 before:content-['']",
                    item.recommended ? "shadow-xl" : "shadow-none",
                  )}
                  style={{
                    borderWidth: "2px",
                    borderColor: item.color,
                  }}
                >
                  <CardHeader>
                    {item.recommended && (
                      <Badge
                        variant="default"
                        render={
                          <span className={cn(
                            "px-2 py-2 text-xs tracking-tight font-medium uppercase",
                          )}
                            style={{
                              background: item.color,
                            }}
                          >
                            {t("pricing.popular", "Popular")}
                          </span>
                        }
                      >
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardDescription className={cn(
                      "text-[11px] text-muted-foreground tracking-tight uppercase"
                    )}>
                      {t(
                        `businessCreate.plans.${key}`,
                        item.desc,
                      )}
                    </CardDescription>
                    <CardTitle className="text-lg font-semibold">
                      {t(
                        `businessCreate.plans.${key}`,
                        item.label,
                      )}
                    </CardTitle>
                    <CardDescription>
                      <div className={cn(
                        "text-3xl font-bold",
                      )}
                        style={{
                          color: item.color,
                        }}
                      >
                        {formatPrice(item.price)}
                      </div>
                    </CardDescription>
                    <CardDescription>
                      {item.price > 0 && item.price !== Infinity && (
                        <span className="line-through">
                          {formatPrice(item.old_price)}
                        </span>
                      )}
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}{item.offer_deadline !== "undefined" && (
                          <>
                            {t("common.until", "Until")} {" "}
                            {item.offer_deadline && new Date(item.offer_deadline).toLocaleDateString(
                              lang,
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })}
                          </>)
                        }
                      </span>
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
                        action.disabled ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                      style={{
                        background: `color-mix(in srgb, ${item.color} 20%, transparent)`,
                      }}
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
      </main>
    </>
  );
}