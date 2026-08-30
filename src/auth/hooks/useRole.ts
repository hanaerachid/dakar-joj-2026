// src/auth/useRole.ts
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { normalizeRole, type AppRole } from "../roles";
import { ensureSessionLoaded, subscribeSession } from "../session";

export function useRole() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [role, setRole] = useState<AppRole | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ensureSessionLoaded();
    const unsub = subscribeSession((user) => {
      const nextRole = normalizeRole(
        user?.role ?? clerkUser?.publicMetadata?.role ?? "standard",
      );
      setRole(nextRole);
      setLoading(false);
    });

    if (clerkLoaded) {
      const nextRole = normalizeRole(
        clerkUser?.publicMetadata?.role ?? "standard",
      );
      setRole(nextRole);
      setLoading(false);
    }

    return () => {
      unsub();
    };
  }, [clerkLoaded, clerkUser?.publicMetadata?.role]);

  return { role, loading };
}
