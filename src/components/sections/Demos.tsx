"use client";

import { DemoRow } from "@/components/audio/DemoRow";
import { useDict } from "@/components/i18n/DictProvider";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { songs } from "@/data/songs";

export function Demos() {
  const { dict } = useDict();
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="music">
      <SectionHeader kicker={dict.demos.kicker} />
      <div className="flex w-full max-w-full min-w-0 flex-col gap-2">
        {songs.map((song, i) => (
          <DemoRow index={i} key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
}
