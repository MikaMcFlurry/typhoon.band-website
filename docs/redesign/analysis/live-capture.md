# Live capture: https://www.typhoon.band (captured 2026-09-25, ~02:40–03:00 UTC)

Read-only capture. No repo was modified; nothing was installed in the repos. Everything was captured with Playwright 1.x (global, `/opt/node22/lib/node_modules/playwright`) and Chromium 141.0.7390.37 through the session proxy.

TLS note: out of the box, Chromium rejected every host with `ERR_CERT_AUTHORITY_INVALID` because the agent-proxy interception CA is not in its NSS store. I fixed that by pinning **only** the two proxy CA SPKIs with `--ignore-certificate-errors-spki-list` (see `live/launch.js`). This is not a global TLS bypass.

Artifacts (all in `/tmp/claude-0/-home-user/86e8ac3e-056b-5b73-b221-7095671df2df/scratchpad/recon/live/`):
- Full-page and top-viewport screenshots at desktop 1440x900 and mobile 390x844 for `/de`, `/en`, `/tr`, `/de/legal/imprint`, `/de/legal/privacy`, `/de/legal/cookies` and `/de/admin/login`. Files are named `<page>-<desktop|mobile>-<full|top>.png`.
- Viewport scroll sequences: `de-desktop-scroll-00..04.png` and `de-mobile-scroll-00..06.png`.
- Interaction shots: `de-desktop-hero-playing.png`, `de-desktop-list-playing.png`, `de-desktop-bottom-while-playing.png`, `de-desktop-lightbox.png`, `de-desktop-booking-empty-submit.png`, `de-desktop-header-after-wheel.png`, `de-desktop-anchor-music.png`, `de-mobile-menu-open.png`, `de-mobile-playing.png`, `de-mobile-after-menu-link.png` and `de-404-desktop.png`.
- Text dumps: `de-text.txt` (the required `document.body.innerText` of `/de`, desktop), `de-text-mobile.txt`, `en-text.txt`, `tr-text.txt`, `de-legal-{imprint,privacy,cookies}-text.txt`, `de-admin-login-text.txt` and `en-legal-imprint-text.txt`.
- Raw data: `analysis.json` (network, performance, structure, images, links, forms, overflow), `interact.json`, `de-ssr.html` (the raw server HTML with its RSC payload), `de-rendered.html` and `main.css`.
- Scripts: `shots.js`, `analyze.js`, `interact.js`, `mobile.js` and `perf.js`.

> Full-page PNG caveat: `body` uses a gradient with `background-attachment: fixed`, and `html` has no background color. In full-page screenshots everything below the first viewport therefore renders on white or grey. This is a capture artifact. The viewport scroll shots show the real look.

---

## 1. Routing, deployment and headers

- `https://www.typhoon.band/` → **307** → `/de`. The server is Vercel, the region is `iad1` and `x-matched-path: /[locale]`.
- The home page is rendered **dynamically on every request**: `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` and `x-vercel-cache: MISS`. There is no ISR or static caching.
  - The HTML is 310,824 bytes decoded and about 18 KB gzip. Most of it is the RSC payload.
- Security headers: only `strict-transport-security: max-age=63072000`. There is **no** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy.
- Missing (404): `/robots.txt`, `/sitemap.xml`, `/favicon.ico`, `/icon.png`, `/apple-icon.png`, `/manifest.webmanifest` and `/opengraph-image`.
  - The favicon 404 is the **only console error** on the home page: "Failed to load resource: the server responded with a status of 404".
- `/de/does-not-exist` → **the default Next.js 404**: white page, "404 | This page could not be found." It is completely off-brand.
- `/de/admin` → 307 → `/de/admin/login?from=%2Fde%2Fadmin`. Admin is server-protected.
- `/api/booking` GET → 405. The form POSTs via JS; I did not submit it, to avoid sending a real booking mail.
- `<head>`:
  - `<title>Typhoon — Funk · Soul · Jazz · Bluesrock</title>` is the same on DE, EN and TR.
  - `meta description` is the German "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock." on **all** locales.
  - There are **no** OG or Twitter tags, **no** hreflang alternates, **no** canonical, **no** icons, **no** JSON-LD and **no** theme-color.
