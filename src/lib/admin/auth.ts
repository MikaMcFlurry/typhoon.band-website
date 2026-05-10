// Server-only Admin auth helpers.
//
// `getCurrentAdmin()` returns the active admin profile bound to the current
// Supabase session, or `null` for anyone else (anonymous, authenticated but
// no admin row, inactive admin). `requireAdmin()` performs the same lookup
// but redirects to the locale-aware login page when the user is not allowed.
// `requireAdminWithPasswordOk()` additionally redirects active admins whose
// `must_change_password` flag is still true to the change-password page —
// every protected dashboard route should use it so the initial password is
// rotated before any other Admin work.
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
  mustChangePassword: boolean;
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
      "id, user_id, display_name, email, role, is_active, must_change_password, password_changed_at, initial_password_issued_at, last_login_at, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) return null;
  if (!canAccessAdmin(profile)) return null;

  return {
    userId: user.id,
    email: user.email ?? profile.email ?? null,
    profile,
    mustChangePassword: profile.must_change_password === true,
  };
}

function loginPath(locale: Locale, from?: string): string {
  const qs = from ? `?from=${encodeURIComponent(from)}` : "";
  return `/${locale}/admin/login${qs}`;
}

function changePasswordPath(locale: Locale): string {
  return `/${locale}/admin/change-password`;
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

// Same as `requireAdmin()` but additionally forces a password rotation on
// the first login. Use this for every Admin route except the login page and
// the change-password page itself.
export async function requireAdminWithPasswordOk(
  locale: string | undefined | null,
  options: { from?: string } = {},
): Promise<CurrentAdmin> {
  const admin = await requireAdmin(locale, options);
  if (admin.mustChangePassword) {
    redirect(changePasswordPath(resolveLocale(locale)));
  }
  return admin;
}
