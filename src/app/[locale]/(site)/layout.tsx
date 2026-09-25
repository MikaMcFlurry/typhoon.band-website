import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import { PlayerDock } from "@/components/audio/PlayerDock";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MotionInit } from "@/components/site/MotionInit";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { getPlatformLinks, getSiteSettings } from "@/lib/content";

// Public site chrome. The admin area lives outside this route group and
// gets its own shell (no public header, footer, player or consent banner).
// The audio provider sits here so playback continues across the home page
// and the legal pages with the dock always visible.

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDict(locale);
  const [settings, platformLinks] = await Promise.all([
    getSiteSettings(),
    getPlatformLinks(),
  ]);

  return (
    <AudioPlayerProvider>
      <div id="top" />
      <a className="skip-link" href="#main">
        {dict.a11y.skip}
      </a>
      <Header bookingEmail={settings.contactBookingEmail} phone={settings.contactPhone} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer
        dict={dict}
        email={settings.contactBookingEmail}
        locale={locale}
        phone={settings.contactPhone}
        platformLinks={platformLinks}
      />
      <PlayerDock fallbackCover="/assets/hero/hero-collage.jpeg" />
      <ConsentBanner />
      <MotionInit />
    </AudioPlayerProvider>
  );
}
