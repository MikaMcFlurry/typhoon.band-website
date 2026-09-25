import { FeaturedPlayer } from "@/components/audio/FeaturedPlayer";
import { PlaylistRegistrar } from "@/components/audio/PlaylistRegistrar";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { Demos } from "@/components/sections/Demos";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Members } from "@/components/sections/Members";
import { Shows } from "@/components/sections/Shows";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { getPublicPageContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const content = await getPublicPageContent(locale);

  // Map normalised SongItem → audio-row shape used by the player. We
  // keep this transform in the page so Demos/FeaturedPlayer don't have
  // to know about the content-provider types.
  const songsForUi = content.songs.map((s) => ({
    id: s.id,
    title: s.title,
    src: s.audioUrl,
    cover: s.coverImageUrl,
  }));
  const featured =
    songsForUi.find(
      (s) => content.songs.find((cs) => cs.id === s.id)?.isFeatured,
    ) ?? songsForUi[0];

  const playlist = songsForUi.map((s) => ({ id: s.id, src: s.src }));

  // `getShows()` falls back to dictionary placeholders when Supabase has
  // no published rows, so passing the result is always safe — the public
  // section never collapses and the design is preserved.
  const supabaseShows = content.shows.filter((s) => Boolean(s.startsAt));

  return (
    <>
      <PlaylistRegistrar playlist={playlist} />
      <Hero
        imageUrl={content.hero.imageUrl}
        signatureUrl={content.hero.signatureUrl}
      />
      {featured ? (
        <FeaturedPlayer
          cover={featured.cover ?? content.hero.imageUrl}
          song={{ id: featured.id, title: featured.title, src: featured.src }}
        />
      ) : null}
      {/* Termine directly under the featured player per docs/v5 §3 */}
      <Shows rows={supabaseShows.length > 0 ? supabaseShows : undefined} />
      <About imageUrl={content.bandInfo.imageUrl} />
      <Members
        members={content.members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          bio: m.bio,
          photoUrl: m.photoUrl,
          isPlaceholder: m.isPlaceholder,
        }))}
      />
      <Demos songs={songsForUi} />
      <Gallery
        items={content.gallery.map((g) => ({
          id: g.id,
          src: g.src,
          alt: g.alt,
        }))}
      />
      <Booking />
    </>
  );
}
