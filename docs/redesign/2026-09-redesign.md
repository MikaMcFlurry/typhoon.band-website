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
| 12 | Booking form + API (Supabase insert, Resend mail, honeypot) | labelled fields, event-type select, inline errors, success state, privacy note; API localized, rate-limited, time trap, correct success semantics |
| 13 | Cookie banner (localStorage) | privacy notice + preferences dialog, reopen from footer, old choice honoured |
| 14 | Footer (contact, socials, legal) | contact as mailto/tel links, platform links from Admin (no dead `#` icons), privacy settings |
| 15 | Legal pages (hard-coded) | Admin-editable (Phase 06) with updated fallback texts |
| 16 | Admin (login, forced password change, booking inbox + convert, shows, media, music, members, assets) | unchanged features, own chrome (no public header), noindex, session refresh |
| 17 | — | **new from Phase 06**: Admin legal pages, SEO entries, platform links, consent overview |
| 18 | — | **new**: sitemap, robots, manifest, icons, OG image, hreflang, JSON-LD (MusicGroup + MusicEvent), styled 404, security headers |

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
- Legal texts cited TMG/RStV (replaced by DDG/MStV) and did not name Supabase/Resend.

## 5. Things found in the live database (no code change needed, owner to decide)

- Member slot `jurgen` is **"Tan – Percussion"** in the live DB (repo/docs: "Jürgen – Gitarre"). Mika is shown as "Mika El Jackson". The DB wins on the site; copy no longer hard-codes names.
- Song titles in the DB lost their diacritics ("Cilgin", "gece yine dustun", "Bir tek sen", "Sen-Benim"). The redesign displays the canonical spelling when a title only differs by case/diacritics; better to fix the titles in Admin → Music.
- Live member bios in the DB contain small typos ("Frontman -", "Posaunen Sound", no final period).
- Gallery alt texts in the DB mix German and English.
- The shows table is empty → the site shows "Neue Termine sind in Planung" with a booking CTA instead of fake TBA cards.

## 6. Open owner decisions

1. Confirm line-up slot 8 (Tan – Percussion vs. Jürgen – Gitarre) and update docs/03 accordingly.
2. Confirm the facts newly shown from `docs/typhoon-info.md` of the typhoon.band repo: home base "Kanzlei Studio, Hechingen", "über 30 Jahre Bühnenerfahrung", "Antwort in der Regel innerhalb von 48 Stunden", "gerne auch weiter weg".
3. Have the legal texts reviewed (`src/content/legal.ts`, or publish your own in Admin → Legal). Not legal advice.
4. Apply the optional `supabase/migrations/0007_security_hardening.sql` (stops public listing of storage files, enforces upload limits).
5. Replace the low-resolution member photos (slots 3–8 are crops of the collage) and add song covers in Admin → Music.
6. Add real platform links (Spotify, Instagram, …) in Admin → Platform links; they appear automatically.
7. Role model: `editor` currently has owner rights (unchanged from live); decide whether to restrict.

## 7. Going live

1. Review the Vercel **preview** of this branch. Note: preview deployments use the production Supabase and Resend variables, so a booking test there creates a real request and e-mail.
2. Merge the branch into `main` (PR) → Vercel deploys production automatically. Rollback = promote the previous deployment `dpl_AchrnQssukAeurSjd17arPKkFore` in Vercel.
3. No database migration is required. 0007 is optional and independent.

## 8. Tooling note

`impeccable.style` could not be installed into the repo in this session (the
environment's permission check blocked installing a third-party agent
skill). Its public anti-pattern list was applied manually (see DESIGN.md,
"Rules"). To install it yourself: `npx skills add pbakaus/impeccable`.
