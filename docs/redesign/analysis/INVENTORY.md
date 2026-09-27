# TYPHOON: authoritative inventory for the complete redesign

Compiled 2026-09-25. It merges 7 recon reports (`public-frontend.md`, `backend-admin.md`, `phase06.md`, `docs-handoff.md`, `typhoon-band-repo.md`, `demo-repo.md`, `live-capture.md`) with my own checks against the repos, the Vercel API, the live SSR payload and the live site. Every check was read-only.

**Precedence when sources disagree.** Highest first:
1. What the live site renders from Supabase.
2. The fallback data in the live repo (`typhoon.band-website` main).
3. The docs in the live repo. Among those, the latest owner decision wins.
4. The other two repos.

Repos:
- LIVE = `/home/user/typhoon.band-website`
- OLD = `/home/user/typhoon.band`
- DEMO = `/home/user/Typhoon-Demo`

File paths are relative to the root of LIVE unless marked otherwise.

---

## 1. LIVE VERSION VERDICT

**The live site is repo `MikaMcFlurry/typhoon.band-website`, branch `main`, commit `740ff464dba8ed75a78498d8a84ab038582f663c`.** That commit is "Merge pull request #15 … band-member-placeholder-fix", dated 2026-06-17.

Evidence, checked against the Vercel API during this pass:
- Vercel project `typhoon-band-website` (`prj_RXRS7JDvkNAksvQl9nrJoEMeDeJq`, team `team_EbHSe8FJPGfgFDZSjyPEaHdL`).
  - Framework nextjs, Node 24.x.
  - SSO protection is on for everything except custom domains.
- Its latest production deployment is **`dpl_AchrnQssukAeurSjd17arPKkFore`**: READY, target production, `githubCommitRef: main`, `githubCommitSha: 740ff464…`, created 1781698106918 (2026-06-17).
- Domains:
  - `www.typhoon.band` is the serving host. It is verified.
  - `typhoon.band` (apex) is verified and **redirects → `www.typhoon.band`**.
  - Also attached: `typhoon-band-website.vercel.app`.
- The live HTTP check agrees:
  - `https://www.typhoon.band/` returns 307 → `/de` with `x-matched-path: /[locale]`, region iad1.
  - The rendered HTML matches main's components.
  - Content comes from Supabase project ref **`furogcuvihbwhtmxgmfu`**.
