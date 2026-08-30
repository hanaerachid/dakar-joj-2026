import { randomBytes } from "node:crypto";
import { env } from "../../config/env.js";
import { getAdminAuth } from "../../firebase/admin.js";
import { getMongoDatabase } from "../../mongodb/client.js";
import { cookieHeader } from "../../lib/http.js";
import { HttpError } from "../../http/errors.js";
import {
  sessionUserSchema,
  type SessionUser,
  type AppRole,
} from "../../../shared/contracts.js";
import { normalizeRole } from "../../../auth/roles.js";

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
  const users = (await getMongoDatabase()).collection<any>("users");
  const now = new Date();
  const existing = await users.findOne({ _id: user.uid });
  const existingRole = normalizeRole(existing?.role ?? "standard");
  const nextRole = normalizeRole(user.role ?? existingRole ?? "standard");

  const result = await users.updateOne(
    { _id: user.uid },
    {
      $setOnInsert: {
        _id: user.uid,
        _firestorePath: `users/${user.uid}`,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: nextRole,
        createdAt: now,
      },
      $set: {
        updatedAt: now,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: nextRole,
      },
    },
    { upsert: true },
  );

  if (result.upsertedCount > 0) {
    return;
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
    role: "standard",
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
    role: "standard",
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
  const profile = await (await getMongoDatabase())
    .collection<any>("users")
    .findOne({ _id: decoded.uid });
  const user = sessionUserSchema.parse({
    uid: record.uid,
    email: record.email ?? null,
    displayName: record.displayName ?? null,
    photoURL: record.photoURL ?? null,
    role: normalizeRole(profile?.role ?? "standard"),
  });
  return user;
}

export function createApiKeyForUser(uid: string, role: AppRole = "standard") {
  return {
    apiKey: randomBytes(24).toString("hex"),
    role: normalizeRole(role),
    uid,
  };
}

export async function setUserRole(uid: string, role: AppRole) {
  const normalized = normalizeRole(role);
  const users = (await getMongoDatabase()).collection<any>("users");
  await users.updateOne(
    { _id: uid },
    { $set: { role: normalized, updatedAt: new Date() } },
    { upsert: true },
  );
  return normalized;
}

export async function resetPassword(email: string) {
  await identityToolkit("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email,
  });
}
