---
name: Typhoon
description: The evening seen from the stage. Setlist, taped line-up and rider on a matte black deck.
colors:
  deck: "rgb(18 17 16)"
  deck-2: "rgb(27 25 23)"
  deck-3: "rgb(38 35 32)"
  chalk: "rgb(238 235 228)"
  chalk-2: "rgb(170 165 156)"
  chalk-3: "rgb(142 137 128)"
  gaffer: "rgb(233 229 219)"
  on-tape: "#121110"
  tape-orange: "rgb(255 107 26)"
  tape-pink: "rgb(255 79 154)"
  tape-green: "rgb(61 220 132)"
  tape-blue: "rgb(58 160 255)"
  rule: "rgba(238, 235, 228, 0.14)"
  rule-2: "rgba(238, 235, 228, 0.32)"
  alert: "#ff8a7a"
typography:
  display:
    fontFamily: "Big Shoulders (opsz), Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 0.9rem + 7vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "normal"
  headline:
    fontFamily: "Big Shoulders (opsz), Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.6rem + 4.6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  headline-sm:
    fontFamily: "Big Shoulders (opsz), Arial Narrow, sans-serif"
    fontSize: "clamp(1.75rem, 1.3rem + 1.6vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 0.95
  title:
    fontFamily: "Big Shoulders (opsz), Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.02
  body-lg:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.45vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  data:
    fontFamily: "Martian Mono (wdth 87.5%), ui-monospace, monospace"
    fontSize: "0.8125rem"
    letterSpacing: "0.02em"
    fontFeature: "tnum"
  label:
    fontFamily: "Martian Mono (wdth 87.5%), ui-monospace, monospace"
    fontSize: "0.75rem"
    letterSpacing: "0.06em"
    fontFeature: "tnum"
  button:
    fontFamily: "Big Shoulders (opsz), Arial Narrow, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
rounded:
  none: "0px"
spacing:
  shell-mobile: "16px"
  shell-sm: "24px"
  shell-lg: "40px"
  block-mobile: "72px"
  block-md: "112px"
  hit: "44px"
  control: "48px"
components:
  button-tape:
    backgroundColor: "{colors.tape-orange}"
    textColor: "{colors.on-tape}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-tape-hover:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.on-tape}"
  button-play:
    backgroundColor: "{colors.tape-pink}"
    textColor: "{colors.on-tape}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-play-hover:
    backgroundColor: "{colors.chalk}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "48px"
  button-sm:
    padding: "0 14px"
    height: "40px"
  control:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-2}"
    rounded: "{rounded.none}"
    size: "44px"
  control-play:
    backgroundColor: "{colors.tape-pink}"
    textColor: "{colors.on-tape}"
    rounded: "{rounded.none}"
    size: "48px"
  tape:
    backgroundColor: "{colors.gaffer}"
    textColor: "{colors.on-tape}"
    rounded: "{rounded.none}"
    padding: "0.08em 0.28em 0.02em"
  tape-piece:
    backgroundColor: "{colors.tape-pink}"
    rounded: "{rounded.none}"
    width: "72px"
    height: "22px"
  sheet:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.on-tape}"
    rounded: "{rounded.none}"
    padding: "24px"
  field:
    backgroundColor: "{colors.deck}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
    padding: "12px 12px 10px"
  field-focus:
    backgroundColor: "{colors.deck-3}"
---

# Design System: Typhoon

> Visual source of truth for **Version B ("Bühnenplan & Setlist")** on branch `claude/typhoon-website-impeccable`: the public site (home, legal pages, 404, player dock, consent). Tokens live as CSS custom properties in `src/app/globals.css`; Tailwind only maps names onto them. **Out of scope:** the admin area (`/[locale]/admin`, the `.admin-root` scope and the "Admin primitives" block with its ink/paper/gold palette, pill buttons, `.kicker`/`.eyebrow`) keeps its previous look and is not part of this system. Nothing here may be applied to the admin, and nothing from the admin may be used on public surfaces. `docs/design/DESIGN.md` is the discarded Version A system, kept only for reference.

## Overview

**Creative North Star: "The Evening Seen From the Stage"**

You see the site the way the band sees the room: a matte black stage deck, chalk-white gaffer tape for labels, spike tape in fixed colours, and paper taped to the floor. The songs are a setlist sheet, the line-up is a row of taped cards, the booking request is a rider. Everything is flat and square-cut. The only depth comes from paper sheets lying on the deck.

Density is working-document density. Big, heavy upright caps carry the signage, a sturdy grotesk handles the reading, and a condensed mono holds every number (times, durations, counters, rider data). Colour means something every time it appears: it shows up only on tape and on state, never on running text. The gold hand-drawn signature is the band's name and is the only gold on public surfaces.

