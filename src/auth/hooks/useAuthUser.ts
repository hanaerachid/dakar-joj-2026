// src/hooks/useAuthUser.ts
import { useEffect, useState } from "react";
import type { SessionUser } from "../../shared/contracts";
import { ensureSessionLoaded, getSessionUser, subscribeSession } from "../session";

export function useAuthUser() {
  const [user, setUser] = useState<SessionUser | null>(getSessionUser());
  const [loading, setLoading] = useState<boolean>(!getSessionUser());

  useEffect(() => {
    void ensureSessionLoaded();
    const unsub = subscribeSession((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  return { user, loading };
}
