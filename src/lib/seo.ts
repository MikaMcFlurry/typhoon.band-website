import type { Metadata } from "next";
import { LOCALES, OG_LOCALE, type Locale } from "@/i18n/locales";

// Next.js merges metadata shallowly: a page that sets `openGraph` replaces
// the layout's object completely. Pages spread this base so og:url,
// og:type, og:site_name and og:locale(:alternate) survive.

export function openGraphBase(locale: Locale, path = ""): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: "Typhoon",
    locale: OG_LOCALE[locale],
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    url: `/${locale}${path}`,
  };
}

/** hreflang map for a path that exists in every locale; German is x-default. */
export function languageAlternates(path = ""): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
    "x-default": `/de${path}`,
  };
}
