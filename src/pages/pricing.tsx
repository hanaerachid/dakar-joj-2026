import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "cn";
import { Calendar, CircleCheck, CreditCard, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card";
import { HeaderBar } from "../components/header/HeaderBar";
import { PRICING_PLANS } from "../components/pricing/pricingplans.config";
import { cancelMySubscription, confirmPayment, createPaymentCheckout, getMySubscription } from "../lib/api/payments";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Breadcrumbs, type BreadcrumbConfig } from "@/components/BreadCrumbs";

export function PricingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const breadcrumbConfig: BreadcrumbConfig = {
    "/pricing": {
      label: t("business.selectplan", "Pricing"),
    },
  }

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
          variant: "default" as const,
        };
      }

    }
    if (!isSignedIn && planId === "discover") {
      return {
        label: t("pricing.add", "Add for free"),
        action: () => navigate("/business"),
        disabled: false,
        variant: "default" as const,
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
      variant: "default" as const,
    };
  };

  const checkIsCurrentPlan = (planId: keyof typeof PRICING_PLANS) => (isSignedIn && planId === currentPlanId && subscription?.status !== "canceled");

  const formatPrice = (price: number) =>
    price === 0
      ? t("businessCreate.plan.free", "Free")
      : price === Infinity ? t("businessCreate.plan.custom", "Custom")
        : (<>
          {formatNumber(price, lang)}
        </>);

  return (
    <>
      <HeaderBar
      // title={t("title")}
      // description={t("description")}
      />
      <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 pt-4 md:pt-16 pb-8 space-y-6">
        <Breadcrumbs
          config={breadcrumbConfig}
        />
        {/* Header */}
        <div className="mb-12 flex-col items-center items-start justify-between gap-3">
          <h2 className="text-xl text-center font-bold tracking-tight">{t("pricing.title", "A single pass for the entire campaign")}</h2>
          <p className="mt-1 text-sm text-center text-foreground/70">
            {t("pricing.description", "Pay once: your visibility lasts until the closing of the Games, on November 13, 2026. The earlier you commit, the less you pay.")}
          </p>
        </div>

        <div className="flex flex-col items-start justify-start sm:flex-row sm:items-center sm:justify-center gap-4">
        <div className="flex items-start gap-1">
          <CreditCard className="w-5 h-5 text-[var(--accent-color-1)]"/>
          <span className="font-bold text-sm text-foreground">{t("pricing.single_payment", "Un seul paiement")}</span>{" · "}
          <span className="font-normal text-sm text-muted-foreground">{t("pricing.no_subscription", "pas d'abonnement")}</span>
        </div>
        <div className="flex items-start gap-1">
          <Calendar className="w-5 h-5 text-[var(--accent-color-2)]"/>
          <span className="font-bold text-sm text-foreground">{t("pricing.visible", "Visible")}</span>{" "}
          <span className="font-normal text-sm text-muted-foreground">{t("pricing.until_date", "jusqu'au 31 décembre 2026")}</span>
        </div>
        <div className="flex items-start gap-1">
          <Star className="w-5 h-5 text-[var(--accent-color-3)]"/>
          <span className="font-bold text-sm text-foreground">{t("pricing.launch_offer", "Offre de lancement")}</span>{" · "}
          <span className="font-normal text-sm text-muted-foreground">{t("pricing.reduced_price", "prix réduits")} </span>
        </div>
        </div>

        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 [&>*:last-child]:col-span-full"
        )}>
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
                    "group",
                    "flex-col items-start",
                    "overflow-visible relative before:absolute before:top-0 before:left-0 before:right-0 before:bg-[linear-gradient(90deg,#008751_0%,#FCD116_52%,#CE1126_100%)] before:content-['']",
                    // item.recommended ? "before:text-xs before:text-center before:font-bold before:uppercase before:h-6 before:content-['Recommended']" : "before:h-1 before:content-['']",
                    item.recommended ? "shadow-xl" : "shadow-none",
                    "grid grid-cols-1 last:sm:grid-cols-2 gap-4 content-start",
                    "last:bg-[color-mix(in_srgb,var(--card)_5%,var(--foreground)_95%)]",
                    "last:text-[color-mix(in_srgb,var(--card)_95%,var(--foreground)_5%)]",
                    "last:sm:[&_[data-slot='item-description']]:block",
                    "last:sm:[&_[data-slot='item']]:bg-foreground/50",
                    "last:sm:[&_[data-slot='item']]:p-4",
                  )}
                  style={{
                    borderWidth: "2px",
                    borderColor: item.recommended ? item.color : "transparent",
                  }}
                >
                  <CardContent className={cn(
                    "space-y-2",
                  )}>
                    {item.recommended && (
                      <CardDescription>
                        <Badge
                          variant="default"
                          className="py-1"
                          render={
                            <span className={cn(
                              "px-4 text-[11px] tracking-tight font-medium uppercase",
                            )}
                              style={{
                                background: item.color,
                              }}
                            >
                              {t("pricing.popular", "Most popular")}
                            </span>
                          }
                        >
                        </Badge>
                      </CardDescription>
                    )}

                    {item.desc && (
                    <CardDescription
                      className={cn(
                        "text-[11px] text-muted-foreground tracking-tight uppercase",
                        "py-1",
                      )}
                      style={{
                        color: item.color,
                      }}
                    >
                      {t(
                        `businessCreate.plan_desc.${key}`,
                        item.desc,
                      )}
                    </CardDescription>
                      )}

                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                      {t(
                        `businessCreate.plans.${key}`,
                        item.label,
                      )}

                      {isCurrentPlan && (
                        <Badge render={
                          <p className="text-xs text-muted-foreground">
                            {t("pricing.current_plan", "Current Plan")}
                          </p>
                        } />
                      )}
                    </CardTitle>
                    <CardDescription>
                      <div className={cn(
                        "text-4xl font-bold",
                      )}
                        style={{
                          color: item.color,
                        }}
                      >
                        {formatPrice(item.price)} <span className="text-sm font-medium">FCFA</span>
                      </div>
                    </CardDescription>
                    <CardDescription>
                      {item.price > 0 && item.price !== Infinity && (
                        <span className="text-[13px] line-through">
                          {formatPrice(item.old_price)} <span>FCFA</span>
                        </span>
                      )}
                      <span className="text-[13px] font-normal text-muted-foreground">
                        {" "}{item.offer_deadline !== undefined && (
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

                    {item.desc && (
                    <CardDescription className="sm:group-not-last:hidden text-sm">
                      {item.desc}
                    </CardDescription>
                    )}

                    <Button
                      type="button"
                      disabled={action.disabled}
                      inert={action.disabled}
                      variant={action.variant}
                      className={cn(
                        "w-full max-w-sm",
                        action.disabled ? "cursor-not-allowed" : "cursor-pointer",
                      )}
                      style={{
                        background: item.color,
                      }}
                      onClick={action.action}
                    >
                      {action.label}
                    </Button>
                  </CardContent>
                  <CardContent className={cn(
                    "grid grid-cols-1 gap-1 sm:group-last:grid-cols-2",
                  )}>
                    {item.features.map((element, index) => {
                      const Icon = element.icon ?? CircleCheck;
                    return (
                      <Item
                        key={index}
                        size="xs"
                        className={cn(
                          "px-1 text-sm",
                        )}
                      >
                        {Icon && (
                          <ItemMedia variant="icon">
                            <Icon className="group-last:text-primary group-not-last:hidden" />
                            <CircleCheck className="group-last:hidden" />
                          </ItemMedia>
                        )}

                        <ItemContent>
                          <ItemTitle>
                            {(element as any).title}
                          </ItemTitle>

                          <ItemDescription
                            className="hidden"
                          >
                            {(element as any).description}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    )}
                    )}
                    {item.limitations.map((element, index) => (
                      <Item
                        key={index}
                        size="xs"
                        className={cn(
                          "px-1 text-sm",
                        )}
                      >
                        <ItemMedia variant="icon">
                          <X className={cn(
                            "text-destructive"
                          )} />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            {(element as any)?.title}
                          </ItemTitle>

                          <ItemDescription
                            className="hidden"
                          >
                            {(element as any)?.description}
                          </ItemDescription>
                        </ItemContent>
                      </Item>

                    ))}
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      </main>
    </>
  );
}