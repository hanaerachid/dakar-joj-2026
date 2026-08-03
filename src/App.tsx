// src/App.tsx
import { Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import MapPage from "./pages/map/MapPage";
import AdminRoute from "./components/auth/AdminRoute";
import AddPlaceFull from "./admin/places/AddPlaceFull";
import { PlacesListPage } from "./admin/places/PlacesList";
import { PlaceDetailsPage } from "./admin/places/PlacesDetails";
import "./App.css";
import { useEffect, useState } from "react";
import { initAuth } from "./auth/nitAuth";
import BulkPlacesImport from "./admin/places/BulkPlacesImport";
import { ThemeProvider } from "@/components/theme-provider"
import { ModalProvider } from "./components/modal-provider";
import { PanelProvider } from "./components/panel-provider";
import { TooltipProvider } from "@/components/ui/tooltip"
import { ArrowLeft, Plus } from "lucide-react";

function AdminShell() {
  return (
    <div className="w-full h-[100dvh] bg-background overflow-auto">
      <div
        className="sticky top-0 z-20 w-full mx-auto gap-2 sm:gap-4
          bg-background backdrop-blur-sm supports-[backdrop-filter]:bg-background/70
          px-2 sm:px-4 py-1.5 sm:py-2 shadow-md"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded px-3 py-1 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <ArrowLeft className="h-4 w-4" />
              <span>
            Back to Map
              </span>
          </Link>

          <div className="ml-auto flex gap-2">
            <Link
              to="/admin/places"
              className="rounded px-3 py-1 hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              Places
            </Link>

            <Link
              to="/admin/places/new"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background uppercase font-semibold text-sm px-3 py-1 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
            >
              <Plus className="h-4 w-4" />
              <span>
              New place
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="p-2">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Call once on mount
    initAuth((user, r) => {
      console.log("[initAuth] user:", user?.uid, "role:", r);
      console.log("[initAuth] role:", role);
      setRole(r);
    });
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <TooltipProvider>
    <ModalProvider>
    <Routes>
      <Route path="/" element={
        <PanelProvider>
          <MapPage />
        </PanelProvider>
      } />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }
      >
        {/* /admin -> /admin/places */}
        <Route index element={<Navigate to="places" replace />} />
        <Route path="places" element={<PlacesListPage />} />
        <Route path="places/import" element={<BulkPlacesImport />} />
        <Route path="places/new" element={<AddPlaceFull />} />
        <Route path="places/:zoneId/:placeId" element={<PlaceDetailsPage />} />
      </Route>

      {/* catch-all */}
      <Route path="*" element={<MapPage />} />
    </Routes>
    </ModalProvider>
    </TooltipProvider>
    </ThemeProvider>
  );
}
