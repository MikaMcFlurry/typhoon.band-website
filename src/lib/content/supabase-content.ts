// Supabase content reader — server-side, anon-key, RLS-bound.
//
// Every loader is defensive:
//   - if Supabase env is not configured → return null (callers fall back)
//   - on any error → return null (never thrown)
// Returning `null` (not `[]`) signals "Supabase had no answer" so the
// content provider falls back to static seed data. An empty array is
// treated as "Supabase is the source of truth and has nothing to show".
//
// We use the SERVER ANON client here (not the service-role one) so
// queries are filtered by the public RLS policies. Anything not allowed
// by policy will simply return no rows.
//
// Translations are joined in JS — two parallel parent + translation
// queries — instead of via PostgREST nested selects. That keeps us
// independent of foreign-key relationship metadata and free of
// cross-version supabase-js generic gymnastics.

import "server-only";

import type { Locale } from "@/i18n/locales";
import { getServerSupabase } from "@/lib/supabase/server";
import type {
  BandInfoRow,
  HeroRow,
  LegalRow,
  MediaRow,
  MemberRow,
  PlatformRow,
  SeoRow,
  ShowRow,
  SongRow,
} from "./normalize";
import type { LegalPageType } from "./types";

type SettingsRow = { key: string; value: Record<string, unknown> | null };

type Maybe<T> = T | null;

const LEGAL_SLUGS: Record<LegalPageType, string> = {
  imprint: "imprint",
  privacy: "privacy",
  cookies: "cookies",
};

async function safeQuery<T>(fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function fetchSiteSettings(): Promise<Maybe<SettingsRow[]>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("is_public", true);
    if (error || !data) return null;
    return data.map((r) => ({
      key: r.key,
      value: (r.value ?? null) as Record<string, unknown> | null,
    }));
  });
}

export async function fetchHero(_locale: Locale): Promise<Maybe<HeroRow>> {
  // Hero copy is dictionary-driven until the Admin phase introduces a
  // dedicated `hero_blocks` table. Returning null lets the dictionary
  // fallback win without any Supabase round-trip.
  void _locale;
  return null;
}

export async function fetchBandInfo(
  _locale: Locale,
): Promise<Maybe<BandInfoRow>> {
  // Same as hero — dictionary-driven until Admin phase.
  void _locale;
  return null;
}

export async function fetchMembers(
  locale: Locale,
): Promise<Maybe<MemberRow[]>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    // Read all rows (visible AND hidden) so the public merge can decide
    // per-slug whether to hide a single member. The is_visible filter
    // lives in the content provider, not in the query, so an Admin
    // toggling visibility doesn't lose the row from the fallback merge.
    const { data: members, error: membersErr } = await supabase
      .from("band_members")
      .select("id, slug, photo_url, sort_order, is_visible")
      .order("sort_order", { ascending: true });
    if (membersErr || !members) return null;
    if (members.length === 0) return [];

    const ids = members.map((m) => m.id);
    const { data: translations, error: trErr } = await supabase
      .from("band_member_translations")
      .select("band_member_id, name, role, bio_md")
      .in("band_member_id", ids)
      .eq("locale", locale);
    if (trErr) return null;

    const trByMember = new Map<string, MemberRow["translation"]>();
    (translations ?? []).forEach((t) => {
      trByMember.set(t.band_member_id, {
        name: t.name,
        role: t.role,
        bio_md: t.bio_md ?? null,
      });
    });

    return members.map((m) => ({
      id: m.id,
      slug: m.slug,
      photo_url: m.photo_url,
      sort_order: m.sort_order,
      is_visible: m.is_visible,
      translation: trByMember.get(m.id) ?? null,
    }));
  });
}

export async function fetchSongs(): Promise<Maybe<SongRow[]>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("songs")
      .select(
        "id, slug, title, audio_url, cover_image_url, is_featured, is_visible, sort_order",
      )
      .eq("is_visible", true)
      .eq("is_streamable", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return null;
    return data;
  });
}

export async function fetchGallery(): Promise<Maybe<MediaRow[]>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("media_items")
      .select(
        "id, type, file_url, thumbnail_url, alt_text, title, category, sort_order, is_visible",
      )
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      type: row.type,
      file_url: row.file_url,
      thumbnail_url: row.thumbnail_url,
      sort_order: row.sort_order,
      is_visible: row.is_visible,
      category: row.category,
      alt: row.alt_text ?? row.title ?? null,
    }));
  });
}

export async function fetchShows(): Promise<Maybe<ShowRow[]>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    // Public anon reader: RLS already restricts this to
    // is_visible AND is_published, but we filter explicitly so a
    // future RLS regression cannot leak unpublished rows. We sort by
    // starts_at for the public homepage; sort_order acts as a tiebreaker.
    const { data, error } = await supabase
      .from("shows")
      .select(
        "id, starts_at, is_tba, venue, city, country, ticket_url, event_type, is_visible, is_published, sort_order",
      )
      .eq("is_visible", true)
      .eq("is_published", true)
      .order("starts_at", { ascending: true, nullsFirst: false })
      .order("sort_order", { ascending: true });
    if (error || !data) return null;
    // The normaliser still expects `starts_at` as a string; substitute
    // an empty string for TBA rows so the formatter falls back to "TBA".
    return data.map((row) => ({
      id: row.id,
      starts_at: row.starts_at ?? "",
      venue: row.venue,
      city: row.city,
      country: row.country,
      ticket_url: row.ticket_url,
      is_visible: row.is_visible,
      sort_order: row.sort_order,
    }));
  });
}

export async function fetchLegalPage(
  type: LegalPageType,
  locale: Locale,
): Promise<Maybe<LegalRow>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    const slug = LEGAL_SLUGS[type];
    const { data: page, error: pageErr } = await supabase
      .from("legal_pages")
      .select("id, slug, is_published")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (pageErr || !page) return null;

    const { data: tr, error: trErr } = await supabase
      .from("legal_page_translations")
      .select("title, body_md")
      .eq("legal_page_id", page.id)
      .eq("locale", locale)
      .maybeSingle();
    if (trErr) return null;

    return {
      slug: page.slug,
      is_published: page.is_published,
      translation: tr ? { title: tr.title, body_md: tr.body_md } : null,
    };
  });
}

export async function fetchPlatformLinks(): Promise<Maybe<PlatformRow[]>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("platform_links")
      .select("id, platform, url, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data) return null;
    return data;
  });
}

export async function fetchSeoEntry(
  path: string,
  locale: Locale,
): Promise<Maybe<SeoRow>> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("seo_entries")
      .select("path, locale, title, description, og_image_url")
      .eq("path", path)
      .eq("locale", locale)
      .maybeSingle();
    if (error || !data) return null;
    return {
      path: data.path,
      title: data.title,
      description: data.description,
      og_image_url: data.og_image_url,
    };
  });
}
