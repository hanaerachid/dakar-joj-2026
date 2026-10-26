import { Trans, useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOnboarding } from "./onboarding-provider";
import { LogoBrand } from "./header/LogoBrand";

export function WelcomeScreen() {
  const {
    currentStep,
    totalSteps,
    next,
    back,
    skip,
    finish,
  } = useOnboarding();
  const { t } = useTranslation();

  const slides = [
    {
      eyebrow: t("onboarding.onboarding_eyebrow_1", "WELCOME TO TERANGAMAP"),
      title: t("onboarding.onboarding_title_1", "Start the journey."),
      description: (
        <span>
          <Trans
            i18nKey="onboarding.onboarding_description_1"
            defaultValue="Navigate and find your way around with ease. By continuing, you agree to our <terms>Terms of Service</terms>."
            components={{
              terms: (
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-foreground underline underline-offset-4"
                />
              ),
            }}
          />
        </span>
      ),
      illustration: "/illustrations/onboarding-1.svg",
      color: "var(--accent-color-1)",
    },
    {
      eyebrow: t("onboarding.onboarding_eyebrow_2", "EXPLORE THE LOCAL HIGHLIGHTS"),
      title: t("onboarding.onboarding_title_2", "Find events happening around you."),
      description: t(
        "onboarding.onboarding_description_2",
        "Discover the best of what your area has to offer."
      ),
      illustration: "/illustrations/onboarding-2.svg",
      color: "var(--accent-color-2)",
    },
    {
      eyebrow: t("onboarding.onboarding_eyebrow_3", "FIND YOUR WAY"),
      title: t("onboarding.onboarding_title_3", "Your destination within reach."),
      description: t(
        "onboarding.onboarding_description_3",
        "Itinerary, places, services in complete simplicity."
      ),
      illustration: "/illustrations/onboarding-3.svg",
      color: "var(--accent-color-3)",
    },
  ];

  const slide = slides[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const illustration = slide.illustration;

  return (
    <main className="fixed inset-0 z-[200] flex h-full flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <LogoBrand logoSrc="/logo.svg" />
        </div>
      </header>

      {/* Main content */}
      <section
        key={currentStep}
        aria-live="polite"
        className="flex-1 h-full flex flex-col gap-2 items-center justify-center px-6 py-2 text-center animate-in fade-in duration-300 overflow-y-auto"
      >
        {/* Illustration */}
        <div
          className={`my-4 size-64 sm:size-64 flex items-center justify-center`}
          aria-hidden="true"
        >
            <img src={illustration} alt="Illustration" className="size-64 sm:size-64" />
        </div>

        {/* Text */}
        <div className="flex-1 space-y-2 max-w-sm">
          <p
            className={`text-xs/7 font-bold tracking-tight uppercase`}
            style={{ color: slides[currentStep].color }}
          >
            {slide.eyebrow}
          </p>

          <h1 className="text-3xl/8 font-bold tracking-tight sm:text-5xl">
            {slide.title}
          </h1>

          <p className="mx-auto max-w-lg text-base/5 text-muted-foreground sm:text-lg">
            {slide.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="space-y-2 shrink-0">
          {!isLastStep && (
            <Button variant="outline" size="sm" onClick={skip}>
              {t("common.skip_intro", "Skip intro")}
            </Button>
          )}
          <div
            className="shrink-0 mt-9 flex items-center justify-center gap-2"
            role="group"
            aria-label="Onboarding progress"
          >

            {slides.slice(0, totalSteps).map((item, index) => (
              <span
                key={item.eyebrow}
                aria-current={index === currentStep ? "step" : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                  ? `w-7`
                  : "w-2"
                  }`}
                style={{ backgroundColor: index === currentStep ? slides[currentStep].color : "var(--muted-foreground)" }}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentStep + 1} {t("common.of", "of")} {totalSteps}
          </div>

        </div>
      </section>

      {/* Footer */}
      <div className="sticky bottom-0">
      <Separator />
      <footer className="w-full flex items-center justify-end gap-4 px-6 py-5 sm:px-10">
        {currentStep > 0 && (
          <Button variant="ghost" onClick={back}>
            {t("common.back", "Back")}
          </Button>
        )}

        <Button
          onClick={isLastStep ? finish : next}
          className="min-w-30"
        >
          {isLastStep ? t("common.get_started", "Get started") : t("common.continue", "Continue")}
          {isLastStep ? (
            <Check className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </Button>
      </footer>
      </div>
    </main>
  );
}