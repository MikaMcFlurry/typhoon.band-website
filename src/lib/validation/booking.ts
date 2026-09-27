// Server-side validation for booking submissions.
//
// Requirements (docs/phases/01-booking-content-foundation.md):
//   - name, email (valid), event_location, event_type, message required
//   - phone optional, event_date optional (real calendar date yyyy-mm-dd)
//   - honeypot must be empty; locale tracked
//
// Errors carry a stable `field` key; the route turns it into a message in
// the visitor's language (the old implementation answered in German only).

import { isLocale, type Locale } from "@/i18n/locales";

export type BookingField =
  | "name"
  | "email"
  | "phone"
  | "event_date"
  | "event_location"
  | "event_type"
  | "message";

export type BookingData = {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  event_location: string;
  event_type: string;
  message: string;
  locale: Locale;
};

export type ValidationResult =
  | { ok: true; data: BookingData }
  | { ok: false; field: BookingField | "_global" | "hp_field" };

// Select values sent by the booking form. Stored as the German label so
// the admin inbox and notification mail stay readable; free text (older
// clients) is still accepted.
export const EVENT_TYPE_LABEL_DE: Record<string, string> = {
  festival: "Festival",
  club: "Club / Konzert",
  cityfest: "Stadtfest",
  corporate: "Firmenevent",
  private: "Private Feier / Hochzeit",
  other: "Sonstiges",
};

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isRealDate(value: string): boolean {
  const m = ISO_DATE_RE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d &&
    y >= 2000 &&
    y <= 2100
  );
}

export function validateBooking(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, field: "_global" };
  }
  const r = raw as Record<string, unknown>;

  // Honeypot — bots fill every field.
  if (typeof r.hp_field === "string" && r.hp_field.length > 0) {
    return { ok: false, field: "hp_field" };
  }

  const trim = (v: unknown, max = 200): string =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = trim(r.name, 120);
  const email = trim(r.email, 200);
  const message = trim(r.message, 4000);
  const phoneRaw = typeof r.phone === "string" ? r.phone.trim() : "";
  const event_date = trim(r.event_date, 40);
  const event_location = trim(r.event_location, 200);
  const typeRaw = trim(r.event_type, 200);
  const event_type = EVENT_TYPE_LABEL_DE[typeRaw] ?? typeRaw;
  const localeRaw = trim(r.locale, 8);
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "de";

  if (name.length < 2) return { ok: false, field: "name" };
  if (!EMAIL_RE.test(email)) return { ok: false, field: "email" };
  if (phoneRaw.length > 60) return { ok: false, field: "phone" };
  if (event_date.length > 0 && !isRealDate(event_date)) {
    return { ok: false, field: "event_date" };
  }
  if (event_location.length < 2) return { ok: false, field: "event_location" };
  if (event_type.length < 2) return { ok: false, field: "event_type" };
  if (message.length < 10) return { ok: false, field: "message" };

  return {
    ok: true,
    data: {
      name,
      email,
      phone: phoneRaw,
      event_date,
      event_location,
      event_type,
      message,
      locale,
    },
  };
}
