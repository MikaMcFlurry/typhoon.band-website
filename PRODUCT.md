# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (owner-confirmed 2026-09-25): **bookers and promoters** — club
programmers, festival and town-fair organisers, agencies, companies and
private hosts looking for a live band. They arrive from a recommendation, a
social post or a search, usually on a phone, often between other tasks. Their
job: in a few minutes decide whether Typhoon fits their event (sound, line-up,
live energy, seriousness) and send a request.

Secondary: fans and listeners who saw the band live and come back for the
songs, photos and upcoming dates. Band members and the admin use `/admin`
(separate Operate surface, not part of the public redesign).

## Product Purpose

The public website of Typhoon, an eight-piece live band from the Hechingen
area (Baden-Württemberg). It lets visitors hear the demos, meet the line-up,
see shows, browse photos and send a booking request that lands in Supabase and
at `booking@typhoon.band`. Success = more qualified booking requests, and a
visitor who leaves knowing what the band sounds like.

## Positioning

Typhoon sings **Turkish lyrics over American-European bluesrock, funk, soul,
jazz and southern rock**, played by eight experienced musicians with a full
brass section (trombone, saxophone, trumpet). No neighbouring cover or
function band can truthfully claim that combination. Owner success test for
the redesign: the site must "sound like the band" — not a generic premium band
template.

## Operating Context

- Content is edited by the band in the Admin (Supabase): members (8 fixed
  slots, DE/EN/TR name/role/bio/photo), songs (MP3 in Storage, featured flag,
  optional cover), shows, gallery, hero/band-info images, legal pages, SEO,
  platform links. Live data overrides the repo fallback per slot.
- Three locales: `/de` (default), `/en`, `/tr`.
- Hosting: Vercel; preview deployments share production Supabase/Resend.

## Capabilities and Constraints

- Audio: one shared audio element, one song at a time, live Web Audio
  waveform, seek (pointer + keyboard), auto-advance, persistent player,
  Media Session; **no download, no native controls**.
- Booking form → `/api/booking` (validation, honeypot, time trap, rate
  limit, Supabase insert + Resend mail). Contact e-mail is only
  `booking@typhoon.band`; phone `+49 176 64472296`.
- Shows: from Supabase only; the table is currently empty. **Never invent
  dates**; empty state leads to booking.
- Consent v1 (necessary + external media), no analytics, no embeds without
  consent, self-hosted fonts.
- Member names are never hard-coded in copy (live slot 8 currently shows
  "Tan – Percussion"; owner to confirm). Never "Taifun", never "Daniel".
- No placeholder badges; no horizontal overflow at 320/390 px; WCAG AA.
- Undecided (owner): line-up slot 8; home-base line "Kanzlei Studio,
  Hechingen"; "über 30 Jahre Bühnenerfahrung"; real platform links.

## Brand Commitments

- Name: **Typhoon**.
- Logo: the **gold handwritten signature PNG**
  (`public/assets/branding/typhoon-signature-gold.png`); never re-set in a
  font. Owner 2026-09-25: *nothing else* from the previous look is binding
  (sepia collage, dark mood, serif/gold palette are all open).
- Genre line: Bluesrock · Funk · Soul · Jazz · Southern Rock.
- Voice: direct, warm, confident; short sentences; du-form in German.

## Evidence on Hand

- Photos: `public/assets/hero/hero-collage.jpeg` (sepia composite of all
  members), `hero/singer-stage.jpeg`, `band-cards/typhoon-band-card.jpg`
  (singer at red Nord keys, daylight stage), `band-cards/mika-band-card.jpg`,
  `gallery/gallery-1…8.jpg` (incl. the band's own studio), low-res member
  crops in `members/`.
- Six demo MP3s (Sen Benim ★, Karanfil, Farksilin, Çılgın, Bir Tek Sen, Gece
  Yine Düştün) with known durations.
- Band texts in DE/EN/TR (`src/i18n/dictionaries.ts`, `src/data/*`).
- Absent — must not be fabricated: show dates, press quotes, testimonials,
  streaming numbers, song descriptions, social links, song covers.

## Product Principles

1. Let the music prove it: a song should be one tap away from the first
   screen.
2. Booking is the conversion; every section ends within reach of it.
3. Truth over filler: live data wins, empty states are honest.
4. One site, three languages, same quality on a 320 px phone.

## Accessibility & Inclusion

WCAG 2.2 AA; full keyboard use of player, gallery and menu; reduced-motion
respected; correct `lang` per locale (Turkish casing).