The world rejects the category default (a full-bleed moody band photo with a big name and a tour list) and Version A's sepia, serif and gold.

**Key Characteristics:**
- Matte deck black ground, chalk text, gaffer-tape labels printed in stage ink.
- Four spike-tape colours, each with one job: orange for booking, pink for audio, green for the line-up, blue for dates.
- Square corners everywhere, 2px rules and strips, and no gradients or glow.
- Tape is laid on from the left, and content rises 16px. The live audio level pulses the "now playing" marks.
- Real photos, uncropped band collage, and a gold signature as the logo.

## Colors

The palette is an achromatic stage (deck and chalk) plus four saturated spike-tape colours used strictly by role.

### Primary
- **Booking Spike Orange** (`tape-orange`): the one primary action. Used for the `btn-tape` button (every "Booking anfragen" and the submit), the Booking heading tape, the header Booking button, the booking item in the mobile menu, the tape piece on the request preview, the skip link, and the focus underline on form fields. It appears on no other element. Stage ink on orange reads at 6.6:1.

### Secondary
- **Now-Playing Pink** (`tape-pink`): audio and "now playing". Used for the play buttons (`btn-play`, `ctl-play`), the current setlist row's tape, the played part of the waveform, the dock's progress line, the volume fill, the tape pieces holding the setlist sheet, the third hero tagline strip, text selection, and the caret. Ink on pink is 6.1:1. Pink on deck is 6.1:1.

### Tertiary
- **Line-up Green** (`tape-green`): line-up only. Used for the instrument/role tape on each member card. Green on deck is 10.6:1.
- **Date Blue** (`tape-blue`): dates only. Used for the show date blocks (past shows use `chalk-2` instead) and the tape piece on the Shows poster. Ink on blue is 6.9:1.

### Neutral
- **Stage Deck** (`deck`): page ground, fields, and the footer.
- **Deck Riser** (`deck-2`): the booking form panel and the player dock.
- **Deck Shadow** (`deck-3`): image placeholders and the field background on focus.
- **Chalk** (`chalk`): primary text (15.8:1 on deck), paper sheets (setlist, request preview, consent), the focus outline, and the hover fill for tape buttons.
- **Chalk Dim** (`chalk-2`): secondary copy and mono labels (7.7:1 on deck, 6.4:1 on deck-3).
- **Chalk Faint** (`chalk-3`): placeholders, hints, and separators (5.4:1 on deck, 4.5:1 on deck-3; never go darker).
- **Gaffer** (`gaffer`): the default tape strip and short tape pieces on gallery prints. Ink on gaffer is 15.0:1.
- **Stage Ink** (`on-tape`): the only text colour on tape and paper. On chalk paper, secondary ink runs at 62 to 76% alpha (4.95:1 to 8.0:1). Nothing lighter than 62% is allowed.
- **Rule / Rule Strong** (`rule`, `rule-2`): hairline section and row dividers, and outline-button strokes (fields use `chalk-3`).
- **Alert** (`alert`): field errors and the invalid underline (8.2:1 on deck).

### Named Rules
**The Spike Tape Rule.** Every tape colour has exactly one role: orange for booking, pink for audio, green for line-up, blue for dates. Short tape pieces take the role colour of their section (pink on the setlist, blue on the Shows poster, orange on the request preview, gaffer on gallery prints). Don't use a colour outside its role.

**The Achromatic Text Rule.** Colour lives on tape and on state only. Running text, headings, and fields stay chalk or ink.

**The Gold Signature Rule.** Gold appears only inside the signature logo image (header, hero, footer). It is never a UI colour on public surfaces.

## Typography

**Display Font:** Big Shoulders, variable with the `opsz` axis (fallback Arial Narrow)
**Body Font:** Schibsted Grotesk (fallback system-ui)
**Label/Mono Font:** Martian Mono, variable `wdth` set at `font-stretch: 87.5%` (fallback ui-monospace)

All three are self-hosted through next/font with latin-ext, for Turkish ğ ı ş İ.

**Character:** Heavy, upright stage-signage caps against a plain, sturdy reading face, with a narrow technical mono for anything you could measure.

