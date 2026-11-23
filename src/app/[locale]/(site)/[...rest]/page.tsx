import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";

// Unknown paths under a locale render the styled not-found page below.
// Own title and no canonical/hreflang (the layout's point at the home page).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = getDict(isLocale(raw) ? raw : DEFAULT_LOCALE);
  return {
    title: dict.notFound.title,
    alternates: {},
    robots: { index: false, follow: true },
  };
}

export default function CatchAll() {
  notFound();
}
