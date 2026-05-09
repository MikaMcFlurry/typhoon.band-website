// Server-side validation for booking submissions.
//
// Phase 01 requirements (docs/phases/01-booking-content-foundation.md):
//   - name required
//   - email required + valid format
//   - event_location required
//   - event_type required
//   - message required
//   - phone optional
//   - event_date optional (ISO yyyy-mm-dd)
//   - honeypot must be empty
//   - locale tracked

import { isLocale, type Locale } from "@/i18n/locales";

export type BookingInput = {
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_location: string;
  event_type: string;
  message: string;
  hp_field?: string;
  locale?: string;
};

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
  | { ok: false; field: keyof BookingInput | "_global"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateBooking(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, field: "_global", message: "Ungültige Anfrage." };
  }
  const r = raw as Record<string, unknown>;

  // Honeypot — silently fail validation if any bot fills the hidden field.
  if (typeof r.hp_field === "string" && r.hp_field.length > 0) {
    return { ok: false, field: "hp_field", message: "Bot erkannt." };
  }

  const trim = (v: unknown, max = 200): string =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = trim(r.name, 120);
  const email = trim(r.email, 200);
  const message = trim(r.message, 4000);
  const phone = trim(r.phone, 60);
  const event_date = trim(r.event_date, 40);
  const event_location = trim(r.event_location, 200);
  const event_type = trim(r.event_type, 200);
  const localeRaw = trim(r.locale, 8);
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "de";

  if (name.length < 2) {
    return { ok: false, field: "name", message: "Bitte gib deinen Namen an." };
  }
  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      field: "email",
      message: "Bitte gib eine gültige E-Mail-Adresse an.",
    };
  }
  if (event_location.length < 2) {
    return {
      ok: false,
      field: "event_location",
      message: "Bitte gib einen Veranstaltungsort an.",
    };
  }
  if (event_type.length < 2) {
    return {
      ok: false,
      field: "event_type",
      message: "Bitte gib die Art der Veranstaltung an.",
    };
  }
  if (message.length < 10) {
    return {
      ok: false,
      field: "message",
      message: "Bitte schreibe uns ein paar Zeilen mehr.",
    };
  }
  if (event_date.length > 0 && !ISO_DATE_RE.test(event_date)) {
    return {
      ok: false,
      field: "event_date",
      message: "Datumsformat ist ungültig.",
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      phone,
      event_date,
      event_location,
      event_type,
      message,
      locale,
    },
  };
}
