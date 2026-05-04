import { SectionHeader } from "@/components/sections/SectionHeader";
import { upcomingShows } from "@/data/shows";

// Termine — placed directly under the FeaturedPlayer per docs/v5
// (desktop-2-soll). Desktop = 4 compact cards in a row. Mobile = horizontal
// scroll-snap so the same card module reflows without a redesign.
//
// Card visual matches handoff `.show-card`: bordered panel, big serif day
// in gold, month label, venue + city + time block.
export function Shows() {
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="shows">
      <SectionHeader
        kicker="Termine"
        link={{ href: "#booking", label: "Alle Termine ansehen →" }}
      />
      {/* Desktop grid */}
      <div className="hidden grid-cols-4 gap-2.5 md:grid">
        {upcomingShows.map((s) => (
          <ShowCard key={s.id} show={s} />
        ))}
      </div>
      {/* Mobile scroll-rail keeps the same card module */}
      <div className="scroll-rail md:hidden">
        {upcomingShows.map((s) => (
          <div className="w-[78%] max-w-[280px]" key={s.id}>
            <ShowCard show={s} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ShowCard({ show }: { show: { day: string; month: string; venue: string; city: string; time: string } }) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.55)] px-4 py-4 transition hover:border-[color:var(--line-strong)]">
      <div className="flex min-w-[44px] flex-col items-start border-r border-[color:var(--line)] pr-3">
        <span className="font-display text-[24px] font-bold leading-none tracking-[-0.02em] text-[color:var(--gold-soft)] md:text-[28px]">
          {show.day}
        </span>
        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)]">
          {show.month}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate font-semibold text-[13px] text-[color:var(--cream)] md:text-[14px]">
          {show.venue}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[color:var(--muted-cream)]">
          <span aria-hidden className="text-[7px] text-[color:var(--gold-soft)]">
            ◉
          </span>
          <span className="truncate">{show.city}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[color:var(--muted)]">{show.time}</div>
      </div>
    </article>
  );
}