- **`<html lang="de">` on `/en` and `/tr` too**: it is hardcoded in `src/app/layout.tsx:26`. After client-side navigation to `/en`, `document.documentElement.lang` still reads `de`.

## 2. Performance (unthrottled, US-East datacenter → iad1; real-world mobile will be slower)

| run | TTFB | FCP | LCP | DCL | load | on-wire KB | of which MP3 KB |
|---|---|---|---|---|---|---|---|
| desktop 1 | 917 | 1372 | 1588 | 1041 | 1645 | 1680 | 567 |
| desktop 2 | 621 | 1016 | 1052 | 749 | 1682 | 1554 | 441 |
| desktop 3 | 737 | 1284 | 1332 | 1039 | 1281 | 1553 | 440 |
| mobile 1 | 601 | 868 | 904 | 720 | 1043 | 1494 | 469 |
| mobile 2 | 357 | 660 | 704 | 603 | 974 | 1488 | 462 |
| mobile 3 | 655 | 1052 | 1064 | 846 | 1349 | 1413 | 387 |

- One cold run (the first mobile load in `analyze.js`) had **TTFB 5844 ms**, LCP 6280 ms and load 6586 ms. That looks like a function cold start: the page is dynamic, has no cache and fetches from Supabase on each request.
- curl TTFB for `/de` ranges from 0.5 to 0.96 s. `/de/legal/imprint` is 0.13–0.30 s.
- LCP element:
  - Desktop: `IMG … hero-collage.jpeg&w=1920` (168 KB webp).
  - Mobile: the H1 at 6.1 s in the cold run, otherwise the hero image `w=640`.
- CLS is 0.0003 on desktop and 0 on mobile.
- 47 resources load on desktop and 46 on mobile. JS is about 143 KB compressed (7 chunks) and CSS is one file of 9 KB (39 KB raw). There is 1 preloaded woff2: Inter latin, 49 KB.
- **All 6 demo MP3s are fetched on page load** straight from Supabase Storage (HTTP 206 range requests, then cancelled). That costs about 390–570 KB before any user interaction. It happens because durations are not in the data (the SSR payload has no duration), so the client reads metadata from every file to print "5:35" and so on.
  - This also means the visitor's IP reaches `furogcuvihbwhtmxgmfu.supabase.co` on first load. The privacy text does not mention Supabase.
- Image waste:
  - `typhoon-signature-gold.png` is served at `w=3840`: 97 KB for a 715x290 display.
  - A second hidden copy of the hero is decoded for mobile and desktop variants.
  - The same hero is also requested at w=256 and w=96, because it is the cover of every song.
- Third-party hosts: **only** `furogcuvihbwhtmxgmfu.supabase.co`, plus `www.typhoon.band` itself.
  - No analytics, no Google Fonts (Inter is self-hosted through next/font) and no embeds.
  - Supabase images go through `/_next/image` (Vercel image optimizer). The MP3s load from supabase.co directly.
- No API keys appear in the HTML or page/layout chunks: no `eyJ…` JWT and no `sb_publishable_…` key.

## 3. Does the content come from Supabase? Yes (project ref `furogcuvihbwhtmxgmfu`)

The public buckets in use are `audio-demos`, `member-images` and `gallery`. Here is what is live, taken from the SSR RSC payload in `de-ssr.html`:

