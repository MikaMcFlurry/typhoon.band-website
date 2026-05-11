// Static fallback layer. Every public-content loader returns this when
// Supabase is not configured or has no published records. Pulls from the
// existing `src/data/*` seed data and `public/assets/*` so the site keeps
// rendering identically with zero env configuration.

import { gallery as galleryFallback } from "@/data/gallery";
import { members as membersFallback } from "@/data/members";
import { upcomingShows } from "@/data/shows";
import { site as siteFallback } from "@/data/site";
import { songs as songsFallback, featuredSong } from "@/data/songs";
import { getDict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
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

export function buildSiteSettingsFallback(): SiteSettings {
  return {
    brandName: siteFallback.brand.name,
    tagline: siteFallback.brand.tagline,
    genreLine: siteFallback.brand.genreLine,
    contactBookingEmail: siteFallback.contact.booking,
    contactPhone: siteFallback.contact.phone,
    bookingDisabledNotice: siteFallback.bookingDisabledNotice,
  };
}

export function buildHeroFallback(locale: Locale): HeroContent {
  const dict = getDict(locale);
  return {
    line1: dict.hero.line1,
    line2: dict.hero.line2,
    line3: dict.hero.line3,
    description: dict.hero.description,
    ctaListen: dict.hero.ctaListen,
    ctaBook: dict.hero.ctaBook,
    imageUrl: "/assets/hero/hero-collage.jpeg",
    signatureUrl: "/assets/branding/typhoon-signature-gold.png",
  };
}

export function buildBandInfoFallback(locale: Locale): BandInfo {
  const dict = getDict(locale);
  return {
    eyebrow: dict.about.eyebrow,
    headline: dict.about.headline,
    body: dict.about.body,
    cta: dict.about.cta,
    ctaBook: dict.about.ctaBook,
    imageUrl: "/assets/gallery/gallery-5.jpg",
  };
}

export function buildMembersFallback(locale: Locale): Member[] {
  const dict = getDict(locale);
  return membersFallback.map((m) => ({
    id: m.id,
    name: m.name,
    role: dict.members.instrument[m.id] ?? m.role,
    bio: dict.members.bio[m.id] ?? m.bio,
    photoUrl: m.photo,
    isPlaceholder: Boolean(m.isPlaceholder),
    sortOrder: m.sortOrder,
  }));
}

export function buildSongsFallback(): SongItem[] {
  return songsFallback.map((s) => ({
    id: s.id,
    title: s.title,
    audioUrl: s.src,
    coverImageUrl: null,
    isFeatured: s.id === featuredSong.id,
    sortOrder: s.sortOrder,
  }));
}

export function buildGalleryFallback(): GalleryItem[] {
  return galleryFallback.map((g, i) => ({
    id: g.id,
    src: g.src,
    alt: g.alt,
    thumbnailUrl: null,
    sortOrder: i + 1,
  }));
}

export function buildShowsFallback(locale: Locale): ShowItem[] {
  const dict = getDict(locale);
  return upcomingShows.map((s, i) => ({
    id: s.id,
    title: dict.shows.placeholderTitles[i] ?? s.venue,
    region: dict.shows.placeholderRegion[i] ?? s.city,
    time: dict.shows.placeholderTime[i] ?? s.time,
    startsAt: null,
    ticketUrl: null,
    sortOrder: i + 1,
  }));
}

export function buildLegalPageFallback(
  type: LegalPageType,
  locale: Locale,
): LegalPage {
  const dict = getDict(locale);
  const titleByType: Record<LegalPageType, string> = {
    imprint: dict.legal.imprintTitle,
    privacy: dict.legal.privacyTitle,
    cookies: dict.legal.cookiesTitle,
  };
  return {
    slug: type,
    title: titleByType[type],
    bodyMd: "",
    draftNote: dict.legal.draftNote,
  };
}

export function buildPlatformLinksFallback(): PlatformLink[] {
  // No real platform links published yet — all socials are empty strings
  // in `src/data/site.ts`, so return an empty list rather than fake URLs.
  return [];
}

export function buildSeoFallback(path: string, locale: Locale): SeoEntry {
  const dict = getDict(locale);
  // Page-specific fallbacks so the legal routes don't pretend to be the
  // home page in their `<title>`. The root layout applies a `· Typhoon`
  // suffix template, so we return the bare page label here.
  let title = `Typhoon — ${dict.brand.genreLine}`;
  if (path === "/legal/imprint") {
    title = dict.legal.imprintTitle;
  } else if (path === "/legal/privacy") {
    title = dict.legal.privacyTitle;
  } else if (path === "/legal/cookies") {
    title = dict.legal.cookiesTitle;
  }
  return {
    path,
    title,
    description: dict.hero.description,
    ogImageUrl: "/assets/hero/hero-collage.jpeg",
  };
}

export function buildPublicPageFallback(locale: Locale): PublicPageContent {
  return {
    locale,
    siteSettings: buildSiteSettingsFallback(),
    hero: buildHeroFallback(locale),
    bandInfo: buildBandInfoFallback(locale),
    members: buildMembersFallback(locale),
    songs: buildSongsFallback(),
    gallery: buildGalleryFallback(),
    shows: buildShowsFallback(locale),
    platformLinks: buildPlatformLinksFallback(),
  };
}
