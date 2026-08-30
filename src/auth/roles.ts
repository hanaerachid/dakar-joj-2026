export type AppRole = "standard" | "business" | "admin";

export function normalizeRole(value: unknown): AppRole {
  const role = String(value ?? "").trim().toLowerCase();
  if (role === "admin" || role === "business" || role === "standard") {
    return role;
  }

  if (role === "user") {
    return "standard";
  }

  return "standard";
}
