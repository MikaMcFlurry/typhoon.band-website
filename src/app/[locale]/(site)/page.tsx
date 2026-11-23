import type { Metadata } from "next";
import { PlaylistRegistrar } from "@/components/audio/PlaylistRegistrar";
import { Band } from "@/components/sections/Band";
import { Booking } from "@/components/sections/Booking";
import { Faq, faqItems } from "@/components/sections/Faq";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Shows, splitShows } from "@/components/sections/Shows";
import { PlatformLinks } from "@/components/site/PlatformLinks";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale, LOCALES, OG_LOCALE } from "@/i18n/locales";
import { getPublicPageContent, getSeoEntry } from "@/lib/content";
import { buildHomeJsonLd } from "@/lib/seo/structured-data";

// Rendered on the server and cached for a minute. Admin actions call
// revalidatePath(`/${locale}`) so edits show up immediately.
export const revalidate = 60;

const FALLBACK_COVER = "/assets/hero/hero-collage.jpeg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDict(locale);
  const seo = await getSeoEntry("/", locale);
  const title = seo.title || dict.meta.title;
  const description = seo.description || dict.meta.description;
  const image = seo.ogImageUrl || "/og-image.jpg";
  // Page-level openGraph replaces the layout's object as a whole, so the
  // full set (type, url, locale, site name) has to be repeated here.
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { de: "/de", en: "/en", tr: "/tr", "x-default": "/de" },
    },
    openGraph: {
      type: "website",
      siteName: "Typhoon",
      url: `/${locale}`,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: dict.meta.shareAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDict(locale);
  const content = await getPublicPageContent(locale);

  const tracks = content.songs.map((s) => ({
    id: s.id,
    title: s.title,
    src: s.audioUrl,
    cover: s.coverImageUrl || FALLBACK_COVER,
  }));
  const featuredSong = content.songs.find((s) => s.isFeatured) ?? content.songs[0];
  const featured = featuredSong ? tracks.find((t) => t.id === featuredSong.id) ?? null : null;

  const { upcoming } = splitShows(content.shows);
  const memberCount = content.members.length;
  const email = content.siteSettings.contactBookingEmail;
  const phone = content.siteSettings.contactPhone;
  const jsonLd = buildHomeJsonLd({
    locale,
    title: dict.meta.title,
    description: dict.meta.description,
    members: content.members.map((m) => ({ name: m.name, role: m.role })),
    tracks: content.songs.map((s) => ({ title: s.title })),
    sameAs: content.platformLinks.map((l) => l.url),
    email,
    phone,
    images: ["/og-image.jpg", content.hero.imageUrl, content.bandInfo.imageUrl].filter(
      (src, i, all) => src && all.indexOf(src) === i,
    ),
    heroImage: content.hero.imageUrl,
    shows: upcoming
      .filter((s) => s.date)
      .map((s) => ({
        name: `Typhoon – ${s.venue}`,
        startDate: s.startTime ? `${s.date}T${s.startTime}` : (s.date as string),
        venue: s.venue,
        city: s.city,
        country: s.country,
        url: s.ticketUrl,
      })),
    faq: faqItems(dict, memberCount),
  });

  // With real dates on the calendar, Shows follows the hero (fans and
  // promoters see the band is busy). Without dates, the honest empty note
  // moves down to lead straight into the booking request instead of being
  // the second thing a booker reads.
  const shows = <Shows dict={dict} locale={locale} shows={content.shows} />;
  const showsFirst = upcoming.length > 0;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
      <PlaylistRegistrar playlist={tracks} />
      <Hero
        dict={dict}
        featured={featured}
        imageUrl={content.hero.imageUrl}
        locale={locale}
        memberCount={memberCount}
        setlistFooter={
          content.platformLinks.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="mono-cap text-chalk-2">{dict.music.alsoOn}</p>
              <PlatformLinks links={content.platformLinks} />
            </div>
          ) : null
        }
        signatureUrl={content.hero.signatureUrl}
        tracks={tracks}
      />
      {showsFirst ? shows : null}
      <Band dict={dict} imageUrl={content.bandInfo.imageUrl} members={content.members} />
      <Gallery items={content.gallery.map((g) => ({ id: g.id, src: g.src, alt: g.alt }))} />
      {showsFirst ? null : shows}
      <Booking dict={dict} email={email} memberCount={memberCount} phone={phone} />
      <Faq dict={dict} memberCount={memberCount} phone={phone} />
    </>
  );
}
