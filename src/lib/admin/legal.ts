// Server-only Admin reader/writer for `legal_pages` and the matching
// `legal_page_translations` rows.
//
// Phase 06 keeps the editor minimal:
//   - one row per slug (imprint/privacy/cookies) — seeded by the
//     0006 migration so the Admin never has to "create" the page
//   - one translation row per (legal_page_id, locale)
//   - body_md is a plain textarea — no rich text editor
//
// Always gate callers with `requireAdminWithPasswordOk()` upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type {
  Database,
  LegalPageRow,
  LegalPageTranslationRow,
} from "@/lib/supabase/types";
import {
  LEGAL_SLUGS,
  type LegalSlug,
} from "@/lib/validation/legal-seo-platforms";
import type { Locale } from "@/i18n/locales";

type LegalPageInsert = Database["public"]["Tables"]["legal_pages"]["Insert"];
type LegalPageUpdate = Database["public"]["Tables"]["legal_pages"]["Update"];
type LegalTrInsert =
  Database["public"]["Tables"]["legal_page_translations"]["Insert"];
type LegalTrUpdate =
  Database["public"]["Tables"]["legal_page_translations"]["Update"];

export type AdminLegalPage = LegalPageRow & {
  translations: LegalPageTranslationRow[];
};

export type ListLegalResult =
  | { available: true; rows: AdminLegalPage[] }
  | { available: false; reason: string };

const PAGE_COLUMNS = "id, slug, is_published, created_at, updated_at";
const TR_COLUMNS = "id, legal_page_id, locale, title, body_md";

export async function listAdminLegalPages(): Promise<ListLegalResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data: pages, error } = await supabase
    .from("legal_pages")
    .select(PAGE_COLUMNS)
    .in("slug", LEGAL_SLUGS as readonly string[]);
  if (error) return { available: false, reason: error.message };

  const list = pages ?? [];
  if (list.length === 0) return { available: true, rows: [] };

  const ids = list.map((p) => p.id);
  const { data: translations, error: trErr } = await supabase
    .from("legal_page_translations")
    .select(TR_COLUMNS)
    .in("legal_page_id", ids);
  if (trErr) return { available: false, reason: trErr.message };

  const byPage = new Map<string, LegalPageTranslationRow[]>();
  for (const t of translations ?? []) {
    const arr = byPage.get(t.legal_page_id) ?? [];
    arr.push(t);
    byPage.set(t.legal_page_id, arr);
  }

  return {
    available: true,
    rows: list.map((p) => ({ ...p, translations: byPage.get(p.id) ?? [] })),
  };
}

export type MutationResult = { ok: true } | { ok: false; reason: string };

export type SaveLegalArgs = {
  slug: LegalSlug;
  locale: Locale;
  title: string;
  bodyMd: string;
  isPublished: boolean;
};

// Upserts the parent `legal_pages` row (creating one for the slug if
// the migration seed was skipped on this database) and then upserts the
// matching translation row. The `is_published` flag is stored on the
// parent and applies to all locales — this matches the spec ("publish
// the imprint" not "publish the German imprint only").
export async function saveLegalPage(
  args: SaveLegalArgs,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };

  const existing = await supabase
    .from("legal_pages")
    .select("id")
    .eq("slug", args.slug)
    .maybeSingle();
  if (existing.error) return { ok: false, reason: existing.error.message };

  let pageId: string;
  if (!existing.data) {
    const insert: LegalPageInsert = {
      slug: args.slug,
      is_published: args.isPublished,
    };
    const { data, error } = await supabase
      .from("legal_pages")
      .insert(insert)
      .select("id")
      .single();
    if (error) return { ok: false, reason: error.message };
    pageId = data.id;
  } else {
    pageId = existing.data.id;
    const next: LegalPageUpdate = {
      is_published: args.isPublished,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("legal_pages")
      .update(next)
      .eq("id", pageId);
    if (error) return { ok: false, reason: error.message };
  }

  // Translation upsert. If body is empty we delete the translation so
  // the public fallback can take over (mirrors the members editor).
  const existingTr = await supabase
    .from("legal_page_translations")
    .select("id")
    .eq("legal_page_id", pageId)
    .eq("locale", args.locale)
    .maybeSingle();
  if (existingTr.error) return { ok: false, reason: existingTr.error.message };

  const isEmpty =
    args.title.trim().length === 0 && args.bodyMd.trim().length === 0;

  if (isEmpty) {
    if (existingTr.data) {
      const { error } = await supabase
        .from("legal_page_translations")
        .delete()
        .eq("id", existingTr.data.id);
      if (error) return { ok: false, reason: error.message };
    }
    return { ok: true };
  }

  if (!existingTr.data) {
    const insert: LegalTrInsert = {
      legal_page_id: pageId,
      locale: args.locale,
      title: args.title.trim(),
      body_md: args.bodyMd, // do not trim — preserves intentional newlines
    };
    const { error } = await supabase
      .from("legal_page_translations")
      .insert(insert);
    if (error) return { ok: false, reason: error.message };
  } else {
    const update: LegalTrUpdate = {
      title: args.title.trim(),
      body_md: args.bodyMd,
    };
    const { error } = await supabase
      .from("legal_page_translations")
      .update(update)
      .eq("id", existingTr.data.id);
    if (error) return { ok: false, reason: error.message };
  }

  return { ok: true };
}
