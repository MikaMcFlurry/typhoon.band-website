# Recon: typhoon.band-website — /docs + /handoff (main @ 740ff46)

Read-only forensic recon. Repo: `/home/user/typhoon.band-website` (LIVE on typhoon.band). All paths are relative to the repo root unless stated.
Other branches checked: `origin/claude/typhoon-website-redesign-7xjozt` (identical to main, zero diff) and `origin/claude/phase-06-legal-seo-consent-platforms` (commit `0cd76d0`, **NOT merged** into main, 32 files / +2783 lines).
Deleted owner-fix docs were recovered from git history with `git show <commit>^:<path>` (they are the richest source of owner complaints, see section 5).

---

## 0. TL;DR for the redesign

- **Owner intent:** a premium, cinematic, dark sepia/antique-gold band site. Real hero collage, with the handwritten gold "Typhoon" signature PNG as an overlay layer. A compact onepager. A custom audio player with a live waveform. Booking is the most important function. Admin/Supabase/Resend stay behind it.
- **Most repeated complaints:**
  1. Horizontal overflow on mobile, and mobile looking like a different or broken site.
  2. The hero image getting cropped or covered.
  3. The signature sitting in the wrong place.
  4. The player and buttons looking "billig/altbacken/Plastik".
  5. Dead or non-functional controls.
  6. Booking image cropped.
  7. Wrong facts: Taifun, Daniel, Jürgen shown as sax, `info@typhoon.band`, fake dates.
  8. Placeholder badges.
- **Handoff data is FAKE placeholder content.** This includes names like "Taner Yücel", Istanbul shows, song titles like "Find A Way", `typhoonband.com` emails, a `+90` phone number, an AGB link and "© 2024". Never reuse it as facts.
- **Roadmap status:**
  - Done on main: phases 01, 01b, 02, 03, 03b, 04 (booking + shows), 05, 05-fix, 05b and the placeholder-badge fix.
  - Built but not merged: phase 06 (legal/SEO/consent/platform links), on its own branch. `docs/current-task.md` still points at phase 06.
  - Not started: 04 generic content CRUD (only partly covered), 07 shop preparation, 08 launch hardening.

---

## 1. Owner intent, goals, non-negotiables, anti-goals

### 1.1 Goals (verbatim)

`docs/00-project-source-of-truth.md`:
> The finished website must be a professional, self-hostable, secure band website with:
> - public onepager - legal pages - local/demo audio playback - gallery/media - shows - booking request flow - protected Admin area - Supabase backend - Resend booking email - future shop readiness for merch, tickets and albums

> Production domain: `typhoon.band`, `www.typhoon.band`

> The user will finalize texts, images and audio later inside Admin. Therefore current repo data and assets are not final content. They are only fallback/seed content.

