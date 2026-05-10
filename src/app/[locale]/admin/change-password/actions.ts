"use server";

import { redirect } from "next/navigation";

import { getCurrentAdmin, resolveLocale } from "@/lib/admin/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

export type ChangePasswordState = {
  ok: boolean;
  message?: string;
  field?: "password" | "confirm" | "form";
};

function trimmedString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function rawString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export async function changePasswordAction(
  _prev: ChangePasswordState | undefined,
  formData: FormData,
): Promise<ChangePasswordState> {
  const locale = resolveLocale(trimmedString(formData.get("locale")));
  const password = rawString(formData.get("password"));
  const confirm = rawString(formData.get("confirm"));

  if (!password || password.length < 12) {
    return {
      ok: false,
      field: "password",
      message: "Bitte vergib ein Passwort mit mindestens 12 Zeichen.",
    };
  }
  if (password !== confirm) {
    return {
      ok: false,
      field: "confirm",
      message: "Die beiden Passwörter stimmen nicht überein.",
    };
  }

  const current = await getCurrentAdmin();
  if (!current) {
    redirect(`/${locale}/admin/login?from=/${locale}/admin/change-password`);
  }

  const authClient = await getSupabaseServerAuthClient();
  if (!authClient) {
    return {
      ok: false,
      field: "form",
      message:
        "Supabase ist nicht konfiguriert. Bitte setze die Auth-Umgebungsvariablen.",
    };
  }

  const { error: updateErr } = await authClient.auth.updateUser({ password });
  if (updateErr) {
    const isWeak =
      typeof updateErr.message === "string" &&
      /password/i.test(updateErr.message);
    return {
      ok: false,
      field: "password",
      message: isWeak
        ? "Das Passwort wurde von Supabase abgelehnt. Bitte wähle ein stärkeres Passwort."
        : "Das Passwort konnte nicht aktualisiert werden. Bitte versuche es erneut.",
    };
  }

  // Flip the rotation flags via the service-role client. The authenticated
  // anon client cannot self-update admin_profiles (no RLS policy allows it
  // by design), so the privileged server client persists the change.
  const adminClient = getAdminSupabase();
  if (adminClient) {
    const now = new Date().toISOString();
    await adminClient
      .from("admin_profiles")
      .update({
        must_change_password: false,
        password_changed_at: now,
        updated_at: now,
      })
      .eq("user_id", current.userId);
  }

  redirect(`/${locale}/admin`);
}
