import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, MoreVertical, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { HeaderBar } from "../components/header/HeaderBar";
import { fileToBase64 } from "@/lib/fileConvert";

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
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { BusinessTypeStep } from "@/components/business/steps/BusinessTypeStep";
import { BusinessIdentityStep } from "@/components/business/steps/BusinessIdentityStep";
import { BusinessDetailsStep } from "@/components/business/steps/BusinessDetailsStep";
import { BusinessMediaStep } from "@/components/business/steps/BusinessMediaStep";
import { BusinessPlanStep } from "@/components/business/steps/BusinessPlanStep";
import {
  listBusinessListings,
  createBusinessListing,
  deleteBusinessListing,
} from "@/lib/api/submitBusinessListing";

const STEP_FIELDS: Record<number, (keyof BusinessCreateValues)[]> = {
  0: ["cat"],
  1: ["name", "tel", "email"],
  2: ["address", "desc", "openHours", "spec"],
  3: ["photos", "videoFile", "priceTag"],
  4: ["pack"],
};

export function BusinessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  // const [search, setSearch] = useState("");
  // const [sort, setSort] = useState<"updated" | "name">("updated");

  async function loadBusinessListings() {
    setLoading(true);
    try {
      let items: BusinessListing[] = [];

      items = (await listBusinessListings()) as BusinessListing[];

      // sort
      items.sort((a: any, b: any) => {
        // if (sort === "updated") {
        //   const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        //   const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        //   if (bt !== at) return bt - at;
        // }
        return (a.name || "").localeCompare(b.name || "");
      });

      setBusinessListings(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBusinessListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteBusinessListing(item: BusinessListing) {
    if (!confirm("Delete this business listing? This cannot be undone.")) return;
    try {
      await deleteBusinessListing(item._id);
      await loadBusinessListings();
    } catch (error) {
      console.error("Failed to delete business listing:", error);
      toast.error("Failed to delete the business listing. Please try again.");
    }
  }

  return (
    <>
      <HeaderBar
        title={t("title")}
        description={t("description")}
      // onReset={handleReset}
      />
      <div className="mx-auto max-w-6xl pt-24 pb-8 space-y-6">
        <Card>
          <CardHeader>
            <Badge variant="secondary">
              Bonjour
            </Badge>
          </CardHeader>
          <CardContent>
            <CardTitle className="max-w-xl">
              {t("business_hero_title", "Gérez vos établissements pour les Jeux.")}
            </CardTitle>
            <CardDescription className="max-w-xl">
              {t("business_hero_description", "Des milliers de visiteurs chercheront où dormir, manger, se déplacer et faire leurs achats à Dakar. Publiez vos fiches sur la carte officielle et captez cette audience.")}
            </CardDescription>
          </CardContent>
          <CardFooter>

            <CardAction>
              <Button>
                <Plus />
                {t("new_listing", "New business listing")}
              </Button>
            </CardAction>
          </CardFooter>
        </Card>

        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Title + subtitle */}
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
                <span className="truncate">Business listings</span>
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="link"
                onClick={() => navigate("/business/create")}
                className="inline-flex items-center gap-2"
              >
                <Plus />
                <span>{t("new_listing", "New business listing")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="col-span-full grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="overflow-hidden rounded-3xl"
                >
                  <Skeleton className="h-2 w-full bg-foreground/30" />
                  <Skeleton className="h-44 w-full bg-foreground/20" />
                  <Skeleton className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/2 rounded bg-foreground/20" />
                    <Skeleton className="h-3 w-2/3 rounded bg-foreground/20" />
                    <Skeleton className="h-8 w-full rounded bg-foreground/20" />
                  </Skeleton>
                </Skeleton>
              ))}
            </div>
          )}

          {!loading && businessListings.length === 0 && (
            <Empty className="col-span-full border border-foreground/30 p-8 text-foreground/50 shadow-sm">
              <EmptyHeader>
                <EmptyDescription className="text-center text-sm text-foreground/50">
                  {t("not_found", "No business listings found")}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="default"
                  disabled
                  onClick={() => navigate("/business/create")}
                  className="inline-flex items-center gap-2"
                >
                  <Plus />
                  <span>{t("new_listing", "New business listing")}</span>
                </Button>
              </EmptyContent>
            </Empty>
          )}

          {!loading &&
            businessListings.map((item, index) => {
              return (
                <Card
                  key={index}
                  className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden"
                  size="sm"
                >
                  <Badge
                    className="absolute start-4 top-4 z-20"
                    variant="secondary"
                  >
                    {item.cat}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="absolute end-4 top-4 z-20"
                    >
                      <Button
                        variant="ghost" size="icon-sm"
                        aria-label={t("more_actions", "More actions")}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        <MoreVertical />
                        <span className="sr-only">Open actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        variant="destructive"
                        // disabled
                        // aria-disabled
                        onClick={() => handleDeleteBusinessListing(item)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <CardHeader className="p-0 gap-0">
                    {/* image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center z-10 aspect-video w-full justify-center bg-background/50 text-foreground/30">
                        {t("no_image", "No image")}
                      </div>
                    )}
                  </CardHeader>

                  {/* body */}
                  <CardHeader>
                    <CardTitle className="font-semibold leading-tight text-foreground/90">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.desc && (
                      <CardDescription>
                        {item.desc}
                      </CardDescription>
                    )}

                    {/* 
                  {item.location && (
                    <p className="text-xs text-foreground/50">
                      {item.location.coordinates[0]?.toFixed?.(5)} •{" "}
                      {item.location.coordinates[1]?.toFixed?.(5)}
                    </p>
                  )} */}

                  </CardContent>
                  <CardFooter className="w-full">
                    {/* <div className="text-xs text-foreground/50">
                    {item.updatedAt?.toDate
                      ? new Date(item.updatedAt.toDate()).toLocaleString()
                      : ""}
                  </div> */}
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    // onClick={() => navigate(`/business/listing/${item._id}`)}
                    >
                      <Pencil />
                      <span>{t("edit", "Edit")}</span>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      </div>
    </>
  );
}

export function BusinessCreate() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(businessCreateSchema),
    defaultValues: defaultBusinessValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    trigger,
    // watch,
    getValues,
    setValue,
    formState: { /*errors*/ },
  } = form;

  // const category = watch("cat");
  // const plan = watch("pack");

  const stepTitle = [
    t("businessCreate.steps.type", "What type of business do you want to list?"),
    t("businessCreate.steps.identity", "Business identity and contact information"),
    t("businessCreate.steps.details", "Business details"),
    t("businessCreate.steps.media", "Photos & media"),
    t("businessCreate.steps.plan", "Choose your visibility plan"),
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

  const changePlan = (nextPlan: BusinessCreateValues["pack"]) => {
    const entitlements = BUSINESS_PLANS[nextPlan];
    const currentPhotos = getValues("photos") ?? [];

    // Keep only the number of photos permitted by the new plan.
    if (currentPhotos.length > entitlements.photos) {
      setValue(
        "photos",
        currentPhotos?.slice(0, entitlements.photos),
        { shouldValidate: true },
      );
    }

    if (!entitlements.video) {
      setValue("videoFile", undefined, {
        shouldValidate: true,
      });
    }

    setValue("pack", nextPlan, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: BusinessCreateValues) => {
    setSubmitting(true);

    try {
      const { photos, videoFile, ...businessData } = values;

      // 1. Convert all photo files to Base64 strings in parallel
      const base64Photos = await Promise.all(
        photos.map((photo) => fileToBase64(photo))
      );

      // 2. Convert video file if it exists
      let base64Video = null;
      if (videoFile) {
        base64Video = await fileToBase64(videoFile);
      }

      // 3. Build a pure JavaScript object payload
      const payload = {
        ...businessData,
        photos: base64Photos, // Now an array of Base64 strings
        video: base64Video,   // A Base64 string or null
      };

      // 4. Send the pure JSON payload to your Hono server
      await createBusinessListing(payload);

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
        return (
          <BusinessPlanStep title={stepTitle}
            onPlanChange={changePlan}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <HeaderBar
        title={t("title")}
        description={t("description")}
      // onReset={handleReset}
      />
      <div className="pt-24 pb-8">
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-3xl space-y-6"
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
      </div>
    </>
  );
}