> Content source order: 1. Supabase published/visible records 2. Static fallback data from src/data/* 3. Static fallback assets from public/assets/*

> Do not scan Supabase Storage folders directly for public content. [Correct flow:] Admin uploads file to Supabase Storage → Admin creates/updates DB record → Admin publishes record → Frontend reads published DB record → Frontend uses asset URL stored in DB record

`docs/00-start-here.md`:
> Do not copy old failed frontend implementations from previous branches/repos. Do not reinterpret the design into a generic band website.

`docs/phases/01-booking-content-foundation.md`:
> **Booking is the most important production function.**

`docs/phases/06-legal-seo-consent-platforms.md`:
> Important user requirement: As soon as Admin inserts a link for an external platform, that platform link should automatically appear on the website.

`docs/02-design-handoff-instructions.md` (onepager compaction):
> The onepager must not become exhausting. Use compact/reveal behavior:
> - Band intro short first, longer text behind "Mehr über Typhoon"
> - Members: preview first 4, reveal all 8
> - Demos: featured + first 3, reveal all 6
> - Shows: compact TBA/upcoming module
> - Booking/contact visible directly, not hidden

Visual identity, from the sibling repo `/home/user/typhoon.band/CLAUDE.md` (same owner; durable brand brief):
> The website must feel like a premium cinematic band website: dark black / dark brown base; warm sepia atmosphere; elegant real gold, not yellow; smoky concert-poster look; modern smooth UI; large dramatic hero image; handwritten Typhoon logo as an overlay layer above the hero image; music, live energy, bluesrock/funk/soul atmosphere; raw but elegant
> Avoid: generic card website; harsh yellow; flat orange; sharp rectangular boxes everywhere; cheap grunge overload; Impact-like cheap typography; unnecessary UI libraries; Bootstrap / Material UI / shadcn unless explicitly requested
> The logo is the decorative script element. Do not fake this with a cheap display font.

### 1.2 Non-negotiables (verbatim)

`CLAUDE.md` (repo root):
> - No secrets in frontend. - No service role key in browser. - Supabase RLS is mandatory. - Admin routes must be server-protected. - Uploads must be validated server-side. - Resend API key must be server-side only. - No external embeds without consent. - No analytics without consent. - No download buttons for demo audio. - README.md, .env.example, .gitignore and docs must stay updated.

> Before finishing any implementation batch: `npm run lint` / `npm run build`

`docs/02-claude-workflow.md`:
> Public site must stay online if Supabase/Resend env vars are missing. Missing env must not cause homepage 500 errors.

`docs/13-audio-player-source.md`:
> Final player goal: Looks like Claude Design. Behaves like old Claude branch.

The required provider behavior is:
- A single shared `HTMLAudioElement`.
- State: `currentId, isPlaying, progress, duration, position`.
- Methods: `toggle(id, src)`, `seek(id, ratio)` and `getAnalyser()`.
- A lazy `AudioContext`, with `MediaElementAudioSourceNode` feeding an `AnalyserNode` at `fftSize = 256`.
- Pause the previous track when another one starts.

The required waveform behavior is:
- Deterministic idle bar heights, seeded from the song id.
- Live FFT bars while playing.
- Played bars in champagne; unplayed bars in muted gold/bronze.
- A smooth return to idle when paused.

There must be no download button, no native controls, no external player and no Spotify/SoundCloud embed.

Behavior source: repo `MikaMcFlurry/typhoon.band`, branch `claude/typhoon-premium-redesign-x01JL`, files `src/components/audio/AudioPlayerProvider.tsx` and `src/components/audio/Waveform.tsx`.

`docs/fixes/phase-05b-member-audio-fixes.md`: `audio.crossOrigin = "anonymous"` must be set **before** `el.src = src`, otherwise Supabase-hosted MP3s play silently through the Web Audio graph. If the analyser fails, playback must still work.

`docs/10-dsgvo-consent.md`:
> Preferred: no analytics; no tracking pixels; no external embeds; **no external fonts**; local audio; local images

This conflicts with the handoff, which loads Inter from Google Fonts. Self-host the fonts.

`docs/phases/08-launch-hardening.md` — "Do not launch if":
> booking sends to wrong email; admin is public; service role appears in client; legal pages are missing; mobile layout broken; audio downloads exposed

`docs/09-assets-audio-gallery.md`:
> other members can use premium placeholders until real images exist; do not invent wrong member photos; **do not show ugly placeholder badges**

### 1.3 Anti-goals / "do not" (verbatim)

`docs/02-design-handoff-instructions.md`:
> Do not treat the handoff as loose inspiration. Do not invent a new look. Do not copy old failed designs. **Do not create generic cards/buttons.** Do not change the approved visual hierarchy.
> Gold must be antique/champagne, not yellow.

`docs/00-project-source-of-truth.md` (approved-frontend freeze; this governed phases 01–06):
> Do not change: hero layout, mobile/desktop layout, audio player visual style, button style, member cards, gallery design, booking layout, typography/color system

Note: the user's new request explicitly asks for a **new, better design on an independent branch**. The freeze was a per-phase rule for backend batches, not a ban on this redesign. Still, it tells us the owner was, in the end, happy with the dark/gold/sepia language, the hero composition and the player. Evolve it; don't discard it.

`docs/phases/07-shop-preparation.md`:
> Do not implement full shop/payment unless explicitly requested. No premature payment integration.

`docs/phases/06-legal-seo-consent-platforms.md`:
> This is not legal advice. Use plain textarea/Markdown-like text only. No rich text editor. No AI legal generation. Do not claim GDPR compliance as guaranteed.

---

## 2. Roadmap / batch plan status

Roadmap (`docs/01-roadmap.md`): phases 01 → 08, one branch/PR per phase, commit format `Phase XX: short description`. `docs/11-batch-plan.md` is the older 6-batch plan; the roadmap supersedes it.

| Phase | File | Status on main | Evidence |
|---|---|---|---|
| Frontend foundation + UI fix rounds (pre-roadmap) | docs/14, v5, v6 (deleted) | DONE | `6b04cb4`, `d7b26ba`, `8945b17`, `d156778`, `02619d0`, `c2b449a`, `356d3e1`, `74055b9` |
| 01 Booking + content foundation | phases/01 | DONE | `02acaaa`, PR #5 |
| 01b Booking email design | phases/01b | DONE | `fe60325`, PR #6 |
| 02 Supabase schema/RLS/storage | phases/02 | DONE | `64961ac`, PR #7 |
| 03 Admin auth + dashboard | phases/03 | DONE | `6110e12`, PR #11 |
| 03b Initial admin password flow | phases/03b | DONE | `f885fe4`/`175c9b6`, PR #10 |
| 04 Booking workflow + shows admin | phases/04-booking-shows-workflow | DONE | `16569b6`, PR #12 |
| 04 Admin content CRUD (generic) | phases/04-admin-content-crud | **NOT done as a phase** | No hero/band-info/site-settings text CRUD. Shows CRUD (04) and member text (05 fix) cover only part of it. |
| 05 Admin media + audio uploads | phases/05 | DONE | `312db28`, PR #13 |
| 05 fix (direct upload, member editing) | docs/phase-05-upload-member-fixes.md | DONE | `753661a` |
| 05b member/audio fixes | fixes/phase-05b | DONE | `80d116f`, PR #14 |
| Placeholder badge fix | — | DONE | `4cf812b`, PR #15, 2026-06-17 (latest on main) |
| **06 Legal/SEO/consent/platform links** | phases/06 = `docs/current-task.md` | **Built on branch `origin/claude/phase-06-legal-seo-consent-platforms` (`0cd76d0`), NOT merged → not live** | Adds `/admin/legal`, `/admin/seo`, `/admin/platform-links` and `/admin/consent`. Adds the consent key `typhoon.consent.v1` `{v,necessary,external_media,decided_at}`. Adds `ExternalMediaGate` and migration/policy `0006_*`. Doc: `docs/admin-legal-seo-consent-platforms.md` (branch only). |
| 07 Shop preparation (merch/tickets/albums) | phases/07 | OPEN | Only a data model proposal, placeholders and payment-provider notes are expected. |
| 08 Launch hardening | phases/08 | OPEN | Checklist items (verbatim): Vercel domain, www/root redirect, SSL, env vars, booking test, RLS review, admin access, no secrets in frontend, legal review, cookie behavior, mobile Safari, audio playback, media viewer, Lighthouse, image/audio sizes, SEO metadata, OpenGraph, sitemap/robots, 404 page, broken links. |

Planned Admin modules (`docs/07-admin-scope.md`):
> Dashboard, Startseite, Band, Mitglieder, Musik, Galerie, Videos, Shows, Booking, Plattformen, SEO, Rechtliches, Einstellungen, Admin-Nutzer

Roles:
- `owner` — everything, including legal pages and admins.
- `admin` — content, songs, media, shows, booking view, SEO and platform links.
- `editor` — prepares content only; no publish, delete, legal, booking or admin management.

Booking status set (phase 04): `new, read, answered, accepted, converted, rejected, archived, spam`.
- Soft delete sets `deleted_at` and `status='archived'`.
- Convert-to-show links `booking_requests.converted_show_id` ↔ `shows.source_booking_request_id`.
- Public shows are those with `is_visible AND is_published`.
- TBA is supported: `starts_at` is nullable and there is an `is_tba` flag.

---

## 3. Claude Design handoff — visual language (handoff/)

### 3.1 Files and what they are

- `handoff/CLAUDE.md` is the handoff protocol (German):
  > "Frontend 1:1 übernehmen, textliche Inhalte anpassen, alle Verlinkungen setzen, Backend anschließen." / "Frontend ist EINGEFROREN"
- `handoff/desktop.html` has a 1440 viewport. `handoff/mobile.html` has a 390 viewport. Both are static.
- `handoff/index.html` is a React/Babel "DesignCanvas" wrapper that shows the desktop and mobile artboards.
  - It references `design-canvas.jsx`, `assets/typhoon-mockup-desktop.png` and `assets/typhoon-mockup-mobile.jpeg`, which are **not in the repo**.
  - Canvas subtitle: "Desktop & Mobile · matched to mockups · custom audio player · 8 members · 6 demos".
- `handoff/assets/typhoon-shared.css` holds the tokens, buttons, panel and waveform styles.
- `handoff/assets/typhoon-data.js` holds **placeholder** content (see 3.9).
- `handoff/assets/typhoon-app.js` is a vanilla render layer.
  - It sorts by `sortOrder` and filters `visibility !== 'hidden'`.
  - Its audio is a mock timer (no real audio), with click-to-seek.
  - It builds a deterministic waveform: `h = 6 + r^1.6 * 26 px`, where r is seeded by char-code sum × sin.
  - Booking has frontend validation plus the `hp_field` honeypot. The toast reads "Danke! Wir melden uns innerhalb 48h."
  - Includes a burger drawer.
  - `renderDemos()` targets `#demo-list`, but **no demo list exists in either HTML**. The 6-demo list was added later by the implementation.

### 3.2 Design tokens (actual `typhoon-shared.css`, which is authoritative)

```css
--bg:#030201; --bg-brown:#060403; --warm-dark:#100a06; --panel:#0b0805; --panel-strong:rgba(11,8,5,.94);
--bronze:#6f4a1f; --deep-gold:#b8873b; --gold:#c79a4b /*antique*/; --gold-soft:#e8c982 /*champagne*/;
--cream:#f2e6cf; --muted-cream:#c9bda5; --muted:#b9aa90;
--line:rgba(232,201,130,.22); --line-strong:rgba(232,201,130,.42);
--radius-card:8px; --radius-button:7px; --container:1280px;
```

- The same palette is repeated in `docs/02-design-handoff-instructions.md` under the names Deep black, Brown black, Warm dark brown, Panel black, Dark bronze, Deep gold, Antique gold, Champagne gold, Warm cream and Muted text (`#b9aa90`).
- `handoff/CLAUDE.md §4` lists slightly **different** values: `--cream:#f4ead3`, `--muted-cream:#b8a987`, `--muted:#6b5e44`, `--line:0.15`. The CSS file wins.

