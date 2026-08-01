export function parseCookie(header: string | null | undefined, name: string) {
  if (!header) return null;
  const parts = header.split(";").map((part) => part.trim());
  for (const part of parts) {
    const [key, ...valueParts] = part.split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return null;
}

export function cookieHeader(options: {
  name: string;
  value: string;
  maxAgeSeconds: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  path?: string;
}) {
  const attrs = [
    `${options.name}=${encodeURIComponent(options.value)}`,
    `Max-Age=${options.maxAgeSeconds}`,
    `Path=${options.path ?? "/"}`,
    `SameSite=${options.sameSite ?? "Lax"}`,
  ];

  if (options.httpOnly !== false) attrs.push("HttpOnly");
  if (options.secure) attrs.push("Secure");

  return attrs.join("; ");
}
