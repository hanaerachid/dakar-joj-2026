// src/auth/useRole.ts
import { useUser } from "@clerk/clerk-react";
import { normalizeRole } from "../roles";

export function useRole() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  const role = clerkLoaded
    ? normalizeRole(clerkUser?.publicMetadata?.role)
    : undefined;

  return {
    role,
    loading: !clerkLoaded,
  };
}