### Hierarchy
- **Display** (900, clamp 2.5 to 6rem, fixed at 4.25rem at lg, line-height 0.92, uppercase): only the hero tagline strips, set on tape.
- **Headline** (800, clamp 2.75 to 6rem, line-height 0.9, -0.01em, uppercase, balanced): section headings (`h-stage`), the 404 heading (no label above it), and legal titles.
- **Headline small** (800, clamp 1.75 to 2.75rem, line-height 0.95): sub-section headings such as the line-up heading.
- **Title** (800 to 900, 1.375 to 3rem, line-height 0.85 to 1.02, uppercase): setlist song titles (1.625rem, 1.875rem from sm), the setlist sheet heading (2.5/3rem), show venues, musician names, the dock title, sheet headings, and the line-up name tapes.
- **Body large** (400, clamp 1.125 to 1.3125rem, line-height 1.55, chalk, max 58ch): intro sentences.
- **Body** (400, 1.0625rem, line-height 1.6, chalk-2, max 62ch, pretty wrap): running copy. The base size is 16px/1.55.
- **Data** (mono 0.8125rem, 0.02em, tabular numbers): times, durations, counters, and preview values.
- **Label** (mono 0.75rem, 0.06em, uppercase, tabular numbers): nav items, field labels, fact labels, and rider data.
- **Button** (Big Shoulders 800, 1.1875rem, 1.0625rem for small, 0.02em, uppercase).

### Named Rules
**The Measurement Rule.** Martian Mono is only for data: times, durations, counts, dates, rider facts, nav, and labels. Don't set sentences in mono.

**The Signage Rule.** Every heading is Big Shoulders in uppercase at 800 or 900. Don't use serifs, italics, or light display weights.

## Layout

- **Shell:** max 1360px, with side padding of 16px, 24px from 640px, and 40px from 1024px. Sections use `block-y` padding (72px, 112px from 768px) and are separated by a `rule` top border.
- **Grid:** a 12-column grid from lg. Content sections split 7/5 (Shows) or 5/7 (Band).
- **Hero:** stacked below lg. At lg it splits 6/6, and at xl 7/5 with min-height 100svh minus the header. The photo plate sits absolutely at the top right of the right column (70% width at lg, 74% at xl). The setlist sheet overlaps its lower-left corner (88%/82% width, rotated 1°). On mobile the plate runs full bleed at 16:10 and the setlist overlaps it by 56px (80px from sm).
- **Header:** 64px tall, 72px from md. Mono nav from lg, with a hamburger menu below lg. The locale switcher and Booking button appear from sm.
- **Player dock:** fixed to the bottom at 76px. It writes `--dock-h` so the body and the consent banner clear it. Previous/volume controls hide at the smaller breakpoints (xs/lg).
- **Line-up:** 2 columns on mobile, 3 from md, 4 from lg.
- **Rider/preview rows:** a two-column dl (7.5 to 12rem label column). The request preview rows stack into one column below 640px.
- **Hit areas:** at least 44px for every interactive target. No horizontal overflow at 320 or 390px (`overflow-x: clip` on body, `overflow-wrap:anywhere` on long email and phone strings).
- **Breakpoints:** xs 420, sm 640, md 768, lg 1024, xl 1280.

## Elevation & Depth

The stage is flat. Depth comes from exactly one device: paper lying on the deck. Chalk sheets (the setlist, the Shows poster, the consent notice and dialog) cast a single soft shadow that falls downward. Nothing else is lifted, and nothing glows.

### Shadow Vocabulary
- **Sheet on deck** (`box-shadow: 0 24px 48px -24px rgba(0,0,0,0.8)`, 0.9 on the poster): taped sheets and prints.
- **Floating sheet** (`box-shadow: 0 24px 48px -12px rgba(0,0,0,0.7)`): the consent notice and dialog.

### Named Rules
**The Paper-Only Lift Rule.** Only paper sheets and posters get a shadow, and it is always soft and falls downward. Don't use hard offset shadows, coloured glows, or shadows on buttons, tape, or panels.

## Shapes

All corners are square (0 radius), including buttons, fields, the range thumb (12x16px), and images. Lines are 2px tape strips and rules: `border-t-2 chalk` heads fact lists and legal bodies, the setlist sheet has 2px ink rules, and the line-up cards carry their names on tape. Tape strips and sheets sit slightly rotated (±0.6° to 1.4° for strips, 1° for sheets, 2° to 6° for tape pieces), which is how tape actually lands. The band collage poster uses `object-contain` and is never cropped.

## Components

### Tape
A flat, matte, square-cut strip in one colour with stage-ink text. Padding is 0.08em 0.28em 0.02em, and wrapped lines clone the strip. `tape` is gaffer. `tape-orange`, `tape-pink`, `tape-green`, and `tape-blue` follow the Spike Tape Rule. **Tape piece** (72x22px, 92% opacity, pink by default) holds sheets and prints; a smaller 56x16 version is used on the gallery.

