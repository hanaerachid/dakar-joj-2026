import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { toast } from "sonner";
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { ChevronDown, ChevronUp, CircleCheck, Settings, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { PRICING_PLANS } from "./pricing/pricingplans.config";
import { getMySubscription } from "../lib/api/payments";
import { listBusinessListings } from "@/lib/api/listings";
import type { BusinessListing } from "@/shared/contracts";
import { getMediaUrl } from "@/lib/fileConvert";
import { getFriendlyCategoryName } from "@/utils/key-translations";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from "./ui/empty";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useStateContext } from "./state-provider";

export const BusinessContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [subscription, setSubscription] = useState<{ plan: string; status: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  const [open, setOpen] = useState(false);
  const { setActiveTab, setSelectedPlace } = useStateContext();

  const openBusinessListing = (listing: BusinessListing) => {
    const [lng, lat] = listing.location.coordinates;
    setSelectedPlace({
      id: listing._id,
      lng,
      lat,
      title: listing.name,
      type: "business",
      listing,
    });
    setActiveTab("explorer");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  useEffect(() => {
    if (!isSignedIn) return;
    const load = async () => {
      setSubscription(await getMySubscription());
    };
    void load().catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load payment status"));
  }, [isSignedIn]);

  async function loadBusinessListings() {
    if (!isLoaded || !user) return;
    setLoading(true);

    try {
      const items = (await listBusinessListings({
        owner: user.id,
      })) as BusinessListing[];

      items.sort((a: BusinessListing, b: BusinessListing) => {
        return (a.name || "").localeCompare(b.name || "");
      });

      setBusinessListings(items as BusinessListing[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBusinessListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  const currentPlan = subscription?.plan;

  const planId: keyof typeof PRICING_PLANS =
    typeof currentPlan === "string" && currentPlan in PRICING_PLANS
      ? (currentPlan as keyof typeof PRICING_PLANS)
      : "discover";
  const plan = PRICING_PLANS[planId];

  const { label, features, limitations, desc } = plan;

  return (
    <div className="space-y-4 pt-2">
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

            <Item
              variant="outline"
              size="sm"
            >
              <Collapsible
                open={open}
                onOpenChange={handleOpenChange}
                className="w-full flex flex-col gap-3"
              >
                <ItemHeader className="flex flex-col items-start justify-start gap-1">
                  <ItemDescription
                    className={cn(
                      "text-[11px] tracking-tight font-medium uppercase",
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {desc}
                    </span>
                  </ItemDescription>
                  <div className="w-full flex items-center justify-between gap-2">
                    <CollapsibleTrigger
                      className="flex-1"
                      render={
                        <ItemTitle>
                          <span className="text-lg text-foreground font-bold">
                            {label}
                          </span>
                          {open ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </ItemTitle>
                      } />
                    {["discover", "starter", "business"].includes(planId) && (
                      <Button
                        variant="link"
                        size="sm"
                        className="shrink-0"
                        onClick={() => navigate("/pricing")}
                      >
                        {t("business.upgrade", "Upgrade")}
                      </Button>
                    )}
                  </div>
                </ItemHeader>
                <CollapsibleContent>
                  <ItemContent>
                    {features.map((item, index) => (
                      <ItemDescription
                        key={index}
                        className="flex justfiy-start gap-2 py-1.5"
                      >
                        <CircleCheck
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-foreground text-xs">
                          {item.title}
                        </span>
                      </ItemDescription>
                    ))}
                    {limitations.map((item, index) => (
                      <>
                        <Separator />
                        <ItemDescription
                          key={index}
                          className="flex justfiy-start gap-2 py-1.5"
                        >
                          <XCircle
                            className="w-4 h-4 text-muted-foreground"
                          />
                          <span className="text-muted-foreground text-xs text-light">
                            {item}
                          </span>
                        </ItemDescription>
                      </>
                    ))}
                  </ItemContent>
                </CollapsibleContent>
              </Collapsible>
            </Item>

            <h2 className="text-xs text-muted-foreground uppercase">
              {t("business.your_listings", "Your listings")}
            </h2>

            {businessListings.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-1">
                  {!loading && businessListings
                    .map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="basis-1/2 pl-0 lg:basis-1/3"
                        >
                          <Item
                            key={index}
                            size="sm"
                            variant="muted"
                            onClick={() => openBusinessListing(item)}
                            className={cn(
                              "group relative aspect-square overflow-hidden",
                            )}
                          >
                            <Badge
                              variant="secondary"
                              className={cn(
                                "absolute start-1.5 top-1.5 z-20",
                                "text-[9px] uppercase"
                              )}
                            >
                              {getFriendlyCategoryName(item.cat, t)}
                            </Badge>
                            <ItemMedia
                              variant="default"
                              className="h-full absolute inset-0"
                              style={{
                                backgroundImage: `url(${getMediaUrl(item.photos[0])})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                              }}
                            />
                            <ItemContent
                              className="flex-col justify-end absolute h-1/2 bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2"
                            >
                              <ItemTitle
                                title={item.name}
                                className={cn(
                                  "w-full line-clamp-1 overflow-hidden text-ellipsis",
                                  "text-xs/3.5 tracking-normal font-heading font-normal"
                                )}
                              >
                                {item.name}
                              </ItemTitle>
                            </ItemContent>
                          </Item>
                        </div>
                      )
                    })}
                  <div className="basis-1/2 pl-0 lg:basis-1/3">
                    <Item
                      size="sm"
                      variant="muted"
                      className={cn(
                        "group relative aspect-square overflow-hidden",
                        "flex flex-col items-center justify-center gap-2",
                        "hover:bg-primary/10 cursor-pointer"
                      )}
                      onClick={() => navigate("/business")}

                    >
                      <ItemMedia
                        variant="default"
                        className={cn(
                          "w-12 h-12",
                          "-z-10",
                          "absolute top-1/3 -translate-x-0 -translate-y-1/2"
                        )}
                      >
                        <Settings
                          className={cn(
                            "w-12 h-12",
                            "text-muted-foreground/20"
                          )}
                        />
                      </ItemMedia>
                      <ItemContent
                        className="flex-col justify-end absolute h-full bottom-0 left-0 right-0 p-2"
                      >
                        <ItemTitle
                          className={cn(
                            "w-full line-clamp-2 overflow-hidden text-ellipsis",
                            "text-center text-xs/3.5 tracking-normal font-heading font-normal"
                          )}
                        >
                          {t("business.manage_business", "Manage your business")}
                        </ItemTitle>
                      </ItemContent>
                    </Item>
                  </div>
                </div>
              </>
            ) :
              <Empty className="border border-dashed border-muted-foreground"
              >
                <EmptyHeader>
                  <EmptyDescription>
                    {t("business.no_listings", "Your listings appear here.")}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/business")}
                  >
                    {t("business.add_listing", "Add a listing")}
                  </Button>
                </EmptyContent>
              </Empty>
            }
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
              <SignInButton mode="redirect">
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
