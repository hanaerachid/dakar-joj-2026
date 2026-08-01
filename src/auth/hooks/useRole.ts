// src/auth/useRole.ts
import { useEffect, useState } from "react";
import { ensureSessionLoaded, subscribeSession } from "../session";

export function useRole() {
  const [role, setRole] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ensureSessionLoaded();
    const unsub = subscribeSession((user) => {
      setRole(user?.role);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  return { role, loading };
}