### Members: live, 8 cards, all Supabase photos, `isPlaceholder:false`
| slot id | name (live) | role DE / EN / TR | bio DE (verbatim live) |
|---|---|---|---|
| typhoon | **Typhoon** | Gesang / VOCALS / VOKAL | "Frontman - türkischsprachige Texte und direkte Energie im Zentrum der Band" |
| mika | **Mika El Jackson** | Posaune / TROMBONE / TROMBON | "Junger Posaunen Sound, frecher live Charakter und warme Brass-Linien" |
| schack | **Schack** | Saxophon / SAXOPHONE / SAKSOFON | "Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion." |
| hardy | **Hardy** | Trompete / TRUMPET / TROMPET | "Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck." |
| stefan | **Stefan** | Funk-Bass / FUNK BASS / FUNK BAS | "Groovendes Fundament, präziser Druck und warme Tiefe." |
| tom | **Tom** | Schlagzeug / DRUMS / DAVUL | "Treibender Puls, Live-Energie und rhythmische Stabilität." |
| bugra | **Buğra** | Gitarre / GUITAR / GITAR | "Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung." |
| **jurgen** | **Tan** | **Percussion** / PERCUSSION / PERKÜSYON | "Zusätzlicher Groove, organische Akzente und rhythmische Farbe." |

- The EN bios are live too, for example "Frontman - Turkish lyrics and powerful energy at the heart of the band." and "Young trombone sound, raw live character, warm brass lines.". Full text is in `en-text.txt` and `tr-text.txt`.
- **Conflicts with repo fallback and docs**:
  - `src/data/members.ts` and `docs/03-content-facts.md` say "Mika – Posaune" and "8. Jürgen – Gitarre" ("Jürgen is Gitarre").
  - Live, the admin has renamed the DB row with slot id `jurgen` to **"Tan – Percussion"**; the photo was uploaded 2026-06-11. "Mika" is displayed as "Mika El Jackson".
  - The repo bios are more polished, for example "Frontmann, …" and "Junger Posaunen-Sound, rauer Live-Charakter …". The live DB bios have typos: "Frontman -", "Posaunen Sound", "frecher live Charakter" and no final period.
  - **Owner decision needed: Tan (Percussion) vs Jürgen (Gitarre).** The live DB is the most recent owner action.
- The photo files are 359 px wide originals from the upload pipeline. They render at 268x201 on desktop (a landscape crop of portrait photos) and about 172x130 on mobile.

### Songs / demos: live, 6 tracks from Supabase `audio-demos`, `cover:null`
Live order and titles, verbatim:
1. **Sen-Benim** (5:35): `2026-05-11-sen-benim-abed5b20-….mp3`
2. **Karanfil** (5:29)
3. **Farksilin** (4:02)
4. **Cilgin** (3:20)
5. **Bir tek sen** (3:34)
6. **gece yine dustun** (9:05)

- The repo fallback `src/data/songs.ts` has different titles and order: "Sen Benim", "Karanfil", "Gece Yine Düştün", "Farksilin", "Çılgın", "Bir Tek Sen".
- `docs/03-content-facts.md` lists: Sen-Benim, **Karanfill**, Gece Yine Düştün, Farksilin, Çılgın, Bir Tek Sen.
- The live titles have **lost their Turkish diacritics and capitalisation** (Cilgin, Bir tek sen, gece yine dustun). A redesign should display canonical titles ("Çılgın", "Bir Tek Sen", "Gece Yine Düştün") or fix the data in admin, after the owner confirms.
- There is no per-song cover. Every row shows the hero collage thumbnail.
- There is no download button, which is correct.

### Shows / Termine: 4 placeholder cards, identical to the repo fallback `src/data/shows.ts`
The DB shows table is empty or unused. The cards, verbatim:
- `TBA 2025` "Neue Termine in Vorbereitung" · Deutschland · Demnächst
- `TBA 2025` "Festival-Saison" · Süddeutschland · Demnächst
- `TBA 2025` "Club-Tour" · DE / AT · Demnächst
- `TBA 2025` "Privat- & Firmenevents" · Anfrage · Booking offen

**Stale**: the cards say "2025" and today is 2026-09-25. "ALLE TERMINE ANSEHEN →" links to `#booking`, not to a shows list.

### Gallery / Media: 9 Supabase images
The alts, in order, verbatim:
1. "Proberaum aus einem anderen Winkel"
2. "Bandcover"
3. "Schwarz-weiß Bild von Oben einer Hammond Orgel mit E-Bass"
4. "Bild des Proberaums"
5. "Typhoon playing Keyboard and singing"
6. "Proberaum aus einem anderen Winkel" (a duplicate alt)
7. "Typhoon singing on a stage"
8. "Bild der Hammond Orgel"
9. "Bandcover 2"

