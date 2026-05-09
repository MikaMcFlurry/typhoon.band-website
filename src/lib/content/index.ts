// Public content provider — Supabase-first, static fallback.
//
// Every loader follows this contract:
//   1. Build the fallback from src/data/* and public/assets/*.
//   2. If Supabase is not configured → return fallback.
//   3. Otherwise try to fetch published/visible records.
//   4. If records exist → normalise and return Supabase data.
//   5. If no records or any error → return fallback.
//
// The site must keep rendering identically when Supabase env vars are
// missing or the database is empty. Frontend code never touches Supabase
// directly — it always goes through these loaders.

import type { Locale } from "@/i18n/locales";
import {
  buildBandInfoFallback,
  buildGalleryFallback,
  buildHeroFallback,
  buildLegalPageFallback,
  buildMembersFallback,
  buildPlatformLinksFallback,
  buildPublicPageFallback,
  buildSeoFallback,
  buildShowsFallback,
  buildSiteSettingsFallback,
  buildSongsFallback,
} from "./fallback";
import {
  normaliseBandInfo,
  normaliseGallery,
  normaliseHero,
  normaliseLegalPage,
  normaliseMembers,
  normalisePlatformLinks,
  normaliseSeoEntry,
  normaliseShows,
  normaliseSiteSettings,
  normaliseSongs,
} from "./normalize";
import {
  fetchBandInfo,
  fetchGallery,
  fetchHero,
  fetchLegalPage,
  fetchMembers,
  fetchPlatformLinks,
  fetchSeoEntry,
  fetchShows,
  fetchSiteSettings,
  fetchSongs,
} from "./supabase-content";
import type {
  BandInfo,
  GalleryItem,
  HeroContent,
  LegalPage,
  LegalPageType,
  Member,
  PlatformLink,
  PublicPageContent,
  SeoEntry,
  ShowItem,
  SiteSettings,
  SongItem,
} from "./types";

async function safe<T>(fn: () => Promise<T | null>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback = buildSiteSettingsFallback();
  const rows = await safe(() => fetchSiteSettings());
  if (!rows || rows.length === 0) return fallback;
  return normaliseSiteSettings(rows, fallback);
}

export async function getHeroContent(locale: Locale): Promise<HeroContent> {
  const fallback = buildHeroFallback(locale);
  const row = await safe(() => fetchHero(locale));
  if (!row) return fallback;
  return normaliseHero(row, fallback);
}

export async function getBandInfo(locale: Locale): Promise<BandInfo> {
  const fallback = buildBandInfoFallback(locale);
  const row = await safe(() => fetchBandInfo(locale));
  if (!row) return fallback;
  return normaliseBandInfo(row, fallback);
}

export async function getMembers(locale: Locale): Promise<Member[]> {
  const fallback = buildMembersFallback(locale);
  const rows = await safe(() => fetchMembers(locale));
  if (!rows || rows.length === 0) return fallback;
  return normaliseMembers(rows, fallback);
}

export async function getSongs(_locale: Locale): Promise<SongItem[]> {
  void _locale;
  const fallback = buildSongsFallback();
  const rows = await safe(() => fetchSongs());
  if (!rows || rows.length === 0) return fallback;
  const normalised = normaliseSongs(rows, fallback);
  return normalised.length > 0 ? normalised : fallback;
}

export async function getGalleryItems(
  _locale: Locale,
): Promise<GalleryItem[]> {
  void _locale;
  const fallback = buildGalleryFallback();
  const rows = await safe(() => fetchGallery());
  if (!rows || rows.length === 0) return fallback;
  const normalised = normaliseGallery(rows, fallback);
  return normalised.length > 0 ? normalised : fallback;
}

export async function getShows(locale: Locale): Promise<ShowItem[]> {
  const fallback = buildShowsFallback(locale);
  const rows = await safe(() => fetchShows());
  if (!rows || rows.length === 0) return fallback;
  return normaliseShows(rows, fallback);
}

export async function getLegalPage(
  type: LegalPageType,
  locale: Locale,
): Promise<LegalPage> {
  const fallback = buildLegalPageFallback(type, locale);
  const row = await safe(() => fetchLegalPage(type, locale));
  if (!row) return fallback;
  return normaliseLegalPage(row, type, fallback);
}

export async function getPlatformLinks(): Promise<PlatformLink[]> {
  const fallback = buildPlatformLinksFallback();
  const rows = await safe(() => fetchPlatformLinks());
  if (!rows) return fallback;
  return normalisePlatformLinks(rows);
}

export async function getSeoEntry(
  path: string,
  locale: Locale,
): Promise<SeoEntry> {
  const fallback = buildSeoFallback(path, locale);
  const row = await safe(() => fetchSeoEntry(path, locale));
  if (!row) return fallback;
  return normaliseSeoEntry(row, fallback);
}

// One-shot homepage bundle so a page can fetch everything it needs in
// parallel through a single loader call.
export async function getPublicPageContent(
  locale: Locale,
): Promise<PublicPageContent> {
  const fallback = buildPublicPageFallback(locale);
  const [
    siteSettings,
    hero,
    bandInfo,
    members,
    songs,
    gallery,
    shows,
    platformLinks,
  ] = await Promise.all([
    getSiteSettings(),
    getHeroContent(locale),
    getBandInfo(locale),
    getMembers(locale),
    getSongs(locale),
    getGalleryItems(locale),
    getShows(locale),
    getPlatformLinks(),
  ]);
  return {
    ...fallback,
    siteSettings,
    hero,
    bandInfo,
    members,
    songs,
    gallery,
    shows,
    platformLinks,
  };
}

export type {
  BandInfo,
  GalleryItem,
  HeroContent,
  LegalPage,
  LegalPageType,
  Member,
  PlatformLink,
  PublicPageContent,
  SeoEntry,
  ShowItem,
  SiteSettings,
  SongItem,
} from "./types";