- Earlier production deployments were `d8ee2d7` (2026-05-11) and `d7a5d6e` (PR #14). Both are rollback candidates.
- Env vars set on the project for **production AND preview**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `BOOKING_EMAIL`, `WEBSITE_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`. I did not decrypt any values.
  - ⚠ **Preview deployments use the production Supabase and Resend.** Testing the booking form on a preview URL sends real mail to booking@ and writes to the production DB.

Other Vercel projects on the same team:
- `typhoon-band-test` (`prj_LdONuo4CYKsC7IoijwOiCyGD62H5`):
  - 1 production deployment, `dpl_91To3JoqDkVxH4UjksxATdW6vUts`, from **OLD `main@5178116`**, dated 2026-05-04.
  - It is behind SSO and uses `*.vercel.app` only.
  - It still renders the wrong facts: "Taifun", "Jürgen – Saxophon", "Daniel – Gitarre".
  - It is stale. The owner should delete or pause it.
- `typhoon-band` (`prj_JBqUKfzrS2mKwKVMKpsG55s8AymH`): 1 deployment of the same SHA, **CANCELED**.

### Role of every branch, across all three repos

| Repo / branch | SHA | Role | Live? |
|---|---|---|---|
| LIVE `origin/main` | 740ff46 | Production site: public one-pager, admin, Supabase, Resend, phases 01–05b plus the placeholder fix | **YES** |
| LIVE `origin/claude/phase-06-legal-seo-consent-platforms` | 0cd76d0 (2026-05-11) | Never merged; no PR. Adds admin Legal/SEO/Platform-links/Consent, public legal pages from Supabase, consent v1, ExternalMediaGate, migration 0006. Merges cleanly onto main and builds. It has a READY but SSO-protected **preview** deployment, `dpl_7fn86EW9YHmiQS3dGMkNBmaPb6Gu` | no (donor) |
| LIVE `origin/claude/typhoon-website-redesign-7xjozt` | 740ff46 | The empty session branch for this run, identical to main | no |
| LIVE local `claude/typhoon-website-redesign-7xjozt` | 5f8a5ab | **Local and unpushed.** Three commits made today, 02:36–02:57 UTC: 3f643d1 "Redesign WIP…", fe1121e "Merge Phase 06…", 5f8a5ab "Redesign: new public site, player dock, booking and legal rebuild". 99 files, +8056/−2918, including `supabase/migrations/0007_security_hardening.sql`. It is checked out in worktree `/home/user/typhoon-redesign`. This is in-flight work from this workflow; the inventory neither reviews it nor relies on it | no |
| OLD `origin/main` = `origin/claude-design` = `origin/claude/typhoon-website-redesign-7xjozt` | 5178116 (2026-04-28) | Codex "batch 1" MVP plus Mika's raw uploads. Wrong member facts. It is what `typhoon-band-test` deploys | no (stale) |
| OLD `origin/claude/typhoon-premium-redesign-x01JL` | e2fe2e1 (2026-04-30) | The "old Claude branch" and the **reference for audio behaviour** (`src/components/audio/AudioPlayerProvider.tsx`, `Waveform.tsx`). Also has Brief v2, Checklist v2, the mockup PNGs and the best tri-lingual prose. Never deployed | no (donor) |
| OLD `origin/codex` | 88add85 (2026-04-27) | Codex "batch 2" rework, never merged. Wrong facts. Only a few copy lines are usable | no |
| DEMO `main` = `origin/main` = `origin/claude/typhoon-website-redesign-7xjozt` | c499c02 (2026-03-08) | A static HTML/JS prototype meant for GitHub Pages; the placeholder URLs were never replaced. Useful only as a source of ideas and tone. Wrong member facts | no |

---

## 2. FEATURE PARITY CHECKLIST

The new site must keep every F-item, or implement it better. `(fix)` marks an item whose current implementation is buggy; the parity target is the corrected behaviour. P06-items come from the unmerged branch and are **improvement candidates**. They are not live today, but they are what the owner asked for next (`docs/current-task.md` = Phase 06).

### 2a. Public site

- **F01 Locale routing.**
  - Routes `/de` (default), `/en`, `/tr`. `/` redirects to `/de` with a 307.
  - An unknown locale returns a 404.
  - Refs: `next.config.mjs` `redirects()`, `src/i18n/locales.ts` (`LOCALES`, `DEFAULT_LOCALE`, `isLocale`), `src/app/[locale]/layout.tsx` (`generateStaticParams`, `notFound()`).
- **F02 Full DE/EN/TR UI dictionaries.** Every visible and aria string must be localised. Refs: `src/i18n/dictionaries.ts` (a typed `Dict`), `DictProvider`/`useDict`.
  - (fix) Today several aria/alt strings are German on every locale.
- **F03 Locale switcher.**
  - Replaces the first path segment and keeps the rest of the path, e.g. `/de/legal/privacy` → `/en/legal/privacy`.
  - Marks the active locale with `aria-current`.
  - Ref: `src/components/layout/LocaleSwitcher.tsx`.
  - (fix) Keep the hash too, and keep the switcher available inside the mobile menu.
- **F04 Fixed header.**
  - The signature logo links to `/${locale}`.
  - Anchor nav: Home `#home`, Band `#band`, Music `#music`, Termine `#shows`, Media `#media`, Booking `#booking`, Kontakt `#contact`.
  - Outside the home page, links become `/${locale}#x`.
  - Ref: `src/components/layout/Header.tsx`, `linkFor()`, verified in code.
  - (fix) Needs a background or scrim on scroll, `scroll-margin-top`, smooth scrolling and an active-section state.
- **F05 Mobile menu drawer.**
  - Current behaviour: opaque full-screen layer that covers the signature; body scroll lock; closes on link click and on route change; contact line.
  - Ref: `Header.tsx`, `#mobile-drawer`.
  - (fix) Add Esc to close, `role=dialog`, a focus trap, `inert` while closed, the locale switcher, and `tel:`/`mailto:` links. The cookie banner must not sit above it.
- **F06 Hero.**
  - A 3-line headline with line 3 in gold, a description, CTA "Songs anhören" → `#music` and CTA "Booking Anfrage" → `#booking`.
  - The sepia band collage.
  - The gold signature PNG overlay, which bleeds out of the hero into the player area.
  - The admin can override the image and signature (site_settings `hero_image`, `hero_signature`).
  - Refs: `src/components/sections/Hero.tsx`, `getHeroContent()` in `src/lib/content/index.ts`.
- **F07 Featured player card.**
  - Shows the song with `isFeatured`, otherwise `songs[0]`.
  - Contents: cover, tag, title, artist "Typhoon", play/pause, prev, next, waveform with seek, `position / duration`, mute, and a volume slider on desktop.
  - Ref: `src/components/audio/FeaturedPlayer.tsx`.
  - (fix) It must follow the currently playing track, and mobile needs prev.
- **F08 Audio engine.** Ref: `src/components/audio/AudioPlayerProvider.tsx` + `PlaylistRegistrar.tsx`.
  - One shared lazy `new Audio()`.
  - `crossOrigin="anonymous"` is set **before** `src`, because the MP3s come from Supabase.
  - `preload="metadata"`.
  - One song at a time.
  - API: `toggle(id,src)`, `seek(id,ratio)`, `setVolume`, `toggleMute`, `setPlaylist`, `next`/`previous`. Next/previous wrap around; `previous` restarts the track when `currentTime` > 3 s.
  - Auto-advance on `ended`.
  - Lazy `AudioContext` → `MediaElementSource` → `AnalyserNode` (fftSize 256, smoothing 0.78), created on the first user gesture and resumed when suspended. Analyser failures must not break playback.
  - `formatTime` → `m:ss`.
  - Source-order note: docs/13 names OLD x01JL as the behaviour source; LIVE is a faithful port of it plus extensions.
  - (fix) **Ghost and double playback after a locale switch, verified live today.** Details are in §7 #1. Also: unmount cleanup, an error state, Media Session, and keyboard seek.
- **F09 Waveform.** Ref: `src/components/audio/Waveform.tsx`.
  - Idle shape is deterministic per song id: FNV-1a seed into mulberry32; envelope `0.5+0.4·sin(πt)+0.18·sin(3πt)`; jitter `0.55+0.85·rng`; clamped to [0.16, 1].
  - Live FFT via rAF: lower 72% of the bins, `avg^0.7`, peak decay ×0.85, minimum 0.08. It writes `scaleY` straight to the DOM.
  - Progress colours: played bars `--gold-soft`, unplayed bars `--bronze`.
  - Returns to idle over 360 ms with `cubic-bezier(.22,1,.36,1)`.
  - Click to seek.
  - (fix) Needs a keyboard-accessible slider (x01JL used `<input type=range>`), `prefers-reduced-motion`, and clicking a non-current track should start it.
- **F10 Demo list.**
  - Shows every visible song: index, cover, play/pause, title, waveform, time. Duration comes from the metadata; the current track shows position/duration.
  - **No download button and no native controls.**
  - Refs: `src/components/sections/Demos.tsx`, `src/components/audio/DemoRow.tsx`, `useTrackDuration.ts`.
  - (fix) Stop fetching the metadata of 6 MP3s on page load. Store durations instead.
- **F11 Shows / Termine.**
  - Reads Supabase `shows` rows that are visible AND published.
  - Card: day, month, year, venue, "city, country". If `ticket_url` is set, the card links out with `target=_blank rel=noopener`.
  - With no rows, it shows 4 dictionary TBA placeholders.
  - On mobile it is a horizontal scroll rail.
  - Refs: `src/components/sections/Shows.tsx`, `src/app/[locale]/page.tsx`, `getShows()`.
  - (fix):
    - TBA rows (`is_tba`, `starts_at` null) are filtered out today.
    - There is no past/upcoming split.
    - The date is always formatted as de-DE and appears twice.
    - The placeholder year is "2025".
    - "Alle Termine" points to `#booking`.
    - Desktop is capped at 4 cards.
- **F12 About / band-info editorial card.**
  - Image, overridable via site_settings `bandinfo_image`, falling back to `/assets/gallery/gallery-5.jpg`.
  - Eyebrow, h2 headline, body, genre line.
  - CTAs "Mehr über die Band" → `#band` and "Booking Anfrage" → `#booking`.
  - Refs: `src/components/sections/About.tsx`, `getBandInfo()`.
- **F13 Members.**
  - Eight fallback slugs, **merged per slug** with Supabase `band_members` + `band_member_translations` for the current locale.
  - Supabase overrides name, role, bio, photo and sort order. `is_visible=false` hides only that member. Unknown slugs are appended.
  - The placeholder badge appears only when there is no photo.
  - Card: photo, name, role, bio.
  - Refs: `src/components/sections/Members.tsx`, `normaliseMembers` in `src/lib/content/normalize.ts`, `src/data/members.ts`.
- **F14 Gallery and lightbox.**
  - Reads Supabase `media_items` where visible and `type=image`. The fallback is the 8 local images.
  - Thumbnails are `<button>`s with aria-labels.
  - Lightbox: `role=dialog aria-modal`, close, prev/next with wrap-around, an "n / N" counter, Esc and ←/→ keys, scroll lock. It opens **in-site** (the owner asked for this; before, images opened in a new tab).
  - Refs: `src/components/sections/Gallery.tsx`, `src/components/media/MediaLightbox.tsx`.
  - (fix) Needs a focus trap, focus return to the thumbnail, backdrop click, swipe, and captions.
- **F15 Booking form.**
  - Fields: `name*`, `email*`, `phone`, `event_date` (date), `event_location*`, `event_type*`, `message*`, plus the honeypot `hp_field`.
  - Client-side required check.
  - `POST /api/booking` as JSON, including `locale`.
  - States: submitting (button disabled), success (form resets), fallback, error. Messages use `aria-live` with `role=status`/`alert`.
  - The notice "Anfragen gehen direkt an booking@typhoon.band. Antwort innerhalb von 48 Stunden." must stay.
  - Ref: `src/components/sections/Booking.tsx`.
  - (fix) Visible labels, the submit button inside the form, per-field errors, localised server messages, and a privacy notice at the form.
- **F16 Booking API.** Ref: `src/app/api/booking/route.ts` (runtime nodejs).
  - Returns 400 for invalid JSON.
  - A honeypot hit returns 200 with a silent "fallback".
  - Server validation: name ≥2 (max 120); email regex (max 200); location ≥2; type ≥2; message ≥10 (max 4000); `event_date` must be `YYYY-MM-DD`; phone max 60; locale ∈ de/en/tr. Ref: `src/lib/validation/booking.ts`.
  - Runs `Promise.all` over two channels:
    - A service-role insert into `booking_requests` with status `new`, `locale` and `user_agent`. Ref: `src/lib/supabase/booking.ts`.
    - Resend REST mail to `BOOKING_EMAIL` from `WEBSITE_FROM_EMAIL`, with `reply_to` set to the sender, subject "Neue Booking-Anfrage über typhoon.band", and a dark/gold HTML + text body that escapes all HTML. Refs: `src/lib/resend/client.ts`, `src/lib/email/booking-email.ts`.
  - With neither channel configured it answers "fallback" and 200. It answers 502 only when both channels fail.
  - (fix):
    - Add rate limiting and an Origin check.
    - Populate `ip_hash`.
    - Localise the messages.
    - Log when one channel fails.
    - Report success truthfully.
- **F17 Footer.**
  - Signature logo and blurb.
  - Contact: `mailto:booking@typhoon.band` and the phone.
  - "Folge uns" social icons.
  - Legal links: imprint, privacy, cookies.
  - `© {year} Typhoon. Alle Rechte vorbehalten.`
  - Ref: `src/components/layout/Footer.tsx`.
  - (fix) The socials are dead `href="#"` today; see P06-03. The phone needs a `tel:` link.
- **F18 Cookie/consent banner.**
  - Stays up until the visitor decides. The choice goes to localStorage `typhoon.cookie-consent` as `"accepted"` or `"declined"`. It links to privacy and cookies. No tracking.
  - Ref: `src/components/layout/CookieConsent.tsx`.
  - The owner asked for this banner in v6. It is superseded by P06-04.
- **F19 Legal pages** `/[locale]/legal/{imprint,privacy,cookies}`.
  - DE/EN/TR, rendered in `LegalShell` with a back-to-home link and styled to match the site (the owner explicitly rejected "plain unstyled placeholders").
  - Refs: `src/app/[locale]/legal/*/page.tsx`, `src/components/legal/LegalShell.tsx`, `src/data/site.ts` `imprint`.
  - (fix) Update the legal references and processors, and drop the "draft" note. See §7.
- **F20 SEO baseline.**
  - Root title default "Typhoon — Funk · Soul · Jazz · Bluesrock", template `"%s · Typhoon"`, description, `metadataBase = NEXT_PUBLIC_SITE_URL`.
  - Ref: `src/app/layout.tsx`.
  - (fix) Needs everything in §8: per-locale metadata, OG, hreflang, canonical, sitemap, robots, icons, JSON-LD, and per-locale `<html lang>`.
- **F21 Privacy posture.**
  - Fonts are self-hosted: Inter via `next/font/google`, which is served from our own domain; verified that it loads live.
  - No analytics, no embeds, and no third-party hosts except Supabase.
  - Refs: docs/10, CLAUDE.md.
- **F22 Graceful degradation.**
  - The public site must render without the Supabase or Resend env vars, with no 500 errors. Every loader is wrapped in `safe()` and falls back to static data.
  - Refs: `src/lib/env.ts` (`isSupabaseConfigured`), `src/lib/content/index.ts`, `fallback.ts`. Rule from docs/02-claude-workflow.
- **F23 `next/image` remotePatterns** for `<SUPABASE_URL>/storage/v1/object/public/**`. Ref: `next.config.mjs`.
- **F24 Brand design language.**
  - Near-black/brown base, sepia imagery, antique and champagne gold (not yellow), cream text, film grain, gold hairlines, the handwritten logo as the decorative script.
  - Ref: `src/app/globals.css`, with tokens in §5.6.
- **F25 A11y baseline to keep.**
  - Localised player aria-labels ("Abspielen/Pause {title}").
  - `aria-expanded`/`aria-controls` on the burger.
  - `aria-current` on the locale switcher.
  - Focus-visible outlines.
  - Keyboard control in the lightbox.
  - `role=alert`/`status` on the booking notices.
  - Decorative SVGs marked `aria-hidden`.
  - No horizontal page overflow at 390 px; verified `scrollWidth == vw` live.

### 2b. Admin (`/[locale]/admin/**`)

All of these use the service-role client on the server and the German UI.

- **F26 Login.**
  - Email + password via `@supabase/ssr` cookie session.
  - The `from` parameter is only honoured if it starts with `/${locale}/admin`.
  - Users without admin rights are signed out.
  - `last_login_at` is updated.
  - Refs: `src/app/[locale]/admin/login/{page.tsx,LoginForm.tsx,actions.ts}`.
- **F27 Forced initial password change.**
  - Password ≥12 characters, entered twice.
  - The `must_change_password` flag is cleared and `password_changed_at` is set.
  - Refs: `admin/change-password/*`, `supabase/migrations/0004_admin_password_flow.sql`.
- **F28 Logout.** `POST /api/admin/auth/logout?locale=` returns a 303 to login. Ref: `src/app/api/admin/auth/logout/route.ts`.
- **F29 Server-side guards on every page and action.**
  - `requireAdmin` and `requireAdminWithPasswordOk` in `src/lib/admin/auth.ts`, built on `admin_profiles` (role owner/admin/editor, `is_active`).
  - Verified live: `/de/admin` → 307 → login.
  - (fix) Enforce the roles that are defined in `src/lib/admin/roles.ts` but never used.
- **F30 Dashboard and admin shell.**
  - Module cards, a pill nav (Dashboard / Booking / Shows / Media / Music / Members / Assets), and the display name + role.
  - Refs: `admin/page.tsx`, `admin/_components/AdminShell.tsx`.
- **F31 Booking inbox.**
  - Lists the 50 latest requests, active or including archived (`?archived=1`).
  - Detail view with all fields; the status can be set to any of `new, read, answered, accepted, converted, rejected, archived, spam`.
  - Archive is a soft delete (`deleted_at` plus status archived). Restore is available. Each request has a mailto link.
  - Refs: `admin/booking/{page.tsx,[id]/page.tsx,[id]/actions.ts}`, `src/lib/admin/bookings.ts`.
- **F32 Convert booking → show.**
  - Prefilled form. The records are linked both ways: `booking_requests.converted_show_id` ↔ `shows.source_booking_request_id`. `converted_at` is set.
  - Refs: `admin/booking/[id]/actions.ts`, migration 0005.
- **F33 Shows CRUD.**
  - List, new, edit, hard delete, and a visibility toggle.
  - Fields: date, time, venue*, city, country (default "Deutschland"), event_type, ticket_url (http/https), sort_order, is_tba, is_visible, is_published.
  - Refs: `admin/shows/*`, `src/lib/validation/show.ts`, `src/lib/admin/shows.ts`.
  - (fix):
    - Unchecked checkboxes save as `true` (verified: `asBool(null,true)`).
    - The local time is stored as UTC.
    - There is no delete confirmation.
- **F34 Gallery admin.**
  - Direct upload, title, alt, sort order, visibility, delete.
  - Refs: `admin/media/*`, `src/lib/admin/media.ts`.
- **F35 Music admin.**
  - Create: title, slug, MP3 upload, optional cover, sort, visible, featured.
  - Edit: replace the MP3 or cover, clear the cover.
  - Delete.
  - Only one song can be featured. The server forces `is_streamable=true` and `is_downloadable=false`.
  - Refs: `admin/music/*` (`SongForms.tsx`), `src/lib/admin/songs.ts`.
- **F36 Members admin.**
  - Covers the 8 fixed slugs.
  - Photo upload or clear; name, role and bio in each of DE/EN/TR; sort order; visibility.
  - Refs: `admin/members/*`, `src/lib/admin/members.ts`.
- **F37 Site-assets admin.**
  - Upload or clear `hero_image`, `hero_signature` and `bandinfo_image`, stored in `site_settings` as `{url}`.
  - Refs: `admin/settings/assets/*`, `src/lib/admin/site-settings.ts`.
- **F38 Direct-to-Storage upload pipeline.**
  1. The client validates the file and the `prepareDirectUpload` server action re-validates the metadata. Images must be JPG, PNG or WebP ≤10 MB; audio must be MP3 ≤50 MB.
  2. The server creates a signed upload URL.
  3. The browser calls `uploadToSignedUrl`.
  4. A hidden `${name}_url` field carries the public URL.
  5. `parseSupabasePublicUrl` enforces the expected bucket.
  - Error messages are German ("Datei zu groß (max. N MB)", "Format nicht erlaubt …").
  - Refs: `admin/_uploads/{DirectUploadField.tsx,actions.ts}`, `src/lib/storage/upload.ts`, `src/lib/validation/upload.ts`.
- **F39 Flash feedback and revalidation.**
  - Query flags `?created|updated|deleted|saved|cleared=1` and `?error=`.
  - `revalidatePath` runs after every write.

### 2c. Backend, security and ops

- **F40 Supabase schema and RLS.**
  - Apply order:
    1. `migrations/0001_init`
    2. `policies/0001_rls`
    3. `0002_supabase_foundation` + `policies/0002`
    4. `0003_storage_buckets`
    5. `0004_admin_password_flow`
    6. `0005_booking_show_workflow` + `policies/0005`
    7. `policies/0006_phase05_member_full_read`
  - RLS is on for all 14 tables. Public read access is scoped per table. Admin writes go through `is_active_admin()`. `booking_requests` has **zero** anon access.
- **F41 Storage buckets.** `public-media`, `audio-demos`, `member-images`, `gallery`, `legal-assets`, with admin-write policies (0003).
- **F42 Secrets stay on the server.** The service role and Resend key live only in `server-only` modules (`src/lib/supabase/admin.ts`, `src/lib/resend/client.ts`). `.env.example` lists all 7 vars. Verified live: no JWT or key in the HTML or chunks.
- **F43 Demo audio is stream-only.** `is_downloadable=false`, no download UI, no native controls.
- **F44 Docs hygiene.**
  - README, `.env.example`, `.gitignore` and `/docs` stay current.
  - `.gitignore` blocks raw audio and DAW files (`*.wav *.aiff *.flac *.m4a …`).
  - `npm run lint` and `npm run build` must pass.

### 2d. Phase 06 improvement candidates (unmerged branch `0cd76d0`)

Diff: `git diff 740ff46 origin/claude/phase-06-legal-seo-consent-platforms`.

- **P06-01 Legal editor and legal pages from the DB.**
  - Admin page `/[locale]/admin/legal`: tabs per slug (imprint, privacy, cookies) and per locale (de, en, tr); title ≤160; `body_md` ≤16000 in a plain textarea; one publish flag per slug.
  - The public legal pages become server components: Supabase first, with the curated fallback, rendered through the `LegalBody` mini-renderer (no HTML injection).
  - Refs: `admin/legal/*`, `src/lib/admin/legal.ts`, `src/lib/validation/legal-seo-platforms.ts`, `src/components/legal/LegalShell.tsx`.
- **P06-02 SEO editor.**
  - Admin page `/[locale]/admin/seo` upserts one entry per `(path, locale)`: title ≤80, description ≤180, `og_image_url` ≤500. The path must match `^\/[a-z0-9\-/]*$`.
  - `generateMetadata` on the home page and the legal pages reads it via `getSeoEntry`.
  - Ref: `src/lib/admin/seo.ts`.
- **P06-03 Platform links.**
  - Admin page `/[locale]/admin/platform-links` for spotify, youtube, instagram, facebook, soundcloud and bandcamp.
  - The public footer renders the active links. With no links, the block is hidden. `href="#"` never appears.
  - Owner requirement: *"As soon as Admin inserts a link for an external platform, that platform link should automatically appear on the website."*
  - Bug to fix: the `is_active` checkbox cannot be switched off.
- **P06-04 Consent v1.**
  - localStorage key `typhoon.consent.v1` holds `{v:1, necessary:true, external_media:boolean, decided_at}`.
  - Events `typhoon:consent-changed` and `typhoon:open-consent`.
  - Banner with "Cookie-Einstellungen / Nur Notwendige / Alle erlauben", a preferences view with "Auswahl speichern", and a footer "Cookie-Einstellungen" link that reopens it.
  - Ref: `src/components/layout/consent.ts`.
  - Gaps to close: a focus trap, Esc, and syncing on `consent-changed`.
- **P06-05 `ExternalMediaGate`.** A click-to-load gate for future YouTube, Spotify or Bandcamp embeds. Nothing uses it yet. Ref: `src/components/media/ExternalMediaGate.tsx`.
- **P06-06 Consent admin.** A read-only view at `/[locale]/admin/consent` over `consent_settings`.
- **P06-07 Migration 0006.**
  - Seeds `legal_pages` with `is_published=false`.
  - Adds a CHECK on `platform_links.platform`; widen the allowed list before applying.
  - Seeds `consent_settings` with necessary, external_media and statistics.
  - Adds `seo_entries_path_idx`.
  - Its policy file number collides with main's `policies/0006_*`, so renumber it to 0007 or later.
- **P06-08 Page-specific SEO fallback titles.**
  - DE Impressum / Datenschutzerklärung / Cookie-Hinweise; EN Imprint / Privacy policy / Cookie notice; TR Künye / Gizlilik politikası / Çerez bildirimi.
  - Do **not** adopt its uppercase genre-line home title. Keep the live title.

---

## 3. CONTENT FACTS (verbatim)

### 3.1 Brand and positioning

- Name: **Typhoon**. Never "Taifun".
- Genre line: `BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK` (DE). EN and TR use `BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK`.
- Tagline (`src/data/site.ts`): `Bluesrock · Funk · Soul · Jazz · Southern Rock`.
- Positioning (docs/03): Bluesrock, Funk, Soul, Jazz, Southern Rock, Turkish lyrics, American-European sound, strong live energy, experienced musicians.
- Studio and home base, from OLD `docs/typhoon-info.md` on x01JL (the canonical copy) and the DEMO; confirmed there, not yet used on live: **"Im eigenen Kanzlei Studio in Hechingen …"**; "über 30 Jahren Bühnenerfahrung"; "acht erfahrene Musiker".
- Region line from the DEMO: "Raum Hechingen • Balingen • Reutlingen • Tübingen • Stuttgart". **Owner must confirm.**
- The imprint operator lives in Bayreuth (see 3.8). Do not confuse this with the band's home base.

### 3.2 Hero (dictionary; the live render matches)

| | DE | EN | TR |
|---|---|---|---|
| line1 | SMOOTH. | SMOOTH. | SMOOTH. |
| line2 | EXZEPTIONELL. | EXCEPTIONAL. | OLAĞANÜSTÜ. |
| line3 (gold) | FUNK. | FUNK. | FUNK. |
| description | Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie. | Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock — powerful, warm, full of live energy. | Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir — güçlü, sıcak ve sahnede dolu enerjik. ⚠ |
| ctaListen | Songs anhören | Listen to songs | Şarkıları dinle |
| ctaBook | Booking Anfrage | Booking request | Booking talebi |

- ⚠ The live TR phrase "sahnede dolu enerjik" is ungrammatical. Doc v6 prescribes "…soul, **caz** ve southern rock ile birleştirir — güçlü, sıcak ve **sahnede enerji dolu**." Recommendation: use the v6 wording. It is the owner's own spec.
- Unused CTA from docs/03: `Live erleben`.

### 3.3 About / band info

- Kicker: `Über Typhoon` / `About Typhoon` / `Typhoon Hakkında`. Eyebrow: `Typhoon`.
- Headline:
  - DE: `Amerikanisches Feeling. Europäische Seele. Türkische Texte.`
  - EN: `American feeling. European soul. Turkish lyrics.`
  - TR: `Amerikan tını. Avrupalı ruh. Türkçe sözler.`
- Body:
  - DE: `Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet.`
  - EN: `Typhoon breaks genre boundaries without losing their handwriting: punchy blues riffs, funky grooves, soulful melodies, jazz finesse and Turkish-language lyrics. An experienced band that ignites the moment they hit the stage.`
  - TR: `Typhoon, kendi imzasını kaybetmeden tür sınırlarını aşar: vurucu blues riff'leri, funky groove'lar, ruhlu melodiler, jazz incelikleri ve Türkçe sözler. Sahneye çıktığı an alev alan tecrübeli bir grup.`
- CTAs: `Mehr über die Band` / `More about the band` / `Grup hakkında daha fazla`, plus `Booking Anfrage`.
- Long DE text, unused on live (`site.about.lead` + docs/14):
  > Typhoon präsentiert einen kraftvollen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit amerikanisch-europäischem Sound. Selbstkomponierte Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen. Türkischsprachige Texte geben den Songs Tiefe und kulturelle Eigenständigkeit.
  > Die Band steht für erfahrene Musiker, warme Live-Energie, starke Bläser, groovende Rhythmusgruppe und ein musikalisches Gesamtbild, das sich vom Mainstream abhebt.
- Canonical band story (OLD `docs/typhoon-info.md` on x01JL). This is the longest verified bio and suits an "Über die Band / Mehr lesen" reveal:
  > Typhoon präsentiert sich mit einem beeindruckenden Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock, der einen kraftvollen amerikanisch-europäischen Sound erzeugt. Ihre selbstkomponierten Songs verweben markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen zu einem mitreißenden Ganzen, das die Band deutlich vom Mainstream abhebt.
  > Ausdrucksstarke türkischsprachige Texte verleihen den Stücken geheimnisvolle Tiefe und unterstreichen die kulturelle Vielfalt, die Typhoon auszeichnet. Diese stilistische Bandbreite sprengt gekonnt Genregrenzen, ohne die charakteristische Handschrift der Band zu verwischen.
  > Im Zentrum steht ein eingespieltes Kollektiv aus acht erfahrenen Musikern mit über 30 Jahren Bühnenerfahrung: Sänger Typhoon, Posaunist Mika, Saxophonist Schack, Trompeter Hardy, Funk-Bassist Stefan, Schlagzeuger Tom sowie die Gitarristen Buğra und Jürgen.
  > Im eigenen Kanzlei Studio in Hechingen produziert die Band ihre Arrangements mit viel Liebe zum Detail und moderner Technik. Das Ergebnis ist ein Gesamtpaket aus handwerklicher Präzision und authentischer Spielfreude.
  - ⚠ Paragraph 3 names Jürgen (guitar). Live now shows **Tan (Percussion)** in that slot; see C1. Owner decision needed before this paragraph is published.
- Footer blurb:
  - DE: `Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.`
  - EN: `Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock.`
  - TR: `Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir.`

### 3.4 Members (LIVE Supabase render, 2026-09-25; this wins)

Order = sort order. The kicker is `Band Mitglieder` / `Band Members` / `Grup Üyeleri`.

| # | slug | name (live) | role DE / EN / TR | bio DE (live, verbatim incl. typos) | bio EN (live) | bio TR (live) |
|---|---|---|---|---|---|---|
| 1 | typhoon | Typhoon | Gesang / Vocals / Vokal | Frontman - türkischsprachige Texte und direkte Energie im Zentrum der Band | Frontman - Turkish lyrics and powerful energy at the heart of the band. | Sahnenin önünde Türkçe sözler ve grubun merkezindeki canlı enerji. |
| 2 | mika | **Mika El Jackson** | Posaune / Trombone / Trombon | Junger Posaunen Sound, frecher live Charakter und warme Brass-Linien | Young trombone sound, raw live character, warm brass lines. | Genç trombon tonu, sahnedeki ham karakter ve sıcak nefesli partileri. |
| 3 | schack | Schack | Saxophon / Saxophone / Saksofon | Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion. | Experience, warm phrasing and a soulful tone driving the brass section. | Tecrübe, sıcak frazeler ve nefesli grubuna soul katan bir saksofon tonu. |
| 4 | hardy | Hardy | Trompete / Trumpet / Trompet | Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck. | Punchy brass voice between funk, blues rock and stage power. | Funk, blues rock ve sahne gücü arasında etkileyici bir trompet sesi. |
| 5 | stefan | Stefan | Funk-Bass / Funk Bass / Funk Bas | Groovendes Fundament, präziser Druck und warme Tiefe. | Grooving foundation, precise punch and warm low end. | Groove temeli, isabetli vuruş ve sıcak alt bant. |
| 6 | tom | Tom | Schlagzeug / Drums / Davul | Treibender Puls, Live-Energie und rhythmische Stabilität. | Driving pulse, live energy and rhythmic stability. | Sürükleyici nabız, sahne enerjisi ve sağlam ritim zemini. |
| 7 | bugra | Buğra | Gitarre / Guitar / Gitar | Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung. | Guitar lines with a Turkish accent, groove and melodic tension. | Türk müzik izi taşıyan, groove ve melodik gerilim dolu gitar partileri. |
| 8 | **jurgen** | **Tan** | **Percussion / Percussion / Perküsyon** | Zusätzlicher Groove, organische Akzente und rhythmische Farbe. | Extra groove, organic accents and rhythmic color. | Ekstra groove, organik vurgular ve ritmik renk. |

- Repo fallback bios in `src/data/members.ts` and the dictionaries are the polished versions. For example, typhoon: "Frontmann, türkischsprachige Texte und direkte Energie im Zentrum der Band."; mika: "Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien."; jurgen: "Gitarrensound zwischen Rhythmus, Wärme und rockiger Kante."
- Hard content rules (docs/03, `members.ts`):
  - Typhoon, not Taifun.
  - Schack plays sax.
  - Daniel must never appear.
  - The singer card comes first.
  - Never use the handoff names "Taner Yücel", "Ali Can", "Selim Sarı", "Murat Öztürk", "Emil Yılmaz", "Cenk Mercan" or "Burak Gürpınar".
- Unconfirmed extras, owner must confirm before use:
  - Surname "Buğra Uzer".
  - Credits: Typhoon "Düzviraj, Kapkaç"; Hardy "bekannt aus „Ernest a / & the Hemingway"" (the name is ambiguous); Buğra "Live- und Session-Gitarrist für prominente Künstler in der Türkei".
  - "24-jähriger Posaunist Mika".
  - "Keys/Hammond" for Typhoon. The live gallery does show him at a Nord keyboard.
  - **Never** move Daniel's credit "Düzviraj und ehemals Rita and the Jetlegs" onto anyone else.

### 3.5 Songs (LIVE Supabase `audio-demos`, 2026-05-11 uploads; this wins)

| # | live slug = title (verbatim) | canonical spelling (repo fallback) | live file (bucket `audio-demos`) | local fallback file | size | duration |
|---|---|---|---|---|---|---|
| 1 ★featured | Sen-Benim | Sen Benim | `2026-05-11-sen-benim-abed5b20-ec5c-4d98-86fa-ad797912c3f0.mp3` | `/assets/audio/demos/Sen-Benim.mp3` | 9.01 MB | 5:35 |
| 2 | Karanfil | Karanfil | `2026-05-11-karanfil-demo-f602e5df-a76f-4716-bd35-a96f4f318104.mp3` | `karanfil-demo.mp3` | 8.42 MB | 5:29 |
| 3 | Farksilin | Farksilin | `2026-05-11-farksilin-demo-5f673e99-330e-4746-99b5-7ae74a0d3ed2.mp3` | `farksilin-demo.mp3` | 3.87 MB | 4:02 |
| 4 | Cilgin | **Çılgın** | `2026-05-11-cilgin-demo-031d5a3d-8660-4555-8533-cdb44318bb96.mp3` | `cilgin-demo.mp3` | 6.19 MB | 3:20 |
| 5 | Bir tek sen | **Bir Tek Sen** | `2026-05-11-bir-tek-sen-demo-064b3632-5f77-46da-b028-711370cae7b8.mp3` | `bir-tek-sen-demo.mp3` | 6.37 MB | 3:34 |
| 6 | gece yine dustun | **Gece Yine Düştün** | `2026-05-11-gece-yine-dustun-demo-d0b1aeb1-1a32-4ed3-a5a0-9655b5cc0af1.mp3` | `gece-yine-dustun-demo.mp3` | 8.72 MB | 9:05 |

- Every live URL has the prefix `https://furogcuvihbwhtmxgmfu.supabase.co/storage/v1/object/public/audio-demos/`.
- `cover_image_url` is null for every song, so every cover shows the hero collage.
- Live slugs contain spaces and capitals ("Bir tek sen", "gece yine dustun"). **Slugify before using a slug in any URL, `id` or anchor.**
- The MP3s are byte-identical across all three repos. The ID3 tags are ffmpeg junk from an M4A conversion and carry no title.
- Featured tag: `Aktueller Demo · Single` / `Current demo · Single` / `Güncel demo · Single`. Kicker: `Demos` / `Demos` / `Demolar`.
- Per-song one-liners exist only in the DEMO and were invented by AI. Do not publish them without band approval.

### 3.6 Shows

- **There are no real shows.** The Supabase `shows` table is empty or has no visible and published rows, so live renders the 4 dictionary placeholders:
  - `TBA 2025` "Neue Termine in Vorbereitung" · Deutschland · Demnächst
  - `TBA 2025` "Festival-Saison" · Süddeutschland · Demnächst
  - `TBA 2025` "Club-Tour" · DE / AT · Demnächst
  - `TBA 2025` "Privat- & Firmenevents" · Anfrage · Booking offen
  - The year "2025" is stale.
- EN placeholders: New dates in preparation / Festival season / Club tour / Private & corporate events · Germany / Southern Germany / DE / AT / On request · Soon×3 / Booking open.
- TR placeholders: Yeni tarihler hazırlanıyor / Festival sezonu / Kulüp turnesi / Özel & kurumsal etkinlikler · Almanya / Güney Almanya / DE / AT / Talep üzerine · Yakında×3 / Booking açık.
- Kicker `Termine` / `Shows` / `Tarihler`. Link `Alle Termine ansehen →` / `All shows →` / `Tüm tarihler →`.
- Rule: **never invent dates**. Every event in the handoff, the DEMO and the OLD repo is fake. That includes "Zorlu PSM", "Jolly Joker", "Kulturfabrik Esch", "Knust Hamburg", "Sudhaus", "Waldmusikfest Walddorfhäslach" and others.
  - Possible exception: "Waldmusikfest Walddorfhäslach – Vorband – 19:00" appears in every DEMO version. Ask the owner whether it is real.

### 3.7 Contact and links

- **Email: `booking@typhoon.band` only.** Phone: **`+49 176 64472296`**.
- Server mail: to `booking@typhoon.band`, from `website@typhoon.band`, recommended display form "Typhoon Website <website@typhoon.band>", with reply-to set to the requester.
- Booking promise:
  - DE: `Anfragen gehen direkt an booking@typhoon.band. Antwort innerhalb von 48 Stunden.`
  - EN: `Requests go straight to booking@typhoon.band. Reply within 48 hours.`
  - TR: `Talepler doğrudan booking@typhoon.band adresine ulaşır. Yanıt 48 saat içinde.`
- Booking messages (DE): submit `Booking anfragen`; `Wird gesendet…`; `Bitte fülle alle Pflichtfelder aus.`; ok `Danke für deine Anfrage. Wir melden uns so schnell wie möglich.`; fallback `Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden.`; error `Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.`
  - EN/TR equivalents are in `src/i18n/dictionaries.ts` (`booking.*`).
- Social and platform URLs: **none exist anywhere** in the repos. All `site.social.*` values are `""`. Whether `platform_links` has rows in prod is unknown (§9).
  - Platforms prepared: Spotify, YouTube, Instagram, Facebook, SoundCloud, Bandcamp.
- **Never use**: `info@typhoon.band` (does not exist), `info@/booking@typhoonband.com`, `booking@typhoon-band.com`, `booking@typhoon-band.de`, `booking@example.com`, `+90 532 123 45 67`, "Istanbul, Türkiye", an AGB link, "© 2024".

### 3.8 Legal data (live render, DE)

- Operator (Impressum):
  ```
  Mika Hertler
  Am Schwarzen Steg 5a
  95448 Bayreuth
  Deutschland
  ```
  Contact: booking@typhoon.band · +49 176 64472296.
- Live imprint sections:
  - "Angaben gemäß § 5 TMG"
  - "Kontakt"
  - "Verantwortlich für den Inhalt": "Verantwortlich nach § 55 Abs. 2 RStV: Mika Hertler, Am Schwarzen Steg 5a, 95448 Bayreuth, Deutschland."
  - "Haftung für Inhalte": "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG … Nach §§ 8 bis 10 TMG …"
  - "Streitbeilegung": "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
- Live privacy sections:
  - Intro: DSGVO, BDSG.
  - Verantwortlicher.
  - Booking-Anfragen: fields listed; legal basis Art. 6 Abs. 1 lit. b; "Die Daten werden nicht an Dritte weitergegeben."
  - Hosting: Vercel, AV contract under Art. 28.
  - Externe Plattformen: links only.
  - Eure Rechte, exercised via booking@.
- Live cookies sections:
  - Only technically necessary cookies.
  - "Technisch notwendige Cookies": Art. 6 Abs. 1 lit. f.
  - Optionale Embeds: a banner will appear first.
  - Cookie-Banner: stored in localStorage.
- Full live texts: `scratchpad/recon/live/de-legal-{imprint,privacy,cookies}-text.txt` and `en-legal-imprint-text.txt`. EN and TR are equivalent JSX in `src/app/[locale]/legal/*`.
- **Required corrections.** Present these to the owner as a draft; this is not legal advice.
  - TMG → **§ 5 DDG**; RStV → **§ 18 Abs. 2 MStV**; §§ 7–10 TMG → DDG.
  - Remove or update the ODR sentence. The EU ODR platform was discontinued on 2025-07-20.
  - Name the processors: **Supabase** (DB for booking requests, storage, and MP3/image delivery that loads directly from `*.supabase.co`) and **Resend** (booking mail, US third-country transfer). Include retention periods and the Art. 77 right to complain to a supervisory authority.
  - Drop "nicht an Dritte weitergegeben".
  - Drop the "INITIALER STAND — WIRD LAUFEND ERGÄNZT." note.

### 3.9 Other UI strings

The full per-locale strings are in `src/i18n/dictionaries.ts`.

- Nav:
  - DE: Home/Band/Music/Termine/Media/Booking/Kontakt
  - EN: Home/Band/Music/Shows/Media/Booking/Contact
  - TR: Ana Sayfa/Grup/Müzik/Tarihler/Medya/Booking/İletişim
- Footer headings:
  - DE: Kontakt/Folge uns/Legal/Impressum/Datenschutz/Cookies
  - EN: Contact/Follow us/Legal/Imprint/Privacy/Cookies
  - TR: İletişim/Bizi takip edin/Hukuki/Künye/Gizlilik/Çerezler
- Copyright: `© {year} Typhoon. Alle Rechte vorbehalten.` / `All rights reserved.` / `Tüm hakları saklıdır.`
- Cookie banner:
  - DE: title `Cookies & Privatsphäre`, body `Diese Website verwendet nur technisch notwendige Cookies. Es findet kein Tracking statt.`, buttons `Verstanden`/`Nicht jetzt`.
  - EN: `Cookies & privacy` … `Got it`/`Not now`.
  - TR: `Çerezler & gizlilik` … `Anladım`/`Şimdi değil`.
- Player labels:
  - DE: Abspielen/Pause/Vorheriger Track/Nächster Track/Lauter/Leiser/Stumm/Ton an.
  - EN: Play/Pause/Previous track/Next track/Volume up/Volume down/Mute/Unmute.
  - TR: Oynat/Duraklat/Önceki parça/Sonraki parça/Sesi aç/Sesi kıs/Sessize al/Sesi aç.
- Media labels:
  - DE: Bild öffnen/Schließen/Zurück/Weiter.
  - EN: Open image/Close/Previous/Next.
  - TR: Görseli aç/Kapat/Önceki/Sonraki.
- Title tag, live on every locale: `Typhoon — Funk · Soul · Jazz · Bluesrock`. Meta description (German on every locale): `Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.`

### 3.10 Contradictions and resolutions

| # | Topic | Sources in conflict | Winner / action |
|---|---|---|---|
| C1 | Member 8 | Repo, docs/03 and CLAUDE rules: "Jürgen – Gitarre". **Live DB**, slot `jurgen`: "**Tan – Percussion**", photo uploaded 2026-06-11 | **Live (Tan – Percussion)**. It is the owner's latest action. Keep the slug `jurgen` for data compatibility. Ask the owner whether to update the fallback and docs to Tan. Until then the static fallback must not contradict silently: either render Supabase only, or change the fallback after confirmation |
| C2 | Mika's display name | Repo "Mika" vs live "Mika El Jackson" | Live |
| C3 | Member bios | Live DB bios have typos ("Frontman -", "Posaunen Sound", "frecher live Charakter", missing final periods) vs the polished repo bios | Render live. Offer the owner the corrected text so he can apply it in admin. Never rewrite DB content silently |
| C4 | Song titles and order | Live: Sen-Benim, Karanfil, Farksilin, Cilgin, Bir tek sen, gece yine dustun. Repo: Sen Benim, Karanfil, Gece Yine Düştün, Farksilin, Çılgın, Bir Tek Sen. docs/03: "Karanfill" | Order: **live**. Spelling: **Karanfil** (one "l") everywhere. Diacritics: render live titles, but recommend the owner fix them to **Çılgın / Bir Tek Sen / Gece Yine Düştün** in admin. Option: a display-title normaliser keyed by slug, with owner approval |
| C5 | Contact email | docs/03, docs/10, OLD content-facts and the `typhoon-band-repo.md` recon all say info@ is canonical | **booking@ only.** The owner's v6 decision was "info@typhoon.band gibt es nicht". `site.ts` has the same comment. The recon's claim is **wrong** |
| C6 | Gallery | Repo: 8 local images. Live: 9 Supabase images | Live (see §4.2) |
| C7 | Member photos | Repo: 251–376 px PNG crops mislabelled `.jpeg`. Live: **hi-res sepia portraits** | Live. `live-capture.md` said "359 px originals"; that is **wrong**. The originals are 1122×1402 or 1254×1254, and Mika's is 3024×4032 |
| C8 | Hero CTAs | Handoff "Listen now / Book now" vs dictionary "Songs anhören / Booking Anfrage", with docs/03 adding "Live erleben" | Dictionary. "Live erleben" → `#shows` becomes sensible once real shows exist |
| C9 | Home `<title>` | Live "Typhoon — Funk · Soul · Jazz · Bluesrock" vs P06 fallback "Typhoon — BLUESROCK • FUNK • …" | Keep the live title. Localise the description |
| C10 | Font claim | `public-frontend.md`: "Inter probably not applied" | **Wrong.** next/font registers the family literally as `Inter` (`@font-face{font-family:Inter…}` in `main.css`), and live reports "Inter 400 loaded". The display face really is Georgia, a system font |
| C11 | site_settings keys | docs: `hero_image_url`, `bandinfo_image_url`, `hero_signature_url` | Code wins: keys `hero_image`, `hero_signature`, `bandinfo_image`, each holding `{"url": …}` |
| C12 | Legal-page header links | `live-capture.md`: "not verified" | Verified in code: `Header.tsx` `linkFor` → `/${locale}#x` when not on home |
| C13 | Canonical host | `.env.example` `NEXT_PUBLIC_SITE_URL=https://typhoon.band`; Vercel redirects the apex → **www** | Use `https://www.typhoon.band` as the canonical host, or flip the redirect. It must be consistent in metadataBase, sitemap and OG. The prod value of the env var is unknown |
| C14 | Nav anchors | Handoff `#musik #kontakt #news` vs docs/02 and live `#music #contact`, no news | Live anchors |
| C15 | Legal links | Handoff Impressum/Datenschutz/**AGB** | Impressum/Datenschutz/**Cookies**. Never AGB |
| C16 | Member count | Handoff shows 7 | Exactly 8 |
| C17 | Hero lede | Handoff "…türkischen Funk & Soul…" and OLD x01JL "die türkisch-funk & soul Band…" | docs/03 and the dictionary text |
| C18 | Design radius tokens | Handoff 8px card / 7px button; live 10px card / pill buttons (the owner approved pills in v5); OLD 18–28px | Pill buttons were approved in v5. Card radius is free to re-choose, but keep it consistent |

---

## 4. ASSETS

### 4.1 In the LIVE repo `public/` (bundled fallback; usable)

| Path | Dimensions / size | Content / purpose |
|---|---|---|
| `/assets/hero/hero-collage.jpeg` | 1254×1254, 456 KB | **The key brand image.** A sepia composite of all 8 original members. The singer (white V-neck, sunglasses, mic) stands front and centre in near-colour. It has aged-paper bands at the top and bottom edges, and no logo. Used as the hero and as the default song cover. It is identical to live gallery "Bandcover 2" and to OLD `typhoon-band-hero-new` |
| `/assets/hero/singer-stage.jpeg` | 1391×956, 234 KB | A colour live shot of Typhoon singing (white tee, sunglasses, red and black festival banner). Byte-identical to `gallery-5.jpg` |
| `/assets/branding/typhoon-signature-gold.png` | 2099×724 RGBA, 331 KB | The handwritten "Typhoon" script in a champagne→antique gold gradient with a long underline stroke. The hero overlay. Must never get a sepia filter |
| `/assets/branding/typhoon-signature-gold-bold.png` | 2099×724 RGBA, 282 KB | A bolder variant used in the header and drawer |
| `/assets/band-cards/typhoon-band-card.jpg` | 1440×929, 238 KB | Typhoon singing at a red Nord keyboard. Same image as live gallery "Typhoon playing Keyboard and singing" |
| `/assets/band-cards/mika-band-card.jpg` | 3024×4032, 1.57 MB | Mika's fisheye festival selfie in colour (headband, trombone). It does not fit the sepia portrait set |
| `/assets/gallery/gallery-1.jpg` | 1440×1393 | Rehearsal room, Nord keyboards and a Hammond |
| `/assets/gallery/gallery-2.jpg` | 2016×1512 | Wide rehearsal room: drums, Persian rugs |
| `/assets/gallery/gallery-3.jpg` | 2048×2048, 495 KB | **Poster:** the sepia collage with the gold "Typhoon" logo baked in. The live booking aside uses it. Same picture as DEMO `typhoon-band.jpg` (678 KB encode) |
| `/assets/gallery/gallery-4.jpg` | 1080×712 | Black-and-white Fender Strat on a Hammond B3 |
| `/assets/gallery/gallery-5.jpg` | 1391×956 | Typhoon live, in colour. The live About image |
| `/assets/gallery/gallery-6.jpg` | 1440×1019 | Wide rehearsal room with a bağlama/saz |
| `/assets/gallery/gallery-7.jpg` | 1077×787 | Near-duplicate of gallery-2. Not in the live Supabase gallery |
| `/assets/gallery/gallery-8.jpg` | 1438×1391 | Hammond B3 organ |
| `/assets/members/{typhoon-vocals,mika-trombone,schack-sax,hardy-trumpet,stefan-bass,tom-drums,bugra-guitar,jurgen-guitar}.jpeg` | **PNG RGBA** despite the extension; 251–376 px wide (e.g. typhoon 376×564, tom 351×351) | Low-resolution crops of the hero collage with neighbours visible at the edges. **Deprecated.** Keep them only as a last-resort fallback, or replace them with mirrors of the live portraits (§4.2) |
| `/assets/audio/demos/{Sen-Benim,karanfil-demo,gece-yine-dustun-demo,farksilin-demo,cilgin-demo,bir-tek-sen-demo}.mp3` | 42.6 MB in total (sizes in §3.5) | Local fallback demos. Stream only |
| `/assets/{audio/demos,band-cards,gallery,reference}/README.md` | text | Asset-folder notes |
| (missing) | — | No favicon, icon, apple-icon, manifest, OG image, SVG logo or 404 art. They must be created |

### 4.2 LIVE Supabase Storage (only here; the best current assets)

Base URL: `https://furogcuvihbwhtmxgmfu.supabase.co/storage/v1/object/public/`

**Member portraits**, bucket `member-images`. I downloaded them to `scratchpad/recon/gap/m00–m07.jpg`; the contact sheet is `gap/sheet.png`.
- These are a **consistent set of high-quality sepia / aged-tintype stage portraits** (uploaded 2026-06-11). Mika's is the exception.
- **Mirror them into `public/assets/members/` as the new fallback**, with owner OK.

| slug | file | dimensions |
|---|---|---|
| typhoon | `member-images/2026-06-11-f74dd24c-…-acaf6182-6e36-4491-8682-2ae93747a87d.jpg` | 1122×1402 (portrait, mic) |
| mika | `member-images/2026-05-11-74f88f2a-…-ce4cf6e1-f589-420b-9776-96368717e75e.jpg` | 3024×4032, 2.06 MB (the colour fisheye selfie; the odd one out) |
| schack | `member-images/2026-06-11-159912c8-…-c31bf558-be33-4fea-9ffd-e075da6655d2.jpg` | 1122×1402 (baritone sax) |
| hardy | `member-images/2026-06-11-6f6a597f-…-d9cb4fc5-9c39-4d1f-8653-84fab5991cc7.jpg` | 1122×1402 (trumpet) |
| stefan | `member-images/2026-06-11-2b489987-…-03f8cc33-7ff2-4047-8b64-9a3d78fe40f2.jpg` | 1122×1402 (bass) |
| tom | `member-images/2026-06-11-26e2150f-…-86f37c6e-fc50-436e-8075-86d14728f9d3.jpg` | 1254×1254 (drum kit) |
| bugra | `member-images/2026-06-11-64a3bea7-…-70d425fb-111e-46ae-89aa-42962c1d21e4.jpg` | 1254×1254 (Strat, suit jacket) |
| jurgen → Tan | `member-images/2026-06-11-d0c252db-…-938e24b9-2a6b-4074-b408-11f54212da7e.jpg` | 1254×1254 (hat, sunglasses, cymbals/percussion) |

The full UUIDs are in `scratchpad/recon/live/de-ssr.html`.

**Gallery, 9 images** (bucket `gallery`, live order):

| # | alt (verbatim) | dimensions | local equivalent |
|---|---|---|---|
| 1 | Proberaum aus einem anderen Winkel | 1440×1019 | gallery-6 |
| 2 | Bandcover | 2048×2048 | gallery-3 (poster with logo) |
| 3 | Schwarz-weiß Bild von Oben einer Hammond Orgel mit E-Bass | 1080×712 | gallery-4 |
| 4 | Bild des Proberaums | 2016×1512 | gallery-2 |
| 5 | Typhoon playing Keyboard and singing | 1440×929 | band-cards/typhoon-band-card |
| 6 | Proberaum aus einem anderen Winkel (duplicate alt) | 1440×1393 | gallery-1 |
| 7 | Typhoon singing on a stage | 1391×956 | gallery-5 / singer-stage |
| 8 | Bild der Hammond Orgel | 1438×1391 | gallery-8 |
| 9 | Bandcover 2 | 1254×1254 | hero-collage |

- The alts mix German and English and are not localised.

**Audio:** the six files are listed in §3.5.

### 4.3 LIVE repo `handoff/` and `docs/` (reference only; never content)

- `handoff/desktop.html` (1440 px) and `mobile.html` (390 px): the approved Claude Design composition.
- `handoff/assets/typhoon-shared.css`: tokens.
- `handoff/assets/typhoon-app.js`, `typhoon-data.js`: **FAKE content. Never use.**
- `handoff/assets/typhoon-singer.jpeg` (733×471): actually the original concept mockup.
- `handoff/assets/trombone-{fan,festival}.jpeg`: identical to each other; the Mika selfie at 3024×4032.
- `handoff/assets/members/*`: the same low-resolution PNG crops.
- `docs/*.png`: 8 target and negative screenshots, mapped in `docs-handoff.md` §3.11. B37293F2 and B8CDF09E are the desktop targets. AA4180EB (demo list) and 7628D137 (band-info text box) are negatives.

### 4.4 Other repos

- **`typhoon-logo.svg`**: viewBox 970×451, 44 KB, 8 subpaths, a polyline trace (staircase edges show at large sizes), single fill `#efe2c3`. Located at OLD `public/assets/reference/typhoon-logo.svg` and DEMO root.
  - **Not in LIVE.** Use it for the favicon, a monochrome mask or `currentColor` fill, and a small header logo. Re-trace it as Béziers for large use.
- OLD `public/assets/reference/`: `typhoon-band-hero.jpg` (2048², the poster with the logo), `typhoon-band-hero-new` (no extension; the hero collage), `member-*` and `website-mockup.png` (all duplicates or mockups).
- OLD x01JL root: `DB2B0C88-280F-447A-9E41-D7C833977F75.png` (desktop mockup, 977×1610) and `CF4A20FB-8C94-45B1-A7C2-63EB9D7B5D4F.png` (mobile mockup, 941×1672). **Layout reference only; their content is fake.**
- DEMO: `typhoon-band.jpg` (2048², md5 0bf69125…, the same file as live "Bandcover") and duplicate `.mp3.mp3` junk.
- `scratchpad/recon/Typhoon-info.docx`: the original bio with the extra credits in §3.4.

---

## 5. DATA / API CONTRACTS

### 5.1 Content layer

Source: `src/lib/content/index.ts`, `import "server-only"`. It uses the anon client and RLS; every loader is wrapped in `safe()` and never throws.

```ts
getSiteSettings(): Promise<SiteSettings>                    // site_settings is_public; keys brand{name,tagline,genreLine}, contact{booking,phone}
getHeroContent(locale: Locale): Promise<HeroContent>        // text=dictionary; imageUrl/signatureUrl ← site_settings hero_image/hero_signature .url
getBandInfo(locale: Locale): Promise<BandInfo>              // text=dictionary; imageUrl ← site_settings bandinfo_image .url
getMembers(locale: Locale): Promise<Member[]>               // per-slug MERGE with 8 fallbacks
getSongs(_locale: Locale): Promise<SongItem[]>              // visible && streamable, sort_order; ANY rows ⇒ fallback REPLACED
getGalleryItems(locale: Locale): Promise<GalleryItem[]>     // media_items visible, type=image (no category filter)
getShows(locale: Locale): Promise<ShowItem[]>               // visible && published; order starts_at asc nulls last, then sort_order
getLegalPage(type: LegalPageType, locale): Promise<LegalPage>      // unused on main, used by P06
getPlatformLinks(): Promise<PlatformLink[]>                 // is_active, sort_order; unused on main, footer in P06
getSeoEntry(path: string, locale): Promise<SeoEntry>        // unused on main, generateMetadata in P06
getPublicPageContent(locale): Promise<PublicPageContent>    // Promise.all of the loaders except legal/seo
```

Types (`src/lib/content/types.ts`):

```ts
type SiteSettings = { brandName; tagline; genreLine; contactBookingEmail; contactPhone; bookingDisabledNotice: string };
type HeroContent  = { line1; line2; line3; description; ctaListen; ctaBook; imageUrl; signatureUrl: string };
type BandInfo     = { eyebrow; headline; body; cta; ctaBook; imageUrl: string };
type Member       = { id /*slug*/; name; role; bio; photoUrl: string; isPlaceholder: boolean; sortOrder: number };
type SongItem     = { id /*slug*/; title; audioUrl: string; coverImageUrl: string|null; isFeatured: boolean; sortOrder: number };
type GalleryItem  = { id; src; alt: string; thumbnailUrl: string|null; sortOrder: number };
type ShowItem     = { id; title /*venue*/; region /*"city, country"*/; time /*de-DE label or TBA*/; startsAt: string|null; ticketUrl: string|null; sortOrder: number };
type LegalPageType = "imprint"|"privacy"|"cookies";
type LegalPage    = { slug: LegalPageType; title; bodyMd: string; draftNote: string|null };
type PlatformLink = { id; platform; url: string; sortOrder: number };
type SeoEntry     = { path; title; description: string; ogImageUrl: string|null };
type PublicPageContent = { locale; siteSettings; hero; bandInfo; members; songs; gallery; shows; platformLinks };
```

Recommended **additive** extensions. They change nothing for existing callers.
- `ShowItem`: add `isTba`, `eventType`, `city`, `country`, and ISO `startsAt` (not `""`).
- `SongItem`: add `durationSec`, via a new nullable column or `site_settings`; the client may fill it in on first play.
- `GalleryItem`: add `title`.
- `Member`: add `slug` and `sortOrder`.

Fetchers (`src/lib/content/supabase-content.ts`): `fetchSiteSettings`, `fetchHero` (**always null**), `fetchBandInfo` (**always null**), `fetchMembers`, `fetchSongs`, `fetchGallery`, `fetchShows`, `fetchLegalPage`, `fetchPlatformLinks`, `fetchSeoEntry`. They return `null` for "no answer" and `[]` for "authoritative empty".

Fallbacks: `src/lib/content/fallback.ts` + `src/data/{site,members,songs,shows}.ts` + the dictionaries.

### 5.2 HTTP endpoints

- `POST /api/booking` (JSON). Request: `{ name, email, phone?, event_date? (YYYY-MM-DD), event_location, event_type, message, hp_field?, locale? }`. Responses:
  - `{ok:true,status:"sent"|"fallback",message}` with 200
  - `{ok:false,status:"validation",field,message}` with 400
  - `{ok:false,status:"error",message}` with 502
- `POST /api/admin/auth/logout?locale=` → 303 redirect.
- Server actions under `src/app/[locale]/admin/**/actions.ts`:
  - login, changePassword
  - booking: status, archive, restore, convert
  - shows: create, update, delete, toggle
  - media: upload, update, delete
  - songs: create, update, delete
  - members: save
  - site assets: save, clear
  - `prepareDirectUpload`

### 5.3 DB tables

Schema `public`, final shape as of main; full column lists are in `backend-admin.md` §1.

`admin_profiles`, `site_settings` (PK is `key` only, which blocks per-locale rows), `platform_links`, `legal_pages` + `legal_page_translations`, `band_members` + `band_member_translations`, `songs` (status demo|single|album_track|unreleased; is_streamable, is_downloadable, is_featured, sort_order, is_visible), `shows` (starts_at nullable, is_tba, venue, city, country, ticket_url, event_type, is_visible, is_published, sort_order, source_booking_request_id) + `show_translations(notes)` (unused), `booking_requests` (status new|read|answered|accepted|converted|rejected|archived|spam; ip_hash (never written), user_agent, locale, converted_show_id, converted_at, deleted_at), `media_items` (type image|video, file_url, thumbnail_url, category, alt_text, title, sort_order, is_visible), `seo_entries(path,locale unique)`, `consent_settings`.

- Functions: `set_updated_at()`, `is_active_admin()` and `is_owner()` (not SECURITY DEFINER).
- Buckets: `public-media`, `audio-demos`, `member-images`, `gallery`, `legal-assets`. All are public. **anon can list them.**
- Upload targets: `gallery`→gallery; `song-audio`→audio-demos; `song-cover`→public-media/covers; `member-photo`→member-images; `site-hero-image|site-hero-signature|site-bandinfo-image`→public-media/site/<key>.
- Object key format: `<prefix/>yyyy-mm-dd-<slug≤60>-<uuid>.<ext>`.

### 5.4 Environment variables

All 7 are set in Vercel for production and preview.

| var | exposure | default / purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | project URL (ref `furogcuvihbwhtmxgmfu`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public (RLS-bound) | server content reads, SSR auth, browser `uploadToSignedUrl` |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | admin data layer, booking insert, signed uploads |
| `RESEND_API_KEY` | **server-only** | booking mail |
| `BOOKING_EMAIL` | server | `booking@typhoon.band` |
| `WEBSITE_FROM_EMAIL` | server | `website@typhoon.band` (must be a Resend-verified domain) |
| `NEXT_PUBLIC_SITE_URL` | public | metadataBase; `.env.example` says `https://typhoon.band`; see C13 |

