import type { SessionUser } from "../shared/contracts";
import { login, logout, register, resetPassword as resetPasswordRequest } from "../lib/api/auth";
import { ensureSessionLoaded, getSessionUser, setSessionUser, subscribeSession } from "./session";
// import { auth } from "@/lib/firebase";

function mapAuthError(err: unknown): string {
  const code = (err as any)?.code ?? (err as Error)?.message ?? "";
  switch (code) {
    case "EMAIL_EXISTS":
    case "auth/email-already-in-use":
      return "That email is already registered.";
    case "INVALID_EMAIL":
    case "auth/invalid-email":
      return "Please enter a valid email.";
    case "auth/missing-password":
    case "auth/weak-password":
      return "Please use a stronger password (at least 6 characters).";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "EMAIL_NOT_FOUND":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "NETWORK_ERROR":
    case "auth/network-request-failed":
      return "Network error — check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signUp(email: string, password: string, displayName?: string) {
  try {
    const result = await register(email, password, displayName);
    setSessionUser(result.data);
    return result.data;
  } catch (err) {
    const msg = mapAuthError(err);
    throw new Error(msg);
  }
}

export async function signIn(email: string, password: string) {
  try {
    const result = await login(email, password);
    setSessionUser(result.data);
    return result.data;
  } catch (err) {
    const msg = mapAuthError(err);
    throw new Error(msg);
  }
}

export async function signOut() {
  await logout();
  setSessionUser(null);
}

export function subscribeAuth(cb: (user: SessionUser | null) => void) {
  return subscribeSession(cb);
}

export async function getIdToken(forceRefresh = false) {
  void forceRefresh;
  return getSessionUser() ? "session-cookie" : null;
}

export async function resetPassword(email: string) {
  try {
    await resetPasswordRequest(email);
  } catch (err) {
    const code = (err as any)?.code ?? (err as Error)?.message ?? "";
    const msg =
      code === "auth/user-not-found"
        ? "We couldn't find an account with that email."
        : code === "auth/invalid-email"
        ? "Please enter a valid email."
        : code === "auth/missing-email"
        ? "Please enter your email."
        : code === "auth/too-many-requests"
        ? "Too many attempts. Try again later."
        : "Something went wrong. Please try again.";
    throw new Error(msg);
  }
}

export function initAuth(onReady?: (user: SessionUser | null, role?: string) => void) {
  void ensureSessionLoaded().then((user) => onReady?.(user, user?.role));
  return subscribeSession((user) => onReady?.(user, user?.role));
}
