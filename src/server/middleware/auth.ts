import type { Context, Next } from "hono";
import { getAdminAuth, getAdminFirestore } from "../firebase/admin";
import { env } from "../config/env";
import { parseCookie } from "../lib/http";
import type { SessionUser } from "../../shared/contracts";

async function getSessionUser(token: string): Promise<SessionUser | null> {
  try {
    const decoded = await getAdminAuth().verifySessionCookie(token, true);
    const userRecord = await getAdminAuth().getUser(decoded.uid);
    const profileSnap = await getAdminFirestore().collection("users").doc(decoded.uid).get();
    const role = (profileSnap.data()?.role as string | undefined) ?? "user";

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

export async function attachSessionUser(c: Context, next: Next) {
  const cookie = parseCookie(
    c.req.header("cookie"),
    env.SESSION_COOKIE_NAME,
  );

  const bearer = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const token = cookie ?? bearer ?? null;
  if (token) {
    const user = await getSessionUser(token);
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