### 5.5 Client storage contracts

- Current consent: `localStorage["typhoon.cookie-consent"] = "accepted"|"declined"`.
- P06 consent: `localStorage["typhoon.consent.v1"] = {v:1,necessary:true,external_media:boolean,decided_at}`, plus the window events `typhoon:consent-changed` and `typhoon:open-consent`.

### 5.6 Design tokens

Live `src/app/globals.css`, ported from `handoff/assets/typhoon-shared.css`:

```
--bg #030201 --bg-2 #060403 --bg-3 #100a06 --panel #0b0805 --panel-strong rgba(11,8,5,.94)
--bronze #6f4a1f --deep-gold #b8873b --gold #c79a4b --gold-soft #e8c982
--cream #f2e6cf --muted-cream #c9bda5 --muted #b9aa90
--line rgba(232,201,130,.22) --line-strong rgba(232,201,130,.42)
```

- Grain: an SVG feTurbulence overlay at opacity .05–.06 with `mix-blend-mode: overlay`.
- Image filter: `sepia(.32–.4) saturate(.78–.85) contrast(1.05–1.08)`, with `brightness(.78)` on the hero.
- Z-order rule: hero image → vignette → copy → player → **signature above the player** → header. The open mobile menu must cover the signature.

---

## 6. OWNER TASTE (what he wants and what he has repeatedly rejected)

