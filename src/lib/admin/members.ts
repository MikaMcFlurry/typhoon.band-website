// Server-only Admin reader/writer for `band_members` + the matching
// `band_member_translations` rows.
//
// Phase 05 (initial) scope was photo + visibility/order. The Phase 05 fix
// adds per-locale name/role/bio editing on top, keyed off the canonical
// slug from `src/data/members.ts`. Always gate callers with
// `requireAdminWithPasswordOk()` upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type {
  BandMemberRow,
  BandMemberTranslationRow,
  Database,
} from "@/lib/supabase/types";

type MemberInsert = Database["public"]["Tables"]["band_members"]["Insert"];
type MemberUpdate = Database["public"]["Tables"]["band_members"]["Update"];
type TranslationInsert =
  Database["public"]["Tables"]["band_member_translations"]["Insert"];
type TranslationUpdate =
  Database["public"]["Tables"]["band_member_translations"]["Update"];

const ROW_COLUMNS =
  "id, slug, photo_url, sort_order, is_visible, created_at, updated_at";

const TRANSLATION_COLUMNS = "id, band_member_id, locale, name, role, bio_md";

export type AdminMemberRow = BandMemberRow;
export type AdminMemberTranslationRow = BandMemberTranslationRow;

export type AdminMemberWithTranslations = AdminMemberRow & {
  translations: AdminMemberTranslationRow[];
};

export type ListMembersResult =
  | { available: true; rows: AdminMemberWithTranslations[] }
  | { available: false; reason: string };

export async function listAdminMembers(): Promise<ListMembersResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data: members, error } = await supabase
    .from("band_members")
    .select(ROW_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) return { available: false, reason: error.message };

  const memberRows = members ?? [];
  if (memberRows.length === 0) {
    return { available: true, rows: [] };
  }

  const ids = memberRows.map((m) => m.id);
  const { data: translations, error: trErr } = await supabase
    .from("band_member_translations")
    .select(TRANSLATION_COLUMNS)
    .in("band_member_id", ids);
  if (trErr) return { available: false, reason: trErr.message };

  const trByMember = new Map<string, AdminMemberTranslationRow[]>();
  for (const t of translations ?? []) {
    const list = trByMember.get(t.band_member_id) ?? [];
    list.push(t);
    trByMember.set(t.band_member_id, list);
  }

  return {
    available: true,
    rows: memberRows.map((m) => ({
      ...m,
      translations: trByMember.get(m.id) ?? [],
    })),
  };
}

export type MutationResult = { ok: true } | { ok: false; reason: string };

// Upserts the `band_members` row by slug (creating it if needed) and
// then replaces the matching `(band_member_id, locale)` translation
// rows. Translation entries with all-empty fields are skipped so an
// Admin who fills only DE doesn't create empty EN/TR rows that would
// later shadow the dictionary fallback.
export type SaveMemberArgs = {
  slug: string;
  photoUrl?: string | null;
  // `undefined` = keep current photo, null = clear photo
  clearPhoto?: boolean;
  sortOrder?: number;
  isVisible: boolean;
  translations: Array<{
    locale: string;
    name: string;
    role: string;
    bioMd: string;
  }>;
};

export async function saveMember(args: SaveMemberArgs): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };

  const existing = await supabase
    .from("band_members")
    .select("id")
    .eq("slug", args.slug)
    .maybeSingle();
  if (existing.error) return { ok: false, reason: existing.error.message };

  const now = new Date().toISOString();
  let memberId: string;

  if (!existing.data) {
    const insert: MemberInsert = {
      slug: args.slug,
      photo_url: args.clearPhoto ? null : (args.photoUrl ?? null),
      sort_order: args.sortOrder ?? 0,
      is_visible: args.isVisible,
    };
    const { data, error } = await supabase
      .from("band_members")
      .insert(insert)
      .select("id")
      .single();
    if (error) return { ok: false, reason: error.message };
    memberId = data.id;
  } else {
    memberId = existing.data.id;
    const next: MemberUpdate = { updated_at: now, is_visible: args.isVisible };
    if (args.clearPhoto) next.photo_url = null;
    else if (args.photoUrl !== undefined) next.photo_url = args.photoUrl;
    if (args.sortOrder !== undefined) next.sort_order = args.sortOrder;
    const { error } = await supabase
      .from("band_members")
      .update(next)
      .eq("id", memberId);
    if (error) return { ok: false, reason: error.message };
  }

  // Translation upsert: one row per locale. Empty trios are skipped so
  // we don't create blank rows that would later mask the dictionary
  // fallback.
  for (const t of args.translations) {
    const isEmpty =
      t.name.trim().length === 0 &&
      t.role.trim().length === 0 &&
      t.bioMd.trim().length === 0;
    if (isEmpty) continue;

    const existingTr = await supabase
      .from("band_member_translations")
      .select("id")
      .eq("band_member_id", memberId)
      .eq("locale", t.locale)
      .maybeSingle();
    if (existingTr.error) {
      return { ok: false, reason: existingTr.error.message };
    }

    if (!existingTr.data) {
      const insertTr: TranslationInsert = {
        band_member_id: memberId,
        locale: t.locale,
        name: t.name.trim(),
        role: t.role.trim(),
        bio_md: t.bioMd.trim() || null,
      };
      const { error } = await supabase
        .from("band_member_translations")
        .insert(insertTr);
      if (error) return { ok: false, reason: error.message };
    } else {
      const updateTr: TranslationUpdate = {
        name: t.name.trim(),
        role: t.role.trim(),
        bio_md: t.bioMd.trim() || null,
      };
      const { error } = await supabase
        .from("band_member_translations")
        .update(updateTr)
        .eq("id", existingTr.data.id);
      if (error) return { ok: false, reason: error.message };
    }
  }

  return { ok: true };
}
