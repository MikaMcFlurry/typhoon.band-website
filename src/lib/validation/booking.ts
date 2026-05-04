export type BookingInput = {
  name: string;
  email: string;
  phone?: string;
  event_date?: string;
  event_location?: string;
  event_type?: string;
  message: string;
  hp_field?: string; // honeypot — must be empty
};

export type ValidationResult =
  | { ok: true; data: Required<Omit<BookingInput, "hp_field">> & { hp_field?: string } }
  | { ok: false; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBooking(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, message: "Ungültige Anfrage." };
  }
  const r = raw as Record<string, unknown>;

  if (typeof r.hp_field === "string" && r.hp_field.length > 0) {
    return { ok: false, message: "Bot erkannt." };
  }

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const email = typeof r.email === "string" ? r.email.trim() : "";
  const message = typeof r.message === "string" ? r.message.trim() : "";

  if (name.length < 2 || name.length > 120) {
    return { ok: false, message: "Bitte gib deinen Namen an." };
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }
  if (message.length < 10 || message.length > 4000) {
    return { ok: false, message: "Bitte schreibe uns ein paar Zeilen mehr." };
  }

  const optional = (v: unknown, max = 200) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  return {
    ok: true,
    data: {
      name,
      email,
      phone: optional(r.phone),
      event_date: optional(r.event_date, 40),
      event_location: optional(r.event_location),
      event_type: optional(r.event_type),
      message,
    },
  };
}
