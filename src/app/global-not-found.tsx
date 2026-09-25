import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { DictProvider } from "@/components/i18n/DictProvider";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Icon } from "@/components/ui/Icon";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { getPlatformLinks, getSiteSettings } from "@/lib/content";
import { archivo, newsreader } from "./fonts";
import "./globals.css";

// Server-rendered 404 for every unknown URL (experimental.globalNotFound).
// The locale comes from the middleware (x-typhoon-locale), because this
// page receives no route params. Title and content are localized, the
// page works without JavaScript and keeps the site header and footer.

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function GlobalNotFound() {
  const raw = (await headers()).get("x-typhoon-locale");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDict(locale);
  const [settings, platformLinks] = await Promise.all([getSiteSettings(), getPlatformLinks()]);

  return (
    <html className={`${archivo.variable} ${newsreader.variable}`} lang={locale}>
      <head>
        <title>{`${dict.notFound.title} · Typhoon`}</title>
      </head>
      <body className="font-sans">
        <DictProvider dict={dict} locale={locale}>
          <a className="skip-link" href="#main">
            {dict.a11y.skip}
          </a>
          <ConsentBanner />
          <Header bookingEmail={settings.contactBookingEmail} phone={settings.contactPhone} />
          <main className="outline-none" id="main" tabIndex={-1}>
            <section className="container-x flex min-h-[70svh] flex-col items-start justify-center pb-24 pt-[calc(var(--header-h)+48px)]">
              <p className="label">404</p>
              <h1 className="h-section mt-4 max-w-[18ch]">{dict.notFound.title}</h1>
              <p className="lede mt-6">{dict.notFound.body}</p>
              <Link className="btn btn-primary mt-10" href={`/${locale}`}>
                <Icon name="arrow-left" size={18} />
                {dict.notFound.cta}
              </Link>
            </section>
          </main>
          <Footer
            dict={dict}
            email={settings.contactBookingEmail}
            locale={locale}
            phone={settings.contactPhone}
            platformLinks={platformLinks}
          />
        </DictProvider>
      </body>
    </html>
  );
}
