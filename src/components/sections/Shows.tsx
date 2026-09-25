import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { INTL_LOCALE, type Locale } from "@/i18n/locales";
import type { ShowItem } from "@/lib/content/types";

// Gig list, poster style: big day number, month + weekday, venue, place,
// time, event type and a clear ticket action. Upcoming first, TBA after,
// past shows folded away. With no dates, an honest empty state that points
// promoters to booking (we never invent dates).

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

// Shows created from a booking ("convert to show") carry the German label
// the booking inbox uses; map those back to keys so EN/TR show their own
// words.
const EVENT_TYPE_ALIASES: Record<string, string> = {
  "club / konzert": "club",
  clubkonzert: "club",
  konzert: "concert",
  stadtfest: "cityfest",
  firmenevent: "corporate",
  "private feier / hochzeit": "private",
  "private feier": "private",
  privatfeier: "private",
  hochzeit: "wedding",
  sonstiges: "other",
};

function eventTypeLabel(type: string | null, dict: Dict) {
  if (!type) return null;
  const raw = type.trim().toLowerCase();
  const labels = dict.shows.eventTypes;
  const key = Object.hasOwn(labels, raw) ? raw : Object.hasOwn(EVENT_TYPE_ALIASES, raw) ? EVENT_TYPE_ALIASES[raw] : null;
  return key && Object.hasOwn(labels, key) ? labels[key] : type;
}

// Admin enters the country as free text (default "Deutschland"); render it
// in the visitor's language where it can be recognised.
const COUNTRY_CODES: Record<string, string> = {
  deutschland: "DE",
  germany: "DE",
  almanya: "DE",
  österreich: "AT",
  austria: "AT",
  avusturya: "AT",
  schweiz: "CH",
  switzerland: "CH",
  isviçre: "CH",
  türkei: "TR",
  turkey: "TR",
  türkiye: "TR",
  frankreich: "FR",
  france: "FR",
  italien: "IT",
  italy: "IT",
  niederlande: "NL",
  netherlands: "NL",
};

export function countryCode(country: string | null): string | null {
  if (!country) return null;
  const raw = country.trim();
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  // "İsviçre": map the Turkish dotted İ first, German lower-casing would
  // turn it into "i̇" (i + combining dot).
  const lower = raw.replace(/İ/g, "i").toLocaleLowerCase("de");
  return Object.hasOwn(COUNTRY_CODES, lower) ? COUNTRY_CODES[lower] : null;
}

function countryLabel(country: string | null, locale: Locale): string | null {
  if (!country) return null;
  const code = countryCode(country);
  if (!code) return country;
  try {
    return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }).of(code) ?? country;
  } catch {
    return country;
  }
}

function ShowRow({ show, dict, locale, muted = false }: { show: ShowItem; dict: Dict; locale: Locale; muted?: boolean }) {
  const parts = show.date ? dateParts(show.date, locale) : null;
  const place = [show.city, countryLabel(show.country, locale)].filter(Boolean).join(", ");
  const type = eventTypeLabel(show.eventType, dict);
  const currentYear = new Date().getFullYear();

  return (
    <li className="grid grid-cols-[72px_1fr] items-center gap-x-5 gap-y-3 border-b border-line py-6 sm:grid-cols-[96px_1fr_auto] md:gap-x-8">
      <div className="text-center">
        {parts ? (
          <time dateTime={show.date ?? undefined} title={parts.full}>
            <span
              className={`block font-sans text-[2.75rem] font-bold leading-none tracking-[-0.04em] md:text-[3.5rem] ${
                muted ? "text-paper-3" : "text-gold"
              }`}
            >
              {parts.day}
            </span>
            <span className="mt-1 block text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-paper-2">
              {parts.month}
              {parts.year !== currentYear ? ` ${parts.year}` : ""}
            </span>
          </time>
        ) : (
          <span className="block text-[0.8125rem] font-semibold uppercase leading-tight tracking-[0.08em] text-gold-hi">
            {dict.shows.tba}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3
          className={`hyphens-auto break-words font-display text-[1.5rem] leading-tight md:text-[1.875rem] ${
            muted ? "text-paper-2" : "text-paper"
          }`}
        >
          {show.venue}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9375rem] text-paper-2">
          {place ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 break-words">
              <Icon className="text-gold-lo" name="pin" size={16} />
              {place}
            </span>
          ) : null}
          {parts ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon className="text-gold-lo" name="calendar" size={16} />
              <span className="capitalize">{parts.weekday}</span>
              {show.startTime ? <span className="tabular">· {show.startTime}</span> : null}
            </span>
          ) : null}
          {type ? <span className="text-paper-3">{type}</span> : null}
        </p>
      </div>

      {show.ticketUrl && !muted ? (
        <div className="col-span-2 sm:col-span-1 sm:justify-self-end">
          <a
            className="btn btn-secondary btn-sm"
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
}: {
  dict: Dict;
  locale: Locale;
  shows: ShowItem[];
}) {
  const { upcoming, past } = splitShows(shows);
  const empty = upcoming.length === 0;

  return (
    <section
      aria-labelledby="shows-title"
      // No dates yet: one slim strip (heading + status + booking link)
      // instead of a full section.
      className={empty ? "pb-8 pt-14 md:pb-10 md:pt-20" : "section"}
      id="shows"
    >
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="h-section reveal md:col-span-7" id="shows-title">
            {dict.shows.title}
          </h2>
          {upcoming.length > 0 ? (
            <p className="reveal text-paper-2 md:col-span-5 md:justify-self-end md:text-right">
              {dict.shows.intro}
            </p>
          ) : (
            <div className="reveal md:col-span-5 md:justify-self-end md:text-right">
              <p className="font-display text-[1.375rem] leading-tight text-paper md:text-[1.625rem]">
                {dict.shows.emptyTitle}
              </p>
              <p className="mt-2 text-paper-2">
                {dict.shows.emptyBody}{" "}
                <a
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-gold-hi underline decoration-line-2 underline-offset-4 hover:text-paper"
                  href="#booking"
                >
                  {dict.shows.emptyCta}
                  <Icon name="arrow-right" size={16} />
                </a>
              </p>
            </div>
          )}
        </div>

        {upcoming.length > 0 ? (
          <ul className="reveal mt-10 border-t border-line md:mt-14">
            {upcoming.map((show) => (
              <ShowRow dict={dict} key={show.id} locale={locale} show={show} />
            ))}
          </ul>
        ) : null}

        {past.length > 0 ? (
          <details className="group mt-10">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-paper-2 hover:text-gold-hi [&::-webkit-details-marker]:hidden">
              <Icon className="transition-transform group-open:rotate-180" name="arrow-down" size={16} />
              {dict.shows.past} ({past.length})
            </summary>
            <ul className="mt-4 border-t border-line">
              {past.map((show) => (
                <ShowRow dict={dict} key={show.id} locale={locale} muted show={show} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}
