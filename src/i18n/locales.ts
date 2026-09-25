// Locale registry shared by middleware, layouts and the dictionary loader.
// Default locale is German.
export const LOCALES = ["de", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export const LOCALE_LABEL: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

export const OG_LOCALE: Record<Locale, string> = {
  de: "de_DE",
  en: "en_GB",
  tr: "tr_TR",
};

/** BCP-47 tag for Intl date formatting. */
export const INTL_LOCALE: Record<Locale, string> = {
  de: "de-DE",
  en: "en-GB",
  tr: "tr-TR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
