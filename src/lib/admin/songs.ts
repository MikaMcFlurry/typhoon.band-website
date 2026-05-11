// Server-only Admin reader/writer for the `songs` table.
//
// The Admin must edit hidden/featured/sort rows the public site never
// sees, so we use the service-role client. Gate callers with
// `requireAdminWithPasswordOk()` upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Database, SongRow } from "@/lib/supabase/types";

type SongInsert = Database["public"]["Tables"]["songs"]["Insert"];
type SongUpdate = Database["public"]["Tables"]["songs"]["Update"];

const ROW_COLUMNS =
  "id, title, slug, audio_url, cover_image_url, status, is_streamable, is_downloadable, is_featured, sort_order, is_visible, created_at, updated_at";

export type AdminSongRow = SongRow;

export type ListSongsResult =
  | { available: true; rows: AdminSongRow[] }
  | { available: false; reason: string };

export async function listAdminSongs(limit = 200): Promise<ListSongsResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("songs")
    .select(ROW_COLUMNS)
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}

export type GetSongResult =
  | { available: true; row: AdminSongRow }
  | { available: false; reason: string };

export async function getAdminSong(id: string): Promise<GetSongResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { available: false, reason: "supabase-not-configured" };
  const { data, error } = await supabase
    .from("songs")
    .select(ROW_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) return { available: false, reason: error.message };
  if (!data) return { available: false, reason: "not-found" };
  return { available: true, row: data };
}

export type CreateSongArgs = {
  title: string;
  slug: string;
  audio_url: string;
  cover_image_url?: string | null;
  is_visible?: boolean;
  is_featured?: boolean;
  sort_order?: number;
};

export type CreateSongResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

export async function createSong(
  args: CreateSongArgs,
): Promise<CreateSongResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const insert: SongInsert = {
    title: args.title,
    slug: args.slug,
    audio_url: args.audio_url,
    cover_image_url: args.cover_image_url ?? null,
    status: "demo",
    is_streamable: true,
    is_downloadable: false,
    is_visible: args.is_visible ?? true,
    is_featured: args.is_featured ?? false,
    sort_order: args.sort_order ?? 0,
  };
  const { data, error } = await supabase
    .from("songs")
    .insert(insert)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data.id };
}

export type UpdateSongArgs = Partial<{
  title: string;
  slug: string;
  audio_url: string;
  cover_image_url: string | null;
  is_visible: boolean;
  is_featured: boolean;
  sort_order: number;
}>;

export type MutationResult = { ok: true } | { ok: false; reason: string };

export async function updateSong(
  id: string,
  patch: UpdateSongArgs,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const next: SongUpdate = {
    updated_at: new Date().toISOString(),
    is_streamable: true,
    is_downloadable: false,
  };
  if (patch.title !== undefined) next.title = patch.title;
  if (patch.slug !== undefined) next.slug = patch.slug;
  if (patch.audio_url !== undefined) next.audio_url = patch.audio_url;
  if (patch.cover_image_url !== undefined)
    next.cover_image_url = patch.cover_image_url;
  if (patch.is_visible !== undefined) next.is_visible = patch.is_visible;
  if (patch.is_featured !== undefined) next.is_featured = patch.is_featured;
  if (patch.sort_order !== undefined) next.sort_order = patch.sort_order;
  const { error } = await supabase.from("songs").update(next).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// Sets `is_featured = false` on every other song so only one is featured
// at a time. Then sets the target row to true. Two writes are acceptable
// here: featured is a small set and the public site reads via filter.
export async function setFeaturedSong(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const now = new Date().toISOString();
  const clear = await supabase
    .from("songs")
    .update({ is_featured: false, updated_at: now })
    .neq("id", id);
  if (clear.error) return { ok: false, reason: clear.error.message };
  const set = await supabase
    .from("songs")
    .update({ is_featured: true, updated_at: now })
    .eq("id", id);
  if (set.error) return { ok: false, reason: set.error.message };
  return { ok: true };
}

export async function deleteSong(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase.from("songs").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
