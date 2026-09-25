# Typhoon — Design System (Redesign 2026)

Source of truth for the look of the public site on the redesign branch.
Tokens live in `src/app/globals.css`, Tailwind only maps names onto them
(`tailwind.config.ts`). Anything not listed here should not appear in the UI.

## Idea

Cinematic, record-sleeve inspired, dark warm stage. Sepia photography, real
antique gold only where it matters (logo, primary action, active playback),
generous space. Music is the product: every screen is one tap away from
sound, and playback continues in a persistent dock.

Kept from the owner-approved handoff: dark/sepia/gold atmosphere, serif hero
headline with a gold "Funk.", the gold signature overlaying the band collage
and bleeding into the player, the two-row featured player with the round gold
play button, shows directly under the player, the editorial band split,
member cards with bios, in-site lightbox, DE/EN/TR.

Fixed from repeated owner complaints: whole collage visible (no hard overlay
seams), signature never over text, no tiny 8–11 px type, premium (not
"billig/altbacken") buttons and player, waveforms that fill the free width,
mobile as a compact version of desktop without overflow, no placeholder
badges, no fake data.

## Type

| Role | Family | Details |
|---|---|---|
| Display + long text | Newsreader (variable, opsz 6–72) | Roman only. Section titles `clamp(2.5rem, …, 5rem)`, weight 500, tracking −0.018em. |
| UI, labels, numbers | Archivo (variable, wdth 62–125) | Labels 13 px, 600, +0.08em uppercase (short labels only). Show dates use `font-stretch: 80%`, 700, tabular numerals. |
| Logo | Gold signature PNG | Never recreated with a font. |

Body text ≥ 16 px (inputs 16 px to avoid iOS zoom), line-height 1.6, measure
60–70 ch. Both fonts are self-hosted through `next/font` (no Google requests
at runtime), `latin` + `latin-ext` for Turkish.

## Colour tokens

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0e0a07` | page background |
| `--ink-2` | `#15100b` | alternate section surface |
| `--ink-3` | `#1d160f` | raised surfaces (player, form, dialogs) |
| `--line` / `--line-2` | paper at 12 % / 22 % | hairlines, borders |
| `--paper` | `#efe4cf` | primary text (15.6:1 on ink) |
| `--paper-2` | `#c8b89b` | secondary text (10.1:1) |
| `--paper-3` | `#9a8a70` | tertiary text ≥ 14 px (5.9:1) |
| `--gold` | `#d6b36a` | primary action, accents (9.9:1) |
| `--gold-hi` | `#f1dca6` | highlight, played waveform |
| `--gold-lo` | `#8c6a33` | bronze, unplayed waveform, icons (decorative only) |
| `--oxblood` | `#9b2f24` | decorative only — fails AA as text |
| `--on-gold` | `#1a1208` | text on gold (9.3:1) |

Each colour also exists as an RGB channel variable (`--ink-rgb` …) so
Tailwind opacity modifiers work (`bg-ink/80`). Legacy names (`--bg`,
`--cream`, `--gold-soft`, …) are aliases kept for the admin area.

## Shape, space, motion

- Radius: `--r-sm` 6 px (inputs, thumbnails), `--r-md` 10 px (panels,
  player, images), pills for buttons. Nothing above 12 px on containers.
- Spacing rhythm: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Sections:
  72 px mobile / 120 px desktop. Container max 1320 px, gutters 16/24/40.
- Motion: 160/240/640 ms, `cubic-bezier(.22,1,.36,1)`, transform/opacity
  only. Scroll reveals are progressive (content visible without JS) and off
  for `prefers-reduced-motion`, which also stops the live waveform animation.

## Components

- **Header**: transparent over the hero, solid ink + hairline after 24 px
  scroll. Logo, anchor nav in scroll order (Termine, Band, Musik, Bilder)
  with scroll-spy, DE/EN/TR switch (keeps path + hash), gold Booking pill.
  Mobile: full-screen sheet with 32 px links, focus trap, Esc, contact links.
- **Hero**: text block left, collage right (paper margins trimmed, soft
  mask fade), signature over the image bleeding into the featured player.
  Actions: `▶ <Single> anhören` (plays directly) and `Booking anfragen`.
- **Featured player**: two rows — cover/label/title/duration, then play,
  prev/next, full-width live waveform (seek slider), time, volume.
- **Player dock**: fixed bottom bar after the first play; title/status,
  prev/play/next, waveform + time (desktop), volume (lg), close = stop.
- **Shows**: poster list — big day numeral, month/weekday, venue, place,
  time, event type, "Tickets" action. TBA rows after dated ones, past shows
  in a disclosure; with no dates an honest one-line strip with a booking
  link (never invented dates).
- **Band**: editorial split (photo / headline, body, "Mehr über Typhoon"
  disclosure, facts), then line-up cards with bios (4 shown, reveal all).
- **Music**: record-sleeve tracklist — real track numbers, cover, title,
  status, auto-width waveform, duration, play button (4 shown, reveal all).
- **Gallery**: contact sheet preview of 5 tiles (one large + four small;
  a "+N" last tile when there are more), in-site viewer with every image
  with counter, captions, arrows, swipe, Esc, focus trap/return.
- **Booking**: promoter facts strip, uncropped band poster + direct contact,
  form with labels, select, inline errors, success/fallback states.
- **Consent**: small non-blocking notice (first in the Tab order, Esc →
  pill, pill when the viewport is too short); preferences dialog from the
  footer.

## Rules (anti-"AI slop", from impeccable.style)

No gradient text, no glassmorphism as decoration (blur only on the sticky
header/dock), no radial halo backgrounds, no eyebrow label above every
heading, no identical card grids, no nested cards, no pulsing dots, no bounce
easing, no italic serif display headlines, no justified text, no text below
13 px, WCAG AA contrast, one `h1` per page and no skipped heading levels,
every visible control must work.