Body background:
- `radial-gradient(circle at 78% 12%, rgba(199,154,75,.13), transparent 30%)`
- `radial-gradient(circle at 20% 45%, rgba(111,74,31,.13), transparent 32%)`
- `linear-gradient(180deg,#030201 0%,#060403 48%,#030201 100%)`
- `background-attachment: fixed`

A dust/noise overlay sits on `body::before`: SVG feTurbulence, `baseFrequency .85`, opacity .06, `mix-blend-mode: overlay`, z-index 99.

Sepia image filter convention (all editorial photos, but **not** the signature PNGs): `filter: sepia(.32–.4) saturate(.78–.85) contrast(1.05–1.08)`. The hero adds `brightness(.78)`.

Spacing scale: 6/10/16/24/32/48/64 px. Card padding is 12–14px on mobile and 18–28px on desktop.

### 3.3 Typography

- **Headlines:** `Georgia, 'Times New Roman', ui-serif, serif`, weight 700, letter-spacing −0.02 to −0.04em. This covers the hero, audio title, show day numbers and drawer links.
- **UI/body:** `Inter, system-ui, sans-serif`, weights 300–700 (Google Fonts link; must be self-hosted per docs/10).
- **Labels/kickers:** Inter, uppercase, letter-spacing .14–.22em, 8–11px, weight 600. The colour is champagne `--gold-soft` or `--muted-cream`.
- **Handoff minimum sizes:** hero headline 38px mobile / 88px desktop (the actual desktop CSS uses **76px**). Body 11px mobile / 14px desktop. Tags 8–10px.
  - The tiny type (7–9px on mobile) is a known legibility weakness.
- The original concept mockup (`handoff/assets/typhoon-singer.jpeg`, see 3.10) used condensed caps sans for "SMOOTH. EXZEPTIONELL. FUNK." The approved handoff switched to Georgia serif.
- Reference screenshot `28403C65…png` uses an Impact-like condensed heavy face. The brand brief says avoid "Impact-like cheap typography".

### 3.4 Buttons

- `.btn`: inline-flex, gap 10px, padding `11px 22px`, Inter 600 uppercase, letter-spacing .14em, 11px, radius 7px.
- `.btn-primary`: `linear-gradient(180deg,#e8c982 0%,#b8873b 100%)`, text `#060403`, border `1px rgba(232,201,130,.55)`, shadow `inset 0 1px 0 rgba(255,255,255,.24), 0 8px 22px rgba(0,0,0,.28)`. Hover: `#efd396 → #c5933f`.
- `.btn-secondary/.btn-ghost`: bg `rgba(11,8,5,.5)`, text cream, border `1px rgba(232,201,130,.34)`. Hover sets border and text to gold-soft.
- Mobile tickets button: transparent, border `rgba(232,201,130,.55)`, gold-soft text, radius 5px, 10px caps.
- Owner reaction (v5, deleted doc): buttons "wirken noch altbacken". The v5 fix moved to pill radius, single-colour gold without a gradient, and round gold icon buttons (commit `d156778`).

### 3.5 Header

- **Desktop `.site-header`:**
  - Fixed, height 72px, z-index 1000, `pointer-events:none` (only the inner row is clickable).
  - Inner row is max 1180px with 32px padding and space-between.
  - Logo on the left: `typhoon-signature-gold-bold.png`, height 48px, `drop-shadow(0 2px 10px rgba(0,0,0,.8))`.
  - Nav on the right with gap 28px, links 11px uppercase, letter-spacing .18em, colour muted-cream. The active link is gold-soft with a 1.5px underline 6px below.
  - Items: Home, Band, Music, Termine, Media, Booking, News, Kontakt.
  - Anchors: `#home #band #musik #shows #media #booking #news #kontakt`. docs/02 prescribes `#home #band #music #shows #media #booking #contact`.
- **Mobile `.site-header-m`:**
  - 60px tall, 16px side padding.
  - Gradient bg `rgba(3,2,1,.7)→0`.
  - Signature 38px on the left, a 36px burger icon button on the right.
- **Drawer:**
  - `top:60px`, `rgba(3,2,1,.97)`, blur 20px, z-index 49.
  - Links in Georgia 26px bold with bottom lines. Order: Home, Termine, Band, Music, Media, Booking, News.
  - Owner later demanded a fully opaque drawer that covers the signature (see section 5).

### 3.6 Hero composition (logo overlay)

Desktop `.hero`:
- `min-height:620px`, **`overflow:visible`** so the signature can bleed out.
- bg: `radial-gradient(circle at 75% 30%, rgba(199,154,75,.2), transparent 38%)`, `linear-gradient(90deg,#030201,#050302 38%,#0c0805)`.
- **Image block** `.hero-image`:
  - Absolute, right 0, top 0, **width 62%**, height 100%, z-index 1.
  - The image is `hero-collage.jpeg` with `object-fit:cover; object-position:center top; filter: sepia(.4) saturate(.85) contrast(1.08) brightness(.78)`.
  - Left fade `::before`: `linear-gradient(90deg, #030201 0%, .85 8%, .35 22%, transparent 40%)`.
  - `::after`: a radial vignette plus a top/bottom fade.
- **Text block** `.hero-inner`:
  - Max 1180px, padding-top 132px, z-index 5. `.hero-copy` max-width 420px.
  - Title in Georgia **76px**, line-height .96, letter-spacing −.04em, 700, cream: "Smooth.<br>Exzeptionell.<br><span class=gold>Funk.</span>". "Funk." is in `--gold` #c79a4b.
  - Lede: 14px/1.6, muted-cream, max 360px.
  - CTAs: primary "▶ Listen now" → `#musik`, secondary "Book now" → `#booking`, gap 10px.
- **Signature block** `.hero-signature`:
  - `typhoon-signature-gold.png` (2099×724, transparent), absolute.
  - `right:-2%; bottom:-40px; width:700px; transform:rotate(-4deg); z-index:50; mix-blend-mode:screen; drop-shadow(0 8px 24px rgba(0,0,0,.85))`.
  - It **must sit above the player** (player z-index 20).
- z-stack: hero image 1 → vignette 2 → copy 5 → player 20 → drawer 49 → signature 50 → header 1000.

Mobile `.hero-m`:
- `height:540px`, padding-top 60px.
- Image at 70% width on the right, `object-position:30% center`, same filter.
- Vignette: left fade (1 → .9 at 18% → .35 at 38% → 0 at 55%) plus a vertical fade.
- Copy: absolute left/right 18px, top 100px, max-width 220px.
  - Title Georgia 38px.
  - Lede 11px, max 200px.
  - CTAs in a row with padding `9px 16px` and 10px text.
