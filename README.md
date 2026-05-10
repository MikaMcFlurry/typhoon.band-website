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
- Supabase (Auth/Postgres/Storage) — `@supabase/supabase-js` v2 with typed `Database` schema; cookie-aware SSR session via `@supabase/ssr`
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
      admin/                    # protected Admin shell (login, dashboard, booking)
        layout.tsx              # forwards children — auth gating happens per-route
        page.tsx                # dashboard cards
        login/                  # email + password form (server action)
        change-password/        # forced first-login password rotation
        booking/                # read-only booking requests view
        _components/AdminShell.tsx
    api/booking/route.ts        # POST handler (validation, honeypot, Supabase insert, Resend email)
    api/admin/auth/logout/      # POST handler — clears Supabase session cookies
  components/
    audio/                      # AudioPlayerProvider, Waveform, FeaturedPlayer, DemoRow
    layout/                     # Header (with mobile drawer), Footer, CookieConsent
    sections/                   # Hero, About, Members, Demos, Gallery, Booking, Shows
  data/                         # static seed data (members, songs, gallery, shows, site)
  i18n/                         # locale registry + dictionaries (de/en/tr)
  lib/
    admin/                      # admin-only helpers (auth guard, role helpers, booking reader)
    content/                    # Supabase-first / static-fallback content provider
    env.ts                      # central env access + helper booleans
    supabase/                   # client/server/admin typed Supabase clients + cookie-aware SSR helpers + booking writer
    resend/                     # server-only mail helper
    validation/                 # booking input validation
supabase/
  migrations/
    0001_init.sql               # schema for all tables in docs/05
    0002_supabase_foundation.sql  # additive: site_settings.locale/is_public, booking_requests.locale,
                                  #            shows.is_tba + nullable starts_at, media_items.alt_text/title
    0003_storage_buckets.sql    # public asset buckets + admin-only write policies
    0004_admin_password_flow.sql  # additive: admin_profiles.must_change_password + password_changed_at + initial_password_issued_at
  policies/
    0001_rls.sql                # base RLS per docs/06
    0002_rls_foundation.sql     # additive: public read on is_public site_settings; assert no public read on booking/admin
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
- Persistence: `src/lib/supabase/booking.ts` inserts into `booking_requests`
  via the typed service-role client (`src/lib/supabase/admin.ts`). Service-role
  bypasses RLS — no public insert policy exists on the table.
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

1. Create the project (Supabase Dashboard → New Project).
2. **Project Settings → API** gives you:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only,
     do **not** prefix with `NEXT_PUBLIC_`).
3. Apply the SQL — order matters because later files reference helpers
   from earlier ones:
   ```bash
   psql -f supabase/migrations/0001_init.sql
   psql -f supabase/policies/0001_rls.sql
   psql -f supabase/migrations/0002_supabase_foundation.sql
   psql -f supabase/policies/0002_rls_foundation.sql
   psql -f supabase/migrations/0003_storage_buckets.sql
   psql -f supabase/migrations/0004_admin_password_flow.sql
   psql -f supabase/migrations/0005_booking_show_workflow.sql
   psql -f supabase/policies/0005_booking_show_workflow.sql
   ```
   The same SQL can be pasted into the Supabase SQL editor. Every
   statement is idempotent so reruns are safe.
4. Verify Row Level Security is **enabled** on every public table and
   that no `select`/`insert` policy is exposed for `booking_requests` or
   `admin_profiles`. The bundled policies enforce this; do not loosen
   them.
5. Storage: `0003_storage_buckets.sql` creates the public asset buckets
   `public-media`, `audio-demos`, `member-images`, `gallery`, and
   `legal-assets`. Public read is enabled because the frontend only ever
   renders files referenced by a published DB record. Writes are
   restricted to authenticated active admins or the server (service
   role). The future Admin upload UI will write into these buckets.

### Test the booking writer

With env vars configured locally (`.env.local`):

