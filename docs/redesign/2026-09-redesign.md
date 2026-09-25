# Typhoon — Redesign 2026 (report)

Date: 2026-09-25 · Branch: `claude/typhoon-website-redesign-7xjozt`
(repo `MikaMcFlurry/typhoon.band-website`) · Production is unchanged until
this branch is merged into `main`.

## 1. Which version is live?

**Live = `MikaMcFlurry/typhoon.band-website`, branch `main`, commit
`740ff46`** ("Merge pull request #15 … band-member-placeholder-fix").

Evidence:

| Check | Result |
|---|---|
| Vercel project `typhoon-band-website` | production deployment `dpl_AchrnQssukAeurSjd17arPKkFore`, `READY`, built from `main@740ff46` (2026-06-17) |
| Domains on that project | `typhoon.band`, `www.typhoon.band` (+ vercel.app aliases) |
| `https://typhoon.band/` | 307 → `https://www.typhoon.band/` → `/de`, served by Vercel (`x-matched-path: /[locale]`) |
| Content | read at runtime from Supabase project `furogcuvihbwhtmxgmfu` (members, songs, gallery) |

Other repositories and branches:

| Repo / branch | Role |
|---|---|
| `typhoon.band-website` `main` (= this branch before the redesign) | **live** |
| `typhoon.band-website` `claude/phase-06-legal-seo-consent-platforms` | finished but never merged (legal/SEO/consent/platform links) → **merged into the redesign** |
| `typhoon.band` `main` / `claude-design` / `claude/typhoon-website-redesign-7xjozt` (identical, `5178116`) | older Next.js attempt; deployed only to Vercel project `typhoon-band-test` (not the domain) |
| `typhoon.band` `claude/typhoon-premium-redesign-x01JL` | source of the audio-player behaviour; owner-corrected band info (`docs/typhoon-info.md`) |
| `typhoon.band` `codex` | first scaffold (April 2026), outdated member data |
| `Typhoon-Demo` `main` (= its redesign branch) | static HTML prototype from March 2026, fictional dates and old line-up; ideas only |

Vercel project `typhoon-band` has only a canceled deployment.

## 2. What the owner asked for, and how it was interpreted

"Eine komplett neue, viel bessere, geilere und passendere Website für die
Band — mindestens alle aktuellen Funktionen, gerne besser umgesetzt."

- **Passender**: keeps what the owner explicitly approved in earlier rounds
  (dark sepia/gold, serif headline with gold "Funk.", gold signature over the
  collage, two-row player with round gold play button, shows under the
  player, editorial band split, cards with bios, lightbox, DE/EN/TR) and
  removes what was criticised again and again (cropped hero, hard overlay
  seams, tiny type, "billig/altbacken" buttons and player, list-like demos,
  placeholder badges, broken mobile, dead controls, fake data).
- **Komplett neu**: new design system (`docs/design/DESIGN.md`), new
  typography (Newsreader + Archivo, self-hosted), all public components
  rewritten, persistent player dock, new booking experience, new legal pages.
- **Mindestens alle Funktionen**: see the parity checklist below.

## 3. Feature parity (old live site → redesign)

| # | Function on the live site | Redesign |
|---|---|---|
| 1 | Locale routes `/de` `/en` `/tr`, `/` → `/de` | same routes; `/` picks the browser language; `<html lang>` now correct per locale |
| 2 | Header with anchor nav + language switch | nav in scroll order, scroll-spy, solid on scroll, Booking button, switch keeps path + section |
| 3 | Mobile drawer | full-screen sheet with focus trap, Esc, language switch and contact links |
| 4 | Hero: headline, text, 2 CTAs, collage, signature | whole collage visible with soft edges, signature bleeds into the player, CTA plays the single directly |
| 5 | Featured player (play/pause, prev/next, waveform seek, time, mute, volume) | same controls, full-width live waveform, keyboard seek, duration before playback |
| 6 | Demo list (6 songs, one at a time, auto-advance) | record-sleeve tracklist, per-song covers, durations, 4 shown + "show all" |
| 7 | — | **new**: persistent player dock + lock-screen/hardware media keys |
| 8 | Shows (Supabase, TBA placeholders) | TBA rows now visible (old bug), upcoming/past split, localized dates, times, event type, ticket button, honest empty state |
| 9 | About/band info (image + text) | editorial split, "Mehr über Typhoon" disclosure, band facts |
| 10 | Members (8 cards with bios, Supabase merge) | cards with bios, 4 shown + reveal, no placeholder badge |
| 11 | Gallery + lightbox | contact sheet for any image count, viewer with counter, captions, swipe, focus return |
| 12 | Booking form + API (Supabase insert, Resend mail, honeypot) | labelled fields, event-type select, inline errors, success state, privacy note; API localized, rate-limited, clock-independent time trap, correct success semantics; also works without JavaScript (POST + status pages) |
| 13 | Cookie banner (localStorage) | privacy notice (reachable first by keyboard, Esc minimises) + preferences dialog, reopen from footer, old choice honoured |
| 14 | Footer (contact, socials, legal) | contact as mailto/tel links, platform links from Admin (no dead `#` icons), privacy settings |
| 15 | Legal pages (hard-coded) | Admin-editable (Phase 06) with updated fallback texts |
| 16 | Admin (login, forced password change, booking inbox + convert, shows, media, music, members, assets) | unchanged features, own chrome (no public header), noindex, session refresh |
| 17 | — | **new from Phase 06**: Admin legal pages, SEO entries, platform links, consent overview |
| 18 | — | **new**: sitemap, robots, manifest, icons, OG image, hreflang incl. x-default, JSON-LD (MusicGroup + MusicEvent), server-rendered localized 404, security headers |
| 19 | — | **new**: Admin can permanently delete archived booking requests (GDPR erasure) |