**Current request (2026-09-25, overrides the old "frontend frozen" rule):**
> "Erstelle anschließend in einem unabhängigen branch eine komplett neue viel bessere und geilere und passendere Website für die Band typhoon. Es müssen mind. alle aktuellen Funktionen enthalten oder besser umgesetzt werden."

**Brand brief** (OLD `CLAUDE.md`, durable):
> premium cinematic band website: dark black / dark brown base; warm sepia atmosphere; elegant real gold, not yellow; smoky concert-poster look; modern smooth UI; large dramatic hero image; handwritten Typhoon logo as an overlay layer above the hero image; music, live energy, bluesrock/funk/soul atmosphere; raw but elegant.
> Avoid: generic card website; harsh yellow; flat orange; sharp rectangular boxes everywhere; cheap grunge overload; Impact-like cheap typography; unnecessary UI libraries; Bootstrap / Material UI / shadcn.
> The logo is the decorative script element. Do not fake this with a cheap display font.

**Goals** (LIVE docs):
- "Booking is the most important production function."
- "The onepager must not become exhausting. Use compact/reveal behavior: Band intro short first, longer text behind 'Mehr über Typhoon'; Members: preview first 4, reveal all 8; Demos: featured + first 3, reveal all 6; Shows: compact TBA/upcoming module; Booking/contact visible directly."
- "Final player goal: Looks like Claude Design. Behaves like old Claude branch."
- "Public site must stay online if Supabase/Resend env vars are missing."
- "Preferred: no analytics; no tracking pixels; no external embeds; no external fonts; local audio; local images."
- "do not show ugly placeholder badges"; "do not invent wrong member photos".
- "Do not create generic cards/buttons." "Do not reinterpret the design into a generic band website." "Gold must be antique/champagne, not yellow."

