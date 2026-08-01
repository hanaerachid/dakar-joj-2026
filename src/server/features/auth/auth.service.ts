import { env } from "../../config/env";
import { getAdminAuth, getAdminFirestore } from "../../firebase/admin";
import { cookieHeader } from "../../lib/http";
import { HttpError } from "../../http/errors";
import { sessionUserSchema, type SessionUser } from "../../../shared/contracts";

const FIREBASE_IDENTITY_BASE = "https://identitytoolkit.googleapis.com/v1";

function requireFirebaseWebApiKey() {
  if (!env.FIREBASE_WEB_API_KEY) {
    throw new HttpError(
      503,
      "AUTH_NOT_CONFIGURED",
      "Firebase web API key is not configured. Set FIREBASE_WEB_API_KEY to enable email/password auth endpoints.",
    );
  }

  return env.FIREBASE_WEB_API_KEY;
}

async function identityToolkit<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${FIREBASE_IDENTITY_BASE}/${path}?key=${requireFirebaseWebApiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };

  if (!response.ok) {
    const message = payload?.error?.message ?? "Authentication failed";
    const code =
      message === "EMAIL_EXISTS"
        ? "EMAIL_EXISTS"
        : message === "EMAIL_NOT_FOUND"
        ? "EMAIL_NOT_FOUND"
        : message === "INVALID_PASSWORD"
        ? "INVALID_PASSWORD"
        : message === "USER_DISABLED"
        ? "USER_DISABLED"
        : message === "TOO_MANY_ATTEMPTS_TRY_LATER"
        ? "TOO_MANY_REQUESTS"
        : "AUTH_ERROR";

    const status =
      code === "EMAIL_EXISTS"
        ? 409
        : code === "EMAIL_NOT_FOUND" || code === "INVALID_PASSWORD" || code === "USER_DISABLED"
        ? 401
        : code === "TOO_MANY_REQUESTS"
        ? 429
        : 400;

    throw new HttpError(status, code, message);
  }

  return payload;
}

async function ensureUserProfile(user: SessionUser) {
  const ref = getAdminFirestore().collection("users").doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await ref.set({ updatedAt: new Date() }, { merge: true });
  }
}

async function createSessionCookie(idToken: string) {
  const expiresIn = env.SESSION_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  return getAdminAuth().createSessionCookie(idToken, { expiresIn });
}

export async function signInWithEmail(email: string, password: string) {
  const payload = await identityToolkit<{
    idToken: string;
    email: string;
    localId: string;
    displayName?: string;
    photoUrl?: string;
  }>("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });

  const user: SessionUser = sessionUserSchema.parse({
    uid: payload.localId,
    email: payload.email,
    displayName: payload.displayName ?? null,
    photoURL: payload.photoUrl ?? null,
    role: "user",
  });

  await ensureUserProfile(user);
  const sessionCookie = await createSessionCookie(payload.idToken);

  return { user, sessionCookie };
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string,
) {
  const created = await getAdminAuth().createUser({
    email,
    password,
    displayName: displayName?.trim() || undefined,
  });

  const payload = await identityToolkit<{
    idToken: string;
    email: string;
    localId: string;
    displayName?: string;
    photoUrl?: string;
  }>("accounts:signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });

  const user: SessionUser = sessionUserSchema.parse({
    uid: created.uid,
    email: payload.email,
    displayName: displayName ?? payload.displayName ?? null,
    photoURL: payload.photoUrl ?? null,
    role: "user",
  });

  await ensureUserProfile(user);
  const sessionCookie = await createSessionCookie(payload.idToken);
  return { user, sessionCookie };
}

export async function signOutSession() {
  return cookieHeader({
    name: env.SESSION_COOKIE_NAME,
    value: "",
    maxAgeSeconds: 0,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  });
}

export async function currentSessionUser(token: string) {
  const decoded = await getAdminAuth().verifySessionCookie(token, true);
  const record = await getAdminAuth().getUser(decoded.uid);
  const profile = await getAdminFirestore().collection("users").doc(decoded.uid).get();
  const user = sessionUserSchema.parse({
    uid: record.uid,
    email: record.email ?? null,
    displayName: record.displayName ?? null,
    photoURL: record.photoURL ?? null,
    role: (profile.data()?.role as string | undefined) ?? "user",
  });
  return user;
}

export async function resetPassword(email: string) {
  await identityToolkit("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}
