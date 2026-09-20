import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PRICING_PLANS } from "./pricing/pricingplans.config";

export const BusinessContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const currentPlan = user?.publicMetadata?.plan;
  const planId: keyof typeof PRICING_PLANS =
    typeof currentPlan === "string" && currentPlan in PRICING_PLANS
      ? (currentPlan as keyof typeof PRICING_PLANS)
      : "discover";
  const plan = PRICING_PLANS[planId];

  const { label, features, desc } = plan;

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
                  {planId === "discover" && (
                    <Button
                      variant="link"
                      onClick={() => navigate("/pricing")}
                    >
                      Upgrade
                    </Button>
                  )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {desc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {features.map((feature, index) => (
              <CardDescription
                key={index}
                className="flex justfiy-start gap-2 text-sm"
              >
                <Check className="w-4 h-4 text-primary" />
                <span>
                  {feature}
                </span>
              </CardDescription>
            ))}
          </CardContent>
          <CardFooter>
            {planId === "discover" ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/business")}
              >
                {t("business.manage_business", "Manage your business")}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/business")}
              >
                {t("business.manage_business", "Manage your business")}
              </Button>
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
