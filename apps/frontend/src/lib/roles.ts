import { useAuth } from "@clerk/nextjs";
import type { UserRole } from "./roles.types";

export function useRole(): UserRole {
  const { sessionClaims } = useAuth();
  return (sessionClaims?.metadata?.role as UserRole) ?? "user";
}

export function useIsAdmin(): boolean {
  const role = useRole();
  return role === "admin" || role === "mainadmin";
}

export function useIsSuperAdmin(): boolean {
  const role = useRole();
  return role === "mainadmin";
}

export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === "admin" || role === "mainadmin";
}

export function isSuperAdmin(role: UserRole | undefined | null): boolean {
  return role === "mainadmin";
}
