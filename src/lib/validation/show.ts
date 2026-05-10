// Server-side validation for Admin show inserts/updates.
//
// Phase 04 requirements (docs/phases/04-booking-shows-workflow.md):
//   - venue required
//   - event_type optional but preferred
//   - date optional only if TBA
//   - ticket_url optional but if present must be a valid URL
//   - city/country optional
//   - is_visible boolean
//   - is_published boolean

export type ShowFormInput = {
  venue?: string;
  city?: string | null;
  country?: string | null;
  event_type?: string | null;
  date?: string | null; // yyyy-mm-dd
  time?: string | null; // HH:MM
  is_tba?: boolean | string | null;
  ticket_url?: string | null;
  is_visible?: boolean | string | null;
  is_published?: boolean | string | null;
  sort_order?: number | string | null;
};

export type ShowFormData = {
  venue: string;
  city: string | null;
  country: string | null;
  event_type: string | null;
  starts_at: string | null;
  is_tba: boolean;
  ticket_url: string | null;
  is_visible: boolean;
  is_published: boolean;
  sort_order: number;
};

export type ShowValidation =
  | { ok: true; data: ShowFormData }
  | { ok: false; field: keyof ShowFormInput | "_global"; message: string };

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function trim(value: unknown, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === "on" || value === "true" || value === "1") return true;
  if (value === "off" || value === "false" || value === "0" || value === "")
    return false;
  return fallback;
}

function asInt(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateShow(raw: unknown): ShowValidation {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, field: "_global", message: "Ungültige Anfrage." };
  }
  const r = raw as Record<string, unknown>;

  const venue = trim(r.venue, 200);
  if (venue.length < 2) {
    return {
      ok: false,
      field: "venue",
      message: "Venue / Ort ist Pflicht.",
    };
  }

  const city = trim(r.city, 120);
  const country = trim(r.country, 120) || "Deutschland";
  const event_type = trim(r.event_type, 120);

  const date = trim(r.date, 40);
  const time = trim(r.time, 16);
  const is_tba = asBool(r.is_tba, false);

  let starts_at: string | null = null;
  if (!is_tba) {
    if (date.length === 0) {
      return {
        ok: false,
        field: "date",
        message: "Datum angeben oder TBA aktivieren.",
      };
    }
    if (!ISO_DATE_RE.test(date)) {
      return {
        ok: false,
        field: "date",
        message: "Datumsformat ist ungültig (yyyy-mm-dd).",
      };
    }
    if (time.length > 0 && !TIME_RE.test(time)) {
      return {
        ok: false,
        field: "time",
        message: "Uhrzeitformat ist ungültig (HH:MM).",
      };
    }
    // Compose a UTC ISO timestamp. If time is missing we anchor to noon
    // local-time-equivalent (12:00 UTC) so date-only shows do not flip
    // a day depending on the viewer's timezone — date-formatters in the
    // Admin/public renders only show the day anyway when no time was
    // entered. This keeps the schema strict (timestamptz) without
    // inventing a fake clock time the user did not type.
    const hhmm = time.length > 0 ? time : "12:00";
    starts_at = `${date}T${hhmm}:00.000Z`;
  }

  const ticketRaw = trim(r.ticket_url, 500);
  let ticket_url: string | null = null;
  if (ticketRaw.length > 0) {
    if (!isValidUrl(ticketRaw)) {
      return {
        ok: false,
        field: "ticket_url",
        message: "Ticket-Link muss eine gültige http(s)-URL sein.",
      };
    }
    ticket_url = ticketRaw;
  }

  const is_visible = asBool(r.is_visible, true);
  const is_published = asBool(r.is_published, true);
  const sort_order = asInt(r.sort_order, 0);

  return {
    ok: true,
    data: {
      venue,
      city: city.length > 0 ? city : null,
      country: country.length > 0 ? country : null,
      event_type: event_type.length > 0 ? event_type : null,
      starts_at,
      is_tba,
      ticket_url,
      is_visible,
      is_published,
      sort_order,
    },
  };
}
