import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth, useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { ChevronLeft, MoreVertical, Plus, Sparkle, Store } from "lucide-react";
import { toast } from "sonner";
import { uploadFilesToR2 } from "@/lib/api/uploads";
import { getMySubscription } from "@/lib/api/payments";
import { getMediaUrl } from "@/lib/fileConvert";
import { getFriendlyCategoryName } from "@/utils/key-translations";

import {
  businessCreateSchema,
  defaultBusinessValues,
  type BusinessCreateValues,
} from "@/components/business/business-create.schema";
import type { BusinessListing } from "@/shared/contracts";

import {
  // BUSINESS_CATEGORIES,
  BUSINESS_PLANS,
  FORM_STEPS,
} from "@/components/business/business-create.config";
import { sanitizeBusinessValues } from "@/components/business/business-plan";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { BusinessTypeStep } from "@/components/business/steps/BusinessTypeStep";
import { BusinessIdentityStep } from "@/components/business/steps/BusinessIdentityStep";
import { BusinessDetailsStep } from "@/components/business/steps/BusinessDetailsStep";
import { BusinessMediaStep } from "@/components/business/steps/BusinessMediaStep";
import { ReviewStep } from "@/components/business/steps/ReviewStep";
import {
  listBusinessListings,
  getBusinessListing,
  createBusinessListing,
  updateBusinessListing,
  deleteBusinessListing,
} from "@/lib/api/listings";
import { type BreadcrumbConfig, Breadcrumbs } from "@/components/BreadCrumbs";
import { useModalContext } from "@/components/modal-provider";
import { PRICING_PLANS } from "../components/pricing/pricingplans.config";

const STEP_FIELDS: Record<number, (keyof BusinessCreateValues)[]> = {
  0: ["cat"],
  1: ["name", "tel", "email"],
  2: ["location", "address", "desc", "openHours", "spec"],
  3: ["photos", "videos", "priceTag"],
  4: ["pack"],
};

