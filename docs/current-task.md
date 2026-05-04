# Current Task – Strict UI + Old Content Completion Fix

## Goal

The deployed frontend is better, but still not acceptable.

This batch is a strict correction batch. Do not add new backend features. Do not expand Admin/Shop. Do not redesign freely.

Main goals:
1. Match the Claude Design handoff exactly, especially Header/Hero.
2. Add/restore the missing old website content and agreed project information.
3. Fix demo player overflow and preserve the visual waveform.
4. Fix Booking layout.
5. Fix legal pages to match the planned website content/style.

## Source of truth order

1. Claude Design desktop HTML and mobile HTML for visual layout.
2. `docs/14-old-site-content-and-ui-fix.md` for missing content and current correction notes.
3. Existing repo assets.
4. Existing current implementation only if it does not conflict.

If current code differs from Claude Design, Claude Design wins.

## Strict scope

Do not implement:
- full Admin CRUD
- shop
- analytics
- external embeds
- consent banner
- new backend features beyond current foundation

Keep:
- existing Supabase/Resend foundation
- existing audio provider/waveform behavior
- current assets unless a clear replacement exists

## Required fixes

### 1. Header/Hero must match Claude Design

Current problem:
- Typhoon signature in header is too low.
- Hero image is not in its own block and not fully/cleanly visible.
- Text, image and signature are not structured like Claude Design.

Required:
- Rebuild Hero to match Claude Design structure closely.
- Text, image and signature must be separate visual blocks/layers exactly as in Claude Design:
  1. text block
  2. hero image block
  3. signature/logo block
- Header logo must sit exactly where Claude Design places it.
- Do not let header signature drift down.
- Hero image must be fully/cleanly visible according to Claude Design, not treated as a random background crop.
- Do not invent extra hero layout.

### 2. Old/agreed content must be added

Use `docs/14-old-site-content-and-ui-fix.md`.

The page currently lacks the quality and content depth we planned. Add the agreed band information, functions and sections, but keep the Claude Design layout.

### 3. Demo player overflow

Current problem:
- Demo song player rows leave the screen on the right.

Required:
- Fix all mobile overflow.
- The demo row must stay inside the viewport.
- Waveform must be visible but clipped/scaled inside the card.
- Use `min-width: 0`, `overflow: hidden`, responsive bar count or CSS clamp if needed.
- No horizontal scrolling.

### 4. Booking

Current problem:
- Booking form does not match the old planned website.
- Image next to form should use the band image with signature from gallery assets.

Required:
- Booking form must follow Claude Design style.
- Next to the form, use the gallery asset that shows the band image with Typhoon signature.
- If filename is unclear, inspect gallery assets and choose the image with band/signature.
- Keep booking contact details visible.
- Keep existing backend fallback behavior.

### 5. Legal pages

Current problem:
- Impressum/Datenschutz/Cookies do not fit the old website/planned content/style.

Required:
- Legal pages must visually match the website style.
- Impressum must contain the correct initial data:
  Mika Hertler
  Am Schwarzen Steg 5a
  95448 Bayreuth
  Deutschland
  info@typhoon.band
  +49 176 64472296
- Datenschutz and Cookies must be clear placeholder/legal drafts, styled consistently.
- Do not claim final legal certainty.
- Keep separate routes.

## Before finishing

Run:
```bash
npm run lint
npm run build
```

Fix all errors.

## Final summary

Report:
1. Header/Hero fixes
2. old/agreed content added
3. demo player overflow fix
4. booking image/form fix
5. legal page fixes
6. files changed
7. lint/build result
8. remaining gaps vs Claude Design