### Buttons
- **Shape:** square, 48px minimum height, 20px side padding, 2px border, uppercase Big Shoulders.
- **Tape (primary):** orange with ink text. It turns chalk on hover, and pressing moves it down 1px. Use it for booking only.
- **Play:** pink with ink text, chalk on hover. It starts audio.
- **Line (secondary):** transparent with a `rule-2` border. The border turns chalk on hover. On chalk paper it inverts to an ink border.
- **Small:** 40px tall, 14px padding, 1.0625rem.
- **Controls:** a square 44px icon button in chalk-2. On hover it turns chalk with a chalk 8% fill. The **play control** is 48px and pink. Disabled controls drop to 35% opacity, and disabled buttons to 60%.
- **Transitions:** 160ms `cubic-bezier(0.16,1,0.3,1)`. Focus is a 2px chalk outline offset 3px (ink on chalk paper).

### Setlist sheet (signature)
A chalk sheet held by two pink tape pieces, with an ink 2px header rule and numbered rows (mono index, title, mono duration, and a 44px ink play square that turns pink when playing or hovered). The current row's title gets pink tape and carries `data-live`, and a seekable waveform opens under it (`on-light`: ink bars played, 28% ink unplayed).

### Line-up cards
One card per member from live data: a 4:5 photo, the name on gaffer tape overlapping the photo's bottom edge (alternating ±0.8° tilt), the role on green tape, and the short bio in chalk-2. **No stage positions or stage plot:** the band has no fixed placement on stage (owner, 2026-09-25), so nothing may suggest one.

### Rider (booking)
A heading on orange tape, a facts dl under a 2px chalk rule, and contact lines in Big Shoulders. The form sits on a `deck-2` panel. A chalk **request preview** sheet (taped in orange) mirrors the draft in mono just above the submit.

### Inputs / Fields
- **Style:** deck fill, no box, a 2px `chalk-3` bottom stroke (5.4:1 on deck, above the 3:1 non-text minimum), square corners, 16px text, and a mono label above.
- **Hover / Focus:** the stroke turns chalk-2 on hover. On focus the stroke turns orange and the fill turns `deck-3`.
- **Error:** an `alert` bottom stroke and alert text below. Hints are chalk-3 at 0.8125rem.

### Navigation
The nav is mono label links, 44px tall. The active item gets a 3px gaffer underline laid from the left. The mobile menu is a full-screen deck with 2.5rem Big Shoulders rows: the active row sits on gaffer tape and Booking always sits on orange tape. The locale switcher is mono.

### Player dock
A `deck-2` bar with a 3px pink progress line on top, a 44px cover thumbnail (`live-mark`), a Big Shoulders title, a mono status, controls, and a waveform with mono time (from md) plus volume (from lg). There is no download control.

### Motion
- **Lay:** tape strips are revealed with `clip-path: inset(0 100% 0 0)` to full over 460ms, staggered through `--reveal-delay` (120ms plus 140ms per strip in the hero).
- **Reveal:** everything else fades up 16px over 560ms. Both only apply under `html[data-motion="on"]`, which MotionInit sets when JS runs and reduced motion is off, so content is visible by default.
- **Live level:** LiveLevel writes the analyser's bass energy (0 to 1) as `--lvl` onto `[data-live]` elements while a song plays. `.live-mark` scales to at most 1.18 with a 90ms linear transition.
- **Reduced motion:** reveals and lays render in their final state, live marks stay static, the level loop never starts, smooth scrolling is off, and all transitions and animations are cut to 0.01ms.

## Do's and Don'ts

### Do:
- **Do** keep every corner square and every stroke flat: 2px strips, hairline rules.
- **Do** put colour on tape and state only, and pick it by role (orange booking, pink audio, green line-up, blue dates).
- **Do** print text on tape or paper in stage ink (`#121110`), with secondary ink at 62% alpha or more.
- **Do** set every number (time, duration, count, date, rider fact) in Martian Mono at 87.5% width with tabular numbers.
- **Do** lay tape from the left once, and keep content visible without JS and under reduced motion.
- **Do** keep hit areas at least 44px and test at 320 and 390px for overflow.
- **Do** show the band collage whole (`object-contain`), and use real photos only.

### Don't:
- **Don't** round corners, use pill buttons, or use rounded cards.
- **Don't** use gradients, glows, or coloured shadows. The only gradient-like fill is the hard-stop volume track.
- **Don't** use orange for anything other than booking.
- **Don't** use gold outside the signature logo, and don't bring in the admin's ink/paper/gold tokens.
- **Don't** put eyebrows or kickers (small caps labels) above headings. Headings stand alone or sit on their own tape.
- **Don't** set colour on body text, headings, or fields.
- **Don't** crop the band collage, and don't add a download control to demo audio.
