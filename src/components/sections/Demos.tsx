import { DemoRow } from "@/components/audio/DemoRow";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { songs } from "@/data/songs";

export function Demos() {
  return (
    <section className="mx-auto mt-10 max-w-container px-4 md:mt-12 md:px-8" id="music">
      <SectionHeader kicker="Demos" />
      <div className="flex flex-col gap-2">
        {songs.map((song, i) => (
          <DemoRow index={i} key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}
