import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SignInButton, useAuth } from "@clerk/clerk-react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PRICING_PLANS } from "./pricing/pricingplans.config";
import { getMySubscription } from "../lib/api/payments";

export const BusinessContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const [subscription, setSubscription] = useState<{ plan: string; status: string } | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const load = async () => {
      setSubscription(await getMySubscription());
    };
    void load().catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load payment status"));
  }, [isSignedIn]);

  const currentPlan = subscription?.plan;

  const planId: keyof typeof PRICING_PLANS =
    typeof currentPlan === "string" && currentPlan in PRICING_PLANS
      ? (currentPlan as keyof typeof PRICING_PLANS)
      : "discover";
  const plan = PRICING_PLANS[planId];

  const { label, features, limitations, desc } = plan;

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
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
        {isSignedIn ? (
          <>
            <h2 className="text-xs text-muted-foreground uppercase">
              {t("business.current_plan", "Current plan")}
            </h2>
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-1">
                  <span
                    className="text-lg text-muted-foreground font-bold uppercase"
                  >
                    {label}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {desc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {features.map((item, index) => (
                  <CardDescription
                    key={index}
                    className="flex justfiy-start gap-2 py-2 text-sm text-foreground"
                  >
                    <Check className="w-4 h-4 text-primary" />
                    <span>
                      {item}
                    </span>
                  </CardDescription>
                ))}
                {limitations.map((item, index) => (
                  <CardDescription
                    key={index}
                    className="flex justfiy-start gap-2 py-2 text-sm text-muted-foreground"
                  >
                    <X className="w-4 h-4 text-destructive" />
                    <span>
                      {item}
                    </span>
                  </CardDescription>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <CardAction className="w-full">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/business")}
                  >
                    {t("business.manage_business", "Manage your business")}
                  </Button>
                </CardAction>
                {planId === "discover" && (
                  <CardAction className="w-full">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => navigate("/pricing")}
                    >
                      Upgrade
                    </Button>
                  </CardAction>
                )}
              </CardFooter>
            </Card>
          </>
        ) : (
          <>
            <Button
              variant="default"
              className="w-full"
              onClick={() => navigate("/pricing")}
            >
              {t("business.pricing", "See plans")}
            </Button>
            <div className="flex items-center justify-start gap-2">
              <h2 className="text-xs text-muted-foreground uppercase">
                {t("business.already_registred", "Already have a business registered?")}
              </h2>
              <SignInButton mode="modal">
                <Button
                  variant="link"
                >
                  {t("auth.login.submit", "Log in")}
                </Button>
              </SignInButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
