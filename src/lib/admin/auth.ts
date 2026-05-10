// Server-only Admin auth helpers.
//
// `getCurrentAdmin()` returns the active admin profile bound to the current
// Supabase session, or `null` for anyone else (anonymous, authenticated but
// no admin row, inactive admin). `requireAdmin()` performs the same lookup
// but redirects to the locale-aware login page when the user is not allowed.
//
// All checks are server-side and use the cookie-bound anon client — RLS on
// `admin_profiles` enforces "self read only", so a leaked anon key would
// still not enable admin escalation.

import "server-only";

import { redirect } from "next/navigation";

import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server-auth";
import type { AdminProfile } from "@/lib/supabase/types";
import { canAccessAdmin } from "@/lib/admin/roles";

export type CurrentAdmin = {
  userId: string;
  email: string | null;
  profile: AdminProfile;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await getSupabaseServerAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return null;

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select(
      "id, user_id, display_name, email, role, is_active, last_login_at, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) return null;
  if (!canAccessAdmin(profile)) return null;

  return {
    userId: user.id,
    email: user.email ?? profile.email ?? null,
    profile,
  };
}

function loginPath(locale: Locale, from?: string): string {
  const qs = from ? `?from=${encodeURIComponent(from)}` : "";
  return `/${locale}/admin/login${qs}`;
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function requireAdmin(
  locale: string | undefined | null,
  options: { from?: string } = {},
): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (admin) return admin;
  redirect(loginPath(resolveLocale(locale), options.from));
}