```bash
curl -sX POST http://localhost:3000/api/booking \
  -H 'content-type: application/json' \
  -d '{
    "name":"Test","email":"test@example.com",
    "event_location":"Bayreuth","event_type":"Hochzeit",
    "message":"Test booking, bitte ignorieren.",
    "locale":"de"
  }' | jq
```

A successful run returns `{ ok: true, status: "sent", … }` and creates a
`booking_requests` row visible in the Supabase Table editor.

### Public content provider

The Supabase reader (`src/lib/content/supabase-content.ts`) covers:

- `band_members` + `band_member_translations` → `getMembers(locale)`
- `songs` (visible + streamable) → `getSongs(locale)`
- `media_items` (visible) → `getGalleryItems(locale)`
- `shows` (visible AND published, supports `is_tba`) → `getShows(locale)`
- `legal_pages` + `legal_page_translations` (published) → `getLegalPage`
- `platform_links` (active) → `getPlatformLinks()`
- `seo_entries` → `getSeoEntry(path, locale)`
- `site_settings` (`is_public = true`) → `getSiteSettings()`

Hero / about copy is still served from dictionaries — those tables are
introduced in the Admin phase.

## Security non-negotiables

- No secrets in the browser; service-role key is server-only.
- Supabase RLS is enabled on every public table — see
  `supabase/policies/0001_rls.sql`.
- Booking submissions are validated server-side, with a honeypot field.
- Admin routes are gated server-side and locked behind config until
  Supabase is connected.
- No download button for demo audio; no external embeds without consent.

## Admin

The Admin shell is reachable at `/[locale]/admin` and protected by Supabase
Auth + an active row in `admin_profiles`.

- Login route: `/[locale]/admin/login` (email + password, German copy).
- Initial password rotation: `/[locale]/admin/change-password`. New admin
  rows are inserted with `must_change_password = true` (the column itself
  defaults to `false`, so the provisioning SQL sets it explicitly together
  with `initial_password_issued_at = now()` — see
  [`docs/admin-setup.md`](docs/admin-setup.md)). The very first login is
  funnelled here before the dashboard becomes reachable.
- Dashboard route: `/[locale]/admin` (placeholder cards for upcoming
  modules; Booking is the only live tile in this phase).
- Booking inbox: `/[locale]/admin/booking` (latest 50, status chips,
  archive filter).
- Booking detail: `/[locale]/admin/booking/<id>` (status update, soft
  delete / restore, convert-to-show form prefilled from the request).
- Shows admin: `/[locale]/admin/shows` (list, `+ Neue Show`, edit,
  visibility toggle, delete).
- Media (gallery): `/[locale]/admin/media` (upload JPG/PNG/WebP, edit
  title/alt/sort, hide, delete).
- Music (demos): `/[locale]/admin/music` (upload/replace MP3 + cover,
  visibility, featured flag, sort).
- Members (photos): `/[locale]/admin/members` (upload/replace photo by
  slug, sort, visibility — names/roles/bios stay dictionary-driven).
- Site assets: `/[locale]/admin/settings/assets` (replace hero image,
  hero signature, bandinfo image; clearing falls back to repo asset).
- Logout: `POST /api/admin/auth/logout?locale=<locale>` from the shell
  header (or from the change-password page).

The Booking → Shows workflow (statuses, soft-delete behaviour, public
visibility rule) is documented in detail in
[`docs/admin-booking-shows-workflow.md`](docs/admin-booking-shows-workflow.md).

Server-side guarding lives in `src/lib/admin/auth.ts`:

```ts
getCurrentAdmin()              // → CurrentAdmin | null
requireAdmin(locale)           // → CurrentAdmin (redirects to login otherwise)
requireAdminWithPasswordOk(locale)
                                // → CurrentAdmin (also redirects to
                                //   /admin/change-password while
                                //   must_change_password is true)
```

