# Typhoon Website

Website of the band Typhoon (Bluesrock · Funk · Soul · Jazz · Southern Rock
with Turkish lyrics). Live on `typhoon.band` / `www.typhoon.band` via the
Vercel project `typhoon-band-website` (production = `main`).

The branch `claude/typhoon-website-redesign-7xjozt` contains the **2026
redesign**: a completely rebuilt public frontend on a new design system
([`docs/design/DESIGN.md`](docs/design/DESIGN.md)), the merged Phase 06
(legal/SEO/consent/platform links) and a set of backend fixes. The full
report — live-version analysis, feature parity, changes and open owner
decisions — is in [`docs/redesign/2026-09-redesign.md`](docs/redesign/2026-09-redesign.md).

The branch `claude/typhoon-website-impeccable` contains **Version B**, an
independent alternative redesign made with the Impeccable design skill
("Bühnenplan & Setlist": the evening seen from the stage). Its visual source
of truth is the root [`DESIGN.md`](DESIGN.md) with [`PRODUCT.md`](PRODUCT.md);
the comparison with Version A and the verification evidence are in
[`docs/redesign/VERSION-B.md`](docs/redesign/VERSION-B.md). Backend, admin and
API are identical to Version A.

Architecture is ready for Supabase, Resend, Admin and Booking. The public
site keeps rendering when no backend env vars are configured (static
fallback content + graceful booking fallback).

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

The site is served at `/de`, `/en` and `/tr`. `/` redirects to the best
match from the browser's `Accept-Language` (default `de`); no cookie is set.

## Scripts

```bash
npm run dev     # local dev server
npm run lint    # next lint
npm run build   # production build
```

## Source layout

```text
src/
  middleware.ts                 # locale redirect (Accept-Language) + admin Supabase session refresh
  app/
    [locale]/
      layout.tsx                # root layout: <html lang>, fonts (Big Shoulders + Schibsted Grotesk + Martian Mono), metadata, DictProvider
      (site)/                   # public site (route group, URLs unchanged)
        layout.tsx              # AudioPlayerProvider, Header, Footer, PlayerDock, ConsentBanner, MotionInit, LiveLevel
        page.tsx                # one-pager: Hero + Setlist → Shows (+ band poster) → Band/Line-up → Photos → Booking
        legal/{imprint,privacy,cookies}/page.tsx  # Admin Markdown or curated fallback (src/content/legal.ts)
        not-found.tsx, [...rest]/page.tsx         # styled 404
      admin/                    # protected Admin (own chrome, noindex)
        layout.tsx              # admin top bar + own fonts (.admin-root); auth gating happens per route
        login/, change-password/, booking/, shows/, media/, music/, members/,
        settings/assets/, legal/, seo/, platform-links/, consent/
    api/booking/route.ts        # POST handler (same-origin JSON, rate limit, validation, Supabase + Resend)
    api/admin/auth/logout/      # POST handler — clears Supabase session cookies
    sitemap.ts, robots.ts, manifest.ts
  components/
    audio/                      # AudioPlayerProvider, Waveform, Setlist, PlayerDock, PlayTrackButton, LiveLevel
    consent/                    # consent contract, ConsentBanner, ExternalMediaGate, settings button
    legal/                      # LegalShell (safe renderer), LegalPage (shared server view)
    sections/                   # Hero, Shows, Band, Lineup, Gallery, Booking, BookingForm
    site/                       # Header, Footer, LocaleSwitcher, PlatformLinks, MotionInit
    ui/                         # Icon set
  content/legal.ts              # fallback legal texts DE/EN/TR (not legal advice)
  data/                         # static seed data (members, songs + covers, gallery + alt texts, site)
  i18n/                         # locale registry + dictionaries (de/en/tr)
  lib/
    admin/                      # admin-only helpers (auth guard, bookings, shows, media, songs, members, legal, seo, platform links)
    content/                    # Supabase-first / static-fallback content provider (request-memoised)
    env.ts, site-url.ts         # env access + canonical site URL
    supabase/                   # typed clients + SSR auth + booking writer
    resend/                     # server-only mail helper
    validation/                 # booking, show, upload, legal/seo/platform validators
supabase/
  migrations/
    0001_init.sql … 0005_booking_show_workflow.sql   # schema history (see below)
    0006_legal_seo_consent_platforms.sql # additive: legal_pages seed, platform check, consent seed, seo path index
    0007_security_hardening.sql # OPTIONAL: stop anon storage listing, bucket size/MIME limits, SECURITY DEFINER helpers
  policies/
    0001_rls.sql, 0002_rls_foundation.sql, 0005_booking_show_workflow.sql,
    0006_phase05_member_full_read.sql, 0006_legal_seo_consent_platforms.sql
public/
  assets/                       # hero, branding, members, band-cards, gallery, audio/demos
  og-image.jpg, icon.svg, icon-192.png, icon-512.png, apple-icon.png
DESIGN.md, PRODUCT.md           # Version B design system + product record (Impeccable)
.impeccable/                    # Impeccable direction round + surface brief (dev only, never shipped)
.claude/skills/impeccable/      # Impeccable design skill (v4.4.0, Apache-2.0) + agents in .claude/agents
docs/design/DESIGN.md           # Version A design system (anti-reference for Version B)
handoff/                        # historical Claude Design handoff (reference only since the redesign)
```

