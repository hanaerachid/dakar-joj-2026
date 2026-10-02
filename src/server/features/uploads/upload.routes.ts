import { Hono } from "hono";
import { ok, fail } from "../../http/response.js";
import { getAdminStorage } from "../../firebase/admin.js";
import { env } from "../../config/env.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storageClient, R2_BUCKET } from "../../lib/storageClient.js";
import { requireAuth } from "../../middleware/auth.js";

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

uploadRoutes.post("/presign", async (c) => {
  const denied = requireAuth(c);
  if (denied) return denied;

  const body = await c.req.json<{
    filename: string;
    contentType: string;
  }>();

  const { filename, contentType } = body;
  const user = c.get("user");
  const extensionByType: Record<string, string> = {
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/ogg": "ogg",
    "video/webm": "webm",
  };
  const extension = extensionByType[contentType];

  if (
    typeof filename !== "string" ||
    filename.length < 1 ||
    filename.length > 255 ||
    !extension
  ) {
    return fail(c, 400, "BAD_REQUEST", "Unsupported media content type");
  }

  if (!user || !R2_BUCKET || !process.env.R2_ACCOUNT_ID ||
      !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    return fail(c, 503, "STORAGE_NOT_CONFIGURED", "Media storage is not configured");
  }

  const key = `users/${user.uid}/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  let url: string;
  try {
    url = await getSignedUrl(storageClient, command, { expiresIn: 60 * 5 });
  } catch (error) {
    console.error("Failed to create R2 upload URL:", error);
    return fail(c, 503, "STORAGE_UNAVAILABLE", "Unable to prepare media upload");
  }

  return ok(c, { url, path: key });
});
