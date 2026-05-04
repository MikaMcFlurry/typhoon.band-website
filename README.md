# Typhoon Website

Frontend follows the Claude Design handoff (`/handoff`); architecture is ready for Supabase, Resend, Admin and Booking.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Vercel
- Supabase (Auth/Postgres/Storage) — wired in a later batch
- Resend — wired in a later batch

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
      page.tsx                  # onepager (Hero, Player, About, Members, Demos, Gallery, Booking)
      layout.tsx                # wraps with AudioPlayerProvider, Header, Footer
      legal/imprint/page.tsx
      legal/privacy/page.tsx
      legal/cookies/page.tsx
      admin/                    # server-protected shell (full CRUD = next batch)
    api/booking/route.ts        # POST handler with graceful Supabase/Resend fallback
  components/
    audio/                      # AudioPlayerProvider, Waveform, FeaturedPlayer, DemoRow
    layout/                     # Header (with mobile drawer), Footer
    sections/                   # Hero, About, Members, Demos, Gallery, Booking
  data/                         # static seed data (members, songs, gallery, site)
  lib/
    env.ts                      # central env access + helper booleans
    supabase/                   # client/server typed wrappers (lazy SDK import)
    resend/                     # server-only mail helper
    validation/                 # booking input validation
supabase/
  migrations/0001_init.sql      # schema for all tables in docs/05
  policies/0001_rls.sql         # RLS policies per docs/06
public/assets/
  audio/demos/                  # demo MP3s (no download UI)
  band-cards/                   # Mika & Typhoon info-card photos
  gallery/                      # 8 gallery JPGs
  hero/                         # hero collage + booking-side image (from handoff)
  branding/                     # gold signature PNGs (from handoff)
  members/                      # member portraits (from handoff)
  reference/                    # reserved for additional reference assets
handoff/                        # ← Claude Design source of truth (read-only reference)
```

## Demo audio player

- Visual layout: Claude Design handoff (`audio-card` / `audio-card-m`).
- Behavior: ported from `MikaMcFlurry/typhoon.band` branch
  `claude/typhoon-premium-redesign-x01JL`:
  - one shared `HTMLAudioElement`
  - one song plays at a time (`AudioPlayerProvider.toggle()`)
  - lazy `AudioContext` + `AnalyserNode` (fftSize 256)
  - live FFT-driven waveform when playing, deterministic per-song idle shape when paused
  - seek by clicking the waveform
- No download button, no native browser controls, no external embeds.

## Environment variables

See `.env.example`. Public values are exposed to the browser; the rest stay
on the server.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SERVICE_ROLE_KEY    # server-only
RESEND_API_KEY               # server-only
BOOKING_EMAIL
WEBSITE_FROM_EMAIL
```

When env values are missing, the booking endpoint returns a clear
"backend versand wird im nächsten batch angebunden" message instead of
crashing — see `src/app/api/booking/route.ts`.

## Security non-negotiables

See `CLAUDE.md`. Highlights:

- No secrets in the browser; service-role key is server-only.
- Supabase RLS is enabled on every public table — see
  `supabase/policies/0001_rls.sql`.
- Booking submissions are validated server-side, with a honeypot field.
- Admin routes are gated server-side and locked behind config until
  Supabase is connected.

## Deferred / next batches

- Real Supabase SDK install + admin auth + content CRUD.
- Real Resend wiring + booking persistence.
- Shows section + News section UI.
- Shop / tickets.
- Cookie consent banner for optional embeds.
- English / Turkish translations.
