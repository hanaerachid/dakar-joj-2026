import { z } from "zod";
import { Hono } from "hono";
import { attachSessionUser } from "../../middleware/auth.js";
import { ok } from "../../http/response.js";
import {
  authCredentialsSchema,
  authRegisterSchema,
  authResetSchema,
} from "../../../shared/contracts.js";
import { cookieHeader, parseCookie } from "../../lib/http.js";
import { env } from "../../config/env.js";
import {
  createApiKeyForUser,
  currentSessionUser,
  registerWithEmail,
  resetPassword,
  signInWithEmail,
  setUserRole,
} from "./auth.service.js";
import { normalizeRole } from "../../../auth/roles.js";

export const authRoutes = new Hono();

authRoutes.use("*", attachSessionUser);

authRoutes.get("/me", (c) => {
  const user = c.get("user");
  if (!user) return c.json({ success: true, data: null }, 200);
  return ok(c, user);
});

authRoutes.post("/login", async (c) => {
  const { email, password } = authCredentialsSchema.parse(await c.req.json());
  const { user, sessionCookie } = await signInWithEmail(email, password);
  c.header(
    "Set-Cookie",
    cookieHeader({
      name: env.SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAgeSeconds: env.SESSION_EXPIRES_DAYS * 24 * 60 * 60,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    }),
  );
  return ok(c, user);
});

authRoutes.post("/register", async (c) => {
  const { email, password, displayName } = authRegisterSchema.parse(
    await c.req.json(),
  );
  console.log("Registering user:", email, displayName);
  const { user, sessionCookie } = await registerWithEmail(
    email,
    password,
    displayName,
  );
  c.header(
    "Set-Cookie",
    cookieHeader({
      name: env.SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAgeSeconds: env.SESSION_EXPIRES_DAYS * 24 * 60 * 60,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    }),
  );
  return ok(c, user, 201);
});

authRoutes.post("/logout", (c) => {
  c.header(
    "Set-Cookie",
    cookieHeader({
      name: env.SESSION_COOKIE_NAME,
      value: "",
      maxAgeSeconds: 0,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    }),
  );
  return ok(c, { success: true });
});

authRoutes.post("/api-key", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      401,
    );
  }

  const role = normalizeRole(user.role ?? "standard");
  const { apiKey } = createApiKeyForUser(user.uid, role);

  const { getMongoDatabase } = await import("../../mongodb/client.js");
  const users = (await getMongoDatabase()).collection<any>("users");
  await users.updateOne(
    { _id: user.uid },
    { $set: { apiKey, role, updatedAt: new Date() } },
    { upsert: true },
  );

  return ok(c, { apiKey, role, uid: user.uid });
});

authRoutes.post("/role", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      401,
    );
  }

  const body = z.object({ role: z.enum(["standard", "business", "admin"]) }).parse(
    await c.req.json(),
  );
  const role = normalizeRole(body.role);

  if (user.role !== "admin" && role !== user.role) {
    return c.json(
      { success: false, error: { code: "FORBIDDEN", message: "Role update not allowed" } },
      403,
    );
  }

  await setUserRole(user.uid, role);
  return ok(c, { role });
});

authRoutes.post("/reset-password", async (c) => {
  const { email } = authResetSchema.parse(await c.req.json());
  await resetPassword(email);
  return ok(c, { sent: true });
});

authRoutes.get("/verify", async (c) => {
  const cookie = parseCookie(c.req.header("cookie"), env.SESSION_COOKIE_NAME);
  if (!cookie) return c.json({ success: true, data: null }, 200);
  const user = await currentSessionUser(cookie);
  return ok(c, user);
});
