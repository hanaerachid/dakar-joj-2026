import type { Context } from "hono";

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export function ok<T>(c: Context, data: T, status = 200) {
  return c.json<ApiSuccess<T>>({ success: true, data }, status as any);
}

export function fail(
  c: Context,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return c.json<ApiError>(
    { success: false, error: { code, message, details } },
    status as any,
  );
}