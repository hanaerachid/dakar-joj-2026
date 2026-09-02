import type { Context, Next } from "hono";
import { getAdminAuth } from "../firebase/admin.js";
import { getMongoDatabase } from "../mongodb/client.js";
import { env } from "../config/env.js";
import { parseCookie } from "../lib/http.js";
import { normalizeRole } from "../../auth/roles.js";
import type { SessionUser } from "../../shared/contracts.js";
import { createClerkClient, verifyToken } from "@clerk/backend";

const clerkClient = env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
  : null;

async function getSessionUser(token: string): Promise<SessionUser | null> {
  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true);
    const userRecord = await getAdminAuth().getUser(decoded.uid);
    const profile = await (await getMongoDatabase())
      .collection<any>("users")
      .findOne({ _id: decoded.uid });
    const role = normalizeRole(profile?.role ?? "standard");

    return {
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      displayName: userRecord.displayName ?? null,
      photoURL: userRecord.photoURL ?? null,
      role,
    };
  } catch {
    return null;
  }
}

async function getApiKeyUser(apiKey: string): Promise<SessionUser | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const profile = await (await getMongoDatabase())
      .collection<any>("users")
      .findOne({ apiKey });

    if (!profile) {
      return null;
    }

    return {
      uid: String(profile._id ?? profile.uid ?? profile.email ?? apiKey),
      email: profile.email ?? null,
      displayName: profile.displayName ?? null,
      photoURL: profile.photoURL ?? null,
      role: normalizeRole(profile.role ?? "standard"),
    };
  } catch {
    return null;
  }
}

async function getClerkUser(token: string): Promise<SessionUser | null> {
  if (!env.CLERK_SECRET_KEY) return null;

  try {
    const claims = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
    const clerkUser = await clerkClient?.users.getUser(claims.sub);
    const metadata = clerkUser?.publicMetadata ??
      (claims as { public_metadata?: { role?: unknown } }).public_metadata;

    return {
      uid: claims.sub,
      email: clerkUser?.primaryEmailAddress?.emailAddress ?? null,
      displayName: clerkUser?.fullName ?? null,
      photoURL: clerkUser?.imageUrl ?? null,
      role: normalizeRole(metadata?.role),
    };
  } catch {
    return null;
  }
}

export async function attachSessionUser(c: Context, next: Next) {
  const cookie = parseCookie(
    c.req.header("cookie"),
    env.SESSION_COOKIE_NAME,
  );

  const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const apiKey =
    c.req.query("api_key") ?? c.req.header("x-api-key") ?? null;
  const token = cookie ?? bearer ?? null;

  if (token) {
    const user = bearer
      ? (await getClerkUser(bearer)) ?? (await getSessionUser(token))
      : await getSessionUser(token);
    if (user) c.set("user", user);
  }

  if (!c.get("user") && apiKey) {
    const user = await getApiKeyUser(apiKey);
    if (user) c.set("user", user);
  }

  await next();
}

export function requireAuth(c: Context) {
  const user = c.get("user");
  if (!user) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      401,
    );
  }
  return null;
}

export function requireAdmin(c: Context) {
  const denied = requireAuth(c);
  if (denied) return denied;

  const user = c.get("user");
  if (user?.role !== "admin") {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Admin access required" },
      },
      403,
    );
  }

  return null;
}
