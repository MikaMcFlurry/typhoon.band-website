// Normalisation helpers — turn raw Supabase rows into the public-content
// shapes consumed by the frontend. All asset URLs are pass-through; if
// a Supabase record misses a URL the caller falls back to the static
// asset path, never to a Storage directory scan.

import type {
  BandInfo,
  GalleryItem,
  HeroContent,
  LegalPage,
  LegalPageType,
  Member,
  PlatformLink,
  SeoEntry,
  ShowItem,
  SiteSettings,
  SongItem,
} from "./types";

type Json = Record<string, unknown> | null | undefined;
type SettingsRow = { key: string; value: Json };

function pickString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function pickStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getSettingValue(rows: SettingsRow[], key: string): Json {
  const row = rows.find((r) => r.key === key);
  return row ? (row.value ?? null) : null;
}

export function normaliseSiteSettings(
  rows: SettingsRow[],
  fallback: SiteSettings,
): SiteSettings {
  const brand = (getSettingValue(rows, "brand") as Record<string, unknown>) ?? {};
  const contact =
    (getSettingValue(rows, "contact") as Record<string, unknown>) ?? {};
  return {
    brandName: pickString(brand.name, fallback.brandName),
    tagline: pickString(brand.tagline, fallback.tagline),
    genreLine: pickString(brand.genreLine, fallback.genreLine),
    contactBookingEmail: pickString(
      contact.booking,
      fallback.contactBookingEmail,
    ),
    contactPhone: pickString(contact.phone, fallback.contactPhone),
    bookingDisabledNotice: fallback.bookingDisabledNotice,
  };
}

export type HeroRow = {
  line1: string | null;
  line2: string | null;
  line3: string | null;
  description: string | null;
  cta_listen: string | null;
  cta_book: string | null;
  image_url: string | null;
  signature_url: string | null;
};

export function normaliseHero(row: HeroRow, fallback: HeroContent): HeroContent {
  return {
    line1: pickString(row.line1, fallback.line1),
    line2: pickString(row.line2, fallback.line2),
    line3: pickString(row.line3, fallback.line3),
    description: pickString(row.description, fallback.description),
    ctaListen: pickString(row.cta_listen, fallback.ctaListen),
    ctaBook: pickString(row.cta_book, fallback.ctaBook),
    imageUrl: pickString(row.image_url, fallback.imageUrl),
    signatureUrl: pickString(row.signature_url, fallback.signatureUrl),
  };
}

export type BandInfoRow = {
  eyebrow: string | null;
  headline: string | null;
  body_md: string | null;
  cta_label: string | null;
  cta_book_label: string | null;
  image_url: string | null;
};

export function normaliseBandInfo(
  row: BandInfoRow,
  fallback: BandInfo,
): BandInfo {
  return {
    eyebrow: pickString(row.eyebrow, fallback.eyebrow),
    headline: pickString(row.headline, fallback.headline),
    body: pickString(row.body_md, fallback.body),
    cta: pickString(row.cta_label, fallback.cta),
    ctaBook: pickString(row.cta_book_label, fallback.ctaBook),
    imageUrl: pickString(row.image_url, fallback.imageUrl),
  };
}

export type MemberRow = {
  id: string;
  slug: string;
  photo_url: string | null;
  sort_order: number | null;
  is_visible: boolean | null;
  translation: {
    name: string | null;
    role: string | null;
    bio_md: string | null;
  } | null;
};