- Signature: `right:2%; bottom:-50px; width:70%; rotate(-4deg)`.
- Mobile lede says "klassischen Funk & Soul"; desktop says "türkischen Funk & Soul". Both are placeholder copy.

### 3.7 Featured audio player card (2-row layout)

The player is identical in visual language on desktop and mobile. It **overlaps the hero**: desktop `margin-top:-48px` (inside a 1180 container), mobile `margin:-36px 16px 0`.

Desktop `.audio-card`:
- `padding:18px 24px; background:rgba(11,8,5,.86); border:1px var(--line); radius 8px; box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 22px 44px rgba(0,0,0,.5); backdrop-filter: blur(10px)`.
- **Row 1** `.audio-top` is a grid `76px 1fr`, gap 18px:
  - Cover 76×76, radius 6px, line border, sepia.
  - Meta:
    - tag "Neuster Release Song": 10px, letter-spacing .22em, muted-cream caps.
    - title "Find A Way": Georgia 22px/700.
    - artist "Typhoon": 13px, muted-cream.
- **Row 2** `.audio-controls-row` is a grid `46px 36px 36px 1fr auto auto auto`, gap 16px, padding-top 14px, top border line. Its contents:
  - The play button: 46px circle with the gold gradient `#e8c982→#b8873b`, dark icon at 14px.
  - Prev and next ghost icons.
  - A waveform (`1fr`, height 36px).
  - The time "0:00 / 4:12" at 12px with tabular nums.
  - Volume, with a left border.
  - A "⋯" more button.
- Waveform bars: `width:3px; gap:2px; radius 1px`. Unplayed bars are `--bronze #6f4a1f`; played bars are `--gold-soft #e8c982`. 64 bars on desktop.

Mobile `.audio-card-m`:
- bg `.92`, radius 6px, padding `12px 14px`.
- Cover 56px.
- Tag 8px "Nächster Release · Single". Title Georgia 16px.
- Controls grid `30px 30px 1fr auto auto`: play 30px, next, wave (22px tall, 48 bars), time 10px, "⋯".

Later owner decisions (commit history):
- The "⋯" more-menu was **dropped** (`356d3e1`, 2026-05-09).
- Prev/next and volume were made functional (v6).
- The waveform must fill the full free width.

### 3.8 Sections (desktop / mobile)

All sections: desktop `.section` is max 1180px with `margin-top:28px`; mobile uses 16px padding and a 28px top margin.
- Section header: the kicker sits left (10px/9px caps, .22em, muted-cream). The link sits right: "Alle Termine ansehen →", "Mehr über die Band →", "Alle Videos & Bilder ansehen →", "Alle News ansehen →".

- **Termine**
  - Desktop: a 4-col grid, gap 10px. `.show-card` has bg `rgba(11,8,5,.6)`, a line border, radius 6px, padding `16px 18px` and a grid `auto 1fr`.
  - The date column has the day in Georgia 30px gold-soft plus the month in 9px caps, with a right border.
  - The info column has the venue (Inter 600 14px cream), the city (11px with a "◉" gold bullet) and the time (11px muted).
  - Desktop hides the Tickets button.
  - Mobile: a stacked list (limit 3), grid `44px 1fr auto`, day 26px, with an outlined **Tickets** button.
- **Band Mitglieder**
  - Desktop: 7 columns (the handoff has 7 members; the band has 8). Each card has a 1:1 photo, radius 4px, line border and sepia filter (hover scale 1.05), then the name (Inter 600 12px, centered) and the role (9px caps .16em).
  - Mobile: 7 columns, gap 5px, name 9px / role 7px. Very tiny.
- **Media**
  - Desktop: 7 square tiles, gap 8px, radius 4px, sepia. Video tiles show a 24px champagne play indicator bottom-left.
  - Mobile: 7 tiles, gap 4px, with the play indicator hidden.
- **Booking**
  - Desktop grid `1.45fr 1fr`, gap 10px.
  - The form box is a 2-col grid: Name | E-Mail, then Ort (full), Veranstaltungsdatum `type=date` (full) and Nachricht textarea (min-height 110px).
  - Inputs: bg `rgba(232,201,130,.04)`, line border, radius 4px, padding `12px 14px`, 13px text. Focus sets the border to gold and the bg to .07.
  - The side panel holds `singer-stage.jpeg` (sepia) plus a gradient. The **submit button "Booking anfragen" sits bottom-right in the image panel**, linked via `form="booking-form"`.
  - Hidden fields: `hp_field` honeypot and `consent=on`.
  - Mobile grid `minmax(0,1.4fr) minmax(0,1fr)`. The handoff §9 warns not to reset this to `1fr 1fr`.
- **News**
  - Desktop: 3 cards (96px thumb + tag in 9px gold caps, title in Inter 600 14px, excerpt 11px, date 10px).
  - Mobile: a list with a 60px thumb and a "›" arrow.
  - The owner never supplied news; there is no news in docs/03.
- **Footer**
  - Desktop grid `1.4fr 1fr 1fr .8fr`:
    - Brand: signature 56px plus a blurb.
    - Kontakt: mail, phone and location rows with gold icons.
    - "Folge uns": 32px round outlined social icons (Instagram, Facebook, YouTube, Spotify, Apple Music).
    - Legal: Impressum, Datenschutz, AGB in 10px caps.
  - Bottom line: "© 2024 Typhoon. Alle Rechte vorbehalten."
  - Mobile has 3 columns, with socials including Mail and TikTok.

### 3.9 Handoff placeholder content: DO NOT USE AS FACTS

From `typhoon-data.js`, `desktop.html` and `mobile.html`:
- `band.location 'Istanbul, Türkiye'`, `email 'info@typhoonband.com'`, `bookingEmail 'booking@typhoonband.com'`, `phone '+90 532 123 45 67'`.
- `handoff/CLAUDE.md` suggests `mailto:booking@typhoon-band.com`.
- featuredSong "Find A Way" (4:12, 'Aktueller Release · Single').
- songs: Find A Way, Anadolu Groove, Sıcak Rüzgâr, Boğaz Funk, Geceyarısı, Yol Sürüyor.
- shows: Zorlu PSM Studio Istanbul 24 MAI, Kulturfabrik Esch-sur-Alzette 07 JUN, Jolly Joker Ankara 21 JUN, Harbiye Açıkhava Istanbul 12 JUL (2025).
- members: Taner Yücel (Vocals/Keys), Ali Can (Trombone), Selim Sarı (Sax), Murat Öztürk (Trumpet), Emil Yılmaz (Guitar), Cenk Mercan (Bass), Burak Gürpınar (Drums). That is only 7 members.
- news: "„Find A Way" ist da!", "Zurück im Studio", "Sommer 2024 — Live!".
- The hero lede "Typhoon bringt den authentischen Sound des türkischen Funk & Soul auf die Bühne — energiegeladen, groovig und einzigartig."
- Footer blurb "Typhoon ist die türkische Funk & Soul Band, die seit Jahren die Bühnen … erobert."
- CTAs "Listen now/Book now".
- AGB link, Apple Music/TikTok icons, "© 2024".
- The photo filenames, however, are correctly mapped to the real people: `typhoon-vocals`, `mika-trombone`, `schack-sax`, `hardy-trumpet`, `bugra-guitar`, `stefan-bass`, `tom-drums`. `jurgen-guitar` is present but unused.