The repo fallback has 8 local `gallery-1..8.jpg` files, so the gallery is **Supabase-driven**. The alts mix German and English.

### Static and local assets still used live
- `/assets/hero/hero-collage.jpeg`: the hero, and the song covers.
- `/assets/branding/typhoon-signature-gold.png` and `…-gold-bold.png`: the script logo.
- `/assets/gallery/gallery-5.jpg`: the About card image, alt "Typhoon — Live".
- `/assets/gallery/gallery-3.jpg`: the booking card, alt "Typhoon — Band mit Signatur".

### Hero, about and footer copy
This comes from the i18n dictionary in the payload (`hero.line1..3`, `about.*`). It is not wired to the DB hero.

### Social / platform links
Instagram, Facebook, YouTube and Spotify in the footer are **all `href="#"`**: dead placeholders. `Footer.tsx` uses `site.social.* || "#"`. `getPlatformLinks()` exists in `src/lib/content/index.ts` but is not wired.

### Contact (verbatim)
- `booking@typhoon.band` is a `mailto:` link.
- `+49 176 64472296` is plain text and **not a `tel:` link**.

## 4. Section-by-section visual description (desktop 1440, `/de`)

Global look:
- Near-black warm base (`--bg:#030201`, `--panel:#0b0805`). The body has radial gold and brown glows plus an SVG fractal-noise grain overlay (`body:before`, opacity .05, mix-blend overlay).
- Gold `--gold:#c79a4b` and `--gold-soft:#e8c982`; cream text `--cream:#f2e6cf` and `--muted-cream:#c9bda5`.
- 1px gold-alpha borders (`--line: rgba(232,201,130,.22)`), card radius 10px and pill buttons (999px).
- Container max width is about 1116 px of content (x = 162 → 1278).
- Typography:
  - **Display font = `Georgia, "Times New Roman", serif`**: a system fallback. No brand display face is loaded.
  - Body = Inter, self-hosted, weights 300–700.
  - Numerals and times use the system monospace (`ui-monospace, … Courier New`).
  - Kickers and labels are 10–11 px uppercase Inter with 0.16–0.22em tracking.

1. **Header** (fixed, 72 px, `pointer-events-none` wrapper, **fully transparent at every scroll position**; no background, blur or shadow appears after wheel-scrolling to y=1200).
   - Left: the gold script "Typhoon" signature logo, 140x48.
   - Right: the nav HOME, BAND, MUSIC, TERMINE, MEDIA, BOOKING, KONTAKT as 11 px letter-spaced cream caps. They are anchors: `#home`, `#band`, `#music`, `#shows`, `#media`, `#booking`, `#contact`.
   - Then a pill language switch "DE | EN | TR". The active locale has a gold fill.
2. **Hero `#home`** (640 px tall).
   - Left column: H1 in Georgia bold 76 px, uppercase, tight leading, three lines: "SMOOTH." / "EXZEPTIONELL." / "FUNK.". The last line is gold, the others cream.
   - Below it, a 3-line Inter intro: "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie."
   - Two pills: a gold "▶ SONGS ANHÖREN" (→ `#music`) and an outlined "BOOKING ANFRAGE" (→ `#booking`).
   - Right: the sepia band collage (`hero-collage.jpeg`, square, `object-contain object-right`). It occupies x≈800–1440 as a **hard-edged rectangle**; the left and bottom edges are not feathered, so a visible seam runs at x≈800 and y≈640.
   - A large gold "Typhoon" signature (715x290) overlays the lower part of the collage and **spills down over the player card's top-right**, crossing the card border and the internal divider line.
3. **Featured player card** (overlaps the hero bottom by -48 px; 1116x195).
   - Top row: a 76 px cover (the hero collage), the kicker "AKTUELLER DEMO · SINGLE", the title "Sen-Benim" in Georgia 24 px, and the artist "Typhoon".
   - A divider, then the controls: a 44 px gold round play button, prev and next icons, a static bar waveform (~480 px wide, gold bars), time "0:00 / —" (duration is unknown until metadata loads), a mute icon and a gold volume slider.
   - While playing, the play button turns cream-gold with a pause icon. The waveform animates through the Web Audio analyser; bars on the left grow taller. Time shows "0:02 / 5:35".