export function normaliseMembers(
  rows: MemberRow[],
  fallbacks: Member[],
): Member[] {
  return rows
    .filter((r) => r.is_visible !== false)
    .map((row) => {
      const fallback = fallbacks.find((m) => m.id === row.slug);
      return {
        id: row.slug,
        name: pickString(row.translation?.name, fallback?.name ?? row.slug),
        role: pickString(row.translation?.role, fallback?.role ?? ""),
        bio: pickString(row.translation?.bio_md, fallback?.bio ?? ""),
        photoUrl: pickString(row.photo_url, fallback?.photoUrl ?? ""),
        isPlaceholder: fallback?.isPlaceholder ?? false,
        sortOrder: row.sort_order ?? fallback?.sortOrder ?? 999,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type SongRow = {
  id: string;
  slug: string;
  title: string;
  audio_url: string | null;
  cover_image_url: string | null;
  is_featured: boolean | null;
  is_visible: boolean | null;
  sort_order: number | null;
};

export function normaliseSongs(
  rows: SongRow[],
  fallbacks: SongItem[],
): SongItem[] {
  return rows
    .filter((r) => r.is_visible !== false)
    .map((row) => {
      const fallback = fallbacks.find((s) => s.id === row.slug);
      return {
        id: row.slug,
        title: pickString(row.title, fallback?.title ?? row.slug),
        audioUrl: pickString(row.audio_url, fallback?.audioUrl ?? ""),
        coverImageUrl:
          pickStringOrNull(row.cover_image_url) ??
          fallback?.coverImageUrl ??
          null,
        isFeatured: Boolean(row.is_featured),
        sortOrder: row.sort_order ?? fallback?.sortOrder ?? 999,
      };
    })
    .filter((s) => s.audioUrl.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type MediaRow = {
  id: string;
  type: "image" | "video";
  file_url: string;
  thumbnail_url: string | null;
  sort_order: number | null;
  is_visible: boolean | null;
  category: string | null;
  alt: string | null;
};

export function normaliseGallery(
  rows: MediaRow[],
  fallbacks: GalleryItem[],
): GalleryItem[] {
  return rows
    .filter((r) => r.is_visible !== false && r.type === "image")
    .map((row, i) => ({
      id: row.id,
      src: pickString(row.file_url, fallbacks[i]?.src ?? ""),
      alt: pickString(row.alt, fallbacks[i]?.alt ?? "Typhoon"),
      thumbnailUrl: pickStringOrNull(row.thumbnail_url),
      sortOrder: row.sort_order ?? i + 1,
    }))
    .filter((g) => g.src.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type ShowRow = {
  id: string;
  starts_at: string;
  venue: string;
  city: string | null;
  country: string | null;
  ticket_url: string | null;
  is_visible: boolean | null;
  sort_order: number | null;
};

export function normaliseShows(
  rows: ShowRow[],
  fallbacks: ShowItem[],
): ShowItem[] {
  if (rows.length === 0) return fallbacks;
  return rows
    .filter((r) => r.is_visible !== false)
    .map((row, i) => {
      const date = new Date(row.starts_at);
      const day = Number.isFinite(date.getTime())
        ? date.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
        : "TBA";
      return {
        id: row.id,
        title: row.venue,
        region: [row.city, row.country].filter(Boolean).join(", ") || "—",
        time: day,
        startsAt: row.starts_at,
        ticketUrl: pickStringOrNull(row.ticket_url),
        sortOrder: row.sort_order ?? i + 1,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type LegalRow = {
  slug: string;
  is_published: boolean | null;
  translation: { title: string | null; body_md: string | null } | null;
};

export function normaliseLegalPage(
  row: LegalRow,
  type: LegalPageType,
  fallback: LegalPage,
): LegalPage {
  if (!row.is_published) return fallback;
  return {
    slug: type,
    title: pickString(row.translation?.title, fallback.title),
    bodyMd: pickString(row.translation?.body_md, fallback.bodyMd),
    draftNote: null,
  };
}

export type PlatformRow = {
  id: string;
  platform: string;
  url: string;
  is_active: boolean | null;
  sort_order: number | null;
};

export function normalisePlatformLinks(rows: PlatformRow[]): PlatformLink[] {
  return rows
    .filter((r) => r.is_active !== false)
    .map((row, i) => ({
      id: row.id,
      platform: row.platform,
      url: row.url,
      sortOrder: row.sort_order ?? i + 1,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type SeoRow = {
  path: string;
  title: string | null;
  description: string | null;
  og_image_url: string | null;
};

export function normaliseSeoEntry(row: SeoRow, fallback: SeoEntry): SeoEntry {
  return {
    path: row.path,
    title: pickStringOrNull(row.title) ?? fallback.title,
    description: pickStringOrNull(row.description) ?? fallback.description,
    ogImageUrl: pickStringOrNull(row.og_image_url) ?? fallback.ogImageUrl,
  };
}
