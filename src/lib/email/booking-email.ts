// Booking notification email — HTML + plain-text builders.
//
// Design direction (docs/phases/01b-booking-email-design.md):
//   - dark premium background, warm cream text, champagne-gold accents
//   - email-safe HTML only: tables, inline styles, no external fonts/CSS/JS
//   - no remote tracking pixels, no external images
//   - all user input is HTML-escaped before inclusion
//
// Recipient/Reply-To routing happens in the API route, not here.

import "server-only";

import type { BookingData } from "@/lib/validation/booking";

export type BookingEmailInput = BookingData & {
  receivedAt?: Date;
};

const NOT_PROVIDED = "Nicht angegeben";
const SUBJECT = "Neue Booking-Anfrage über typhoon.band";
const FOOTER =
  "Diese Nachricht wurde über das Booking-Formular auf typhoon.band gesendet.";
const HEADER_KICKER = "TYPHOON BOOKING";
const HEADER_TITLE = "Neue Booking-Anfrage";
const HEADER_SUB = "Typhoon Website";
const INTRO =
  "Über das Booking-Formular auf typhoon.band ist eine neue Anfrage eingegangen. Direkt antworten geht über Reply — die Antwort landet bei der anfragenden Person.";
const MESSAGE_LABEL = "Nachricht";

// HTML entity escape — must be applied to every value that came from the
// public form before it is interpolated into the HTML template.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function fmtReceivedAt(d: Date): string {
  // de-DE, Europe/Berlin — short, unambiguous timestamp the band can quote
  // back when replying.
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function fmtDate(value: string): string {
  if (!value) return NOT_PROVIDED;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(d);
  } catch {
    return value;
  }
}

function localeLabel(locale: string): string {
  const map: Record<string, string> = {
    de: "Deutsch (de)",
    en: "English (en)",
    tr: "Türkçe (tr)",
  };
  return map[locale] ?? locale;
}

type Field = { label: string; value: string; isOptional: boolean };

function buildFields(input: BookingEmailInput): Field[] {
  return [
    { label: "Name", value: input.name, isOptional: false },
    { label: "E-Mail", value: input.email, isOptional: false },
    {
      label: "Telefon",
      value: input.phone || NOT_PROVIDED,
      isOptional: true,
    },
    {
      label: "Veranstaltungsdatum",
      value: fmtDate(input.event_date),
      isOptional: true,
    },
    { label: "Ort", value: input.event_location, isOptional: false },
    {
      label: "Art der Veranstaltung",
      value: input.event_type,
      isOptional: false,
    },
    {
      label: "Sprache",
      value: localeLabel(input.locale),
      isOptional: false,
    },
  ];
}

export function getBookingEmailSubject(): string {
  return SUBJECT;
}

export function buildBookingEmailText(input: BookingEmailInput): string {
  const receivedAt = fmtReceivedAt(input.receivedAt ?? new Date());
  const lines: string[] = [
    SUBJECT,
    "",
    `Name: ${input.name}`,
    `E-Mail: ${input.email}`,
    `Telefon: ${input.phone || NOT_PROVIDED}`,
    `Veranstaltungsdatum: ${fmtDate(input.event_date)}`,
    `Ort: ${input.event_location}`,
    `Art der Veranstaltung: ${input.event_type}`,
    `Sprache: ${localeLabel(input.locale)}`,
    `Eingegangen am: ${receivedAt}`,
    "",
    "Nachricht:",
    input.message,
    "",
    FOOTER,
  ];
  return lines.join("\n");
}

export function buildBookingEmailHtml(input: BookingEmailInput): string {
  const receivedAt = fmtReceivedAt(input.receivedAt ?? new Date());
  const fields = buildFields(input);

  const fieldRows = fields
    .map((f) => {
      const valueColor = f.isOptional && f.value === NOT_PROVIDED
        ? "#8a7a64"
        : "#f3e7d3";
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(232,201,130,0.12);vertical-align:top;width:42%;">
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:0.18em;text-transform:uppercase;color:#c79a4b;font-weight:600;">${escapeHtml(f.label)}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(232,201,130,0.12);vertical-align:top;">
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:${valueColor};">${escapeHtml(f.value)}</div>
          </td>
        </tr>`;
    })
    .join("");

  const messageHtml = nl2br(input.message);
  const replyMailto = `mailto:${escapeHtml(input.email)}`;

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>${escapeHtml(SUBJECT)}</title>
  </head>
  <body style="margin:0;padding:0;background:#030201;color:#f3e7d3;-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(input.name)} · ${escapeHtml(input.event_location)} · ${escapeHtml(input.event_type)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#030201;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0b0805;border:1px solid rgba(232,201,130,0.18);border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 16px 32px;border-bottom:1px solid rgba(232,201,130,0.12);background:linear-gradient(180deg,#100a06 0%,#0b0805 100%);">
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:0.28em;text-transform:uppercase;color:#c79a4b;font-weight:700;">${escapeHtml(HEADER_KICKER)}</div>
                <h1 style="margin:8px 0 4px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;color:#f7ecd6;font-weight:700;letter-spacing:-0.01em;">${escapeHtml(HEADER_TITLE)}</h1>
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#bfae90;">${escapeHtml(HEADER_SUB)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px 32px;">
                <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#d8c8a8;">${escapeHtml(INTRO)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 4px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(11,8,5,0.65);border:1px solid rgba(232,201,130,0.14);border-radius:10px;">
                  <tr>
                    <td style="padding:6px 18px 14px 18px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        ${fieldRows}
                        <tr>
                          <td style="padding:10px 0 0 0;vertical-align:top;width:42%;">
                            <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:0.18em;text-transform:uppercase;color:#8a7a64;font-weight:600;">Eingegangen am</div>
                          </td>
                          <td style="padding:10px 0 0 0;vertical-align:top;">
                            <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:#bfae90;">${escapeHtml(receivedAt)}</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 4px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(199,154,75,0.06);border:1px solid rgba(232,201,130,0.18);border-radius:10px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.4;letter-spacing:0.18em;text-transform:uppercase;color:#c79a4b;font-weight:600;margin-bottom:8px;">${escapeHtml(MESSAGE_LABEL)}</div>
                      <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;color:#f3e7d3;white-space:normal;">${messageHtml}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#bfae90;">
                      Antwort direkt an
                      <a href="${replyMailto}" style="color:#e8c982;text-decoration:none;">${escapeHtml(input.email)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 22px 32px;border-top:1px solid rgba(232,201,130,0.10);background:#080604;">
                <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.55;color:#8a7a64;text-align:center;letter-spacing:0.04em;">
                  ${escapeHtml(FOOTER)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
