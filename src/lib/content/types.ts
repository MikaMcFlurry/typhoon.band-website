// Public content shapes consumed by the website. These are the
// "normalised" types the frontend reads — every loader (Supabase or
// fallback) returns one of these. Supabase row types live in
// `@/lib/supabase/types`.

import type { Locale } from "@/i18n/locales";

export type SiteSettings = {
  brandName: string;
  tagline: string;
  genreLine: string;
  contactBookingEmail: string;
  contactPhone: string;
  bookingDisabledNotice: string;
};

export type HeroContent = {
  line1: string;
  line2: string;
  line3: string;
  description: string;
  ctaListen: string;
  ctaBook: string;
  imageUrl: string;
  signatureUrl: string;
};

export type BandInfo = {
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  ctaBook: string;
  imageUrl: string;
};

export type Member = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  isPlaceholder: boolean;
  sortOrder: number;
};

export type SongItem = {
  id: string;
  title: string;
  audioUrl: string;
  coverImageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  thumbnailUrl: string | null;
  sortOrder: number;
};

export type ShowItem = {
  id: string;
  title: string;
  region: string;
  time: string;
  startsAt: string | null;
  ticketUrl: string | null;
  sortOrder: number;
};

export type LegalPageType = "imprint" | "privacy" | "cookies";

export type LegalPage = {
  slug: LegalPageType;
  title: string;
  bodyMd: string;
  draftNote: string | null;
};

export type PlatformLink = {
  id: string;
  platform: string;
  url: string;
  sortOrder: number;
};

export type SeoEntry = {
  path: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
};

export type PublicPageContent = {
  locale: Locale;
  siteSettings: SiteSettings;
  hero: HeroContent;
  bandInfo: BandInfo;
  members: Member[];
  songs: SongItem[];
  gallery: GalleryItem[];
  shows: ShowItem[];
  platformLinks: PlatformLink[];
};

export type ContentSource = "supabase" | "fallback";
