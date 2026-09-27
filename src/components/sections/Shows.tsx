import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { INTL_LOCALE, type Locale } from "@/i18n/locales";
import type { ShowItem } from "@/lib/content/types";

// Dates on the wall next to the band poster: blue tape carries the day,
// venue in stage caps, place/time/type in mono, ticket link when set.
// Upcoming first, TBA after, past shows folded away. With no dates, an
// honest note that points promoters to booking (we never invent dates).
// The poster is the admin's hero image (Site assets → hero_image), shown
// whole: the band collage is never cropped.

export function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function splitShows(shows: ShowItem[], today = todayInBerlin()) {
  const upcoming: ShowItem[] = [];
  const past: ShowItem[] = [];
  for (const s of shows) {
    if (s.date && s.date < today) past.push(s);
    else upcoming.push(s);
  }
  past.reverse();
  return { upcoming, past };
}

function dateParts(date: string, locale: Locale) {
  // Wall-clock date → format in UTC so the day never shifts.
  const d = new Date(`${date}T00:00:00Z`);
  const intl = INTL_LOCALE[locale];
  return {
    day: new Intl.DateTimeFormat(intl, { day: "2-digit", timeZone: "UTC" }).format(d),
    month: new Intl.DateTimeFormat(intl, { month: "short", timeZone: "UTC" })
      .format(d)
      .replace(".", ""),
    weekday: new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" })
      .format(d)
      .replace(".", ""),
    year: d.getUTCFullYear(),
    full: new Intl.DateTimeFormat(intl, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d),
  };
}

function eventTypeLabel(type: string | null, dict: Dict) {
  if (!type) return null;
  const key = type.trim().toLowerCase();
  return dict.shows.eventTypes[key] ?? type;
}

function ShowRow({ show, dict, locale, muted = false }: { show: ShowItem; dict: Dict; locale: Locale; muted?: boolean }) {
  const parts = show.date ? dateParts(show.date, locale) : null;
  const place = [show.city, show.country].filter(Boolean).join(", ");
  const type = eventTypeLabel(show.eventType, dict);
  const currentYear = new Date().getFullYear();

  return (
    <li
      className={`grid grid-cols-[76px_minmax(0,1fr)] items-start gap-x-4 gap-y-3 border-b border-rule py-5 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:items-center md:gap-x-6 ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className={`flex aspect-square flex-col items-center justify-center text-[#121110] ${muted ? "bg-chalk-2" : "bg-blue"}`}>
        {parts ? (
          <time className="text-center" dateTime={show.date ?? undefined} title={parts.full}>
            <span className="block font-stage text-[2.5rem] font-black leading-none sm:text-[3rem]">{parts.day}</span>
            <span className="mono-cap mt-1 block">
              {parts.month}
              {parts.year !== currentYear ? ` ${parts.year}` : ""}
            </span>
          </time>
        ) : (
          <span className="mono-cap px-1 text-center leading-tight">{dict.shows.tba}</span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="font-stage text-[1.75rem] font-extrabold uppercase leading-[0.95] md:text-[2.125rem]">
          {show.venue}
        </h3>
        <p className="mono mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-chalk-2">
          {place ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon className="text-chalk-3" name="pin" size={15} />
              {place}
            </span>
          ) : null}
          {parts ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon className="text-chalk-3" name="calendar" size={15} />
              <span className="capitalize">{parts.weekday}</span>
              {show.startTime ? <span>· {show.startTime}</span> : null}
            </span>
          ) : null}
          {type ? <span className="text-chalk-3">{type}</span> : null}
        </p>
      </div>

      {show.ticketUrl && !muted ? (
        <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
          <a
            className="btn-line btn-sm"
            href={show.ticketUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {dict.shows.tickets}
            <span className="sr-only">: {show.venue}</span>
            <Icon name="external" size={16} />
          </a>
        </div>
      ) : null}
    </li>
  );
}

export function Shows({
  dict,
  locale,
  shows,
  posterUrl,
}: {
  dict: Dict;
  locale: Locale;
  shows: ShowItem[];
  posterUrl: string;
}) {
  const { upcoming, past } = splitShows(shows);

  return (
    <section aria-labelledby="shows-title" className="block-y border-t border-rule" id="shows">
      <div className="shell grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="h-stage reveal" id="shows-title">
            {dict.shows.title}
          </h2>
          {upcoming.length > 0 ? (
            <>
              <p className="copy reveal mt-4">{dict.shows.intro}</p>
              <ul className="reveal mt-8 border-t border-rule">
                {upcoming.map((show) => (
                  <ShowRow dict={dict} key={show.id} locale={locale} show={show} />
                ))}
              </ul>
            </>
          ) : (
            <div className="reveal mt-8 md:mt-10">
              <p className="font-stage text-[clamp(2rem,1.4rem+2.2vw,3.25rem)] font-extrabold uppercase leading-[1.02]">
                <span className="lay tape -rotate-[0.8deg]">{dict.shows.emptyTitle}</span>
              </p>
              <p className="copy-lg mt-6">{dict.shows.emptyBody}</p>
              <a className="btn-tape mt-8" href="#booking">
                {dict.shows.emptyCta}
                <Icon name="arrow-right" size={20} />
              </a>
            </div>
          )}

          {past.length > 0 ? (
            <details className="group mt-10">
              <summary className="mono-cap inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-chalk-2 hover:text-chalk [&::-webkit-details-marker]:hidden">
                <Icon className="transition-transform group-open:rotate-180" name="arrow-down" size={16} />
                {dict.shows.past} ({past.length})
              </summary>
              <ul className="mt-4 border-t border-rule">
                {past.map((show) => (
                  <ShowRow dict={dict} key={show.id} locale={locale} muted show={show} />
                ))}
              </ul>
            </details>
          ) : null}
        </div>

        <figure className="reveal relative mx-auto w-full max-w-[520px] lg:col-span-5 lg:max-w-none lg:-rotate-[1deg]">
          <span aria-hidden className="tape-piece -top-2 left-1/2 z-10 -translate-x-1/2 rotate-2 !bg-blue" />
          <div className="relative aspect-square overflow-hidden bg-deck-2 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]">
            <Image
              alt={dict.meta.ogAlt}
              className="object-contain"
              fill
              sizes="(min-width: 1024px) 38vw, (min-width: 560px) 520px, 100vw"
              src={posterUrl}
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
