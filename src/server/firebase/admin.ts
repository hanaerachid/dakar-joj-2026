import admin from "firebase-admin";
import { cert, applicationDefault, getApps } from "firebase-admin/app";
import { env } from "../config/env.js";
import { HttpError } from "../http/errors.js";

function resolveProjectId() {
  return (
    env.FIREBASE_PROJECT_ID ??
    process.env.GOOGLE_CLOUD_PROJECT ??
    process.env.GCLOUD_PROJECT ??
    null
  );
}

function buildCredential() {
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };

      if (serviceAccount.client_email && serviceAccount.private_key) {
        return cert({
          projectId: serviceAccount.project_id ?? env.FIREBASE_PROJECT_ID,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        });
      }
    } catch {
      // Fall back to explicit env fields below.
    }
  }

  if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !env.FIREBASE_CLIENT_EMAIL && !env.FIREBASE_PRIVATE_KEY) {
    throw new HttpError(
      503,
      "AUTH_NOT_CONFIGURED",
      "Firebase admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY to enable auth and Firestore routes.",
    );
  }

  return applicationDefault();
}

export function getAdminApp() {
  if (!getApps().length) {
    const projectId = resolveProjectId();
    if (!projectId) {
      throw new HttpError(
        503,
        "AUTH_NOT_CONFIGURED",
        "Firebase project ID is not configured. Set FIREBASE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT/GCLOUD_PROJECT) to enable auth and Firestore routes.",
      );
    }

    admin.initializeApp({
      credential: buildCredential(),
      projectId,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
  }

  return admin.app();
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminStorage() {
  return getAdminApp().storage();
}

export { admin };