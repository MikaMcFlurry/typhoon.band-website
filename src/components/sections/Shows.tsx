"use client";

import { useDict } from "@/components/i18n/DictProvider";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { ShowItem } from "@/lib/content/types";

// Termine — placed directly under the FeaturedPlayer per docs/v5 §3.
// Desktop = 4 compact cards in a row, mobile = horizontal scroll-snap.
//
// When the homepage server-fetches Supabase rows it passes them in via
// `rows`. If `rows` is empty (Supabase missing, no published shows, or a
// transient error) the section falls back to the localised TBA copy from
// the dictionary so the design never collapses.
export function Shows({ rows }: { rows?: ShowItem[] }) {
  const { dict } = useDict();
  const cards =
    rows && rows.length > 0
      ? rows.map((row) => formatShowCard(row))
      : dict.shows.placeholderTitles.map((title, i) => ({
          id: `tba-${i + 1}`,
          title,
          region: dict.shows.placeholderRegion[i] ?? "",
          time: dict.shows.placeholderTime[i] ?? "",
          ticketUrl: null as string | null,
          year: "2025",
          dateLabel: "TBA",
        }));

  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="shows">
      <SectionHeader kicker={dict.shows.kicker} link={{ href: "#booking", label: dict.shows.link }} />
      <div className="hidden grid-cols-4 gap-2.5 md:grid">
        {cards.slice(0, 4).map((s) => (
          <ShowCard key={s.id} show={s} />
        ))}
      </div>
      <div className="scroll-rail md:hidden">
        {cards.map((s) => (
          <div className="w-[78%] max-w-[280px]" key={s.id}>
            <ShowCard show={s} />
          </div>
        ))}
      </div>
    </section>
  );
}

type CardModel = {
  id: string;
  title: string;
  region: string;
  time: string;
  ticketUrl: string | null;
  year: string;
  dateLabel: string;
};

function formatShowCard(row: ShowItem): CardModel {
  const date = row.startsAt ? new Date(row.startsAt) : null;
  const valid = date && Number.isFinite(date.getTime());
  const dateLabel = valid
    ? date.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
    : "TBA";
  const year = valid
    ? String(date.getFullYear())
    : new Date().getFullYear().toString();
  return {
    id: row.id,
    title: row.title,
    region: row.region,
    time: row.time,
    ticketUrl: row.ticketUrl,
    year,
    dateLabel,
  };
}

function ShowCard({ show }: { show: CardModel }) {
  const inner = (
    <>
      <div className="flex min-w-[44px] flex-col items-start border-r border-[color:var(--line)] pr-3">
        <span className="font-display text-[24px] font-bold leading-none tracking-[-0.02em] text-[color:var(--gold-soft)] md:text-[28px]">
          {show.dateLabel}
        </span>
        <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)]">
          {show.year}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate font-semibold text-[13px] text-[color:var(--cream)] md:text-[14px]">
          {show.title}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[color:var(--muted-cream)]">
          <span aria-hidden className="text-[7px] text-[color:var(--gold-soft)]">
            ◉
          </span>
          <span className="truncate">{show.region}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[color:var(--muted)]">{show.time}</div>
      </div>
    </>
  );

  const className =
    "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.55)] px-4 py-4 transition hover:border-[color:var(--line-strong)]";

  if (show.ticketUrl) {
    return (
      <a
        href={show.ticketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return <article className={className}>{inner}</article>;
}
