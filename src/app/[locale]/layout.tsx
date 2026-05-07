import { notFound } from "next/navigation";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import { DictProvider } from "@/components/i18n/DictProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getDict } from "@/i18n/dictionaries";
import { isLocale, LOCALES } from "@/i18n/locales";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <DictProvider dict={dict} locale={locale}>
      <AudioPlayerProvider>
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </AudioPlayerProvider>
    </DictProvider>
  );
}
