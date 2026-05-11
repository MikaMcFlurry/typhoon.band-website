// Server-only Admin reader/writer for `site_settings`.
//
// Phase 05 only writes a small set of asset-URL keys (hero, bandinfo,
// optional signature) so the public site can swap static images for
// uploaded ones without redesigning anything. Each setting is stored
// as a single JSON object `{ url: "..." }` under a stable key.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";

export const SITE_ASSET_KEYS = {
  hero_image: "hero_image",
  hero_signature: "hero_signature",
  bandinfo_image: "bandinfo_image",
} as const;

export type SiteAssetKey =
  (typeof SITE_ASSET_KEYS)[keyof typeof SITE_ASSET_KEYS];

export const SITE_ASSET_KEY_LIST: readonly SiteAssetKey[] = Object.values(
  SITE_ASSET_KEYS,
);

export type AssetSetting = {
  key: SiteAssetKey;
  url: string | null;
  updatedAt: string | null;
};

export type AssetSettingsMap = Record<SiteAssetKey, AssetSetting>;

function emptyMap(): AssetSettingsMap {
  return SITE_ASSET_KEY_LIST.reduce<AssetSettingsMap>((acc, key) => {
    acc[key] = { key, url: null, updatedAt: null };
    return acc;
  }, {} as AssetSettingsMap);
}

export type ListAssetsResult =
  | { available: true; map: AssetSettingsMap }
  | { available: false; reason: string };

// Admin view: reads through the service-role client so even rows with
// is_public = false (asset settings stay public, but we don't want a
// silent RLS regression to hide rows from the Admin) are visible.
export async function listAssetSettings(): Promise<ListAssetsResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, updated_at")
    .in("key", SITE_ASSET_KEY_LIST as readonly string[]);
  if (error) return { available: false, reason: error.message };

  const map = emptyMap();
  for (const row of data ?? []) {
    const key = row.key as SiteAssetKey;
    if (!SITE_ASSET_KEY_LIST.includes(key)) continue;
    const value = (row.value ?? null) as Record<string, unknown> | null;
    const url = typeof value?.url === "string" ? (value.url as string) : null;
    map[key] = { key, url, updatedAt: row.updated_at ?? null };
  }
  return { available: true, map };
}

export type MutationResult = { ok: true } | { ok: false; reason: string };

export async function upsertAssetSetting(
  key: SiteAssetKey,
  url: string | null,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const value = url ? { url } : {};
  const { error } = await supabase.from("site_settings").upsert(
    {
      key,
      value,
      is_public: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

// Public reader. Used by the content provider so anonymous visitors get
// the URL without going through the service-role bypass. RLS allows
// public select where `is_public = true`.
export async function fetchPublicAssetSettings(): Promise<AssetSettingsMap | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("is_public", true)
      .in("key", SITE_ASSET_KEY_LIST as readonly string[]);
    if (error || !data) return null;
    const map = emptyMap();
    for (const row of data) {
      const key = row.key as SiteAssetKey;
      if (!SITE_ASSET_KEY_LIST.includes(key)) continue;
      const value = (row.value ?? null) as Record<string, unknown> | null;
      const url =
        typeof value?.url === "string" ? (value.url as string) : null;
      map[key] = { key, url, updatedAt: null };
    }
    return map;
  } catch {
    return null;
  }
}