**Repeated complaints, by recurring theme** (quotes from the deleted fix docs v5/v6/docs14 and from commits):
1. **Mobile broken:**
   - "Aktuell ist Mobile komplett verschoben."
   - "keine verschobenen, abgeschnittenen oder zufällig gestapelten Elemente"
   - "Mobile muss wie eine hochwertige, kompakte Version der Desktop-Seite aussehen, nicht wie ein anderes Layout."
   - "Demo rows overflow to the right."
2. **Hero:**
   - "Hero must not be one blended background blob … separate visual blocks: text, image, signature."
   - "linke Rand des Hero-Bildes vom schwarzen Hintergrund/Overlay überdeckt. Das Bild muss aber vollständig sichtbar sein … Keine harte vertikale Kante."
   - "Keine harte untere Bildkante."
   - He wants the **whole collage visible**.
3. **Signature placement:**
   - "The signature must be positioned exactly like Claude Design, not freely placed."
   - "ca. 5 mm nach unten, ca. 2 cm nach links"
   - "nicht über dem Textblock"
   - It should "gerade so unten aus dem Bild herausragen".
   - It must be hidden by the open mobile menu.
4. **Cheap UI:**
   - Player: "zu billig, zu leer, schlechte Button-Optik, Waveform zu klein/isoliert, Layout wirkt wie Liste, nicht wie Premium-Audio-Modul"
   - "Der Player muss hochwertig, modern und musikalisch wirken."
   - Buttons: "Buttons wirken noch altbacken … keine billigen Verläufe, keine harten Schatten, kein Plastik-Look, keine altmodischen dicken Rahmen, subtiler Gold-/Champagne-Look, klare Hover-/Active-States, moderne Icons, konsistente Höhe, Radius und Innenabstände."
   - The waveform must "über die ganze freie Breite" rendern.