### 3.10 Handoff images (viewed)

- `hero-collage.jpeg` (1254×1254): the sepia/aged-paper band collage.
  - Arrangement: trumpeter (Hardy, sunglasses) top-left; drummer (Tom) top-center; bassist (Stefan, bald) top-right; sax player (Schack, white hair, glasses); trombonist lower-left (young man); the singer (Typhoon: white V-neck tee, sunglasses, mic) front-center in colour-ish; guitarists (Buğra with flat cap and beard; Jürgen, young and bearded) on the right.
  - Textured brown paper bands sit at the top and bottom. This is THE key brand image.
- `typhoon-signature-gold.png` / `-bold.png` (2099×724 RGBA): the handwritten "Typhoon" script in a champagne→antique gold gradient, with a long slanted underline stroke.
- `singer-stage.jpeg` (1391×956): a colour live photo of the singer in a white tee with sunglasses and mic. The background is a red/black festival banner, with a drummer in a straw hat behind. Used in the booking panel.
- `typhoon-singer.jpeg` (733×471) is **actually the original concept mockup**, not a singer photo. It matches the canvas "Reference · Desktop mockup" 733×471. It shows:
  - A dark sepia hero with a gold script logo top-left.
  - Nav: HOME BAND MUSIC TOUR MEDIA CONTACT, plus Instagram/YouTube/Spotify icons.
  - The headline "SMOOTH. EXZEPTIONELL. FUNK." in condensed caps, with FUNK in gold.
  - Copy: "Typhoon – die türkisch-funk & soul Band aus Leidenschaft, Groove und Energie."
  - Buttons "LISTEN NOW" (gold) and "LIVE ERLEBEN" (outline).
  - The collage on the right with the huge gold signature overlay.
  - A bottom strip: a "NEUER TRACK / Find A Way / LISTEN NOW →" vinyl-cover card, "NÄCHSTES KONZERT 24.05.2025 Hamburg – Knust" and an "ALLE TERMINE" outline button.
- `trombone-fan.jpeg` == `trombone-festival.jpeg` (identical md5 `54898b86…`, 3024×4032, 2 MB): a close-up wide-angle festival selfie of Mika (backwards cap, white "Birdland" tee, trombone, crowd). It is not sepia.
- `members/*.jpeg` are **really PNG files** (RGBA) with a `.jpeg` extension, at low resolution (251–376 px wide). They are crops of the hero collage:
  - bugra 251×451, hardy 314×376, jurgen 339×527, mika 276×376, schack 339×477, stefan 376×502, tom 351×351, typhoon-vocals 376×564.
  - They are too small for large cards; they need upscaling or better source photos.
- Live public assets (outside the handoff, for reference):
  - `public/assets/gallery/gallery-1..8.jpg` (8 gallery images; gallery-3 is "the band photo with the gold Typhoon signature" per commit `8945b17`).
  - `public/assets/band-cards/mika-band-card.jpg` and `typhoon-band-card.jpg`.
  - `public/assets/audio/demos/` holds `Sen-Benim.mp3, karanfil-demo.mp3, gece-yine-dustun-demo.mp3, farksilin-demo.mp3, cilgin-demo.mp3, bir-tek-sen-demo.mp3`. docs/09 expected the names `sen-benim.mp3, karanfill.mp3, …`; the real names differ.

### 3.11 docs/*.png screenshots (viewed)

All were uploaded in `293997b` (2026-05-05) alongside design-fix v5. The v5 doc names its reference images; the UUID→name mapping below is **inferred from content**.

| File | Inferred v5 name | What it shows |
|---|---|---|
| `B37293F2-5D0C-49EF-983D-E603221696EA.png` (2048×886) | `desktop-soll.png` (TARGET) | The rendered handoff desktop hero. Small gold script logo top-left. Nav HOME (gold, underlined) BAND MUSIC TERMINE MEDIA BOOKING NEWS KONTAKT, letter-spaced. Huge serif "Smooth. / Exzeptionell. / Funk." (Funk in gold) on pure black on the left. Sepia collage on the right with a soft left fade. Big gold "Typhoon" signature diagonally bottom-right, bleeding onto the player card. "▶ LISTEN NOW" gold button plus "BOOK NOW" outline. The top of the player ("NEUSTER RELEASE SONG / Find A Way") is visible. |
| `B8CDF09E-9727-496D-B274-2BCAFDEA0C06.png` (2047×935) | `desktop-2-soll.png` (TARGET) | Scrolled view: the hero bottom, then the player card (cover, tag, title "Find A Way", artist, gold round play, prev/next, bronze waveform about 40% of the width, "0:00 / 4:12", volume, ⋯). The signature overlaps the card's top-right. Below: "TERMINE" kicker + "ALLE TERMINE ANSEHEN →", then 4 show cards (24 MAI Zorlu PSM Studio Istanbul 20:30 Uhr, and so on; placeholder data). The browser status bar shows a claudeusercontent.com design-project URL. |
| `2A9B5A8F-337A-4439-953E-F68282E55656.png` | `player-example.png` (TARGET) | A close-up of the featured player card. Note the waveform only fills about 35% of the row; the owner later demanded it fill the full free width. |
| `AA4180EB-3BCA-404B-A3E0-43E12E8A19E0.png` | `player-aktuell.png` (NEGATIVE) | The "DEMOS" list as implemented. Rows 01–05 (Sen Benim, Karanfil, Gece Yine Düştün, Farksilin, Çılgın), each a bordered full-width card with number, big gold play circle, serif title and a tiny isolated waveform in the middle. Lots of dead space. This is the "zu billig, zu leer … wirkt wie Liste" complaint. |
| `28403C65-F334-4314-BAAB-37292E8091D8.png` | `band-info-example.png` (TARGET layout) | Editorial split. Left: a colour live photo of the singer (singer-stage) with a thin border. Right: a small gold kicker "TYPHOON", the headline "AMERIKANISCHES FEELING. EUROPÄISCHE SEELE. TÜRKISCHE TEXTE." in **white condensed heavy caps (Impact/Anton-like)**, the body "Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und eine erfahrene Band, die live sofort zündet." and an outline button "MEHR ÜBER DIE BAND". This looks like the style of the older typhoon.band site/repo. |
| `7628D137-9DD1-4C29-8998-69A4BB23E475.png` | `band-info-aktuell.png` (NEGATIVE) | "ÜBER TYPHOON" kicker, then one large bordered panel: a gold genre line "BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK", a big serif paragraph ("Typhoon präsentiert einen kraftvollen Mix …") and a small secondary paragraph. The complaint: a large text box, no image. |
| `AD570CF8-67E2-47E2-B15A-F500A6A35345.png` | `band-card-example.png` (TARGET layout; content has errors) | "BANDMITGLIEDER" in condensed heavy caps. There are 4 large bordered cards; each has a photo, a bold name, the instrument and a 2-line bio. The cards are: Mika (festival selfie) · **"Taifun"** Gesang (singer-stage photo) · **"Jürgen – Saxophon"** placeholder panel ("SAXOPHON / FOTO FOLGT") with a "PLATZHALTER" pill · Hardy Trompete placeholder with a "PLATZHALTER" pill. These wrong names are exactly what the owner later banned. |
| `E54866E5-3C09-438C-BA76-965F477610D2.png` | `band-card-aktuell.png` (NEGATIVE) | "BAND MITGLIEDER": 8 small square sepia photos in one row, with name + caps role below: Typhoon GESANG, Mika POSAUNE, Schack SAXOPHON, Hardy TROMPETE, Stefan FUNK-BASS, Tom SCHLAGZEUG, Buğra GITARRE, Jürgen GITARRE. The names are correct, but the owner found it "nur Bild, Name, Instrument … zu wenig hochwertiger Card-Charakter". |