4. **Termine `#shows`**.
   - The kicker "TERMINE" on the left, "ALLE TERMINE ANSEHEN →" on the right.
   - Four equal cards in a row. Each has a large Georgia gold "TBA" with "2025" under it, a vertical divider, the title in Inter semibold, "◉ city" and a status line.
   - Titles are truncated with an ellipsis: "Neue Termine in Vo…" and "Privat- & Firmeneve…".
5. **Über Typhoon `#about`**: a big bordered card.
   - Left 40%: a colour live photo of the singer with a mic (`gallery-5.jpg`). It is saturated red and white, which clashes with the sepia world.
   - Right: the eyebrow "TYPHOON"; H2 in Georgia 34 px, "Amerikanisches Feeling. Europäische Seele. Türkische Texte."; the body copy; a gold genre line, "BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK"; and two pills, "MEHR ÜBER DIE BAND" (→ `#band`, which is just the next section) and a gold "BOOKING ANFRAGE".
6. **Band Mitglieder `#band`**: a 4x2 grid of bordered cards (268 px wide).
   - The photo sits on top as a 201 px tall landscape crop. Photos are sepia or monochrome, except Mika's playful fisheye selfie in colour.
   - Under the photo: the name in Georgia 17 px, the role as gold 10 px caps and a 2-line bio.
   - Cards have equal heights, and the text is small.
7. **Demos `#music`**: 6 full-width rows, each 72 px tall and bordered.
   - Each row: a cover thumbnail (the same collage every time), the monospace index "01", a 36 px gold play button, the Georgia title, a static waveform strip (~360 px, centred and leaving a big empty gap to the right), the monospace duration on the far right and a mute icon.
   - The active row gets a brighter border and an animated waveform with "0:02 / 4:02".
8. **Media `#media`**: an 8-column grid of square 131 px thumbnails with 9 images.
   - **The ninth image is orphaned alone on a second row.** The section has no heading beyond the tiny kicker "MEDIA".
   - Clicking a thumbnail opens a lightbox: `role=dialog`, aria "Media", a black overlay, the image at 1920w, round prev and next buttons at the viewport edges, a close X at top-right and a "1 / 9" pill counter. ArrowRight works and Escape closes.
9. **Booking `#booking`**: two columns.
   - Left: a bordered form panel with **placeholder-only fields and no visible labels**: "Name *", "E-Mail *" (a 2-column row), "Telefon (optional)", a date input (a native date picker; it shows "mm/dd/yyyy" in headless because of the Chromium UI locale), "Ort *", "Art der Veranstaltung *" and "Nachricht *" (a textarea).
   - Below the fields, a 10 px tracked note: "ANFRAGEN GEHEN DIREKT AN BOOKING@TYPHOON.BAND. ANTWORT INNERHALB VON 48 STUNDEN."
   - A honeypot `hp_field` is positioned at -9999px.
   - Right: an `<aside>` image card (`gallery-3.jpg`, the collage with the signature).
   - **The submit button "BOOKING ANFRAGEN" sits inside the image card** (`form="booking-form"`), physically separated from the form.
   - An empty submit shows a single red-brown box, "Bitte fülle alle Pflichtfelder aus.". There are no per-field error states.
   - There is no privacy consent checkbox or privacy note next to the form.
10. **Footer `#contact`**: a top border line, then 4 columns.
    - Logo plus the tagline "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock."
    - "KONTAKT": the email and the phone.
    - "FOLGE UNS": 4 circular 32 px icon buttons (Instagram, Facebook, YouTube, Spotify), **all dead `#`**.
    - "LEGAL": IMPRESSUM, DATENSCHUTZ, COOKIES.
    - A bottom line: "© 2026 TYPHOON. ALLE RECHTE VORBEHALTEN." in tracked gold caps.
