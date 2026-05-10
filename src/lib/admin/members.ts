// Server-only Admin reader/writer for `band_members`.
//
// Phase 05 only manages the photo + visibility/order — full bio/role
// CRUD is intentionally deferred. Always gate callers with
// `requireAdminWithPasswordOk()` upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Database, BandMemberRow } from "@/lib/supabase/types";

type MemberInsert = Database["public"]["Tables"]["band_members"]["Insert"];
type MemberUpdate = Database["public"]["Tables"]["band_members"]["Update"];

const ROW_COLUMNS =
  "id, slug, photo_url, sort_order, is_visible, created_at, updated_at";

export type AdminMemberRow = BandMemberRow;

export type ListMembersResult =
  | { available: true; rows: AdminMemberRow[] }
  | { available: false; reason: string };

export async function listAdminMembers(): Promise<ListMembersResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("band_members")
    .select(ROW_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}

export type GetMemberBySlugResult =
  | { available: true; row: AdminMemberRow | null }
  | { available: false; reason: string };

export async function getAdminMemberBySlug(
  slug: string,
): Promise<GetMemberBySlugResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("band_members")
    .select(ROW_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) return { available: false, reason: error.message };
  return { available: true, row: data ?? null };
}

export type UpsertMemberArgs = {
  slug: string;
  photo_url?: string | null;
  sort_order?: number;
  is_visible?: boolean;
};

export type MutationResult = { ok: true } | { ok: false; reason: string };

// Insert-or-update by slug. `slug` is a stable identifier coming from
// the static fallback list (`src/data/members.ts`); we use it as the
// natural key inside the band_members table.
export async function upsertMemberBySlug(
  args: UpsertMemberArgs,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };

  const existing = await supabase
    .from("band_members")
    .select("id")
    .eq("slug", args.slug)
    .maybeSingle();
  if (existing.error) return { ok: false, reason: existing.error.message };

  const now = new Date().toISOString();

  if (!existing.data) {
    const insert: MemberInsert = {
      slug: args.slug,
      photo_url: args.photo_url ?? null,
      sort_order: args.sort_order ?? 0,
      is_visible: args.is_visible ?? true,
    };
    const { error } = await supabase.from("band_members").insert(insert);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  }

  const next: MemberUpdate = { updated_at: now };
  if (args.photo_url !== undefined) next.photo_url = args.photo_url;
  if (args.sort_order !== undefined) next.sort_order = args.sort_order;
  if (args.is_visible !== undefined) next.is_visible = args.is_visible;
  const { error } = await supabase
    .from("band_members")
    .update(next)
    .eq("id", existing.data.id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