---

## 4. Content facts (verbatim `docs/03-content-facts.md`) + conflicts

```
# 03 – Typhoon Content Facts
## Band positioning
Typhoon combines: Bluesrock, Funk, Soul, Jazz, Southern Rock, Turkish lyrics, American-European sound, strong live energy, experienced musicians
## Main language
German. Prepared later: English, Turkish
## Hero
Headline:
SMOOTH.
EXZEPTIONELL.
FUNK.
Genre line:
BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK
Hero copy:
Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.
CTA labels:
Songs anhören
Live erleben
Booking Anfrage
## Members
There are exactly 8 musicians. Correct order:
1. Typhoon – Gesang
2. Mika – Posaune
3. Schack – Saxophon
4. Hardy – Trompete
5. Stefan – Funk-Bass
6. Tom – Schlagzeug
7. Buğra – Gitarre
8. Jürgen – Gitarre
Important: Typhoon, not Taifun. Schack is Saxophon. Jürgen is Gitarre. Daniel must not appear.
## Demo songs
Sen-Benim
Karanfill
Gece Yine Düştün
Farksilin
Çılgın
Bir Tek Sen
Rules: streamable; no download button; local MP3 playback; custom player with waveform visualization
## Contact
info@typhoon.band
booking@typhoon.band
+49 176 64472296
## Booking form fields
Name / E-Mail / Telefon optional / Veranstaltungsdatum optional / Ort / Art der Veranstaltung / Nachricht
Dummy/fallback notice: Booking-Versand wird im nächsten Batch angebunden.
## Imprint
Mika Hertler
Am Schwarzen Steg 5a
95448 Bayreuth
Deutschland
E-Mail: info@typhoon.band
Telefon: +49 176 64472296
## External platforms prepared
Spotify, YouTube, Instagram, Facebook, SoundCloud, Bandcamp
Rules: simple links are okay when URLs exist; no embeds without consent
```

### 4.1 Additional canonical content (from deleted fix docs; these texts are live on main)

About text, from `docs/14-old-site-content-and-ui-fix.md` (deleted in `21d842e`):
> Typhoon präsentiert einen kraftvollen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit amerikanisch-europäischem Sound. Selbstkomponierte Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen. Türkischsprachige Texte geben den Songs Tiefe und kulturelle Eigenständigkeit.
> Die Band steht für erfahrene Musiker, warme Live-Energie, starke Bläser, groovende Rhythmusgruppe und ein musikalisches Gesamtbild, das sich vom Mainstream abhebt.

Bandinfo headline and text, from `docs/typhoon-design-fix-v5.md` §4 (deleted in `6308d9d`):
- Kicker `TYPHOON`.
- Headline `AMERIKANISCHES FEELING. EUROPÄISCHE SEELE. TÜRKISCHE TEXTE.`
- Button `MEHR ÜBER DIE BAND`.
- Text:
  > Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet.

Member bios (v5 §5; identical in `src/data/members.ts` on main):
1. Typhoon – Gesang: "Frontmann, türkischsprachige Texte und direkte Energie im Zentrum der Band."
2. Mika – Posaune: "Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien."
3. Schack – Saxophon: "Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion."
4. Hardy – Trompete: "Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck."
5. Stefan – Funk-Bass: "Groovendes Fundament, präziser Druck und warme Tiefe."
6. Tom – Schlagzeug: "Treibender Puls, Live-Energie und rhythmische Stabilität."
7. Buğra – Gitarre: "Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung."
8. Jürgen – Gitarre: "Gitarrensound zwischen Rhythmus, Wärme und rockiger Kante."

Member content direction (docs/14):
- Typhoon: singer/frontman, expressive stage presence, Turkish lyrics, the band's central voice.
- Mika, Schack and Hardy: the brass section.
- Stefan: groove foundation. Tom: rhythmic drive.
- Buğra: "Turkish music/session experience may be mentioned carefully".

EN/TR hero copy (v6 §6):
- EN: "Typhoon blends Turkish lyrics with blues rock, funk, soul, jazz and southern rock — powerful, warm and full of live energy."
- TR: "Typhoon, Türkçe sözleri blues rock, funk, soul, caz ve southern rock ile birleştirir — güçlü, sıcak ve sahnede enerji dolu."

Booking messages (phase 01):
- Success: "Danke für deine Anfrage. Wir melden uns so schnell wie möglich."
- Backend-missing fallback: "Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden."
- Error: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut."

Booking email (phase 01b):
- Subject: "Neue Booking-Anfrage über typhoon.band". Header: "Neue Booking-Anfrage / Typhoon Website".
- Label on top: "TYPHOON BOOKING". Empty optional fields show "Nicht angegeben".
- Footer: "Diese Nachricht wurde über das Booking-Formular auf typhoon.band gesendet."
- From: `Typhoon Website <website@typhoon.band>`; To: `booking@typhoon.band`; Reply-To: the user's email.

Booking server validation:
- Required: name, email (valid), event_location, event_type and message.
- Optional: phone and event_date. The honeypot must be empty. Locale is stored.

### 4.2 Fact conflicts: resolve with the LATEST owner decision

