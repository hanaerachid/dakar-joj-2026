// src/App.tsx
import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { enUS, frFR, esES } from "@clerk/localizations";
import { shadcn } from "@clerk/ui/themes";
import MapPage from "./pages/map/MapPage";
import AdminRoute from "./components/auth/AdminRoute";
import AddPlaceFull from "./admin/places/AddPlaceFull";
import { PlacesListPage } from "./admin/places/PlacesList";
import { PlaceDetailsPage } from "./admin/places/PlacesDetails";
import { TorchPage, AddTorchPage, EditTorchPage } from "./pages/torch/TorchPage";
import { PricingPage } from "./pages/pricing";
import { BusinessCreate } from "./pages/business";
import "./App.css";
import BulkPlacesImport from "./admin/places/BulkPlacesImport";
import { ThemeProvider } from "@/components/theme-provider";
import { ModalProvider } from "@/components/modal-provider";
import { PanelProvider } from "@/components/panel-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StateProvider } from "@/components/state-provider";
import { ArrowLeft, Plus } from "lucide-react";
import { setApiAuthTokenProvider } from "./lib/apiClient";
import { useTranslation } from "react-i18next";
import { HeaderBar } from "@/components/header/HeaderBar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

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

function AdminShell() {
  const { t } = useTranslation();
  return (
    <>
      <HeaderBar
        showLogo={false}
        backButton={
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  // className={navigationMenuTriggerStyle()}
                  render={<Link
                    to="/"
                    className="inline-flex items-center gap-2 py-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("back_to_map", "Back to Map")}
                  </Link>}
                >
                  Places
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        }
        title={t("admin_panel", "Admin Panel")}
      >
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                // className={navigationMenuTriggerStyle()}
                render={<Link
                  to="/admin/torch"
                  className="inline-flex items-center gap-2 py-2"
                />}
              >
                {t("torch_stops", "Torch Stops")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                // className={navigationMenuTriggerStyle()}
                render={<Link
                  to="/admin/places"
                  className="inline-flex items-center gap-2 py-2"
                />}
              >
                {t("places", "Places")}
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                // className={navigationMenuTriggerStyle()}
                render={
                  <Link
                    to="/admin/places/new"
                    className="inline-flex items-center gap-2 py-2"
                  />
                }
              >
                <Plus className="h-4 w-4" />
                {t("new_place", "New place")}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </HeaderBar>
      <div className="pt-12">
        <Outlet />
      </div>
    </>
  );
}

export default function App() {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { i18n } = useTranslation();
  const language = i18n.language.split("-")[0] as SupportedLanguage;
  const localization = localizations[language] ?? localizations.en;

  const appRoutes = (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
      <StateProvider>
        <ModalProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PanelProvider>
                  <MapPage />
                </PanelProvider>
              }
            />

            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/business/create" element={<BusinessCreate />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminShell />
                </AdminRoute>
              }
            >
              <Route path="torch" element={<TorchPage />} />
              <Route path="torch/new" element={<AddTorchPage />} />
              <Route path="torch/:torchStopId" element={<EditTorchPage />} />
              <Route index element={<Navigate to="places" replace />} />
              <Route path="places" element={<PlacesListPage />} />
              <Route path="places/import" element={<BulkPlacesImport />} />
              <Route path="places/new" element={<AddPlaceFull />} />
              <Route path="places/:zoneId/:placeId" element={<PlaceDetailsPage />} />
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
    <ClerkProvider
      localization={localization}
      appearance={{
        theme: shadcn,
      }}
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
    >
      <ClerkApiAuthBridge />
      {appRoutes}
    </ClerkProvider>
  );
}
