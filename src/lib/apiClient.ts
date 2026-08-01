type ApiErrorPayload = {
  success: false;
  error?: {
    message?: string;
    code?: string;
  };
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function joinUrl(path: string) {
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(joinUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: T | ApiErrorPayload | undefined;
  if (text) {
    try {
      payload = JSON.parse(text) as T | ApiErrorPayload;
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | undefined;
    throw new Error(
      errorPayload?.error?.message ??
        (text || `Request failed with status ${response.status}`),
    );
  }

  return payload as T;
}

export function apiPath(path: string) {
  return joinUrl(path);
}