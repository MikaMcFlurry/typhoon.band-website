// Server-only Admin reader/writer for the gallery (`media_items`).
//
// Public visibility is filtered at the public-content layer; the Admin
// must see hidden rows too, so we use the service-role client. Always
// gate callers with `requireAdminWithPasswordOk()` upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Database, MediaItemRow } from "@/lib/supabase/types";

type MediaInsert = Database["public"]["Tables"]["media_items"]["Insert"];
type MediaUpdate = Database["public"]["Tables"]["media_items"]["Update"];

const ROW_COLUMNS =
  "id, type, file_url, thumbnail_url, alt_text, title, category, sort_order, is_visible, created_at, updated_at";

export type AdminMediaRow = MediaItemRow;

export type ListMediaResult =
  | { available: true; rows: AdminMediaRow[] }
  | { available: false; reason: string };

export async function listAdminMedia(
  category = "gallery",
  limit = 200,
): Promise<ListMediaResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("media_items")
    .select(ROW_COLUMNS)
    .eq("category", category)
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}

export type CreateMediaArgs = {
  type: "image";
  file_url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  alt_text?: string | null;
  category?: string;
  sort_order?: number;
  is_visible?: boolean;
};

export type CreateMediaResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

export async function createMediaItem(
  args: CreateMediaArgs,
): Promise<CreateMediaResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const insert: MediaInsert = {
    type: args.type,
    file_url: args.file_url,
    thumbnail_url: args.thumbnail_url ?? null,
    title: args.title ?? null,
    alt_text: args.alt_text ?? null,
    category: args.category ?? "gallery",
    sort_order: args.sort_order ?? 0,
    is_visible: args.is_visible ?? true,
  };
  const { data, error } = await supabase
    .from("media_items")
    .insert(insert)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data.id };
}

export type UpdateMediaArgs = Partial<{
  file_url: string;
  thumbnail_url: string | null;
  title: string | null;
  alt_text: string | null;
  sort_order: number;
  is_visible: boolean;
}>;

export type MutationResult = { ok: true } | { ok: false; reason: string };

export async function updateMediaItem(
  id: string,
  patch: UpdateMediaArgs,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const next: MediaUpdate = { updated_at: new Date().toISOString() };
  if (patch.file_url !== undefined) next.file_url = patch.file_url;
  if (patch.thumbnail_url !== undefined)
    next.thumbnail_url = patch.thumbnail_url;
  if (patch.title !== undefined) next.title = patch.title;
  if (patch.alt_text !== undefined) next.alt_text = patch.alt_text;
  if (patch.sort_order !== undefined) next.sort_order = patch.sort_order;
  if (patch.is_visible !== undefined) next.is_visible = patch.is_visible;
  const { error } = await supabase
    .from("media_items")
    .update(next)
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteMediaItem(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase.from("media_items").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
