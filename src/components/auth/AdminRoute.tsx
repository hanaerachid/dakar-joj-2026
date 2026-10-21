// src/auth/AdminRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useRole } from "../../auth/hooks/useRole";
import type { JSX } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, loading } = useRole();
  const loc = useLocation();
  const redirectUrl = `${loc.pathname}${loc.search}${loc.hash}`;
  const searchParams = new URLSearchParams({
    redirect_url: redirectUrl,
  });

  if (!isLoaded || loading) {
    return (
      <Card
        size="default"
        className="w-full h-[100dvh] flex items-center justify-center"
      >
        <CardContent>
          <CardDescription>
            Checking access…
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Navigate to={`/sign-in?${searchParams.toString()}`} replace state={{ from: loc }} />
    );
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
