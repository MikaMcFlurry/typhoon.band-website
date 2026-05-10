"use server";

import { redirect } from "next/navigation";

import { resolveLocale } from "@/lib/admin/auth";
import { canAccessAdmin } from "@/lib/admin/roles";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

export type LoginActionState = {
  ok: boolean;
  message?: string;
  field?: "email" | "password" | "form";
};

const ADMIN_PATH = (locale: string, from?: string | null) => {
  if (from && from.startsWith(`/${locale}/admin`)) return from;
  return `/${locale}/admin`;
};

const CHANGE_PASSWORD_PATH = (locale: string) =>
  `/${locale}/admin/change-password`;

function trimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginWithPasswordAction(
  _prev: LoginActionState | undefined,
  formData: FormData,
): Promise<LoginActionState> {
  const locale = resolveLocale(trimmedString(formData.get("locale")));
  const fromRaw = trimmedString(formData.get("from"));
  const email = trimmedString(formData.get("email"));
  const password =
    typeof formData.get("password") === "string"
      ? (formData.get("password") as string)
      : "";

  if (!email) {
    return { ok: false, field: "email", message: "Bitte gib deine E-Mail an." };
  }
  if (!password) {
    return {
      ok: false,
      field: "password",
      message: "Bitte gib dein Passwort an.",
    };
  }

  const supabase = await getSupabaseServerAuthClient();
  if (!supabase) {
    return {
      ok: false,
      field: "form",
      message:
        "Supabase ist nicht konfiguriert. Bitte setze die Auth-Umgebungsvariablen.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      field: "form",
      message: "Login fehlgeschlagen. Bitte prüfe E-Mail und Passwort.",
    };
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role, is_active, must_change_password")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!canAccessAdmin(profile)) {
    await supabase.auth.signOut();
    return {
      ok: false,
      field: "form",
      message:
        "Dieser Account hat keinen aktiven Admin-Zugang. Bitte wende dich an einen Owner.",
    };
  }

  // last_login_at lives on admin_profiles, which has no self-update RLS
  // policy by design — so we go through the privileged service-role
  // client for this housekeeping write. It never bypasses the auth
  // checks above; we only get here once the user is a confirmed active
  // admin.
  const adminClient = getAdminSupabase();
  if (adminClient) {
    await adminClient
      .from("admin_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", data.user.id);
  }

  if (profile?.must_change_password === true) {
    redirect(CHANGE_PASSWORD_PATH(locale));
  }

  redirect(ADMIN_PATH(locale, fromRaw || null));
}
