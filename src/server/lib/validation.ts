import type { ZodTypeAny } from "zod";

export async function parseJson<T extends ZodTypeAny>(
  request: Request,
  schema: T,
) {
  const body = await request.json().catch(() => null);
  return schema.parse(body) as ReturnType<T["parse"]>;
}
