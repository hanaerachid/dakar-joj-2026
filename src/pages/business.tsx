import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { HeaderBar } from "../components/header/HeaderBar";

import {
  businessCreateSchema,
  defaultBusinessValues,
  type BusinessCreateValues,
} from "@/components/business/business-create.schema";

import {
  // BUSINESS_CATEGORIES,
  BUSINESS_PLANS,
  FORM_STEPS,
} from "@/components/business/business-create.config";

import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { BusinessTypeStep } from "@/components/business/steps/BusinessTypeStep";
import { BusinessIdentityStep } from "@/components/business/steps/BusinessIdentityStep";
import { BusinessDetailsStep } from "@/components/business/steps/BusinessDetailsStep";
import { BusinessMediaStep } from "@/components/business/steps/BusinessMediaStep";
import { BusinessPlanStep } from "@/components/business/steps/BusinessPlanStep";
import { createBusinessListing } from "@/lib/api/submitBusinessListing";

const STEP_FIELDS: Record<number, (keyof BusinessCreateValues)[]> = {
  0: ["cat"],
  1: ["name", "tel", "email"],
  2: ["address", "desc", "openHours", "spec"],
  3: ["photos", "videoFile", "priceTag"],
  4: ["pack"],
};

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
      const payload = new FormData();

      // Serialize the regular form data.
      const {
        photos,
        videoFile,
        ...businessData
      } = values;

      payload.append(
        "business",
        JSON.stringify(businessData),
      );

      photos.forEach((photo) => {
        payload.append("photos", photo);
      });

      if (videoFile) {
        payload.append("video", videoFile);
      }

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