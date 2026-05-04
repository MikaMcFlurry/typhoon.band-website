import { SectionHeader } from "@/components/sections/SectionHeader";

export function About() {
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8">
      <SectionHeader kicker="Über Typhoon" />
      <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-5 md:p-7">
        <p className="font-display text-xl leading-snug tracking-[-0.02em] text-[color:var(--cream)] md:text-2xl">
          Typhoon ist eine 8-köpfige Live-Band, die türkischsprachige Texte mit
          Bluesrock, Funk, Soul, Jazz und Southern Rock verbindet.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Erfahrene Musiker, kraftvolle Bläser-Sektion, warmer amerikanisch-europäischer
          Sound — und auf der Bühne ein Groove, der sofort ansteckt.
        </p>
      </div>
    </section>
  );
}
