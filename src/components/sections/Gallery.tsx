"use client";

import Image from "next/image";
import { useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { MediaLightbox } from "@/components/media/MediaLightbox";
import { SectionHeader } from "@/components/sections/SectionHeader";

// The server passes the active gallery list (Supabase first, repo
// fallback second) so the Admin can publish/hide images via
// `media_items` without touching the design.
export type GalleryCard = {
  id: string;
  src: string;
  alt: string;
};

export function Gallery({ items }: { items: GalleryCard[] }) {
  const { dict } = useDict();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="media">
      <SectionHeader kicker={dict.media.kicker} />
      <div className="grid grid-cols-4 gap-1.5 md:grid-cols-8 md:gap-2">
        {items.map((g, i) => (
          <button
            aria-label={`${dict.media.open}: ${g.alt}`}
            className="relative block aspect-square overflow-hidden rounded-md border border-[color:var(--line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gold-soft)]"
            key={g.id}
            onClick={() => setOpenIndex(i)}
            type="button"
          >
            <Image
              alt={g.alt}
              className="h-full w-full object-cover sepia-img transition duration-500 hover:scale-105"
              height={400}
              src={g.src}
              width={400}
            />
          </button>
        ))}
      </div>
      <MediaLightbox
        index={openIndex}
        items={items}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </section>
  );
}