| Topic | Older statement | Latest owner decision (wins) |
|---|---|---|
| Contact email | docs/03 and docs/10 imprint list `info@typhoon.band` | **`info@typhoon.band` does not exist.** v6 §10 (2026-05-07): "`info@typhoon.band` gibt es nicht … Nutze aktuell ausschließlich: booking@typhoon.band / +49 176 64472296 … Impressum: E-Mail ebenfalls auf booking@typhoon.band ändern". docs/00 and phases/01 say "Do not use info@typhoon.band". Live `src/data/site.ts` has booking only. |
| Song 2 spelling | docs/03 "Karanfill", docs/09 file `karanfill.mp3` | "Karanfil" (docs/00, docs/14; live title; file `karanfil-demo.mp3`) |
| Song 1 spelling | docs "Sen-Benim" | Live display title is "Sen Benim" (file `Sen-Benim.mp3`). Either form appears; the owner never objected to "Sen Benim". |
| Hero CTAs | Handoff "▶ Listen now" / "Book now" | German "Songs anhören", "Live erleben" (optional) and "Booking Anfrage" |
| Hero lede | Handoff "…türkischen Funk & Soul…" | docs/03 copy "Typhoon verbindet türkischsprachige Texte …" |
| Genre line | Removed by `d7b26ba` because it is not in the handoff | Present in docs/03 and docs/14 as content; used in the About panel |
| Members count | Handoff grid has 7 | Exactly 8 |
| Nav anchors | Handoff `#musik #kontakt #news` | `#home #band #music #shows #media #booking #contact` (docs/02) |
| Legal links | Handoff Impressum/Datenschutz/**AGB** | Impressum/Datenschutz/**Cookies** (`/de/legal/imprint`, `/privacy`, `/cookies`) |
| Placeholder badge | v5 allowed an optional "Platzhalter" label | docs/09: "do not show ugly placeholder badges". The June fix `4cf812b` hides the badge once a photo exists. |
| Shows | Handoff has fake dated shows | "Do not create fake real dates … TBA / Demnächst" (docs/14, v5). Real shows come from Admin/Supabase. |
| News | Handoff has a News section | There is no news content anywhere in the owner docs. Optional; must not be faked. |

---

## 5. Acceptance checklist (verbatim `docs/12-acceptance-checklist.md`)

- **Design:**
  - Frontend follows Claude Design desktop handoff.
  - Frontend follows Claude Design mobile handoff.
  - Previous failed frontend design is not copied.
  - Onepager remains compact.
  - Buttons/panels match handoff style.
  - Hero uses correct approved image/logo treatment.
  - No horizontal overflow.
- **Assets:**
  - Uploaded gallery assets are used in the gallery/media teaser.
  - Uploaded Mika band-card asset is used for Mika/Posaune.
  - Uploaded Typhoon band-card asset is used for Typhoon/Gesang.
  - Other members use clean premium placeholders until real photos exist.
  - Asset paths are documented.
- **Content:**
  - Correct band positioning.
  - 8 members listed/accesssible.
  - Typhoon is singer. Schack is saxophonist. Jürgen is guitarist.
  - Daniel does not appear. Taifun does not appear.
  - 6 demos listed/accesssible.
  - Booking/contact visible on homepage.
  - Legal pages exist.
- **Audio:**
  - Demo player retains Claude Design size/layout/style.
  - Waveform/audio behavior is copied/recreated from old Claude branch.
  - Local MP3 paths. Custom player. Waveform/audio visualization.
  - One song at a time. No download button. No external player/embed. No native browser controls.
- **Backend foundation:**
  - Supabase env variables prepared.
  - Supabase client/server helpers prepared.
  - SQL migrations exist. RLS policy files exist.
  - Admin shell/protection foundation exists.
  - Booking handler server-side. Resend server-side only.
- **Security:**
  - No secrets in frontend. No service role key in browser.
  - `.env.example` exists.
  - `.gitignore` blocks raw audio/project files.
  - No public write access implied.
- **Build:** `npm run lint` passes. `npm run build` passes.

The per-phase acceptance lists live in each phases/*.md file. The key functional ones to carry into the redesign are:
- Booking: honeypot, server validation, Supabase insert and Resend only when configured, no crash on missing env.
- Admin: server-protected, forced password change, booking detail/status/archive/convert-to-show, and shows CRUD.
- Uploads: direct-to-Storage with signed URLs; images JPG/PNG/WebP ≤10 MB; MP3 ≤50 MB; no SVG/GIF/HEIC/WAV/FLAC/M4A; German errors "Datei zu groß / Format nicht erlaubt / Upload fehlgeschlagen / Speichern fehlgeschlagen".
- Members: per-slug fallback merge; hiding one member hides only that member.
- Phase 06 (on its branch): legal/SEO/platform-link editors, consent banner with `external_media` category, `ExternalMediaGate`.

---

## 6. Owner complaints and feedback, chronologically (critical)

Sources:
- Deleted docs: `docs/14-old-site-content-and-ui-fix.md` (2026-05-04), `docs/prompt-ui-content-fix.md`, `docs/typhoon-design-fix-v5.md` (05-04/05), `docs/prompt-ui-bugfix-v6.md` and `docs/16-ui-bugfix-v6-exact-requirements.md` (05-07). All were deleted in commits `21d842e`, `8504465`, `6308d9d`, `b6ca1b7` and `20258a8` before the roadmap commit `64c345d`.
- Commit messages from `8945b17`, `d156778`, `02619d0`, `c2b449a`, `356d3e1` and `74055b9`.
- Existing fix docs: `docs/phase-05-upload-member-fixes.md` and `docs/fixes/phase-05b-member-audio-fixes.md`.

### Round 1: docs/14 (after the first fidelity pass)
> "The current implementation is visually closer, but not yet correct."
> "Header/Hero still diverges." — "Header signature/logo must not sit too low." — "**Hero must not be one blended background blob.** Hero must have separate visual blocks: 1. text block 2. image block 3. signature/logo block" — "The signature must be positioned exactly like Claude Design, not freely placed."
> Demo player: "**Demo rows overflow to the right.** … no horizontal scroll … keep visible waveform bars"
> Booking: "The image next to the booking form should use the gallery image that shows the band image with Typhoon signature … Do not use the wrong close-up image"
> Legal pages must "match website style; **not look like plain unstyled placeholders**"
> Shows: "Do not create fake real dates."

### Round 2: design-fix v5
> "**Aktuell ist Mobile komplett verschoben.**" — "Die mobile Ansicht darf nicht als eigenes anderes Design auseinanderfallen … **keine verschobenen, abgeschnittenen oder zufällig gestapelten Elemente**" — "Mobile muss wie eine hochwertige, kompakte Version der Desktop-Seite aussehen, nicht wie ein anderes Layout."
> Termine must sit **directly under the featured demo player**.
> Bandinfo: "zu großflächige Textbox; nicht wie das gewünschte Editorial-Modul; Bild fehlt …; typografisch zu wenig wie Soll". The target is image left, text right, and "nicht als riesige Textwand".
> Band cards: "nur Bild, Name, Instrument; keine Beschreibung; **zu wenig hochwertiger Card-Charakter**"
> Demo players: "**zu billig, zu leer, schlechte Button-Optik, Waveform zu klein/isoliert, Layout wirkt wie Liste, nicht wie Premium-Audio-Modul, teilweise Overflow nach rechts**" — "Der Player muss hochwertig, modern und musikalisch wirken." — "keine billig wirkenden Icon-Buttons"
> Buttons: "**Buttons wirken noch altbacken.** … keine billigen Verläufe, keine harten Schatten, kein Plastik-Look, keine altmodischen dicken Rahmen, subtiler Gold-/Champagne-Look, klare Hover-/Active-States, moderne Icons, konsistente Höhe, Radius und Innenabstände". The v5 button specs are:
> - Primary: gold/champagne fill, dark text, a subtle inner highlight, a soft shadow and no glow.
> - Secondary: dark background, a fine gold outline and warm white text.
> - Icon: round with a gold circle.
> Missing DE/EN/TR switch: "klein, hochwertig, nicht dominant".

### Round 3: UI bugfix v6 ("Dies ist kein allgemeiner Redesign-Batch")
1. Desktop hero: "der linke Rand des Hero-Bildes vom schwarzen Hintergrund/Overlay überdeckt. Das Bild muss aber vollständig sichtbar sein … Keine harte vertikale Kante". Signature: "ca. 5 mm nach unten, ca. 2 cm nach links" (translateX −70…−80px, translateY 18…22px), "nicht über dem Textblock".
2. Mobile hero: "nicht vollständig sichtbar … linke Teil ist abgeschnitten. Die Signatur sitzt zu hoch". It should "gerade so unten aus dem Bild herausragen", with "Keine harte untere Bildkante" (fade instead).
3. Mobile menu: "die Typhoon-Signatur ist weiterhin sichtbar; … sieht man Website-Inhalt im Hintergrund". It needs an opaque background and z-index 1000+.
4. On legal pages the header links must go to `/${locale}#section`.
5. "Cookies sind bisher nur Legal Page, aber kein Banner mit Bestätigung". The banner needs localStorage persistence and no tracking.
6. "EN und TR Routen existieren, aber Inhalte sind nicht wirklich übersetzt": they need real dictionaries.
7. Player: "Vor, Zurück, Lautstärke, Drei Punkte [haben] noch keine Funktion". Also "Header-Demo-Player-Waveform rendert nicht über die ganze freie Breite"; "Demo-Row-Waveforms … deutlich breiter"; each demo needs a cover and a duration ("Nicht dauerhaft leer lassen"). The ⋯ menu offers "Song-Link kopieren", with no download.
8. "**Media-Inhalte öffnen aktuell in neuem Tab**". The fix is an in-site overlay viewer with close, prev/next, a counter "3 / 8", Esc/Arrow keys, and all 8 images.
9. Booking mobile: the image is "links und rechts abgeschnitten. Der Button sitzt nicht korrekt. … das Datum-Feld [ragt] sowohl Desktop als auch Mobile zu weit heraus".
10. "`info@typhoon.band` gibt es nicht."

### Round 4: targeted fixes 2026-05-09 (commits `356d3e1`, `74055b9`)
- "full hero image": the desktop and mobile hero use `object-contain` so the **entire collage is visible**. Mobile was then switched to cover + object-left "so no bottom edge and left side stays visible".
- "**drop more-menu**": the ⋯ button and its menu were removed from the featured player.
- "full booking image on mobile": aspect-square with `object-contain`.

### Round 5: backend phases (Admin UX complaints)
- Phase 05 fix:
  - Large MP3/image uploads caused a "client-side application error" on Vercel.
  - Member name, instrument and bio could not be edited.
  - One Supabase member made the other fallback members disappear.
  - The visibility checkbox did not persist.
  - The owner wants "clear German errors … no generic client-side exception", with the allowed formats and max size shown beside every input.
- Phase 05b:
  - The public card ignored the Supabase role and bio.
  - The Admin card heading showed the old name.
  - "Uploaded demo songs have no sound on the website" (CORS/Web Audio).
- 2026-06-17 (`4cf812b`): the "Platzhalter" badge stayed visible after a real photo was uploaded.

### 6.1 Recurring themes: what the owner repeatedly disliked

1. **Mobile breakage and horizontal overflow.** Raised in docs/14, v5 and v6, and again in the booking/date-field fixes. Mobile must be the same design, compact and never shifted or cut off. Test at 390px and 320px.
2. **Hero image cropped, covered or blended.** Raised in docs/14, v6 #1–2 and the two fixes on 05-09. The owner wants the **whole band collage visible**, with no hard black overlay edges and no hard bottom seam. Text, image and signature must be clearly separate layers.
3. **Signature misplaced.** Raised in docs/14, v5 and v6. It must look designed and intentional: over the image and bleeding past the hero's bottom edge into the player area. It must never sit over the text, and it must be hidden by the open mobile menu.
4. **Cheap or outdated UI.** v5 called it "billig", "altbacken", "Plastik-Look", "wie Liste", "zu leer". The player and buttons must feel premium, modern and musical. There were repeated demands for a wider, integrated waveform.
5. **Dead or fake functionality.** Seen in v6 #7 and #8, the unfunctional ⋯ and the new-tab media. Every visible control must work, or be removed as the ⋯ menu was.
6. **Wrong or fake content.** Taifun/Daniel/Jürgen-as-sax, `info@`, fake dates, untranslated EN/TR and placeholder badges are all out. Only verified facts; TBA instead of invented dates.
7. **Booking image and crop.** Raised in docs/14, v6 #9 and 05-09. The owner wants the band-with-signature image fully visible, with the button fully visible and aligned.
8. **Generic look.** "Do not create generic cards/buttons"; "Do not reinterpret the design into a generic band website." Yet the owner also asked for richer cards (bios) and editorial modules (Bandinfo image+text).
9. **Onepager too long.** "The onepager must not become exhausting." Use compact/reveal patterns.

What the owner liked or approved:
- The dark/sepia/gold atmosphere.
- The serif hero headline with a gold "Funk.".
- The gold signature overlay.
- The 2-row featured player with its round gold play button.
- Termine cards directly under the player.
- The editorial Bandinfo split.
- Cards with bios.
- An in-site lightbox and a real consent banner.
- DE/EN/TR.

After v6 and the 05-09 fixes, the owner declared the frontend "approved" (docs/00, 2026-05-10).

### 6.2 Tension points to design around
- The band-info-example uses Impact-like condensed caps, while the brand brief says "Avoid Impact-like cheap typography". The implementation used a serif. Prefer an elegant serif or high-quality display face; never a cheap condensed face.
- The handoff's tiny mobile type (7–9px) and its 7-across mobile member grid conflict with legibility. There is room to improve here, as long as the mobile layout stays a coherent compact version of desktop.
- The member photos are low-res PNGs mislabeled as .jpeg (≤376px wide). Large member cards need better sources, or a design that tolerates small images (for example, sepia treatment at modest size).

---

## 7. Misc facts useful for the rebuild

- Stack: Next.js App Router, TypeScript, Tailwind, Vercel, Supabase (Auth/Postgres/Storage), Resend. Locales `/de` (default; `/` redirects), `/en`, `/tr`.
- Env vars (docs/04, phases/01):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
  - `BOOKING_EMAIL=booking@typhoon.band`, `WEBSITE_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL=https://typhoon.band`
- Tables: `admin_profiles, site_settings, platform_links, legal_pages, legal_page_translations, band_members, band_member_translations, songs, shows, show_translations, booking_requests, media_items, seo_entries, consent_settings`. Migrations 0001–0005 are on main; 0006 is on the phase-06 branch.
- Storage buckets: `public-media, audio-demos, member-images, gallery, legal-assets`.
- `site_settings` keys: `hero_image_url, bandinfo_image_url, hero_signature_url`.
- Songs flags: `is_streamable`, `is_downloadable default false`, `is_featured`, `sort_order`, `is_visible`.
- Consent (v6 on main): localStorage `typhoon.cookie-consent`, buttons "Verstanden / Nicht jetzt". Phase-06 branch: `typhoon.consent.v1`, with necessary + external_media and a footer "Cookie preferences" reopen event `typhoon:open-consent`.
- Handoff JSON-LD suggestion (§2.4): OpenGraph, Twitter Cards, JSON-LD `MusicGroup` and `Event` schema. Also WebP/AVIF, `loading="lazy"` and `srcset`.
- The handoff says to use WaveSurfer/Howler. The owner docs override this: use the custom provider + Web Audio analyser. No heavy dependencies unless approved (typhoon.band CLAUDE.md).
