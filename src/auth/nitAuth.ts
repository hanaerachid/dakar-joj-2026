// src/auth/initAuth.ts
import type { SessionUser } from "../shared/contracts";
import { ensureSessionLoaded, subscribeSession } from "./session";

export function initAuth(onReady?: (user: SessionUser | null, role?: string) => void) {
  void ensureSessionLoaded().then((user) => onReady?.(user, user?.role));
  return subscribeSession((user) => onReady?.(user, user?.role));
}