11. **Cookie banner**: `role=dialog`, aria "Cookies & Privatsphäre".
    - It is fixed at the bottom centre, max 840 px wide, z-1200, with a dark panel and a gold border.
    - Text: "COOKIES & PRIVATSPHÄRE / Diese Website verwendet nur technisch notwendige Cookies. Es findet kein Tracking statt. Datenschutz · Cookies".
    - Buttons: "NICHT JETZT" (outline) and "VERSTANDEN" (gold).
    - "Verstanden" stores `localStorage["typhoon.cookie-consent"]="accepted"` and sets no cookies.
    - It is shown on every page until dismissed and covers about 140 px on desktop and **185 px (22%) of the mobile viewport**.
    - TR labels: "ÇEREZLER & GIZLILIK", "ŞIMDI DEĞIL", "ANLADIM".

### Mobile (390) differences
- The header is 60 px: logo, lang pill and hamburger ("Menu", `aria-controls="mobile-drawer"`). It is still transparent over content.
- Hero: the collage becomes a full-bleed background behind the text (`object-cover object-left`). The H1 is 40 px Georgia. The CTAs stack. The script logo (`md:hidden` img) overflows the viewport by 12 px and is clipped. The player card below is compact, and its waveform is only about 140 px wide.
- Termine is a horizontal `scroll-rail` with `scroll-snap x mandatory` (1147 px of content in 358 px). Cards are 78% wide.
- About stacks with the image on top. Members form a 2-column grid. Demo rows put the index, play, title and time on the first line and the waveform on the second line, which **only fills ~65% of the width**. Media is 4 columns (9 images → 4+4+1 orphan).
- Booking stacks; the image card with the submit button comes **below** the form, and its CTA is full-width. The email and phone repeat under the booking card.
- The footer stacks.
- **Mobile menu**:
  - It is a full-screen `nav.fixed` overlay (z-1100) with a black background and 7 large links (Home, Band, Music, Termine, Media, Booking, Kontakt) separated by gold hairlines. The logo and close X sit at the top.
  - Focus moves to "Schließen" and body scroll is locked (`overflow:hidden`).
  - A link click closes the menu and scrolls correctly.
  - **Escape does NOT close it.** It has no `role="dialog"` or `aria-modal`.
  - **The language switch is hidden while the menu is open**, and the menu has none.
  - **The cookie banner (z-1200) renders on top of the open menu.**
- Tap targets under 40 px: the lang pills are 38x23; the demo play buttons are 30x30; the social icons are 32x32; the legal links are 15 px tall; the hero CTAs are 33 px tall.

### Legal and admin pages
- **Legal pages**:
  - They share the header, the footer and a centred 700 px bordered card.
  - Above the card: "← ZUR STARTSEITE", the kicker "LEGAL", an H1 in Georgia, and the subtitle "**INITIALER STAND — WIRD LAUFEND ERGÄNZT.**" (EN: "INITIAL DRAFT — EXTENDED OVER TIME."). This reads as unfinished.
  - Header nav anchors on legal pages are `#band` and so on. They should be `/de#band`, but I did not verify whether they navigate home.
  - The language switch keeps the path (`/en/legal/imprint`).
- **Impressum** (verbatim facts):
  - "Angaben gemäß § 5 TMG / Mika Hertler / Am Schwarzen Steg 5a / 95448 Bayreuth / Deutschland"
  - Kontakt: booking@typhoon.band, +49 176 64472296
  - "Verantwortlich nach § 55 Abs. 2 RStV: Mika Hertler, …"
  - Haftung für Inhalte (§ 7, §§ 8–10 TMG) and Streitbeilegung.
  - **Outdated law references**: TMG was replaced by the DDG (§ 5 DDG) in May 2024, and RStV by the MStV (§ 18 Abs. 2 MStV). There is no link to the EU ODR platform.
