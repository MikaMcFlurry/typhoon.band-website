// Locale registry shared by middleware-less locale routing and the
// dictionary loader. Default locale is German.
export const LOCALES = ["de", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