## 4. Bugs of the live site fixed on the way

- Inter was downloaded but not applied (system font rendered); Georgia as display font.
- `<html lang="de">` on every locale → broken Turkish uppercase (MÜZIK instead of MÜZİK), wrong SEO signals.
- TBA shows from Supabase never appeared; past shows never disappeared.
- Booking reported success when the only configured channel failed; German-only errors for EN/TR; no rate limit.
- Admin could not unpublish/hide shows or deactivate platform links (unchecked checkbox saved as `true`).
- Admin sessions expired after ~1 h (no Supabase session refresh).
- All six MP3 files were requested on page load (~0.5 MB) just to show durations.
- Footer social icons were dead `#` links; phone was not a `tel:` link.
- Header was transparent over content; anchors landed under the header.
- Admin login page showed internal setup notes publicly.
- Without JavaScript the booking form sent all personal data as a GET
  query string and the request was lost.
- The time trap compared the visitor's clock with the server clock.
- Demo durations were read by downloading ~0.8 MB of MP3 per visit.
- Legal texts cited TMG/RStV (replaced by DDG/MStV) and did not name Supabase/Resend.

## 5. Things found in the live database (no code change needed, owner to decide)

- Member slot `jurgen` is **"Tan – Percussion"** in the live DB (repo/docs: "Jürgen – Gitarre"). Mika is shown as "Mika El Jackson". The DB wins on the site; copy no longer hard-codes names.
- Song titles in the DB lost their diacritics ("Cilgin", "gece yine dustun", "Bir tek sen", "Sen-Benim"). The redesign displays the canonical spelling when a title only differs by case/diacritics; better to fix the titles in Admin → Music.
- Live member bios in the DB contain small typos ("Frontman -", "Posaunen Sound", no final period).
- Gallery alt texts in the DB mix German and English.
- The shows table is empty → the site shows "Neue Termine sind in Planung" with a booking CTA instead of fake TBA cards.

## 6. Open owner decisions

1. Confirm line-up slot 8 (Tan – Percussion vs. Jürgen – Gitarre) and
   Mika's display name ("Mika El Jackson" in the DB); update the DB or the
   fallback + docs/03 so the site does not flip when Supabase is down.
2. Confirm the facts newly shown from `docs/typhoon-info.md` of the
   typhoon.band repo: home base "Kanzlei Studio, Hechingen", "über 30 Jahre
   Bühnenerfahrung", "Antwort in der Regel innerhalb von 48 Stunden".
   Removed until confirmed: "gerne auch weiter weg" (travel) and weddings
   as a booking category.
3. Have the legal texts reviewed (`src/content/legal.ts`, or publish your own in Admin → Legal). Not legal advice.
4. Apply the optional `supabase/migrations/0007_security_hardening.sql` (stops public listing of storage files, enforces upload limits).
5. Replace the low-resolution member photos (slots 3–8 are crops of the collage) and add song covers in Admin → Music.
6. Add real platform links (Spotify, Instagram, …) in Admin → Platform links; they appear automatically.
7. Role model: `editor` currently has owner rights (unchanged from live); decide whether to restrict. Permanent deletion of booking requests is already limited to owner/admin.
8. Form of address: the site copy uses "du"; the German legal texts still
   use "ihr" (kept deliberately until the legal review). Have a native
   speaker proofread the Turkish copy.

