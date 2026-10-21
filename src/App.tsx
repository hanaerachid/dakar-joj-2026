// src/App.tsx
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { enUS, frFR, esES } from "@clerk/localizations";
import { shadcn } from "@clerk/ui/themes";
import MapPage from "./pages/map/MapPage";
import AdminRoute from "./components/auth/AdminRoute";
import BusinessRoute from "./components/auth/BusinessRoute";
import AddPlaceFull from "./admin/places/AddPlaceFull";
import { BusinessPage4Admin } from "./pages/BusinessPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { PlacesListPage } from "./admin/places/PlacesList";
import { PlaceDetailsPage } from "./admin/places/PlacesDetails";
import { TorchPage, AddTorchPage, EditTorchPage } from "./pages/torch/TorchPage";
import { EventPage, AddEventPage, EditEventPage } from "./pages/events/EventPage";
import { PricingPage } from "./pages/pricing";
import { SignInPage, SignUpPage } from "./pages/auth";
import { BusinessCreate, BusinessPage, BusinessEdit } from "./pages/business";
import "./App.css";
import BulkPlacesImport from "./admin/places/BulkPlacesImport";
import { OnboardingGate } from "@/components/OnboardingGate";
import { ThemeProvider } from "@/components/theme-provider";
import { ModalProvider } from "@/components/modal-provider";
import {NavbarProvider } from "@/components/navbar-provider";
import { OnboardingProvider } from "@/components/onboarding-provider";
import { PanelProvider } from "@/components/panel-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StateProvider } from "@/components/state-provider";
import { setApiAuthTokenProvider } from "./lib/apiClient";
import { useTranslation } from "react-i18next";
import { AdminShell } from "./components/admin/AdminShell";
import { BusinessShell } from "./components/business/BusinessShell";
import { TermsOfService } from "./pages/TermsOfService";

const localizations = {
  en: enUS,
  fr: frFR,
  es: esES,
} as const;
type SupportedLanguage = keyof typeof localizations;

function ClerkApiAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setApiAuthTokenProvider(getToken);
    return () => setApiAuthTokenProvider(null);
  }, [getToken]);

  return null;
}

export default function App() {
  const navigate = useNavigate();
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { i18n } = useTranslation();
  const language = i18n.language.split("-")[0] as SupportedLanguage;
  const localization = localizations[language] ?? localizations.en;

  const appRoutes = (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
      <StateProvider>
        <ModalProvider>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />

            <Route
              path="/:tab"
              element={
                <MainApp />
              }
            />

            <Route path="/sign-in/*" element={<SignInPage/>} />
            <Route path="/sign-up/*" element={<SignUpPage/>} />

            <Route path="/pricing" element={<PricingPage />} />

            <Route path="/terms" element={<TermsOfService />} />

            <Route path="/business" element={
              <BusinessRoute>
                <BusinessShell />
              </BusinessRoute>
            }>
              <Route index element={<Navigate to="listings" replace />} />
              <Route path="listings" element={<BusinessPage />} />
              <Route path="listings/:id" element={<BusinessEdit />} />
              <Route path="create" element={<BusinessCreate />} />
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminShell />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="places" replace />} />
              <Route path="places" element={<PlacesListPage />} />
              <Route path="places/import" element={<BulkPlacesImport />} />
              <Route path="places/new" element={<AddPlaceFull />} />
              <Route path="places/:zoneId/:placeId" element={<PlaceDetailsPage />} />

              <Route path="events" element={<EventPage />} />
              <Route path="events/new" element={<AddEventPage />} />
              <Route path="events/:eventId" element={<EditEventPage />} />

              <Route path="torch" element={<TorchPage />} />
              <Route path="torch/new" element={<AddTorchPage />} />
              <Route path="torch/:torchStopId" element={<EditTorchPage />} />

              <Route path="listings" element={<BusinessPage4Admin />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />

            </Route>

            <Route path="*" element={<MapPage />} />
          </Routes>
        </ModalProvider>
      </StateProvider>
      </TooltipProvider>
    </ThemeProvider>
  );

  if (!clerkPublishableKey) {
    return appRoutes;
  }

  return (
    <OnboardingProvider totalSteps={3}>
    <ClerkProvider
      localization={localization}
      appearance={{
        theme: shadcn,
      }}
      publishableKey={clerkPublishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <ClerkApiAuthBridge />
      {appRoutes}
    </ClerkProvider>
    </OnboardingProvider>
  );
}

const VALID_TABS = ["home", "explorer", "events", "news", "pro"] as const;

function MainApp() {
  const { tab } = useParams();

  if (!VALID_TABS.includes(tab as (typeof VALID_TABS)[number])) {
    return <Navigate to="/home" replace />;
  }

  return (
    <NavbarProvider>
      <PanelProvider>
        <OnboardingGate>
          <MapPage />
        </OnboardingGate>
      </PanelProvider>
    </NavbarProvider>
  );
}
