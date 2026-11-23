import type { Metadata } from "next";
import { LegalBody, LegalSections, LegalShell } from "@/components/legal/LegalShell";
import { legalFallback } from "@/content/legal";
import { site } from "@/data/site";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale, LOCALES, OG_LOCALE, type Locale } from "@/i18n/locales";
import { getLegalPage, getSeoEntry, getSiteSettings } from "@/lib/content";
import type { LegalPageType } from "@/lib/content/types";

// Shared server implementation of /[locale]/legal/{imprint,privacy,cookies}.
// Admin → Legal (Supabase, published) wins; otherwise the curated fallback.

const PATHS: Record<LegalPageType, string> = {
  imprint: "/legal/imprint",
  privacy: "/legal/privacy",
  cookies: "/legal/cookies",
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

const TITLE_KEY: Record<LegalPageType, "imprintTitle" | "privacyTitle" | "cookiesTitle"> = {
  imprint: "imprintTitle",
  privacy: "privacyTitle",
  cookies: "cookiesTitle",
};

export async function legalMetadata(type: LegalPageType, rawLocale: string): Promise<Metadata> {
  const locale = resolveLocale(rawLocale);
  const dict = getDict(locale);
  const entry = await getSeoEntry(PATHS[type], locale);
  const url = `/${locale}${PATHS[type]}`;
  const title = entry.title ?? dict.legal[TITLE_KEY[type]];
  const image = entry.ogImageUrl || "/og-image.jpg";
  // A full openGraph object: a partial one would inherit the layout's
  // home-page URL as og:url.
  return {
    title,
    description: entry.description ?? undefined,
    alternates: {
      canonical: url,
      languages: {
        de: `/de${PATHS[type]}`,
        en: `/en${PATHS[type]}`,
        tr: `/tr${PATHS[type]}`,
        "x-default": `/de${PATHS[type]}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Typhoon",
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title: `${title} · Typhoon`,
      images: [{ url: image, width: 1200, height: 630, alt: dict.meta.shareAlt }],
    },
  };
}

export async function LegalPageView({ type, rawLocale }: { type: LegalPageType; rawLocale: string }) {
  const locale = resolveLocale(rawLocale);
  const dict = getDict(locale);
  const [page, settings] = await Promise.all([getLegalPage(type, locale), getSiteSettings()]);
  const published = page.bodyMd.trim().length > 0;
  const fallback = legalFallback(type, locale, {
    name: site.imprint.name,
    street: site.imprint.street,
    city: site.imprint.city,
    country: site.imprint.country,
    email: settings.contactBookingEmail,
    phone: settings.contactPhone,
  });

  return (
    <LegalShell
      backLabel={dict.legal.backToHome}
      homeHref={`/${locale}`}
      meta={published ? null : `${dict.legal.updated}: ${fallback.updated}`}
      title={page.title}
    >
      {published ? <LegalBody text={page.bodyMd} /> : <LegalSections sections={fallback.sections} />}
    </LegalShell>
  );
}