## 7. Going live

1. Review the Vercel **preview** of this branch. Note: preview deployments use the production Supabase and Resend variables, so a booking test there creates a real request and e-mail.
2. Merge the branch into `main` (PR) → Vercel deploys production automatically. Rollback = promote the previous deployment `dpl_AchrnQssukAeurSjd17arPKkFore` in Vercel.
3. No database migration is required. 0007 is optional and independent.

## 8. Tooling note

`impeccable.style` could not be installed with `npx skills add` in this
session (the environment's permission check blocked installing a
third-party agent skill). After the owner asked for it explicitly, the
upstream repository was reviewed and installed as a project skill on the
separate branch `claude/typhoon-website-impeccable` (Version B, see
`docs/redesign/IMPECCABLE-VERSION-BRIEF.md` there). Version A applies its
public anti-pattern list manually (see DESIGN.md, "Rules").

## 9. Independent review (after the first build)

A separate multi-agent review (parity, security, accessibility, design,
performance/SEO, content/i18n — each finding re-verified by a second
agent) reported 60 findings; 57 were confirmed, 1 stayed uncertain (live
DB member data, an owner decision) and 2 were partly refuted. All
confirmed findings are fixed on this branch:

| Severity | Findings | Fixed |
|---|---|---|
| P0 | 4 (one bug): content stayed invisible after client-side navigation back to the home page and for members 5–8 after "Alle Musiker zeigen" | ✔ reveal state in `data-revealed`, MutationObserver for new nodes, hidden elements observed instead of marked |
| P1 | 10: booking time trap vs. device clock, touch swipe on waveforms started playback, consent notice and dock hid focused elements, privacy H1 overflowed at 320/390 px | ✔ |
| P2 | 22: player controls on phones/tablets, no-JS booking GET, privacy retention vs. soft delete, menu dialog semantics, dock close focus, field contrast, forced colours, live regions, mobile demo rows, first viewport CTA, footer at 768 px, MP3 prefetch, mobile LCP, TR grammar, EN/TR event types and countries, Art. 21 GDPR | ✔ |
| P3 | 21: anchors, `__proto__` validation, SQL re-run regression, 404 title + SSR, frontman crop, page length, grid orphans, truncation, repeated facts, no-JS lists, Open Graph, legal meta, x-default, venue wrapping, image cache TTL, gallery sizes, unbacked claims, TR/EN wording, du/ihr, percent format | ✔ (du/ihr in legal texts: owner decision 8) |

Evidence (production build, Chromium via Playwright; scripts in the
session scratchpad, results summarised here):

- `npm run lint` ✔, `tsc --noEmit` ✔, `npm run build` ✔.
- 42/42 targeted fix checks passed, among them: members 5–8 visible after
  expand/collapse/expand; no invisible `.reveal` after home → Impressum →
  back and legal → logo → home; without JavaScript all 8 members and 6
  demos are visible, the form is `POST /api/booking` with native
  validation and the 404 is server-rendered (status 404, localized
  `<title>`, `lang`); notice reachable right after the skip link, Esc →
  pill; menu dialog has its close button inside, background inert, focus
  restored; no MP3 request before play; vertical swipe over a waveform
  scrolls (no playback), tap plays; one live region "Karanfil – Läuft
  gerade"; featured player shows prev/mute/time at 390 px; closing the
  dock focuses the song's play button; no horizontal overflow on home,
  TR, privacy, imprint, booking status and 404 at 320 and 390 px; hero
  play CTA above the fold at 768×1024; lineup without orphan at 768 px.
- Regression: DE/EN/TR journeys (hero play → dock, Media Session title,
  lightbox counter, form validation focus, mobile menu) without console
  errors; ghost playback after a language switch 0 → exactly 1 on replay;
  0 px overflow at 320/768/1024/1920 px.
- Booking API (local, no Supabase/Resend configured): JSON with
  `elapsed_ms` 5000 → fallback; 800 → fake success; legacy `started_at`
  ignored; `__proto__` stored as plain text; form POST → 303 to
  `/tr/booking/fallback`, invalid → `/en/booking/invalid`, foreign origin →
  `/de/booking/error`; `text/plain` → 415.
- Page height (collapsed): 6706 px at 1440 (was 7083), 9387 px at 390
  (was 9764).
