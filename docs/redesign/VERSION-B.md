# Typhoon — Version B ("Bühnenplan & Setlist")

Date: 2026-09-25 · Branch: `claude/typhoon-website-impeccable` (repo
`MikaMcFlurry/typhoon.band-website`). Production (`main` → typhoon.band) and
Version A (`claude/typhoon-website-redesign-7xjozt`) are untouched. Made with
the Impeccable design skill (v4.4.0, `.claude/skills/impeccable`).

Visual source of truth: root [`DESIGN.md`](../../DESIGN.md) (written from the
built site by Impeccable's documenter). Product record:
[`PRODUCT.md`](../../PRODUCT.md). Direction contract:
`.impeccable/surfaces/src-app-locale-site-page-tsx.md` (dev-only).

## 1. How the direction was chosen

1. `impeccable init`: the owner answered three questions. **Bookers and
   promoters** are the primary audience. **Only the gold signature logo** is
   binding from the old look. The success test is that **the site "sounds
   like the band"**. The result is `PRODUCT.md`.
2. `new-work` direction round (seed `f20ee826`, mode Persuade). I listed seven
   worlds from the band's own culture, in resonance order:
   1. Anadolu-rock 45s
   2. soul-jazz LP sleeves
   3. letterpress gig posters
   4. **tour rider & stage plot**
   5. mixing console
   6. horn charts
   7. backstage laminates

   The roll assigned no. 4. Catalog challengers were weighed and declined, and
   each lent one discipline to the direction:
   - algorave → one shared clock
   - darkroom → preview before committing
   - Art-Deco lobby → exactly one framed primary action
   - cloud edge → text stays achromatic
3. The owner chose the rolled direction over three alternatives: the Anadolu
   45 sleeve (Impeccable's pick), an obi-band sleeve, and the category
   standard.
4. The build was code-led (no image generation in this environment). Then
   came the independent finish review and two fix rounds, with a verdict after
   each (see §4).

## 2. The design direction

**The evening seen from the stage.**
- The songs are the **setlist** taped to the floor: every row plays.
- The line-up is a **stage plot**: spike-tape marks where each musician
  stands, with a drum riser and monitor wedges.
- Booking is the **rider**, with a live preview of the request as it will
  arrive.

The materials:
- matte stage-deck black
- chalk-white gaffer tape as the label surface
- spike tape with fixed colour roles:
  - **orange** = booking, the one primary action
  - **pink** = audio / now playing
  - **green** = line-up
  - **blue** = dates

Type:
- Big Shoulders (stage-signage caps)
- Schibsted Grotesk (reading)
- Martian Mono (times, durations, rider data only)

Square corners, no gradients, no glow. Gold appears only in the signature
logo.

The signature interaction is **one shared clock**. While a song plays, the
live Web Audio level pulses the stage-plot marks and the dock cover, and the
active setlist row carries the pink tape and a seekable waveform. The pulse is
off under reduced motion.

## 3. What differs

| Area | Live site (`main`) | Version A (redesign branch) | Version B (this branch) |
|---|---|---|---|
| World | dark sepia/gold, handoff layout | cinematic record sleeve: sepia photos, antique gold, Newsreader serif + Archivo | stage floor: deck black, gaffer tape, spike-tape roles; Big Shoulders + Schibsted + Martian Mono |
| First screen | collage + serif headline, player card below | collage with signature bleeding into a featured player | big gold signature, tagline laid as three tape strips, **setlist with all six songs** taped over a colour live photo; play + booking CTAs |
| Music | featured player + list | featured player + record-sleeve tracklist (4 + "show all") | the setlist *is* the tracklist; the active row shows a waveform and pink tape; persistent dock |
| Shows | TBA placeholder cards | list / honest empty state | dates on blue tape next to the **band poster** (admin hero image, always shown whole); honest empty state → booking |
| Band | image + text, member cards | editorial split + member cards with bios | statement headline, story, rider-style facts, **interactive stage plot** (tabs, arrow keys) with a member panel |
| Photos | grid + lightbox | contact sheet + viewer | taped contact sheet with frame numbers + the same viewer |
| Booking | form | facts + poster + form | rider: orange tape heading, facts, direct line, form with a **live request preview above submit**; errors re-check while typing |
| Colour | gold accents | gold for the primary action | orange only for booking; pink only for audio |

Function parity: every item of the parity checklist in
`docs/redesign/2026-09-redesign.md` §3 is kept. Nothing changed in the
backend, admin, API, `src/lib`, middleware or Supabase. The admin keeps its
Version A palette and fonts through the `.admin-root` wrapper.

Behaviour changes:
- Metadata for demo durations now loads at browser idle time.
- The Turkish hero sentence uses the owner's v6 wording ("… caz … sahnede
  enerji dolu").
- Two claims the owner has not confirmed were removed from the band text:
  - "Homebase: Kanzlei Studio, Hechingen" and the studio paragraph
  - "über 30 Jahre Bühnenerfahrung"

## 4. Evidence

- `npm run lint`: no warnings. `npm run build`: passes.
- Impeccable detector: one finding (layout transition on the body padding),
  fixed.
- Playwright (local production build, fallback data, **no bookings sent**):
  19/19 journeys pass:
  - play from the setlist → the dock appears with the title
  - only one song plays at a time
  - a seek slider appears on the active row
  - no download links or native controls
  - stage-plot tab switching and arrow keys
  - lightbox: open, arrow key, Esc, focus returns
  - booking: client validation and preview updates
  - DE→TR switch keeps `#band`, with correct Turkish uppercase (OLAĞANÜSTÜ)
  - mobile menu: open, Esc, link navigation
  - no overflow while playing
- No horizontal overflow at 320 / 390 / 768 / 1024 / 1280 / 1440 px.
- Impeccable finish review (fresh reviewer, no shared context):
  - First review: `fix`, 8 material fixes.
  - Verdict 1: 7 resolved; the photo plate was partial and there was one
    regression.
  - Verdict 2: both resolved; one new regression (the headline touched the
    setlist at 1024 px).
  - I fixed that last regression and checked it by measurement only: a gap of
    at least 77 px from 1024 to 1440. It has **not** been re-scored by the
    reviewer.
- Every shipped raster carries an embedded origin note (`impeccable
  embed-prompt --scan` → 0 missing). All images are owner-supplied; none were
  generated.
- Screenshots in [`version-b/`](version-b/):
  - `de-{320,390,768,1024,1440}-{fold,full}.jpg`
  - `tr-{390,1440}-*.jpg`
  - `legal-en-390-*.jpg`
  - `journey-*.png` (playing, stage plot, booking validation + preview,
    lightbox, mobile menu, mobile dock)

## 5. Open points

- **Owner review of the direction** on the Vercel preview. Preview deployments
  use production Supabase and Resend, so **do not send test bookings there**.
- Items the reviewer noted but did not order a fix for:
  - The pink "Funk." strip shares its colour with the now-playing tape.
  - The singer photo appears both in the gallery and in the band section
    (fallback data).
  - The tape is set in type; there is no hand-marker lettering and no torn
    ends.
- Owner facts, unchanged from Version A:
  - line-up slot 8 (live: "Tan – Percussion")
  - the Hechingen / Kanzlei Studio wording (still in the JSON-LD location and
    the booking "Basis" row)
  - real platform links
  - song covers
  - higher-resolution member photos (the stage-plot panel shows them at up
    to 380 px)
- The stage plot is a schematic of the line-up, not a technical rider. A real
  rider (inputs, power) would need the band's data.
