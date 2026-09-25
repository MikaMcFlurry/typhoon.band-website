// Server-only Admin reader/writer for `platform_links`.
//
// Phase 06 supports the following platforms (CHECK constraint enforced
// in 0006 migration):
//   spotify · youtube · instagram · facebook · soundcloud · bandcamp
//
// The public site automatically picks up any active row through the
// content provider (see `src/lib/content/index.ts` :: getPlatformLinks).

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Database, PlatformLinkRow } from "@/lib/supabase/types";

type PlatformInsert = Database["public"]["Tables"]["platform_links"]["Insert"];
type PlatformUpdate = Database["public"]["Tables"]["platform_links"]["Update"];

export type AdminPlatformLink = PlatformLinkRow;

export type ListPlatformResult =
  | { available: true; rows: AdminPlatformLink[] }
  | { available: false; reason: string };

const COLUMNS =
  "id, platform, url, is_active, sort_order, created_at, updated_at";

export async function listAdminPlatformLinks(): Promise<ListPlatformResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("platform_links")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("platform", { ascending: true });
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}

export type MutationResult = { ok: true } | { ok: false; reason: string };

export type SavePlatformArgs = {
  id?: string | null;
  platform: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

export async function savePlatformLink(
  args: SavePlatformArgs,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };

  if (args.id) {
    const update: PlatformUpdate = {
      platform: args.platform,
      url: args.url,
      is_active: args.isActive,
      sort_order: args.sortOrder,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("platform_links")
      .update(update)
      .eq("id", args.id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  }

  const insert: PlatformInsert = {
    platform: args.platform,
    url: args.url,
    is_active: args.isActive,
    sort_order: args.sortOrder,
  };
  const { error } = await supabase.from("platform_links").insert(insert);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deletePlatformLink(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase
    .from("platform_links")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
