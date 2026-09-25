---
version: 1
slug: "src-app-locale-site-page-tsx"
primary_target: "src/app/[locale]/(site)/page.tsx"
related_targets: ["src/app/[locale]/(site)/layout.tsx"]
---

# Surface brief — public one-pager (/[locale]) + legal pages

Scope: public site (home, legal, 404, player dock, consent). Mode: Persuade.
Audience: bookers/promoters first (phone, few minutes), fans second.
Action: hear a demo within one tap; send a booking request.
Proof on hand: 6 demo MP3s, real photos, live Supabase line-up, band texts.
Constraints: PRODUCT.md; no invented dates, names never hard-coded, booking@ only.
Build path: code-led (no image generation in this environment).

## Direction contract

THESIS: The site is the evening seen from the stage: the line-up is a stage plot, the songs are the setlist taped to the floor, booking is the rider. It refuses the category default of a full-bleed moody band photo with a big name and a tour-date list (and Version A's sepia/serif/gold).

OWN-WORLD: Matte stage-deck black ground; chalk-white gaffer tape as the label surface with black printed text; spike-tape colours with fixed roles (orange = the one primary action/booking, pink = audio/now playing, green = line-up positions, blue = dates). Big Shoulders Display (heavy, upright stage-signage caps) for display, Schibsted Grotesk for body, Martian Mono for times, durations, counters and rider data. Square corners, 2px tape strips, thin white plot lines, no gradients, no glow, no rounded cards. Gold appears only in the signature logo.

STORY: Visitor sees the band's own setlist and one tap plays "Sen Benim"; believes eight musicians with a brass section play Turkish lyrics over funk/bluesrock; meets each musician on the stage plot; checks dates; sends a rider-style request whose preview they read before sending.

FIRST VIEWPORT: Desktop: header strip (gold signature left, mono nav, orange Booking tape right). Left 7 columns: the headline set as three gaffer-tape strips (Smooth. / Exzeptionell. / Funk. — the last on orange), genre line in mono, one-sentence description, CTAs (pink "Sen Benim anhören" play control, orange "Booking anfragen"). Right 5 columns: a real colour stage photo plate with the setlist sheet (chalk paper, taped with two pink strips, slightly rotated) overlapping its lower-left corner, listing all six songs with mono durations; each row plays. Mobile: signature, tape headline, CTAs, then setlist full width, photo behind it cropped to a band.

FORM: Tour rider / stage plot / setlist (candidate 4 of 7 on my ordered list: 1 Anadolu 45s, 2 soul-jazz LP sleeves, 3 letterpress gig poster, 4 rider & stage plot, 5 mixing console, 6 horn charts, 7 backstage laminates). Seed key f20ee826. Raises: one shared clock (live analyser pulses setlist row, dock and stage-plot marks — from algorave); request preview before sending (darkroom test strip); exactly one framed primary action (deco); text fields stay achromatic, colour only on tape and state (cloud).

Signature interaction: while a song plays, the live Web Audio level drives the pink "now playing" tape and the stage-plot position marks (bounded, off under reduced motion). Motion grammar: tape strips are laid (scaleX from the left, 420ms, staggered) once as they enter; everything else fades up 16px; no bounce.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Build decisions (recorded after the first finish review)
- Third tagline strip is pink (audio role), orange stays booking-only.
- The admin hero image (band collage, must stay whole) is the band poster in Shows; the first viewport's photo plate is the live colour photo `public/assets/band-cards/typhoon-band-card.jpg`.
- Booking section sits on deck black; orange = heading tape + submit.
- Header at rest on the home page shows no small signature: the big hero signature is the mark in the same viewport (one logo per view); the header logo fades in once the hero has scrolled away and is always shown on other pages.
- Line-up photos get one monochrome treatment (grayscale + contrast) so colour snapshots and sepia crops read as one set.
- Owner 2026-09-25: "Die Bühnen-Aufstellung ist hässlich und stimmt nicht, wir haben keine feste Bühnen-Aufstellung." The stage plot is removed; the line-up is a row of taped member cards (photo, name on gaffer, role on green tape, bio). Never show stage positions.

## Unresolved
- Line-up slot 8 (live DB: Tan – Percussion) — rendered from data, no copy change.
