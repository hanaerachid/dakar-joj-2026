import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const ONBOARDING_STORAGE_KEY = "my-app:onboarding-complete";

type OnboardingContextValue = {
  isOpen: boolean;
  isReady: boolean;
  currentStep: number;
  totalSteps: number;
  next: () => void;
  back: () => void;
  skip: () => void;
  finish: () => void;
  restart: () => void;
};

const OnboardingContext =
  createContext<OnboardingContextValue | null>(null);

type OnboardingProviderProps = {
  children: ReactNode;
  totalSteps?: number;
};

export function OnboardingProvider({
  children,
  totalSteps = 3,
}: OnboardingProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const completed =
        localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";

      setIsOpen(!completed);
    } catch {
      // If storage is unavailable, still allow the app to work.
      setIsOpen(false);
    }

    setIsReady(true);
  }, []);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // Completion will only persist for the current app session.
    }

    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((step) =>
      Math.min(step + 1, totalSteps - 1)
    );
  }, [totalSteps]);

  const back = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const restart = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        isReady,
        currentStep,
        totalSteps,
        next,
        back,
        skip,
        finish,
        restart,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboarding must be used within OnboardingProvider"
    );
  }

  return context;
}