`/admin` and `/admin/booking` use `requireAdminWithPasswordOk()`, so an
admin can never reach the dashboard while their initial password is still
in place. The change-password page itself uses plain `requireAdmin()`
to break the redirect loop.

Role helpers are in `src/lib/admin/roles.ts` (`isOwner`, `isAdminLike`,
`isEditor`, `canAccessAdmin`). All three roles (`owner`, `admin`, `editor`)
get the same dashboard access today; owner-only mutations land in later
phases.

The booking reader uses the service-role client (`src/lib/admin/bookings.ts`),
so `booking_requests` keeps its zero-public-read RLS contract intact.

First owner setup, environment variables, and inactive-admin denial tests
are documented in [`docs/admin-setup.md`](docs/admin-setup.md).

## Admin media + audio uploads

Phase 05 wires the prepared Storage buckets to admin-gated upload flows.
Every flow runs `requireAdminWithPasswordOk()`, validates the file
server-side, uploads through the service-role client, and writes a DB
record that the public site reads.

| Bucket          | Use                                          |
| --------------- | -------------------------------------------- |
| `gallery`       | Gallery images (`media_items.file_url`)      |
| `audio-demos`   | Demo MP3s (`songs.audio_url`)                |
| `public-media`  | Song covers + hero/bandinfo settings         |
| `member-images` | Band member photos (`band_members.photo_url`)|
| `legal-assets`  | Reserved for later phases                    |

Validation lives in `src/lib/validation/upload.ts`:

- Images: `image/jpeg`, `image/png`, `image/webp`, max **10 MB**.
  SVG, GIF, HEIC/HEIF, executables and unknown MIME are rejected.
- Audio: `audio/mpeg` / `audio/mp3` only, max **50 MB**. WAV/AIFF/FLAC/M4A
  are rejected.
- Filenames are sanitized (lower-case ASCII slug + ISO date + UUID +
  original extension); originals are never written to Storage as-is.

Storage uploads go through `src/lib/storage/upload.ts`. Failures during
the DB write trigger a best-effort cleanup of the orphan Storage object.

### Public fallback rule

The public site keeps using the static repo assets when Supabase has no
record for an asset:

- Hero / bandinfo / signature images: `site_settings` keys
  `hero_image`, `hero_signature`, `bandinfo_image` (JSON `{ "url": "…" }`).
- Gallery: visible rows in `media_items` (category `gallery`).
- Demos: visible + streamable rows in `songs`. The featured flag chooses
  the song shown above the demo list.
- Member photos: `band_members.photo_url` keyed by member slug.

If any of these are empty/missing, the page renders with the repo asset
in `public/assets/*` (no design change).

### Manual smoke test

1. Sign in as Admin and rotate the initial password.
2. `/[locale]/admin/media` — upload a JPG, set title/alt/sort, save.
   Public homepage gallery shows the new image first.
3. Hide the image — public gallery falls back to the repo set.
4. `/[locale]/admin/music` — create a song, attach an MP3 + cover,
   mark as featured. Featured player swaps to the new song; static
   featured returns when the row is hidden.
5. `/[locale]/admin/members` — upload a photo for `mika`. The Members
   grid reads the new URL; the Repo fallback returns after "Foto
   entfernen".
6. `/[locale]/admin/settings/assets` — replace hero/bandinfo image.
   Confirm Hero and Bandinfo modules render the new URLs.

### Image optimisation

`next/image` requires explicit `images.remotePatterns` for Supabase
Storage URLs. `next.config.mjs` adds the pattern automatically when
`NEXT_PUBLIC_SUPABASE_URL` is set; without it, the site renders the
repo assets and never reaches Storage.

## Deferred / next batches

- Per-locale text CRUD (members, hero, about) and rich-text editor.
- Legal page editor + SEO entries admin.
- Owner-only mutations (admin-profile management UI, legal page deletes).
- Shop/tickets phase.
- Launch hardening (rate limit, monitoring, generated Supabase types).
