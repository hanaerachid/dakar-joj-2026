import type { SessionUser } from "../shared/contracts";

type Listener = (user: SessionUser | null) => void;

const listeners = new Set<Listener>();
let currentUser: SessionUser | null = null;
let loaded = false;
let loadPromise: Promise<SessionUser | null> | null = null;

function emit(user: SessionUser | null) {
  currentUser = user;
  loaded = true;
  for (const listener of listeners) listener(user);
}

async function fetchSessionUser() {
  const response = await fetch("/api/v1/auth/me", { credentials: "include" });
  const payload = (await response.json().catch(() => null)) as
    | { success: true; data: SessionUser | null }
    | null;
  const user = payload?.data ?? null;
  emit(user);
  return user;
}

export function getSessionUser() {
  return currentUser;
}

export function isSessionLoaded() {
  return loaded;
}

export function ensureSessionLoaded() {
  if (!loadPromise) {
    loadPromise = fetchSessionUser();
  }
  return loadPromise;
}

export function subscribeSession(listener: Listener) {
  listeners.add(listener);
  if (loaded) listener(currentUser);
  return () => listeners.delete(listener);
}

export function setSessionUser(user: SessionUser | null) {
  emit(user);
}
