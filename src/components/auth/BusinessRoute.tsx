// src/auth/BusinessRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import type { JSX } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

export default function BusinessRoute({ children }: { children: JSX.Element }) {
  const { isSignedIn, isLoaded } = useAuth();
  const loc = useLocation();
  const redirectUrl = `${loc.pathname}${loc.search}${loc.hash}`;
  
  if (!isLoaded)
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
  if (!isSignedIn)
    return (
      <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} replace state={{ from: loc }} />
    );
  return children;
}
