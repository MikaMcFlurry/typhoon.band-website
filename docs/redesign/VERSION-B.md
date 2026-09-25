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
- The line-up is a row of **taped member cards** (photo, name on gaffer
  tape, instrument on green tape, bio). The first build had a stage plot
  with positions; the owner rejected it (the band has no fixed stage
  placement), so it was removed.
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
live Web Audio level pulses the now-playing tape and the dock cover, and the
active setlist row carries the pink tape and a seekable waveform. The pulse is
off under reduced motion.

## 3. What differs

| Area | Live site (`main`) | Version A (redesign branch) | Version B (this branch) |
|---|---|---|---|
| World | dark sepia/gold, handoff layout | cinematic record sleeve: sepia photos, antique gold, Newsreader serif + Archivo | stage floor: deck black, gaffer tape, spike-tape roles; Big Shoulders + Schibsted + Martian Mono |
| First screen | collage + serif headline, player card below | collage with signature bleeding into a featured player | big gold signature, tagline laid as three tape strips, **setlist with all six songs** taped over a colour live photo; play + booking CTAs |
| Music | featured player + list | featured player + record-sleeve tracklist (4 + "show all") | the setlist *is* the tracklist; the active row shows a waveform and pink tape; persistent dock |
| Shows | TBA placeholder cards | list / honest empty state | dates on blue tape next to the **band poster** (admin hero image, always shown whole); honest empty state → booking |
| Band | image + text, member cards | editorial split + member cards with bios | statement headline, story, rider-style facts, member cards with name on gaffer tape, instrument on green tape and bio |
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

## 4. Evidence (final state, commit on this branch after `95e2a57`)

**Build and code checks**
- `npm run lint`: no warnings. `npm run build`: passes.
- Impeccable detector: 0 findings in the public site. One remaining finding
  is the admin's gold focus shadow, which is outside Version B's scope.

**Accessibility (axe-core 4, WCAG 2.2 AA + best practice): 0 violations**
- Pages: `/de` at 1440 and 390, `/tr` at 390, legal, 404.
- Interactive states: song playing + dock, lightbox, mobile menu, booking
  errors, consent dialog.
- Keyboard order is logical, and focus is visible everywhere (chalk on
  deck, ink on the setlist paper).

**Lighthouse (mobile, simulated throttling, `/de`)**
- Accessibility 100, Best Practices 100, SEO 100, Performance 88.
- CLS 0, TBT 30 ms, FCP 0.9 s, Speed Index 1.2 s.
- LCP (the gold signature) is ~3.9 s simulated. Hydration dominates it;
  the page is visually complete at 1.2 s.

**Journeys (Playwright, local production build, no bookings sent): 18/18
pass**
- play from the setlist → the dock appears
- only one song plays at a time
- seek slider on the active row
- no download links or native controls
- line-up cards present, no stage plot
- lightbox: keys, Esc, focus returns
- booking: validation and live preview
- DE→TR switch keeps `#band`, with correct Turkish capitals
- mobile menu: open, Esc, navigate
- no overflow while playing

**States checked with temporary sample data (never committed)**
- The shows list: long names, "Datum folgt", past shows.
- The booking fallback screen. The local server has no mail or database
  channel, so nothing was sent.

**Live data (Vercel preview of `95e2a57`, production Supabase, read-only)**
- 6 songs, 8 members incl. "Mika El Jackson" and "Tan – Percussion", 9
  gallery images, no shows.
- No broken images and no errors. No overflow at 1440, 390 or 320.
- Live member photos are 1122–3024 px wide and render sharp in the
  monochrome treatment.

**Layout**
- No horizontal overflow at 320 / 390 / 768 / 1024 / 1280 / 1440 px.

**Impeccable finish reviews (fresh reviewer each time)**
1. Build review: `fix`, 8 material fixes. Two verdict rounds, then one
   self-measured regression fix.
2. Final ship review after the line-up change: `fix`, 8 items. All
   addressed:
   - one photo treatment for the line-up
   - distinct gallery frames in the fallback
   - no green icon tile on the booking result
   - date-picker icon visible
   - seed key and header decision recorded
   - live line-up evidence captured
   - live photo resolution confirmed

   These fixes are verified by measurement and captures, not re-scored by
   the reviewer.

**Assets**
- Every shipped raster carries an embedded origin note (`impeccable
  embed-prompt --scan` → 0 missing). Band photos and the logo are
  owner-supplied.
- The new share image and the icons were composed from the site's own
  tokens, fonts and the owner's photo. None were AI-generated.

**Screenshots in [`version-b/`](version-b/)**
- `de-{320,390,768,1024,1440}-{fold,full}.jpg`
- `tr-{390,1440}-*.jpg`
- `legal-en-390-*.jpg`
- `live-*.jpg` (live data)
- `journey-*.png`
- `state-shows-sample-data-1440.png` (sample data)
- `state-booking-fallback-390.png`
- `share-image.jpg`

## 5. Open points (content, for the owner in Admin — no code needed)

- **Owner review** on the Vercel preview. Preview deployments use
  production Supabase and Resend, so **do not send test bookings there**.
- The live gallery (Admin → Media) repeats frames:
  - the singer photo appears twice
  - the band collage is also the Termine poster

  Removing the duplicates makes the contact sheet stronger.
- Line-up slot 8 (live: "Tan – Percussion") and the live bio typos
  ("Frontman -", "Posaunen Sound", missing final periods): Admin → Members.
- Song titles without diacritics in the DB (e.g. "Cilgin"): the site shows
  the canonical spelling, but fixing them in Admin → Music is cleaner.
- The Hechingen wording, still in the JSON-LD location and the booking
  "Basis" row: confirm it.
- Real platform links (Admin → Platform links) and song covers
  (Admin → Music).
- Optional design ideas the reviewer listed as "ceiling", not required:
  - hand-marker lettering on the setlist
  - torn tape ends
  - consistent tape on every section heading
- Going live = merge this branch into `main`. That is the owner's decision
  and has not been done.
