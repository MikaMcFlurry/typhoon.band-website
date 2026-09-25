// Server-side validation for Phase 06 admin forms:
//   - Legal page translations (per slug × locale)
//   - SEO entries (per path × locale)
//   - Platform links (Spotify/YouTube/Instagram/Facebook/SoundCloud/Bandcamp)
//
// All inputs come from FormData (server actions) and are therefore
// untrusted strings. Each validator returns a discriminated union so
// callers can branch cleanly without try/catch.

import { LOCALES, type Locale } from "@/i18n/locales";

// ---------- shared helpers ----------

function trim(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "on" || value === "true" || value === "1") return true;
  if (value === "off" || value === "false" || value === "0" || value === "")
    return false;
  return fallback;
}

function asInt(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// ---------- legal page ----------

export const LEGAL_SLUGS = ["imprint", "privacy", "cookies"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

export type LegalFormData = {
  slug: LegalSlug;
  locale: Locale;
  title: string;
  bodyMd: string;
  isPublished: boolean;
};

export type LegalValidation =
  | { ok: true; data: LegalFormData }
  | { ok: false; field: string; message: string };

const TITLE_MAX = 160;
const BODY_MAX = 16_000;

export function validateLegal(raw: unknown): LegalValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, field: "_global", message: "Ungültige Anfrage." };
  }
  const r = raw as Record<string, unknown>;

  const slug = trim(r.slug, 40);
  if (!isLegalSlug(slug)) {
    return { ok: false, field: "slug", message: "Ungültiger Seiten-Slug." };
  }

  const locale = trim(r.locale, 8);
  if (!isLocale(locale)) {
    return { ok: false, field: "locale", message: "Ungültige Locale." };
  }

  const title = trim(r.title, TITLE_MAX);
  if (title.length === 0) {
    return { ok: false, field: "title", message: "Titel ist Pflicht." };
  }

  const bodyMd = trim(r.body_md, BODY_MAX);
  // Body may be empty when an Admin wants to create the page row up-front
  // and fill it later — we just skip the translation insert downstream.

  const isPublished = asBool(r.is_published, false);

  return { ok: true, data: { slug, locale, title, bodyMd, isPublished } };
}

// ---------- SEO entry ----------

const SEO_PATH_MAX = 200;
const SEO_TITLE_MAX = 80;
const SEO_DESC_MAX = 180;
const SEO_OG_MAX = 500;
const SEO_PATH_RE = /^\/[a-z0-9\-/]*$/i;

export type SeoFormData = {
  path: string;
  locale: Locale;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export type SeoValidation =
  | { ok: true; data: SeoFormData }
  | { ok: false; field: string; message: string };

export function validateSeo(raw: unknown): SeoValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, field: "_global", message: "Ungültige Anfrage." };
  }
  const r = raw as Record<string, unknown>;

  const rawPath = trim(r.path, SEO_PATH_MAX);
  if (rawPath.length === 0) {
    return { ok: false, field: "path", message: "Pfad ist Pflicht." };
  }
  if (!SEO_PATH_RE.test(rawPath)) {
    return {
      ok: false,
      field: "path",
      message: "Pfad muss mit / beginnen und darf nur a-z, 0-9, /, - enthalten.",
    };
  }

  const locale = trim(r.locale, 8);
  if (!isLocale(locale)) {
    return { ok: false, field: "locale", message: "Ungültige Locale." };
  }

  const title = trim(r.title, SEO_TITLE_MAX) || null;
  const description = trim(r.description, SEO_DESC_MAX) || null;

  const ogRaw = trim(r.og_image_url, SEO_OG_MAX);
  let ogImageUrl: string | null = null;
  if (ogRaw.length > 0) {
    if (!isHttpsUrl(ogRaw)) {
      return {
        ok: false,
        field: "og_image_url",
        message: "OG-Bild muss eine gültige http(s)-URL sein.",
      };
    }
    ogImageUrl = ogRaw;
  }

  return {
    ok: true,
    data: { path: rawPath, locale, title, description, ogImageUrl },
  };
}

// ---------- platform link ----------

export const PLATFORM_KEYS = [
  "spotify",
  "youtube",
  "instagram",
  "facebook",
  "soundcloud",
  "bandcamp",
] as const;
export type PlatformKey = (typeof PLATFORM_KEYS)[number];

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
};

export function isPlatformKey(value: string): value is PlatformKey {
  return (PLATFORM_KEYS as readonly string[]).includes(value);
}

export type PlatformLinkFormData = {
  platform: PlatformKey;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

export type PlatformLinkValidation =
  | { ok: true; data: PlatformLinkFormData }
  | { ok: false; field: string; message: string };

export function validatePlatformLink(raw: unknown): PlatformLinkValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, field: "_global", message: "Ungültige Anfrage." };
  }
  const r = raw as Record<string, unknown>;

  const platform = trim(r.platform, 32).toLowerCase();
  if (!isPlatformKey(platform)) {
    return {
      ok: false,
      field: "platform",
      message: "Plattform wird nicht unterstützt.",
    };
  }

  const url = trim(r.url, 500);
  if (url.length === 0) {
    return { ok: false, field: "url", message: "URL ist Pflicht." };
  }
  if (!isHttpsUrl(url)) {
    return {
      ok: false,
      field: "url",
      message: "URL muss eine gültige http(s)-URL sein.",
    };
  }

  const isActive = asBool(r.is_active, true);
  const sortOrder = asInt(r.sort_order, 0);

  return { ok: true, data: { platform, url, isActive, sortOrder } };
}