export function BusinessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [subscription, setSubscription] = useState<{ plan: string; status: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  const { setIsOpen, setModalContent } = useModalContext();

  // const [search, setSearch] = useState("");
  // const [sort, setSort] = useState<"updated" | "name">("updated");

  const breadcrumbConfig: BreadcrumbConfig = {
    "/business": {
      label: t("business.businesses", "Businesses"),
    },
    "/business/listings": {
      label: t("business.listings", "Listings"),
    },
  }
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

      // sort
      items.sort((a: BusinessListing, b: BusinessListing) => {
        // if (sort === "updated") {
        //   const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        //   const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        //   if (bt !== at) return bt - at;
        // }
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

  async function handleDelete(item: BusinessListing) {
    setModalContent({
      title: t("delete_confirmation_title", "Delete this business listing?"),
      size: "md",
      children: (
        <p>{t("delete_confirmation_message", "This cannot be undone.")}</p>
      ),
      onClose: () => {
        setIsOpen(false);
      },
      footer: ((
        <>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {t("cancel", "Cancel")}
          </Button>

          <Button
            variant="default"
            onClick={async () => {
              const previousListings = businessListings;
              setBusinessListings((listings) =>
                listings.filter((listing) => listing._id !== item._id)
              );
              setIsOpen(false);
              try {
                await deleteBusinessListing(item._id);
                await loadBusinessListings();
              } catch (error) {
                console.error("Failed to delete business listing:", error);
                setBusinessListings(previousListings);
                toast.error(
                  t("listing_deletion_failure", "Failed to delete the business listing. Please try again.")
                );
              }
            }}
          >
            {t("confirm", "Confirm")}
          </Button>
        </>
      )),
    });

    setIsOpen(true);
  }
  const currentPlan = subscription?.plan;

  const planId: keyof typeof PRICING_PLANS =
    typeof currentPlan === "string" && currentPlan in PRICING_PLANS
      ? (currentPlan as keyof typeof PRICING_PLANS)
      : "discover";
  const plan = PRICING_PLANS[planId];

  const { listings } = plan;
  const MAX_VISIBLE_SLOTS = 6;

  const existingCount = businessListings.length;
  const isManageable = listings <= 5;
  // Total slots to display, including existing listings
  const totalSlots = isManageable
    ? listings
    : Math.min(
      listings,
      Math.max(MAX_VISIBLE_SLOTS, existingCount + 1)
    );

  // Only render empty slots for the remaining capacity
  const emptySlots = Math.max(0, totalSlots - existingCount);

  // Show a notice when the listing limit has been reached or exceeded.
  const hasReachedListingLimit = existingCount >= listings;

  return (
    <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 pt-4 md:pt-16 pb-8 space-y-6">
        <Breadcrumbs
          config={breadcrumbConfig}
        />

      <div className="text-2xl/7 font-bold leading-tight text-foreground">
        {t("hello", "Hello", { name: user?.firstName || user?.fullName || t("business_owner", "Business owner") })}
      </div>

      {businessListings.length === 0 && (
        <Card>
          <CardContent>
            <CardTitle className="max-w-xl text-lg leading-wide text-foreground font-semibold">
            {t("business.hero_title", "Manage your business listings and reach more customers.")}
            </CardTitle>
            <CardDescription className="max-w-xl">
            {t("business.hero_description", "Create, edit, and manage your business listings to attract more customers and grow your presence.")}
            </CardDescription>
          </CardContent>
          <CardFooter>

            <CardAction>
              <Button
                variant="default"
                onClick={() => navigate("/business/create")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>{t("business.new_listing", "New business listing")}</span>
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      )}

        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Title + subtitle */}
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
                <span className="truncate">{t("business.listings", "Business listings")}</span>
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
            {["discover", "starter", "business"].includes(planId) && (
              <Button
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="inline-flex items-center gap-2"
              >
                <Sparkle />
                <span>{t("business.upgrade_plan", "Upgrade")}</span>
              </Button>
            )}
              <Button
                variant="link"
                disabled={hasReachedListingLimit}
                onClick={() => navigate("/business/create")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>{t("business.new_listing", "New business listing")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {!loading &&businessListings.map((item, index) => {
              return (
                <Card
                  key={index}
                  className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden"
                  size="sm"
                >
                  <Badge
                    className={cn(
                      "absolute start-4 top-4 z-20",
                      "text-[10px] uppercase",
                    )}
                    variant="secondary"
                  >
                    {getFriendlyCategoryName(item.cat, t)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="absolute end-4 top-4 z-20"
                      render={
                        <Button
                          variant="ghost" size="icon-sm"
                          aria-label={t("more_actions", "More actions")}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <MoreVertical />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      }
                    />

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="default"
                        className="w-full"
                        onClick={() => navigate(`/business/listings/${item._id}`)}
                      >
                        <span>{t("edit", "Edit")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDelete(item)}
                      >
                        <span>{t("delete", "Delete")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <CardHeader className="p-0 gap-0">
                    {/* image */}
                    {item.photos && item.photos.length > 0 ? (
                      <>
                    <div className="absolute bg-gradient-to-b from-background to-transparent w-full h-1/4 aspect-video object-cover" />
                      <img
                        src={getMediaUrl(item.photos[0])}
                        alt={item.name}
                        className="w-full aspect-video object-cover"
                        loading="lazy"
                      />
                      </>
                    ) : (
                      <div className="flex items-center z-10 aspect-video w-full justify-center bg-background/50 text-foreground/30">
                        {t("no_image", "No image")}
                      </div>
                    )}
                    <Separator />
                  </CardHeader>
                  {/* body */}
                  <CardContent>
                    <CardTitle
                      title={item.name}
                      className={cn(
                        "w-full line-clamp-1 overflow-hidden text-ellipsis",
                        "text-lg leading-wide tracking-normal text-foreground font-heading font-semibold"
                      )}
                    >
                      {item.name}
                    </CardTitle>

                    {item.desc && (
                      <CardDescription className={cn(
                        "w-full line-clamp-2 overflow-hidden text-ellipsis",
                        "text-sm leading-snug tracking-normal text-foreground/90 font-body font-normal"
                      )}>
                        {item.desc}
                      </CardDescription>
                    )}

                    {item.address && (
                      <CardDescription className={cn(
                        "w-full line-clamp-2 overflow-hidden text-ellipsis",
                        "text-sm leading-snug tracking-normal text-muted-foreground font-body font-normal"
                      )}>
                        {item.address}
                      </CardDescription>
                    )}

                  
                  {/* 
                  {item.location && (
                    <p className="text-xs text-foreground/50">
                      {item.location.coordinates[0]?.toFixed?.(5)} •{" "}
                      {item.location.coordinates[1]?.toFixed?.(5)}
                    </p>
                  )}
                  */}

                  {/*
                  <div className="text-xs text-foreground/50">
                    {item.updatedAt?.toDate
                      ? new Date(item.updatedAt.toDate()).toLocaleString()
                      : ""}
                  </div>
                  */}
                  </CardContent>
                </Card>
              );
            })}

        {[...Array(emptySlots)].map((_, index) => {
          const isFirstSlot = index === 0
          return (
            <Empty
              key={index}
              className={cn(
                "bg-muted/10",
                // "opacity-50",
                isFirstSlot && "border border-border",
                isFirstSlot && "bg-[radial-gradient(var(--card)_1px,transparent_1px)] [background-size:8px_8px]",
                isFirstSlot && "hover:bg-muted transition-colors duration-300",
              )}
            >
              {isFirstSlot && (
                <>
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                    >
                      <Store className="w-12 h-12 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyDescription>
                      {t("business.your_listing_appears_here", "Your listing appears here.")}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="default"
                      onClick={() => navigate("/business/create")}
                    >
                      <Plus />
                      <span>{t("business.new_listing", "Add a listing here")}</span>
                    </Button>
                  </EmptyContent>
                </>
              )}
            </Empty>
          )
        }
        )}

        {hasReachedListingLimit && (
          <Empty className={cn(
            "border border-border bg-muted/10"
          )}>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Store className="w-12 h-12 text-muted-foreground" />
              </EmptyMedia>

              <EmptyDescription>
                {t(
                  "business.listing_limit_reached",
                  "You've reached the listing limit for your current plan."
                )}
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <Button
                variant="default"
                onClick={() => navigate("/pricing")}
              >
                <Sparkle />
                <span>
                  {t("business.upgrade_plan", "Upgrade your plan")}
                </span>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {loading && (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="overflow-hidden rounded-3xl" >
                <Skeleton className="aspect-video w-full bg-foreground/20" />
                <Skeleton className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/2 rounded bg-foreground/20" />
                  <Skeleton className="h-3 w-2/3 rounded bg-foreground/20" />
                  <Skeleton className="h-8 w-full rounded bg-foreground/20" />
                </Skeleton>
              </Skeleton>
            ))}
          </>
        )}
        </div>
    </main>
  );
}

export function BusinessCreate() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState("discover");

  const breadcrumbConfig: BreadcrumbConfig = {
    "/business": {
      label: t("business.businesses", "Businesses"),
    },
    "/create": {
      label: t("business.create", "Create Business"),
    },
  }

  const selectedPlan = plan in BUSINESS_PLANS
    ? (plan as BusinessCreateValues["pack"])
    : "discover";

  useEffect(() => {
    void getMySubscription()
      .then((subscription) => setPlan(subscription.plan))
      .catch(() => undefined);
  }, []);

  const form = useForm({
    resolver: zodResolver(businessCreateSchema),
    defaultValues: { ...defaultBusinessValues, pack: selectedPlan },
    mode: "onTouched",
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    trigger,
    setValue,
    // watch,
  } = form;

  useEffect(() => {
    setValue("pack", selectedPlan, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [selectedPlan, setValue]);

  // const category = watch("cat");
  // const plan = watch("pack");

  const stepTitle = [
    t("businessCreate.steps.type", "What type of business do you want to list?"),
    t("businessCreate.steps.identity", "Business identity and contact information"),
    t("businessCreate.steps.details", "Business details"),
    t("businessCreate.steps.media", "Photos & media"),
    t("businessCreate.steps.review", "Review your listing"),
  ][step];

  const next = async () => {
    const fields = STEP_FIELDS[step];

    const valid = await trigger(fields, {
      shouldFocus: true,
    });

    if (!valid) return;

    setStep((current) =>
      Math.min(current + 1, FORM_STEPS.length - 1),
    );
  };

  const previous = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const onSubmit = async (values: BusinessCreateValues) => {
    setSubmitting(true);

    try {
      const sanitizedValues = sanitizeBusinessValues({
        ...values,
        pack: selectedPlan,
      });
      const { photos, videos, ...businessData } = sanitizedValues;

      const uploadedPhotos = await uploadFilesToR2(photos);
      const uploadedVideos = await uploadFilesToR2(videos);

      const payload = {
        ...businessData,
        photos: uploadedPhotos,
        videos: uploadedVideos,
      };

      // 4. Send the pure JSON payload to your Hono server
      await createBusinessListing(payload);

      toast.success(
        t(
          "businessCreate.success",
          "Your business has been submitted successfully.",
        ),
      );
    } catch (error) {
      console.error(error);

      toast.error(
        t(
          "businessCreate.error",
          "Unable to submit your business. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
      navigate("/business/listings");
    }
  };

  const renderStep = (
    { stepTitle }: { stepTitle?: string }
  ) => {
    switch (step) {
      case 0:
        return <BusinessTypeStep title={stepTitle} />;

      case 1:
        return <BusinessIdentityStep title={stepTitle} />;

      case 2:
        return <BusinessDetailsStep title={stepTitle} />;

      case 3:
        return <BusinessMediaStep title={stepTitle} />;

      case 4:
        return <ReviewStep title={stepTitle} />;

      default:
        return null;
    }
  };

  return (
    <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 pt-4 md:pt-16 pb-8 space-y-6">
      <Breadcrumbs
        config={breadcrumbConfig}
      />
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {t(
                    "businessCreate.title",
                    "Create your business",
                  )}
                </h1>

                <span className="text-sm text-muted-foreground">
                  {t("businessCreate.step", "Step")}{" "}
                  {step + 1} / {FORM_STEPS.length}
                </span>
              </div>

              <Progress
                value={((step + 1) / FORM_STEPS.length) * 100}
              />

            </div>

            <Card>
              {renderStep({stepTitle})}
              <CardFooter className="flex justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={previous}
                  disabled={step === 0 || submitting}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("common.back", "Back")}
                </Button>

                {step < FORM_STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      void next();
                    }}
                  >
                    {t("common.continue", "Continue")}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? t("common.submitting", "Submitting...")
                      : t(
                        "businessCreate.submit",
                        "Submit listing",
                      )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </FormProvider>
      </main>
  );
}

export function BusinessEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const listingId = params.id;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const breadcrumbConfig: BreadcrumbConfig = {
    "/business": {
      label: t("business.businesses", "Businesses"),
    },

    "/business/listings": {
      label: t("business.listings", "Listings"),
    },
  }

  const form = useForm({
    resolver: zodResolver(businessCreateSchema),
    defaultValues: defaultBusinessValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    reset,
  } = form;

  useEffect(() => {
    let active = true;

    async function loadListing() {
      if (!listingId) {
        setLoadError(t("businessEdit.notFound", "Business listing not found."));
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const listing = (await getBusinessListing(listingId)) as BusinessListing;
        if (!active) return;

        reset({
          ...defaultBusinessValues,
          cat: listing.cat as BusinessCreateValues["cat"],
          name: listing.name,
          tel: listing.tel,
          wa: listing.wa,
          email: listing.email,
          website: listing.website,
          social: listing.social,
          address: listing.address,
          location: listing.location,
          desc: listing.desc,
          openHours: listing.openHours,
          spec: listing.spec,
          pack: listing.pack as BusinessCreateValues["pack"],
          priceTag: listing.priceTag ?? "",
        });
      } catch (error) {
        console.error("Failed to load business listing:", error);
        if (active) {
          setLoadError(
            t(
              "businessEdit.loadError",
              "Unable to load this business listing. Please try again.",
            ),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadListing();
    return () => {
      active = false;
    };
  }, [listingId, reset, t]);

  const handleDelete = async () => {
    if (!listingId || deleting) return;
    if (!confirm(t("businessEdit.deleteConfirm", "Delete this business listing? This cannot be undone."))) return;

    setDeleting(true);
    try {
      await deleteBusinessListing(listingId);
      toast.success(t("businessEdit.deleteSuccess", "Business listing deleted."));
      navigate("/business");
    } catch (error) {
      console.error("Failed to delete business listing:", error);
      toast.error(t("businessEdit.deleteError", "Unable to delete the business listing. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (values: BusinessCreateValues) => {
    setSubmitting(true);

    try {
      const { photos, videos, ...businessData } = values;

      const uploadedPhotos = await uploadFilesToR2(photos);
      const uploadedVideos = await uploadFilesToR2(videos);

      const payload: Record<string, unknown> = {
        ...businessData,
      };

      // Leave existing remote media untouched unless replacement files were selected.
      if (photos.length > 0) payload.photos = uploadedPhotos;
      if (videos.length > 0) payload.videos = uploadedVideos;

      await updateBusinessListing(listingId , payload);

      toast.success(
        t(
          "businessCreate.success",
          "Your business has been submitted successfully.",
        ),
      );

      // Replace this with your router navigation or
      // success screen once your API response is defined.
    } catch (error) {
      console.error(error);

      toast.error(
        t(
          "businessCreate.error",
          "Unable to submit your business. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 pt-4 md:pt-16 pb-8 space-y-6">
      <Breadcrumbs
        config={breadcrumbConfig}
      />

          {loading && <Skeleton className="h-[38rem] w-full" />}

          {!loading && loadError && (
            <Empty className="border p-8">
              <EmptyHeader>
                <EmptyDescription>{loadError}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!loading && !loadError && (
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)} >
                <Card>
                  <CardHeader>
                    <CardTitle>{t("businessEdit.title", "Edit business listing")}</CardTitle>
                    <CardDescription>
                      {t("businessEdit.description", "Update your listing information and save your changes.")}
                    </CardDescription>
                  </CardHeader>
                  <BusinessTypeStep title={t("businessCreate.steps.type", "Business type")} />
                  <BusinessIdentityStep title={t("businessCreate.steps.identity", "Business identity and contact information")} />
                  <BusinessDetailsStep title={t("businessCreate.steps.details", "Business details")} />
                  <BusinessMediaStep title={t("businessCreate.steps.media", "Photos & media")} />
                  <CardFooter className="flex justify-between gap-3">
                    <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={submitting || deleting}>
                      {deleting ? t("common.deleting", "Deleting...") : t("common.delete", "Delete")}
                    </Button>
                    <Button type="submit" disabled={submitting || deleting}>
                      {submitting ? t("common.saving", "Saving...") : t("common.save", "Save changes")}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </FormProvider>
          )}
    </main>
  )
}
