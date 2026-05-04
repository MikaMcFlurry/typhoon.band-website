import { SectionHeader } from "@/components/sections/SectionHeader";
import { site } from "@/data/site";

// Long-form band description per docs/14-old-site-content-and-ui-fix.md.
// Uses the panel/card visual rhythm of the rest of the onepager so it
// reads as a section, not a hero callout.
export function About() {
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="about">
      <SectionHeader kicker="Über Typhoon" />
      <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-5 md:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--gold-soft)] md:text-[11px]">
          {site.brand.genreLine}
        </p>
        <p className="mt-3 font-display text-xl leading-snug tracking-[-0.02em] text-[color:var(--cream)] md:text-2xl">
          {site.about.lead}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          {site.about.body}
        </p>
      </div>
    </section>
  );
}
