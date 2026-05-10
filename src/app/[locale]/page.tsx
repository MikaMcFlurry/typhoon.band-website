import { FeaturedPlayer } from "@/components/audio/FeaturedPlayer";
import { PlaylistRegistrar } from "@/components/audio/PlaylistRegistrar";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { Demos } from "@/components/sections/Demos";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Members } from "@/components/sections/Members";
import { Shows } from "@/components/sections/Shows";
import { featuredSong, songs } from "@/data/songs";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { getShows } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const playlist = songs.map((s) => ({ id: s.id, src: s.src }));
  // `getShows()` falls back to dictionary placeholders when Supabase has
  // no published rows, so passing the result is always safe — the public
  // section never collapses and the design is preserved.
  const shows = await getShows(locale);
  // The fallback rows synthesise sortOrder 1..N but carry no real
  // `startsAt`. We treat "any row with a real timestamp" as the signal
  // that Supabase has visible shows; otherwise keep the dictionary look.
  const supabaseShows = shows.filter((s) => Boolean(s.startsAt));
  return (
    <>
      <PlaylistRegistrar playlist={playlist} />
      <Hero />
      <FeaturedPlayer cover="/assets/hero/hero-collage.jpeg" song={featuredSong} />
      {/* Termine directly under the featured player per docs/v5 §3 */}
      <Shows rows={supabaseShows.length > 0 ? supabaseShows : undefined} />
      <About />
      <Members />
      <Demos />
      <Gallery />
      <Booking />
    </>
  );
}
