import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type PWAInstallState = {
  canInstall: boolean;
  isInstalled: boolean;
  install: () => Promise<boolean>;
};

export function usePWAInstall(): PWAInstallState {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check whether the app is already running as an installed PWA.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone ===
          true);

    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the browser from automatically showing its install prompt.
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    await installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    // The prompt can only be used once.
    setInstallPrompt(null);

    if (outcome === "accepted") {
      setIsInstalled(true);
      return true;
    }

    return false;
  }, [installPrompt]);

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    install,
  };
}
