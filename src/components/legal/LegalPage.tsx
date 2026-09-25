import type { Metadata } from "next";
import { LegalBody, LegalSections, LegalShell } from "@/components/legal/LegalShell";
import { legalFallback } from "@/content/legal";
import { site } from "@/data/site";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
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

export async function legalMetadata(type: LegalPageType, rawLocale: string): Promise<Metadata> {
  const locale = resolveLocale(rawLocale);
  const entry = await getSeoEntry(PATHS[type], locale);
  return {
    title: entry.title ?? undefined,
    description: entry.description ?? undefined,
    alternates: {
      canonical: `/${locale}${PATHS[type]}`,
      languages: {
        de: `/de${PATHS[type]}`,
        en: `/en${PATHS[type]}`,
        tr: `/tr${PATHS[type]}`,
      },
    },
    openGraph: entry.ogImageUrl ? { images: [{ url: entry.ogImageUrl }] } : undefined,
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