- **Datenschutz**:
  - Verantwortlicher (as above); Booking-Anfragen (Art. 6 Abs. 1 lit. b DSGVO, "Die Daten werden nicht an Dritte weitergegeben"); Hosting on Vercel (AVV Art. 28); Externe Plattformen (links only: Spotify, YouTube, Instagram, Facebook, SoundCloud, Bandcamp); Eure Rechte.
  - **It does not mention Supabase** (DB, storage and direct MP3 loads from supabase.co) **or Resend** (mail). The "nicht an Dritte" claim is questionable.
- **Cookies**: only necessary cookies; "Optionale Embeds … Consent-Banner"; consent is stored in localStorage.
- **Admin login** `/de/admin/login`:
  - A centred form: kicker "ADMIN", H1 "Anmelden", intro "Geschützter Bereich für Typhoon-Admins. Bitte melde dich mit deinem E-Mail-Account und Passwort an.", then the E-MAIL and PASSWORT fields and a gold full-width "ANMELDEN".
  - **It leaks internal ops text publicly**: "Zugang nur für aktive Admins. Owner richten neue Accounts über die Supabase-Konsole + admin_profiles ein. Siehe docs/admin-setup.md."
  - It carries the public nav and footer. Title: "Admin · Login · Typhoon".

## 5. Interaction tests
- **Play first demo**:
  - The first `aria-label="Abspielen"` in the DOM is a **hidden** duplicate: there are mobile and desktop player variants, so each control exists twice (15 play buttons for 7 visible).
  - Clicking the visible hero play works: the label changes to "Pause", the time runs ("0:02 / 5:35") and the waveform animates.
  - There is **no `<audio>` element in the DOM** (`document.querySelectorAll('audio')` = []), so it uses a JS `Audio` object.
  - There is no `navigator.mediaSession` metadata, so there are no lock-screen or hardware media keys with a title.
- **One at a time**: playing "Farksilin" from the list paused "Sen-Benim"; labels became "Pause Farksilin" and "Abspielen Sen-Benim". However, the **hero card still displays "Sen-Benim"**: it does not follow the global current track.
- **Seek**: no `role="slider"` or aria value exists on the waveforms, so seeking is not keyboard or screen-reader accessible. The visual click-to-seek was not verifiable via aria.
- **No sticky mini-player**: scrolling to the footer while a track plays leaves no visible control.
- **Mobile play** works: "0:03 / 5:35" and the pause icon show.
- **Language switch**: `EN` → `/en` (soft navigation). Content switches, `lang` stays `de`, the title and description stay German, and the H1 becomes "SMOOTH. / EXCEPTIONAL. / FUNK.". TR H1: "SMOOTH. / OLAĞANÜSTÜ. / FUNK.".
- **Turkish casing bug** (caused by `lang="de"` plus CSS `text-transform:uppercase`): "MÜZIK", "TARIHLER", "ŞARKILARI DINLE", "BOOKING TALEBI", "GRUP ÜYELERI", "İLETIŞIM", "BIZI TAKIP EDIN", "GIZLILIK", "ÇEREZLER & GIZLILIK", "ŞIMDI DEĞIL", "GITAR". They should be MÜZİK, TARİHLER, DİNLE, TALEBİ, ÜYELERİ, İLETİŞİM, BİZİ TAKİP EDİN, GİZLİLİK, ŞİMDİ DEĞİL, GİTAR. This is visible in `tr-desktop-top.png`.
- **Anchor nav**: `#music` scrolls so that the section top sits at y=0. There is **no scroll-margin-top**, so the section kicker hides behind the 72 or 60 px header. The header is transparent, so the header text visibly collides with the content.
- **Header overlap**: this is visible in `de-desktop-scroll-01/02/03.png` and `de-desktop-header-after-wheel.png`. The nav letters overlap "ALLE TERMINE ANSEHEN →", the genre line and the member names. On mobile the logo overlaps the kickers and card text.
- **Cookie banner**: present on first visit on every route. It has 2 buttons plus 2 links, and it disappears after "Verstanden".
- **Reduced motion**: no `prefers-reduced-motion` rules exist in the CSS.

