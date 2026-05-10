# Typhoon Website

Frontend follows the Claude Design handoff (`/handoff`); architecture is ready
for Supabase, Resend, Admin and Booking. The public site keeps rendering when
no backend env vars are configured (static fallback content + graceful booking
fallback).

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Vercel
- Supabase (Auth/Postgres/Storage) — connected via REST in this phase, SDK ships next
- Resend — wired through a server-only fetch helper

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site is served at `/de` (root redirects there).

## Scripts

```bash
npm run dev     # local dev server
npm run lint    # next lint
npm run build   # production build
```

## Source layout

```text
src/
  app/
    [locale]/
      page.tsx                  # onepager (Hero, Player, Shows, About, Members, Demos, Gallery, Booking)
      layout.tsx                # wraps with AudioPlayerProvider, Header, Footer, CookieConsent
      legal/imprint/page.tsx
      legal/privacy/page.tsx
      legal/cookies/page.tsx
    api/booking/route.ts        # POST handler (validation, honeypot, Supabase insert, Resend email)
  components/
    audio/                      # AudioPlayerProvider, Waveform, FeaturedPlayer, DemoRow
    layout/                     # Header (with mobile drawer), Footer, CookieConsent
    sections/                   # Hero, About, Members, Demos, Gallery, Booking, Shows
  data/                         # static seed data (members, songs, gallery, shows, site)
  i18n/                         # locale registry + dictionaries (de/en/tr)
  lib/
    content/                    # Supabase-first / static-fallback content provider
    env.ts                      # central env access + helper booleans
    supabase/                   # client/server typed wrappers + booking writer (REST)
    resend/                     # server-only mail helper
    validation/                 # booking input validation
supabase/
  migrations/0001_init.sql      # schema for all tables in docs/05
  policies/0001_rls.sql         # RLS policies per docs/06
public/assets/                  # hero, branding, members, band-cards, gallery, audio/demos
handoff/                        # ← Claude Design source of truth (read-only reference)
```

## Booking

The booking flow is the first production-grade backend function.

- Frontend: `src/components/sections/Booking.tsx` (German/English/Turkish copy
  via dictionaries; success/fallback/error UI).
- API: `POST /api/booking` (`src/app/api/booking/route.ts`).
- Validation: `src/lib/validation/booking.ts` — server-side, honeypot, ISO date
  check, length caps, required fields (`name`, `email`, `event_location`,
  `event_type`, `message`).
- Persistence: `src/lib/supabase/booking.ts` posts to
  `booking_requests` via Supabase REST using `SUPABASE_SERVICE_ROLE_KEY`.
- Mail: `src/lib/resend/client.ts` — Resend REST, server-only key, Reply-To
  set to the sender's address. Subject:
  `Neue Booking-Anfrage über typhoon.band`.

### API response shape

```ts
// success — Supabase insert and/or Resend mail succeeded
{ ok: true, status: "sent",      message: string }

// success — env not configured yet, no insert, no mail
{ ok: true, status: "fallback",  message: string }

// validation — input rejected (per-field message)
{ ok: false, status: "validation", field: string, message: string }

// hard failure — every configured channel failed
{ ok: false, status: "error",      message: string }
```

When env values are missing, the route never crashes — it returns the
`fallback` status with a clear "Booking ist vorbereitet, aber der Versand ist
noch nicht vollständig angebunden." message.

## Content provider

Public content goes through `src/lib/content/` (Supabase-first, static
fallback). Every loader follows:

1. Build the fallback from `src/data/*` and `public/assets/*`.
2. If Supabase is not configured → return fallback.
3. Try to load published/visible Supabase records.
4. If records exist → normalise and return Supabase data.
5. If no records or any error → return fallback.

Available loaders (`src/lib/content/index.ts`):

```ts
getSiteSettings()
getHeroContent(locale)
getBandInfo(locale)
getMembers(locale)
getSongs(locale)
getGalleryItems(locale)
getShows(locale)
getLegalPage(type, locale)
getPlatformLinks()
getSeoEntry(path, locale)
getPublicPageContent(locale)   // bundle for the homepage
```

Frontend code never reads from Supabase Storage directly — it always reads
DB rows that hold the asset URL. Missing URLs fall back to the static asset.

## Demo audio player

- Visual layout: Claude Design handoff (`audio-card` / `audio-card-m`).
- Behavior ported from `MikaMcFlurry/typhoon.band` branch
  `claude/typhoon-premium-redesign-x01JL`:
  - one shared `HTMLAudioElement`
  - one song plays at a time (`AudioPlayerProvider.toggle()`)
  - lazy `AudioContext` + `AnalyserNode` (fftSize 256)
  - live FFT-driven waveform when playing, deterministic per-song idle shape
    when paused
  - seek by clicking the waveform
- No download button, no native browser controls, no external embeds.

## Environment variables

See `.env.example`.

```text
NEXT_PUBLIC_SUPABASE_URL          # browser + server
NEXT_PUBLIC_SUPABASE_ANON_KEY     # browser + server
NEXT_PUBLIC_SITE_URL              # browser + server
SUPABASE_SERVICE_ROLE_KEY         # SERVER ONLY — never NEXT_PUBLIC
RESEND_API_KEY                    # SERVER ONLY — never NEXT_PUBLIC
BOOKING_EMAIL                     # recipient address (booking@typhoon.band)
WEBSITE_FROM_EMAIL                # must be a Resend-verified domain
```

### Vercel deploy checklist

1. Connect the GitHub repo.
2. In **Project → Settings → Environment Variables**, add each variable
   above. Mark `NEXT_PUBLIC_*` for **Production / Preview / Development**.
   Mark all server secrets **without** the public flag.
3. Verify the Resend "from" domain is verified in
   [Resend → Domains](https://resend.com/domains) and that
   `WEBSITE_FROM_EMAIL` matches one of its verified addresses.
4. Verify a `MX` record exists for `booking@typhoon.band` (mailbox host),
   independent of Resend's outbound sender record.

### Supabase setup checklist

1. Create the project, run the migration:
   ```bash
   psql -f supabase/migrations/0001_init.sql
   psql -f supabase/policies/0001_rls.sql
   ```
2. Verify Row Level Security is **enabled** on every table.
3. Confirm `booking_requests` has **no** public select/insert policy —
   inserts must come through the server route (service-role bypasses RLS).
4. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`,
   `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only).

## Security non-negotiables

- No secrets in the browser; service-role key is server-only.
- Supabase RLS is enabled on every public table — see
  `supabase/policies/0001_rls.sql`.
- Booking submissions are validated server-side, with a honeypot field.
- Admin routes are gated server-side and locked behind config until
  Supabase is connected.
- No download button for demo audio; no external embeds without consent.

## Deferred / next batches

- **Phase 02:** ship `@supabase/supabase-js`, finalise schema & RLS, type
  generation. Replace REST writer with SDK + idempotent migration runner.
- Admin auth shell + protected routes.
- Admin CRUD for content tables.
- Admin media/audio uploads.
- Legal/SEO/consent + platform links from Admin.
- Shop/tickets phase.
- Launch hardening (rate limit, monitoring).
