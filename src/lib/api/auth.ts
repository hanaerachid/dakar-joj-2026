import { apiRequest } from "../apiClient";
import type { SessionUser } from "../../shared/contracts";

export async function login(email: string, password: string) {
  return apiRequest<{ success: true; data: SessionUser }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string, displayName?: string) {
  return apiRequest<{ success: true; data: SessionUser }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function logout() {
  return apiRequest<{ success: true; data: { success: true } }>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function resetPassword(email: string) {
  return apiRequest<{ success: true; data: { sent: true } }>("/api/v1/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function currentUser() {
  return apiRequest<{ success: true; data: SessionUser | null }>("/api/v1/auth/me");
}