5. **Dead controls:**
   - "Vor, Zurück, Lautstärke, Drei Punkte [haben] noch keine Funktion"
   - "Media-Inhalte öffnen aktuell in neuem Tab"
   - Rule that follows: every visible control must work, or be removed (the ⋯ menu was dropped).
6. **Wrong content:**
   - "info@typhoon.band gibt es nicht."
   - Taifun, Daniel and Jürgen-as-sax are banned.
   - "Do not create fake real dates."
   - "EN und TR Routen existieren, aber Inhalte sind nicht wirklich übersetzt."
7. **Booking image and button:**
   - The image is "links und rechts abgeschnitten. Der Button sitzt nicht korrekt."
   - "das Datum-Feld ragt … zu weit heraus"
   - He wants the band-with-signature image fully visible.
8. **Band info and cards:**
   - "zu großflächige Textbox … Bild fehlt" → he wants an editorial image + text split.
   - Member cards: "nur Bild, Name, Instrument … zu wenig hochwertiger Card-Charakter" → he wants cards with bios.
9. **Legal:** must "match website style; not look like plain unstyled placeholders".
10. **Cookies:** "Cookies sind bisher nur Legal Page, aber kein Banner mit Bestätigung".
11. **Admin UX:**
    - "clear German errors … no generic client-side exception", with the allowed formats and max size shown at every input.
    - One Supabase member must not hide the others.
    - Checkboxes must persist.

