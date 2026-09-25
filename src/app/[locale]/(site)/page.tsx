import type { Metadata } from "next";
import { FeaturedPlayer } from "@/components/audio/FeaturedPlayer";
import { PlaylistRegistrar } from "@/components/audio/PlaylistRegistrar";
import { Band } from "@/components/sections/Band";
import { Booking } from "@/components/sections/Booking";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Music } from "@/components/sections/Music";
import { countryCode, Shows, splitShows } from "@/components/sections/Shows";
import { PlatformLinks } from "@/components/site/PlatformLinks";
import { getDict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { getPublicPageContent, getSeoEntry } from "@/lib/content";
import { languageAlternates, openGraphBase } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

// Rendered on the server and cached for a minute. Admin actions call
// revalidatePath(`/${locale}`) so edits show up immediately.
export const revalidate = 60;

const FALLBACK_COVER = "/assets/hero/hero-collage.jpeg";
const POSTER = "/assets/gallery/gallery-3.jpg";

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
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/${locale}`, languages: languageAlternates() },
    openGraph: {
      ...openGraphBase(locale),
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: dict.meta.ogAlt }],
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
    duration: s.durationSeconds,
  }));
  const featuredSong = content.songs.find((s) => s.isFeatured) ?? content.songs[0];
  const featured = featuredSong ? tracks.find((t) => t.id === featuredSong.id) ?? null : null;

  const { upcoming } = splitShows(content.shows);
  const jsonLd = buildJsonLd({
    locale,
    description: dict.meta.description,
    members: content.members.map((m) => ({ name: m.name, role: m.role })),
    sameAs: content.platformLinks.map((l) => l.url),
    email: content.siteSettings.contactBookingEmail,
    shows: upcoming
      .filter((s) => s.date)
      .map((s) => ({
        name: `Typhoon – ${s.venue}`,
        startDate: s.startTime ? `${s.date}T${s.startTime}` : (s.date as string),
        venue: s.venue,
        city: s.city,
        country: countryCode(s.country) ?? s.country,
        url: s.ticketUrl,
      })),
  });

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
        signatureUrl={content.hero.signatureUrl}
      />
      {featured ? <FeaturedPlayer song={featured} /> : null}
      <Shows dict={dict} locale={locale} shows={content.shows} />
      <Band dict={dict} imageUrl={content.bandInfo.imageUrl} members={content.members} />
      <Music tracks={tracks}>
        {content.platformLinks.length > 0 ? (
          <div className="reveal mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <p className="label">{dict.music.alsoOn}</p>
            <PlatformLinks links={content.platformLinks} />
          </div>
        ) : null}
      </Music>
      <Gallery items={content.gallery.map((g) => ({ id: g.id, src: g.src, alt: g.alt }))} />
      <Booking
        dict={dict}
        email={content.siteSettings.contactBookingEmail}
        memberCount={content.members.length}
        phone={content.siteSettings.contactPhone}
        posterUrl={POSTER}
      />
    </>
  );
}

function buildJsonLd(input: {
  locale: string;
  description: string;
  members: { name: string; role: string }[];
  sameAs: string[];
  email: string;
  shows: {
    name: string;
    startDate: string;
    venue: string;
    city: string | null;
    country: string | null;
    url: string | null;
  }[];
}) {
  const url = absoluteUrl(`/${input.locale}`);
  const group = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": absoluteUrl("/#band"),
    name: "Typhoon",
    url,
    description: input.description,
    image: absoluteUrl("/og-image.jpg"),
    logo: absoluteUrl("/assets/branding/typhoon-signature-gold.png"),
    genre: ["Blues rock", "Funk", "Soul", "Jazz", "Southern rock"],
    location: {
      "@type": "Place",
      name: "Kanzlei Studio",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hechingen",
        addressRegion: "Baden-Württemberg",
        addressCountry: "DE",
      },
    },
    email: input.email,
    member: input.members.map((m) => ({
      "@type": "OrganizationRole",
      member: { "@type": "Person", name: m.name },
      roleName: m.role,
    })),
    ...(input.sameAs.length ? { sameAs: input.sameAs } : {}),
    ...(input.shows.length
      ? {
          event: input.shows.map((s) => ({
            "@type": "MusicEvent",
            name: s.name,
            startDate: s.startDate,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: s.venue,
              address: {
                "@type": "PostalAddress",
                ...(s.city ? { addressLocality: s.city } : {}),
                ...(s.country ? { addressCountry: s.country } : {}),
              },
            },
            performer: { "@id": absoluteUrl("/#band") },
            ...(s.url ? { offers: { "@type": "Offer", url: s.url } } : {}),
          })),
        }
      : {}),
  };
  // Escape "<" so user-provided strings can never close the script tag.
  return JSON.stringify(group).replace(/</g, "\\u003c");
}