## 6. Bugs and visual problems, prioritised
1. The fixed header has no background or scrim at any scroll position, so the nav and logo collide with section content on desktop and mobile.
2. `<html lang="de">`, the German title and the German meta description are served on /en and /tr. This hurts SEO and a11y and breaks Turkish uppercase (I→I instead of İ).
3. The footer social links are all `href="#"`, and the platform links in the DB are not wired.
4. The shows are stale placeholders ("TBA 2025"), and "Alle Termine ansehen" → #booking.
5. The favicon and icons are missing (404 and a console error). There is no OG image, OG tags, hreflang, sitemap, robots or JSON-LD (MusicGroup / Event).
6. The 404 page is the default Next white page.
7. All 6 MP3s (~0.4–0.57 MB) load on page load just to show durations; the IP goes to supabase.co before consent, and the privacy text omits it.
8. The booking submit button is detached from the form and sits in the image card. Fields are placeholder-only (no labels), there is no per-field validation and there is no privacy notice at the form.
9. The hero collage is a hard-edged rectangle, with a visible seam at the left and bottom. The signature logo crosses the player card border and divider.
10. The display font is Georgia (a system fallback) and the numerals are system monospace, so the typography does not look premium or brand-specific.
11. The media grid orphans its 9th image (8 columns on desktop, 4 on mobile). There is no gallery heading or intro.
12. The hero player does not reflect the track playing from the list. There is no persistent or sticky player, no mediaSession and no slider semantics for seek. Every control is duplicated (hidden mobile/desktop variants).
13. All song covers are the same hero collage. The song titles lack Turkish diacritics (Cilgin, Bir tek sen, gece yine dustun).
14. Mobile menu: Escape does not close it; it has no dialog semantics; the cookie banner sits above it; it has no language switch.
15. The legal pages say "INITIALER STAND — WIRD LAUFEND ERGÄNZT." and cite TMG/RStV (outdated; should be DDG/MStV). The admin login leaks "Supabase-Konsole + admin_profiles … docs/admin-setup.md".
16. The home page is fully dynamic (`no-store`, cache MISS); cold TTFB was 5.8 s on one run. It could be ISR or revalidated on admin save.
17. Only HSTS is set; no CSP or other hardening headers.
18. Small tap targets and tiny text: 10–11 px kickers, 30 px play buttons on mobile, 23 px-tall language pills.
19. There is no background color on `html` (a white overscroll risk). There is no `prefers-reduced-motion` handling.
20. Wide empty areas: the waveform uses about 35% of the demo row width on desktop and about 65% on mobile. The hero's left side is plain black.
21. The About photo is a saturated colour shot inside an otherwise sepia palette.

## 7. Facts the redesign must preserve (verbatim)
- Band name: **Typhoon** (never "Taifun"). Genres: "Bluesrock • Funk • Soul • Jazz • Southern Rock".
- Title tag: "Typhoon — Funk · Soul · Jazz · Bluesrock".
- Claim: "SMOOTH. / EXZEPTIONELL. / FUNK." (EN "EXCEPTIONAL.", TR "OLAĞANÜSTÜ.").
- About headline: "Amerikanisches Feeling. Europäische Seele. Türkische Texte." / "American feeling. European soul. Turkish lyrics." / "Amerikan tını. Avrupalı ruh. Türkçe sözler."
- Contact: `booking@typhoon.band`, `+49 176 64472296`.
- Legal operator: Mika Hertler, Am Schwarzen Steg 5a, 95448 Bayreuth, Deutschland.
- Booking promise: "Anfragen gehen direkt an booking@typhoon.band. Antwort innerhalb von 48 Stunden."
- Booking fields: name*, email*, phone, event_date, event_location*, event_type*, message*, and the honeypot `hp_field`.
- Members: 8 live cards, as in the table in §3. Tan vs Jürgen needs the owner's confirmation.
- Demos: 6 live tracks, as listed in §3. They are streamed only, with no download.
- Gallery: 9 Supabase images with the alts listed in §3.
- Nav IA: Home, Band, Music, Termine/Shows, Media, Booking, Kontakt, with DE/EN/TR.
- Admin exists at `/[locale]/admin/*`: login, booking, change-password, media, members, music, settings, shows.
