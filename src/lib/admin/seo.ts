// Server-only Admin reader/writer for `seo_entries`.
//
// Phase 06 supports per-(path, locale) overrides for:
//   - title
//   - description
//   - og_image_url (optional)
//
// The content provider falls back to dictionary-derived metadata when
// no row exists, so the Admin never has to seed every path manually.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Database, SeoEntryRow } from "@/lib/supabase/types";

type SeoInsert = Database["public"]["Tables"]["seo_entries"]["Insert"];
type SeoUpdate = Database["public"]["Tables"]["seo_entries"]["Update"];

export type AdminSeoEntry = SeoEntryRow;

export type ListSeoResult =
  | { available: true; rows: AdminSeoEntry[] }
  | { available: false; reason: string };

const COLUMNS = "id, path, locale, title, description, og_image_url";

export async function listAdminSeoEntries(): Promise<ListSeoResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("seo_entries")
    .select(COLUMNS)
    .order("path", { ascending: true })
    .order("locale", { ascending: true });
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}

export type MutationResult = { ok: true } | { ok: false; reason: string };

export type SaveSeoArgs = {
  path: string;
  locale: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export async function saveSeoEntry(args: SaveSeoArgs): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };

  const existing = await supabase
    .from("seo_entries")
    .select("id")
    .eq("path", args.path)
    .eq("locale", args.locale)
    .maybeSingle();
  if (existing.error) return { ok: false, reason: existing.error.message };

  // If every override is empty/null, delete the row so the public
  // fallback wins again.
  const isEmpty =
    !args.title && !args.description && !args.ogImageUrl;

  if (isEmpty) {
    if (existing.data) {
      const { error } = await supabase
        .from("seo_entries")
        .delete()
        .eq("id", existing.data.id);
      if (error) return { ok: false, reason: error.message };
    }
    return { ok: true };
  }

  if (!existing.data) {
    const insert: SeoInsert = {
      path: args.path,
      locale: args.locale,
      title: args.title,
      description: args.description,
      og_image_url: args.ogImageUrl,
    };
    const { error } = await supabase.from("seo_entries").insert(insert);
    if (error) return { ok: false, reason: error.message };
  } else {
    const update: SeoUpdate = {
      title: args.title,
      description: args.description,
      og_image_url: args.ogImageUrl,
    };
    const { error } = await supabase
      .from("seo_entries")
      .update(update)
      .eq("id", existing.data.id);
    if (error) return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export async function deleteSeoEntry(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase.from("seo_entries").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
