import Image from "next/image";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { site } from "@/data/site";

// Editorial Bandinfo module per docs/v5 + docs/band-info-example.png:
//   desktop : image left  ─ text right
//   mobile  : same logic, image stays on top, text reflows below.
//
// Visuals: dark panel, gold eyebrow + serif headline, lede paragraph,
// secondary "Mehr über die Band" button. Replaces the old plain text card.
export function About() {
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="about">
      <SectionHeader kicker="Über Typhoon" />
      <article
        className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
        style={{
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 14px 38px rgba(0,0,0,0.34)",
        }}
      >
        <div className="relative aspect-[5/3] w-full overflow-hidden md:aspect-auto md:min-h-full">
          <Image
            alt="Typhoon — Live"
            className="h-full w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 42vw"
            src="/assets/gallery/gallery-5.jpg"
            style={{
              objectPosition: "center",
              filter: "saturate(0.92) contrast(1.05) brightness(0.92)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, rgba(3,2,1,0.55) 100%), linear-gradient(90deg, transparent 60%, rgba(3,2,1,0.45) 100%)",
            }}
          />
        </div>
        <div className="flex flex-col justify-center gap-3 p-5 md:gap-4 md:p-8">
          <span className="eyebrow">{site.about.eyebrow}</span>
          <h2 className="m-0 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-[color:var(--cream)] md:text-[34px] md:leading-[1.05]">
            {site.about.headline}
          </h2>
          <p className="text-[13px] leading-[1.65] text-[color:var(--muted-cream)] md:text-[14px]">
            {site.about.body}
          </p>
          <p className="text-[12px] leading-[1.7] text-[color:var(--muted)] md:text-[13px]">
            <span className="eyebrow mr-2 text-[9px] md:text-[10px]">
              {site.brand.genreLine}
            </span>
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <a className="btn btn-secondary" href="#band">
              {site.about.cta}
            </a>
            <a className="btn btn-primary" href="#booking">
              Booking Anfrage
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}
