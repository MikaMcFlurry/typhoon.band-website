// Pure role helpers. Decoupled from Supabase so they can be reused in any
// server context that already loaded an `AdminProfile`.

import type { AdminProfile } from "@/lib/supabase/types";

export type AdminRole = AdminProfile["role"];

export const ADMIN_ROLES = ["owner", "admin", "editor"] as const;

export function isOwner(profile: Pick<AdminProfile, "role"> | null | undefined): boolean {
  return profile?.role === "owner";
}

export function isAdminLike(
  profile: Pick<AdminProfile, "role"> | null | undefined,
): boolean {
  return profile?.role === "owner" || profile?.role === "admin";
}

export function isEditor(
  profile: Pick<AdminProfile, "role"> | null | undefined,
): boolean {
  return profile?.role === "editor";
}

export function canAccessAdmin(
  profile: Pick<AdminProfile, "role" | "is_active"> | null | undefined,
): boolean {
  if (!profile) return false;
  if (!profile.is_active) return false;
  return (ADMIN_ROLES as readonly string[]).includes(profile.role);
}
