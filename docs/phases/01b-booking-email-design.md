# Phase 01b – Booking Email Design

## Goal

The booking form already works and sends mail to:

```text
booking@typhoon.band
```

This phase improves the visual design and readability of the email received by the band.

Do not change the approved website frontend.

## Scope

Allowed:
- improve server-side booking email HTML template
- add plain-text fallback
- improve field labels and formatting
- keep or improve subject line
- preserve Reply-To behavior
- preserve Supabase insert behavior
- preserve current API response contract
- preserve current booking frontend design

Not allowed:
- frontend redesign
- full Admin CRUD
- shop
- payment
- analytics
- external embeds
- new public UI features

## Email design direction

The booking email should visually match the Typhoon brand:

- dark premium background
- warm cream text
- antique/champagne gold accents
- clear card layout
- readable spacing
- no overdesigned marketing layout
- professional band/booking tone

Use simple, email-safe HTML:
- tables or inline styles preferred
- no external fonts
- no external CSS files
- no JavaScript
- no remote tracking pixels
- no external images unless already public and necessary
- must render acceptably in common email clients

## Required email content

Subject:

```text
Neue Booking-Anfrage über typhoon.band
```

Header:

```text
Neue Booking-Anfrage
Typhoon Website
```

Must include:

```text
Name
E-Mail
Telefon
Veranstaltungsdatum
Ort
Art der Veranstaltung
Nachricht
Sprache/Locale
Eingegangen am
```

Also include a small footer:

```text
Diese Nachricht wurde über das Booking-Formular auf typhoon.band gesendet.
```

## Empty optional fields

If optional fields are empty, show:

```text
Nicht angegeben
```

## Reply-To

Reply-To must remain the user's email address.

This is critical so the band can answer directly.

## Plain text fallback

Add a readable plain text version with the same fields.

Example structure:

```text
Neue Booking-Anfrage über typhoon.band

Name: ...
E-Mail: ...
Telefon: ...
Datum: ...
Ort: ...
Art der Veranstaltung: ...
Sprache: ...

Nachricht:
...

Diese Nachricht wurde über das Booking-Formular auf typhoon.band gesendet.
```

## Security

- Escape or safely render user input.
- Never inject raw user HTML into the email.
- No tracking pixels.
- No external scripts.
- No frontend secrets.
- No service role key in client.

## Suggested implementation

If booking route currently builds email inline, consider extracting:

```text
src/lib/email/booking-email.ts
```

Recommended exports:

```ts
buildBookingEmailHtml(input)
buildBookingEmailText(input)
```

This keeps `src/app/api/booking/route.ts` clean.

## Visual target

Simple HTML email:

```text
[dark background]
  [gold small label: TYPHOON BOOKING]
  [large title: Neue Booking-Anfrage]
  [cream intro line]

  [card]
    Name
    Email
    Telefon
    Datum
    Ort
    Art
    Sprache
  [/card]

  [message card]
    Nachricht
  [/message card]

  [footer]
```

## Booking behavior to preserve

- validation still works
- honeypot still works
- Supabase insert still works if configured
- Resend send still works if configured
- fallback response still works if env missing
- no hard crash

## Acceptance checklist

- email HTML is visually polished
- text fallback exists
- optional empty fields display `Nicht angegeben`
- Reply-To is still user email
- `booking@typhoon.band` remains recipient
- no `info@typhoon.band`
- no frontend design change
- `npm run lint` passes
- `npm run build` passes
