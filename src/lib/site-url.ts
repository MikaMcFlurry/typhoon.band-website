// Canonical site origin for metadata, sitemap and JSON-LD.
// NEXT_PUBLIC_SITE_URL is set in Vercel; fall back to the production domain.
const FALLBACK = "https://www.typhoon.band";

export function siteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // ignore malformed value
    }
  }
  return new URL(FALLBACK);
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl()).toString();
}