## Booking

The booking flow is the most important production function.

- Frontend: `src/components/sections/Booking.tsx` (promoter facts, poster,
  direct contact) + `BookingForm.tsx` (labelled fields, event-type select,
  inline validation, focus to first error, success/fallback states, privacy
  note). Copy in DE/EN/TR via dictionaries.
- API: `POST /api/booking` (`src/app/api/booking/route.ts`):
  same-origin + `application/json` only, best-effort per-IP rate limit
  (5 per 10 min per instance), honeypot `hp_field` and a 2.5 s time trap
  (both answer with a fake success), messages in the visitor's language.
- Validation: `src/lib/validation/booking.ts` — required `name`, `email`,
  `event_location`, `event_type`, `message` (≥ 10 chars); optional `phone`,
  `event_date` (must be a real calendar date). Event-type keys from the
  select are stored as German labels (`Festival`, `Firmenevent`, …) so the
  admin inbox and the mail stay readable; free text is still accepted.
- Persistence: `src/lib/supabase/booking.ts` inserts into `booking_requests`
  via the typed service-role client. No public insert policy exists.
- Mail: `src/lib/resend/client.ts` — Resend REST, server-only key, Reply-To
  set to the sender. Subject: `Neue Booking-Anfrage über typhoon.band`.
- **Preview deployments share the production Supabase/Resend env vars**
  (Vercel env targets production + preview), so a test submission on a
  preview URL creates a real booking row and sends a real e-mail.

### API response shape

```ts
// success — at least one configured channel (Supabase insert or Resend mail) succeeded
{ ok: true, status: "sent",      message: string }

// success — env not configured, nothing stored or sent
{ ok: true, status: "fallback",  message: string }

// validation — input rejected (400, per-field message)
{ ok: false, status: "validation", field?: string, message: string }

// rate limited (429) / foreign origin (403) / wrong content type (415)
{ ok: false, status: "rate_limited" | "error" | "validation", message: string }

// hard failure — every configured channel failed (502)
{ ok: false, status: "error",      message: string }
```

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

## Audio player

- Behaviour ported from `MikaMcFlurry/typhoon.band` branch
  `claude/typhoon-premium-redesign-x01JL` (docs/13-audio-player-source.md):
  one shared `HTMLAudioElement`, one song at a time, lazy `AudioContext` +
  `AnalyserNode` (fftSize 256, smoothing 0.78), live FFT waveform with a
  deterministic idle shape per song, auto-advance, `previous()` restarts
  after 3 s, `crossOrigin="anonymous"` before every `src`.
- Redesign additions: separate playback/time contexts (no full re-render
  4×/s), persistent **player dock** after the first play (keeps playing on
  legal pages), Media Session API (lock screen / hardware keys), loading and
  error states, waveforms auto-fit the available width, keyboard-operable
  seek slider, reduced-motion support, durations shown before playback.
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
- Legal: `/[locale]/admin/legal` (imprint/privacy/cookies × de/en/tr,
  plain textarea body, `is_published` per page; public falls back to the
  repo copy with a draft note while the slug is unpublished).
- SEO: `/[locale]/admin/seo` (per `(path, locale)` Title/Description/OG-Bild
  overrides; consumed via `generateMetadata` on `/`, `/legal/imprint`,
  `/legal/privacy`, `/legal/cookies`).
- Platform Links: `/[locale]/admin/platform-links` (Spotify, YouTube,
  Instagram, Facebook, SoundCloud, Bandcamp — active rows render in the
  footer instantly).
- Consent: `/[locale]/admin/consent` (read-only overview of cookie
  categories; banner copy is dictionary-driven in this phase).
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
Files travel **directly from the browser to Supabase Storage** via a
one-shot signed URL the server issues after admin + format/size checks.
The Server Action only ever receives metadata and the resulting public
URL, so Vercel's serverless request body limit never sees real demo
MP3s or member photos.

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

Allowed formats and max sizes are surfaced inline next to every file
input. Errors stay inside the Admin UI in German (Format nicht erlaubt
/ Datei zu groß / Upload fehlgeschlagen / Speichern fehlgeschlagen).
The service-role key never reaches the browser — only the signed upload
URL bound to the exact `(bucket, path)` the server picked.

See [`docs/admin-media-audio-uploads.md`](docs/admin-media-audio-uploads.md)
for the detailed flow diagram and the
[`docs/phase-05-upload-member-fixes.md`](docs/phase-05-upload-member-fixes.md)
fix log for the regression it solves.

### Public fallback rule

The public site keeps using the static repo assets when Supabase has no
record for an asset:

- Hero / bandinfo / signature images: `site_settings` keys
  `hero_image`, `hero_signature`, `bandinfo_image` (JSON `{ "url": "…" }`).
