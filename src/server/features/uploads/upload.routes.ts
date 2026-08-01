import { Hono } from "hono";
import { ok, fail } from "../../http/response";
import { getAdminStorage } from "../../firebase/admin";
import { env } from "../../config/env";

export const uploadRoutes = new Hono();

uploadRoutes.post("/image", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "uploads");

  if (!(file instanceof File)) {
    return fail(c, 400, "BAD_REQUEST", "Missing file upload");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getAdminStorage().bucket();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;
  const remote = bucket.file(path);

  await remote.save(buffer, {
    contentType: file.type || "application/octet-stream",
    resumable: false,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  const [url] = await remote.getSignedUrl({
    action: "read",
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
  });

  return ok(c, {
    url,
    path,
    bucket: bucket.name,
    production: env.NODE_ENV === "production",
  });
});
