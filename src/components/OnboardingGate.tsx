import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useOnboarding } from "./onboarding-provider";
import { WelcomeScreen } from "./WelcomeScreen";

export function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInstalled } = usePWAInstall();
  const { isReady, isOpen } = useOnboarding();

  if (!isReady) return;

  if (isOpen && isInstalled) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
}