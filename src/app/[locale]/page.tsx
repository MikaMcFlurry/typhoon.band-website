import { FeaturedPlayer } from "@/components/audio/FeaturedPlayer";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { Demos } from "@/components/sections/Demos";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Members } from "@/components/sections/Members";
import { Shows } from "@/components/sections/Shows";
import { featuredSong } from "@/data/songs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedPlayer
        cover="/assets/hero/hero-collage.jpeg"
        releaseTag="Aktueller Demo · Single"
        song={featuredSong}
      />
      {/* Termine directly under the featured player per docs/v5 §3 */}
      <Shows />
      <About />
      <Members />
      <Demos />
      <Gallery />
      <Booking />
    </>
  );
}
