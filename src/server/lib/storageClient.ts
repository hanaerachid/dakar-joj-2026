import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const accountId = env.R2_ACCOUNT_ID;

export const storageClient = new S3Client({
  region: "auto",
  endpoint: accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : undefined,
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const R2_BUCKET = env.R2_BUCKET_NAME ?? "";
