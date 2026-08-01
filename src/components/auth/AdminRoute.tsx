// src/auth/AdminRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../../auth/hooks/useRole";
import type { JSX } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { role, loading } = useRole();
  const loc = useLocation();
  if (loading)
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
  if (role !== "admin")
    return <Navigate to="/" replace state={{ from: loc }} />;
  return children;
}
