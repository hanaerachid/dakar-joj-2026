import { useOnboarding } from "./onboarding-provider";
import { WelcomeScreen } from "./WelcomeScreen";

export function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isOpen } = useOnboarding();

  if (!isReady) return <>Hello</>;

  if (isOpen) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
}