- Gallery: visible rows in `media_items` (category `gallery`).
- Demos: visible + streamable rows in `songs`. The featured flag chooses
  the song shown above the demo list.
- Members: **per-slug merge**. The 8 fallback musicians always render
  unless a matching Supabase row sets `is_visible = false`. A row that
  carries a photo, sort or translation overrides only that one member;
  the other 7 stay visible. Apply
  `supabase/policies/0006_phase05_member_full_read.sql` so the public
  client can see hidden member rows (without it, hidden members would
  silently fall back to the repo and render again).

If any of these are empty/missing, the page renders with the repo asset
in `public/assets/*` (no design change).

### Member text editing

`/[locale]/admin/members` edits per slug: name, instrument/role, short
bio (DE required; EN/TR fall back to the dictionary when empty),
`sort_order`, `is_visible`, photo. The `is_visible` checkbox uses a
hidden-input pattern so unchecking persists `false` instead of snapping
back to `true`. Photo uploads use the same direct-to-Storage flow as
media/music.

### Manual smoke test

1. Sign in as Admin and rotate the initial password.
2. `/[locale]/admin/media` — upload a JPG, set title/alt/sort, save.
   Public homepage gallery shows the new image first.
3. Untick "Auf der Website anzeigen", save — that image disappears
   from the public gallery, others stay.
4. `/[locale]/admin/music` — create a song, attach a real (10–50 MB)
   MP3 + cover, mark as featured. Featured player swaps to the new
   song; static featured returns when the row is hidden.
5. `/[locale]/admin/members` — edit Mika's DE name/role/bio and upload
   a photo. Only the Mika card changes on the public site; the other
   7 musicians keep their fallback. Untick visibility → only Mika
   disappears. Re-tick → returns.
6. `/[locale]/admin/settings/assets` — replace hero/bandinfo image.
   Confirm Hero and Bandinfo modules render the new URLs.
7. Try a `.svg`, a `.wav`, a 12 MB JPG → inline German error, no
   upload attempt, no client crash.

### Image optimisation

`next/image` requires explicit `images.remotePatterns` for Supabase
Storage URLs. `next.config.mjs` adds the pattern automatically when
`NEXT_PUBLIC_SUPABASE_URL` is set; without it, the site renders the
repo assets and never reaches Storage.

## Legal, SEO, Consent & Platform Links

- `/[locale]/admin/legal` — imprint/privacy/cookies × DE/EN/TR with
  `is_published`. Public legal routes render the published Admin text
  (Markdown-ish: `## ` headings, `- ` lists, auto-linked e-mails/URLs, no
  HTML) and otherwise the curated fallback in `src/content/legal.ts`
  (updated to § 5 DDG / § 18 Abs. 2 MStV, names Vercel, Supabase and Resend
  as processors, Art. 77 complaint right). **Not legal advice — have it
  reviewed before relying on it.**
- `/[locale]/admin/seo` — per `(path, locale)` Title/Description/OG image
  overrides for `/` and the legal routes. Defaults come from the
  dictionaries (`meta.*`) and `/og-image.jpg` (1200×630).
- Built-in SEO: per-locale `<html lang>`, canonical + hreflang alternates,
  Open Graph/Twitter cards, `sitemap.xml`, `robots.txt` (admin/api
  disallowed, admin also `noindex`), web manifest, JSON-LD `MusicGroup`
  with members and `MusicEvent` for upcoming dated shows.
- `/[locale]/admin/platform-links` — Spotify, YouTube, Instagram, Facebook,
  SoundCloud, Bandcamp. Active rows appear automatically in the footer and
  as "Also on" links in the music section; none → the blocks are hidden.
- Consent: first visit shows a small non-blocking notice; the footer button
  "Datenschutz-Einstellungen" reopens it as a dialog (focus trap, Esc).
  Stored only in `localStorage` (`typhoon.consent.v1`; the old key
  `typhoon.cookie-consent` is honoured). The public site sets no cookies.
  Wrap any future embed in `src/components/consent/ExternalMediaGate.tsx`.

Full admin workflow and manual tests:
[`docs/admin-legal-seo-consent-platforms.md`](docs/admin-legal-seo-consent-platforms.md).

## Security hardening (optional migration 0007)

`supabase/migrations/0007_security_hardening.sql` is **not required** by
the code. It stops anonymous listing of Storage objects (public file URLs
keep working), enforces bucket size/MIME limits (50 MB MP3, 10 MB
JPG/PNG/WebP) and makes the RLS helper functions `SECURITY DEFINER` with an
empty `search_path`. It was verified against a local Postgres 16 with all
earlier migrations applied. Apply it in the Supabase SQL editor after a
backup.

## Deferred / next batches

- Owner decisions listed in `docs/redesign/2026-09-redesign.md` (facts to
  confirm, legal review, apply 0007, real photos for members 3–8).
- Role enforcement (`editor` currently has the same rights as `owner`).
- Per-locale text CRUD (hero, about) and News/"Aus dem Proberaum" module.
- Real external embeds (always behind `ExternalMediaGate`).
- Shop/tickets phase.
- Monitoring and generated Supabase types.
