// Server-only Admin reader for `consent_settings`.
//
// Phase 06 keeps consent labels code-driven for the public banner (see
// `src/components/layout/CookieConsent.tsx`). This helper just exposes
// the stored categories so the Admin can view (and later: edit) them.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { ConsentSettingRow } from "@/lib/supabase/types";

export type AdminConsentSetting = ConsentSettingRow;

export type ListConsentResult =
  | { available: true; rows: AdminConsentSetting[] }
  | { available: false; reason: string };

export async function listAdminConsentSettings(): Promise<ListConsentResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("consent_settings")
    .select("id, category, label, description, is_required, updated_at")
    .order("category", { ascending: true });
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}
