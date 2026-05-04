import Image from "next/image";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { gallery } from "@/data/gallery";

export function Gallery() {
  return (
    <section className="mx-auto mt-10 max-w-container px-4 md:mt-12 md:px-8" id="media">
      <SectionHeader kicker="Media" />
      <div className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-2">
        {gallery.map((g) => (
          <a
            aria-label={g.alt}
            className="relative block aspect-square overflow-hidden rounded border border-[color:var(--line)]"
            href={g.src}
            key={g.id}
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt={g.alt}
              className="h-full w-full object-cover sepia-img transition duration-500 hover:scale-105"
              height={400}
              src={g.src}
              width={400}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