**What he approved and liked:**
- The dark, sepia, gold atmosphere.
- The serif hero "Smooth. / Exzeptionell. / Funk." with "Funk." in gold.
- The gold signature overlapping the player.
- The 2-row featured player with a round gold play button.
- Termine directly under the player.
- The editorial band-info split.
- Member cards with bios.
- The in-site lightbox.
- A real consent banner.
- A small, understated DE/EN/TR switch.
- Pill buttons, single-colour gold (v5).

**Tension to resolve:**
- The owner's `band-info-example` screenshot uses Impact-like condensed caps, but the brief bans them. Use a high-quality display serif, self-hosted.
- The handoff's 7–9 px mobile type and 7-across member grid are illegible. Improve them, but keep mobile a "compact version of desktop".

---

## 7. PROBLEMS IN THE CURRENT LIVE SITE (ranked)

Severity: S1 = broken / risky, S2 = major quality issue, S3 = polish.

1. **S1 Audio: ghost and double playback on locale switch.** *Verified live today with an instrumented `Audio` constructor (`scratchpad/recon/gap/ghost.js`).*
   - Play on `/de`, then switch to EN: the old element keeps playing (t 2.5 s → 6.1 s) with no UI.
   - Press play on `/en`: a **second** `Audio` starts the same song, so two streams overlap.
   - Cause: the provider sits under the `[locale]` layout, which remounts on a locale change, and it has no unmount cleanup.
   - This breaks the "one song at a time" rule.
2. **S1 Fixed header is fully transparent at every scroll position.** Nav and logo collide with section content on desktop and mobile. There is no `scroll-margin-top`, so anchors land under the header.
3. **S1 i18n / SEO correctness.**
   - `<html lang="de">` is served on `/en` and `/tr`.
   - The title and meta description are German on every locale.
   - The Turkish uppercase is wrong: "MÜZIK", "GIZLILIK", "GITAR" should be MÜZİK, GİZLİLİK, GİTAR.
   - Several aria and alt strings are German-only.
   - The booking API messages are German only and override the EN/TR dictionaries.
4. **S1 Dead or fake UI.**
   - The footer social icons are all `href="#"`.
   - "Alle Termine ansehen" points to `#booking`.
   - The shows are stale "TBA 2025" placeholders.
   - The phone number is not a `tel:` link.
5. **S1 Booking.**
   - The submit button is physically detached from the form, inside the image card.
   - The fields have placeholders only, no labels.
   - There are no per-field errors.
   - There is no privacy notice at the form.
   - There is **no rate limit, CAPTCHA or Origin check**, and `ip_hash` is never written.
   - A failure of a single channel is silent: nothing is logged, and the user sees success.
