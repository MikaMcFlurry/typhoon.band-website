import { SectionHeader } from "@/components/sections/SectionHeader";

// Compact #shows section per docs/14 — header navigation links to it.
// No real dates yet; we render a single TBA card and never invent
// fake events. When Admin/Supabase ships, this will read real shows.
export function Shows() {
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="shows">
      <SectionHeader kicker="Termine" />
      <div className="rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-5 md:p-7">
        <div className="grid grid-cols-[auto_1fr] items-center gap-4 md:gap-[14px]">
          <div className="flex flex-col items-start border-r border-[color:var(--line)] pr-4 md:pr-[14px]">
            <span className="font-display text-[28px] font-bold leading-none tracking-[-0.02em] text-[color:var(--gold-soft)] md:text-[30px]">
              TBA
            </span>
            <span className="mt-[5px] text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)]">
              2025
            </span>
          </div>
          <div>
            <div className="font-display text-[15px] font-semibold leading-tight tracking-[-0.005em] text-[color:var(--cream)] md:text-base">
              Neue Termine in Vorbereitung
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[color:var(--muted-cream)] md:text-[13px]">
              Live-Daten werden gerade geplant. Schreibt uns für direkte
              Booking-Anfragen oder folgt uns für Updates.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                className="btn btn-secondary !px-3 !py-2 !text-[10px] md:!px-4 md:!py-2.5 md:!text-[11px]"
                href="#booking"
              >
                Booking Anfrage
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
