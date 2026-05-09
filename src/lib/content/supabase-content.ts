// Supabase content reader. The Supabase JS SDK is NOT yet installed (a
// later phase adds it) — until then every loader returns `null` so the
// public-content layer transparently falls back to seed data. The file
// exists so swapping to a real client is a single, well-typed change.

import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import type { Locale } from "@/i18n/locales";
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

// Returning `null` (not `[]`) signals "Supabase had no answer" so callers
// fall back to seed data. An empty array would be treated as "Supabase
// is the source of truth and there is nothing to show", which would hide
// the placeholder content the public site relies on.
type Maybe<T> = T | null;

export async function fetchSiteSettings(): Promise<Maybe<SettingsRow[]>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchHero(_locale: Locale): Promise<Maybe<HeroRow>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchBandInfo(
  _locale: Locale,
): Promise<Maybe<BandInfoRow>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchMembers(
  _locale: Locale,
): Promise<Maybe<MemberRow[]>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchSongs(): Promise<Maybe<SongRow[]>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchGallery(): Promise<Maybe<MediaRow[]>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchShows(): Promise<Maybe<ShowRow[]>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchLegalPage(
  _type: LegalPageType,
  _locale: Locale,
): Promise<Maybe<LegalRow>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchPlatformLinks(): Promise<Maybe<PlatformRow[]>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}

export async function fetchSeoEntry(
  _path: string,
  _locale: Locale,
): Promise<Maybe<SeoRow>> {
  if (!isSupabaseConfigured()) return null;
  return null;
}