6. **S1 Legal.**
   - The pages cite outdated law (TMG/RStV) and the discontinued EU ODR platform.
   - The privacy page omits Supabase (which also gets the visitor's IP through 6 MP3 range requests on page load) and Resend.
   - The claim "nicht an Dritte" is false.
   - The "INITIALER STAND" note is visible.
7. **S1 Security and admin.**
   - The `editor` role has the same power as `owner`.
   - anon can **list all storage buckets**, so hidden and deleted MP3s can be enumerated. Tested in the recon's local replica of the policies.
   - Show publish/visibility checkboxes cannot be switched off.
   - There is no `@supabase/ssr` middleware, so session refresh is likely to fail (logouts after about 1 h).
   - Deletes leave orphaned files in storage.
   - Booking PII has no hard delete.
   - The admin login publicly shows "Owner richten neue Accounts über die Supabase-Konsole + admin_profiles ein. Siehe docs/admin-setup.md."
   - Admin pages render inside the public chrome (header, footer, cookie banner).
8. **S2 Missing launch basics.**
   - Favicon and icons return 404; this is the only console error.
   - No OG or Twitter tags, OG image, canonical, hreflang, sitemap, robots or JSON-LD.
   - Unknown routes get the white default Next 404.
   - Only HSTS is set; there is no CSP, XFO, nosniff, Referrer-Policy or Permissions-Policy.
   - No `noindex` on `/admin`.
9. **S2 Performance.**
   - The home page is `force-dynamic` with `no-store`, making about 10 Supabase queries per request. One cold TTFB measured 5.8 s.
   - **All 6 MP3s are range-fetched on load** (0.4–0.57 MB) just to show durations.
   - Both hero variants are marked `priority`.
   - The signature PNG is served at w=3840, 97 KB, for a 715 px slot.
   - A full-viewport blend-mode noise layer plus `background-attachment: fixed` hurts scrolling.
   - `timeupdate` re-renders every consumer about 4 times per second.
   - Every section is a client component, so all 3 dictionaries ship to the browser.
10. **S2 Player UX.**
    - The featured card does not follow the track playing in the list.
    - There is no persistent or sticky mini-player; audio keeps playing on legal pages with no controls.
    - No Media Session, so there are no lock-screen controls.
    - Seek works only on the current track and is mouse-only (no slider role).
    - The waveform fills about 35% of a desktop row and about 65% on mobile.
    - All 6 covers are the same collage.
    - A mute button on each row mutes everything.
    - The mobile player has no prev button.
    - Every control is duplicated in hidden mobile/desktop variants: 15 play buttons for 7 visible.
    - No error state for a 404 or decode error.
    - The iOS volume slider does nothing.
11. **S2 Shows logic.**
    - Admin TBA shows never render.
    - There is no past/upcoming split.
    - Dates are always de-DE and printed twice.
    - Desktop is capped at 4 cards.
    - The admin stores local time as UTC.
12. **S2 Visual.**
    - The hero collage is a hard-edged rectangle with visible seams at the left and bottom. The signature crosses the player's border and divider.
    - The display face is Georgia, a system font; numerals use system monospace.
    - Type is tiny: 8–11 px kickers, a 9 px role line.
    - Spacing is cramped (28 px between sections).
    - "Cards on black" everywhere.
    - The About photo is saturated colour, clashing with the sepia world.
    - The 9th gallery image sits orphaned on its own row (8-column grid, and 4+4+1 on mobile).
    - The gallery images are re-used in About and Booking.
    - Mika's colour fisheye selfie breaks the sepia portrait set.
13. **S2 Consent.**
    - The banner gates nothing, cannot be reopened, and covers 22% of the mobile viewport.
    - It renders **above the open mobile menu**.
    - It is a "dialog" without focus management.
14. **S2 A11y.**
    - No skip link and no `prefers-reduced-motion` handling.
    - The drawer's links stay focusable while it is hidden.
    - No focus trap or focus return in the drawer and the lightbox.
    - Broken heading outline: h1 → h3 and span kickers.
    - Tap targets under 40 px: language pills 38×23, mobile play buttons 30×30, social icons 32×32.
    - The volume slider is labelled "Lauter".
15. **S3 Data hygiene.**
    - Adding one Supabase song replaces all fallback songs, whereas members merge.
    - Restoring an archived booking keeps `status='archived'`.
    - The `site_settings` PK blocks per-locale rows.
    - The README apply list is missing `policies/0006_phase05_member_full_read.sql`.
    - Several helpers are dead code (§ reports).
    - Stale Vercel projects `typhoon-band-test` (wrong members) and `typhoon-band` still exist.

---

## 8. OPPORTUNITIES (concrete, for a much better site)

**Architecture and platform**
1. Move the audio provider **above** the `[locale]` segment: a root-level client provider, or `src/app/layout.tsx` with a locale-agnostic wrapper. Add unmount cleanup. This fixes #1 and enables a **persistent player dock** that survives locale changes and legal pages.
2. Render sections as server components with only small client islands. Pass each client island only the strings it needs.
3. Use ISR or `revalidate` together with `revalidatePath` / `revalidateTag` from the admin save actions, instead of `force-dynamic`. Target TTFB under 200 ms.
4. Add `middleware.ts` for:
   - `@supabase/ssr` `updateSession` on `/admin`
   - an optional Accept-Language redirect on `/`
   - security headers (CSP allowing only `self` and `*.supabase.co`, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors none)
5. Give the admin its own layout without the public chrome (`src/app/[locale]/admin/layout.tsx` → a standalone shell), plus `noindex`. Enforce roles, fix the checkbox bugs, delete storage objects together with their rows, add a hard delete for bookings, and fix restore.
6. Booking hardening:
   - A rate limit, e.g. a per-IP-hash sliding window in a Supabase table, or Vercel KV/Upstash if the owner approves a dependency.
   - An Origin check and a strict JSON content-type.
   - Populate `ip_hash` as a salted SHA-256.
   - Report truthfully and log channel failures.
   - Localise server messages by error code.
   - An optional auto-reply to the requester (owner opt-in).
7. SEO:
   - `generateMetadata` per locale and page (use P06 `getSeoEntry`).
   - `alternates` with canonical and hreflang de/en/tr/x-default.
   - `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` (the collage plus the gold logo, 1200×630).
   - Icons generated from `typhoon-logo.svg`, and `themeColor #030201`.
   - JSON-LD `MusicGroup` (members, genre, `sameAs` = platform links) and `MusicEvent` per real show.
   - Per-locale `<html lang>` via a root layout per locale, or a `[locale]` root layout.
8. Branded `not-found.tsx` and `error.tsx`, with the signature, "Zur Startseite", and optionally a demo to play.

**Design and UX** (keep the approved DNA, raise the craft)
9. A **cinematic hero** that shows the whole collage:
   - Full-bleed, with feathered edges on every side (no seams).
   - The copy on the left, the gold script bleeding from the image into the player, subtle parallax or grain, and a slow warm light sweep that is disabled under reduced motion.
   - Headline in a self-hosted premium display serif, e.g. Fraunces, Cormorant or Playfair-class; decide in the design pass. No Georgia and no Impact.
   - Pill CTAs in single-colour gold: Songs anhören, Booking Anfrage, and "Live erleben" once shows exist.
10. **Sticky player dock and redesigned player:**
    - The featured card is the hero module.
    - Once playback starts, a slim dock pinned to the bottom shows cover, title, prev/play/next, a **full-width live waveform used as an accessible slider** (`role=slider`, arrow keys), time and volume (volume hidden on iOS).
    - Media Session metadata with artwork.
    - Clicking any waveform starts that track at that position.
    - Durations come from data, not from 6 prefetches.
11. **Demos as a tracklist** ("featured + 3, reveal all 6"):
    - Wide rows with a waveform using the full free width, numbered, with per-song cover art. If there are no real covers, generate sepia crops of distinct gallery or portrait images per song, or gold typographic covers.
    - No per-row mute.
    - Turkish titles with correct diacritics (owner fixes them in admin).
12. **Members as a portrait wall** using the new hi-res sepia portraits:
    - Four visible, reveal eight.
    - Hover or tap flips to the bio, with a subtle gold rim light.
    - Grouped by section (Gesang · Bläser · Rhythmus · Gitarre/Percussion) to express "Acht Musiker, ein Sound".
    - Mika's photo needs a sepia treatment or a request for a matching portrait.
13. **Band story editorial:** image plus short copy, with "Mehr über Typhoon" revealing the canonical long bio. Add a **facts strip**: "8 Musiker · 3 Bläser · Kanzlei Studio Hechingen · Türkische Texte · 30+ Jahre Bühne" (owner confirms the numbers). Add a "Sound DNA" row (Groove, Riffs, Bläser, Southern) using DEMO-style copy after approval.
14. **Shows done right:**
    - Upcoming first, with a big "next show" highlight card.
    - Past shows collapsed; TBA rows supported.
    - Locale dates via `Intl`, Europe/Berlin.
    - A visible "Tickets" button when a ticket URL exists.
    - An honest empty state ("Neue Termine in Vorbereitung — jetzt buchen") instead of fake "TBA 2025" cards, with a CTA to booking.
15. **Gallery as a masonry or poster grid:**
    - No orphans.
    - A full-screen lightbox with swipe, focus trap, captions (localised alts), and preloading of neighbouring images.
    - Video support is ready behind `ExternalMediaGate` for when the owner adds YouTube.
16. **Booking as the conversion centrepiece:**
    - A two-column layout: the form with **visible labels**, the submit button inside the form, and inline validation.
    - `event_type` as chips: Festival / Club / Firmenevent / Privat / Sonstiges.
    - A privacy line with a link.
    - The poster image fully visible (`contain`, no crop).
    - A direct contact card with `mailto:`/`tel:` and the "Antwort innerhalb 48 h" promise.
    - A success state with a summary.
17. **Platform links everywhere, driven by the DB:** a "Listen on" strip in the hero or music section plus the footer. Hidden when empty. Widen the allowlist with Apple Music, TikTok, Deezer and Bandsintown.
18. **Consent v1 done properly:** a real modal with focus trap and Esc, a reopen link in the footer, layered below the menu (z-order), no banner until something actually needs consent (or a compact first-visit notice), and re-ask after 12 months.
19. **Header:** transparent over the hero, then a blurred dark scrim after scrolling. Scrollspy for the active section, nav order that matches page order, a compact locale switch, and a full-screen menu as a real dialog with the locale switch and contact. Proper Turkish casing (`lang="tr"` plus `text-transform`, or pre-cased strings).
20. **Typography and spacing system:** a fluid type scale with a 12 px minimum for labels and 15–17 px body text; generous section rhythm (96–160 px desktop); a consistent radius scale; tabular numerals from the brand fonts, not system monospace.
21. **Motion:** subtle scroll reveals, waveform idle breathing, and the gold light sweep, all gated behind `prefers-reduced-motion`. No heavy animation library (a CSS or IntersectionObserver approach suffices).
22. **Legal:** Supabase-first with the P06 editor, plus updated curated fallbacks (DDG/MStV, processors, retention, Art. 77), styled like the site, and no draft note.
23. **Admin polish and future modules** (docs/07): hero and band text per locale (needs a `site_settings` PK fix or a `hero_blocks` table), News ("Aus dem Proberaum", optional, never faked), Videos (consent-gated), and admin-user management. Keep the shop out of scope (phase 07 only prepares it).
24. **Asset upgrades:**
    - Mirror the live hi-res member portraits into `public/assets/members/` as fallbacks.
    - Re-trace `typhoon-logo.svg` for the favicon, OG image and mask logo.
    - Serve AVIF/WebP with correct `sizes`.
    - Optionally transcode the demos to smaller streaming bitrates. Keep the originals; they are never downloadable.
25. **Ops:** QA previews without real mail, because they share production Supabase and Resend. Options: a `BOOKING_DRY_RUN` env on preview, or a Resend test recipient. Retire `typhoon-band-test`. Add a CI lint and build check.

---

## 9. COMPLETENESS-CRITIC PASS

### 9.1 Gaps in the reports that I checked myself (results are folded into the sections above)

| Gap | Check | Result |
|---|---|---|
| Vercel verdict claims | `list_projects`, `list_deployments` (all and prod), `list_project_domains`, `get_project`, `filter_project_envs` (names only, not decrypted) | Confirmed `dpl_AchrnQssukAeurSjd17arPKkFore` = main@740ff46. The apex redirects to www. Node 24.x. SSO on previews. The phase-06 **preview** deployment exists. All 7 env vars are set for prod AND preview |
| Ghost playback (listed as "likely bug, verify") | Playwright against live with the `window.Audio` constructor wrapped | **Confirmed**, and worse than expected: two overlapping streams (§7 #1) |
| Inter font "probably not applied" | Inspected `main.css` and the live `document.fonts` | **False.** The `@font-face` family is literally `Inter`, and it is loaded. The display face is Georgia |
| Member photo quality ("359 px originals") | Downloaded all live Supabase images | **False.** The live originals are hi-res sepia portraits (1122×1402 / 1254×1254). This changes the design options for the members section |
| Gallery provenance | md5 and dimension match | 8 of the 9 live images correspond to local files; "Bandcover" is the DEMO 2048² poster; gallery-7 is not used live |
| Legal-page nav links | Read `Header.tsx` `linkFor` | Correct: `/${locale}#x` |
| site_settings keys (docs vs code) | grep | Code uses `hero_image` / `hero_signature` / `bandinfo_image` with `{url}` |
| Show checkbox bug, booking result logic | Read `validation/show.ts` and `api/booking/route.ts` | Both confirmed as described |
| Live song slugs | Parsed the SSR playlist | Slugs contain spaces and capitals; slugify before use |
| Horizontal overflow | Live analysis: `scrollW` = `vw` at 1440 and 390 | None at page level. `body` has `overflow-x` hidden, which masks the clipped mobile signature and the rail |
| Owner feedback outside the docs | GitHub PRs #1–#15 and issues | No issues. All 15 PRs are closed. The list API reports `merged:false` even though merge commits such as `740ff46` "Merge pull request #15" are on main, so treat that field as unreliable. Nothing new beyond the docs |
| Local in-flight branch | `git branch -vv` | Local unpushed `claude/typhoon-website-redesign-7xjozt` @ 5f8a5ab in `/home/user/typhoon-redesign`. Noted in §1 and not reviewed here |
| UI strings for EN/TR | Extracted from `dictionaries.ts` and the live text dumps | Folded into §3 |

### 9.2 Still unverified or unknown (owner or runtime access needed)

1. **Production Supabase state.** The Supabase MCP account can see only the "Buchhaltungstool" project, not `furogcuvihbwhtmxgmfu`, and no anon key is exposed publicly, so the DB could not be queried. Unknown:
   - whether `platform_links` has rows
   - whether migration 0006 (or anything beyond 0005) is applied
   - whether `legal_pages` or `seo_entries` have rows
   - whether any `shows` rows exist that are hidden or TBA
   - the CORS configuration of the buckets
   - Design rule: the code must degrade gracefully in every one of these cases.
2. **Resend domain verification and deliverability** for `website@typhoon.band`. I did not submit a booking, to avoid sending a real mail.
3. The prod value of `NEXT_PUBLIC_SITE_URL` (apex vs www). I did not decrypt it.
4. Owner decisions:
   - Tan (Percussion) vs Jürgen (Gitarre), and whether the fallback and docs should follow.
   - Mika's display name and photo.
   - Fixing the diacritics in the song titles.
   - Using the Hechingen / Kanzlei Studio / region / "30+ Jahre" facts publicly.
   - Using the docx credits.
   - Social platform URLs (none are known).
   - Real show dates, including whether "Waldmusikfest Walddorfhäslach" was real.
   - Retiring the stale Vercel projects.
   - A legal review of the updated imprint and privacy texts.
5. iOS Safari behaviour (volume, autoplay resume) and real mobile-network performance were not tested; Chromium only.
6. The admin UI after login was not exercised live (no credentials). Admin behaviour comes from reading the code plus the recon's PG16 replica test of the RLS policies.
