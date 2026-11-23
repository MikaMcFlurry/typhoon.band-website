# Council Round 1 — Independent Critique of www.typhoon.band (Google Gemini)

## 1. Verdict

**No — a senior product designer, CRO lead, or technical SEO lead would not sign off today, though the core aesthetic is unusually strong and original.** The "Bühnenplan & Setlist" visual world (`DESIGN.md`) genuinely sounds and looks like a real band rather than a generic SaaS template, and the instant-play Setlist + Web Audio dock is a standout product asset. However, conversion and discovery are actively undermined by four blockers: (1) an unnecessary first-visit privacy banner that physically covers the Hero CTAs and Setlist above the fold, (2) weak organic/AI discoverability (an `<h1>` with zero genre/location/booking keywords, missing `og:url`/`og:type`/`og:locale`/`og:site_name` on the homepage, chained 307 redirects, and thin schema), (3) high booking-funnel friction (no promoter proof/tech-rider basics, and a verbose `"noch offen"` preview sheet pushing the submit button down), and (4) repeated photos and a 3.4 s mobile LCP.

---

## 2. Top Findings (Ranked by Impact on Booking Conversions & Organic Discovery)

### F01 — First-visit privacy banner covers primary Hero CTAs and Setlist above the fold (and has no legal trigger on page)
- **Area:** CRO / UX/UI
- **Evidence:**
  - `de-390-firstvisit-fold.png`: the fixed bottom `PRIVATSPHÄRE` sheet (`y: 640..836 px` in Playwright `mobile-390x844`) completely covers the primary `BOOKING ANFRAGEN →` CTA (`y: 654..702 px`) and the top of the band collage.
  - `de-1440-firstvisit-fold.png`: the banner (`y: 764..892 px` in Playwright `desktop-1440x900`) sits directly over both Hero CTAs (`y: 825..873 px`) and rows 06–08 of the Setlist.
  - `de-1280-fold.png` / Playwright `desktop-1280x720`: the banner covers the intro sentence and CTAs.
  - `src/components/consent/ConsentBanner.tsx:13-31` and `src/i18n/dictionaries.ts:475-476`: the banner explicitly states *"Diese Website setzt keine Tracking- oder Werbe-Cookies"*, and `src/components/consent/ExternalMediaGate.tsx` is not mounted anywhere on `/[locale]`.
- **Concrete fix:** Do **not** auto-open `ConsentBanner` in `"notice"` mode when the page sets no non-essential cookies/scripts and renders no third-party embeds; keep `ConsentBanner` solely as the preference dialog triggered from the footer (`ConsentSettingsButton.tsx`) and `ExternalMediaGate` if embeds are ever added. If the owner still insists on an informational notice, render it as a compact non-overlapping dismissible bar *only* after scroll or without covering `y < 100svh` CTAs.
- **Impact:** H | **Effort:** S | **Risk:** Low (confirm with owner/legal counsel that zero third-party embeds exist at load; `ExternalMediaGate` already gates future embeds per TDDDG § 25).

### F02 — Homepage `<h1>` lacks entity/genre/location/booking intent and concatenates words without spaces
- **Area:** SEO-content/local/AI / A11y
- **Evidence:**
  - `src/components/sections/Hero.tsx:52-74` puts `<Image alt="Typhoon">` and three separate `<span>` tagline strips (`SMOOTH.`, `EXZEPTIONELL.`, `FUNK.`) inside `<h1 id="hero-title">` with no whitespace between them. Live DOM `h1.textContent` returns `"Smooth.Exceptional.Funk."` on `/en` and `"Smooth.Olağanüstü.Funk."` on `/tr` (verified in Playwright), and `"SMOOTH. EXZEPTIONELL. FUNK."` carries zero keywords for *"Liveband"*, *"Bluesrock / Funk / Soul"*, *"türkische Texte"*, or *"Hechingen / Baden-Württemberg"*.
  - Furthermore, in German (`de-1440-fold.png`), *"EXZEPTIONELL"* mixes English *"SMOOTH."* with an uncommon Latinism.
- **Concrete fix:** Keep the gold signature PNG and three tape strips visually intact (`DESIGN.md` Display rule), but make the tape strips a `<p>` or decorative `<span>` (or include proper spacing) and promote a clear, high-intent accessible/visible `<h1>` or semantic headline pairing within the Hero left column that includes **Typhoon**, **genre + Turkish lyrics**, and **Hechingen / Baden-Württemberg** (e.g., making the signature `<h1>` via `alt="Typhoon — Liveband aus Hechingen für Bluesrock, Funk, Soul & Jazz mit türkischen Texten"` or adding a concise visible `<h1>` line in Schibsted Grotesk / stage hierarchy without adding an eyebrow above a heading). Also surface **Hechingen / Baden-Württemberg** once in the Hero or Band intro so users and AI answer engines see the band's base before scrolling 8,000 px to `#booking`.
- **Impact:** H | **Effort:** S | **Risk:** Low (keep signature PNG `alt` and tape strip aesthetics strictly aligned with `DESIGN.md`).

### F03 — Homepage `generateMetadata` wipes out `og:url`, `og:type`, `og:locale`, and `og:site_name` (and Legal pages omit OG/Twitter/x-default)
- **Area:** SEO-technical
- **Evidence:**
  - `src/app/[locale]/(site)/page.tsx:35-40` sets `openGraph: { title, description, images }`, which in Next.js App Router **replaces** the parent `openGraph` object from `src/app/[locale]/layout.tsx:75-93`.
  - Live HTML `<head>` on `https://www.typhoon.band/de` (and `/en`, `/tr`) is confirmed missing `og:type`, `og:url`, `og:locale`, `og:locale:alternate`, and `og:site_name`.
  - `src/components/legal/LegalPage.tsx:29-37` (`legalMetadata`) omits `x-default` in `alternates.languages`, omits `twitter`, and omits `openGraph` entirely unless `entry.ogImageUrl` is set.
- **Concrete fix:** In `src/app/[locale]/(site)/page.tsx:35-40`, include `type: "website"`, `siteName: "Typhoon"`, `locale: OG_LOCALE[locale]`, `alternateLocale`, and `url: \`/${locale}\`` (or share a `buildOpenGraph(locale, ...)` helper with `layout.tsx` and `legalMetadata`). Add `"x-default": \`/de${PATHS[type]}\`` in `LegalPage.tsx:31-35` and in `src/app/sitemap.ts:15-17`.
- **Impact:** H | **Effort:** S | **Risk:** Low.

### F04 — Mobile LCP is 3.4 s (~1.2 s render delay) due to heavy PNG/JPEG competition, font preloads, and lazy header logo
- **Area:** Perf / SEO-technical
- **Evidence:**
  - Brief Lighthouse baseline: mobile Perf 91, LCP 3.4 s (render delay ~1.2 s) on the hero signature `<img>` (`public/assets/branding/typhoon-signature-gold.png`, **331,535 bytes** at `2099×724`, `Hero.tsx:53-62`).
  - `Hero.tsx:104-111` also marks `hero-collage.jpeg` (**455,895 bytes**) with `priority`, generating a second `<link rel="preload" as="image" imageSrcSet="...3840w">` in `<head>` that competes with the LCP image on mobile 4G, alongside **6 `.woff2` font preloads** (`steps/78/output.txt:102-109`).
  - `Hero.tsx:59` sets `sizes="(min-width: 1024px) 560px, 88vw"`, which causes Next/Image to pick `w=640` on 390 px DPR 1 (`desktop-1440x900` also loads `w=640` for a 500 px slot).
  - `Header.tsx:142` sets `priority={!isHome}`, forcing `loading="lazy"` on the above-the-fold header logo (`typhoon-signature-gold-bold.png`, 282 KB source).
- **Concrete fix:** (1) Re-encode `typhoon-signature-gold.png` (and `-bold.png`) as tightly cropped lossless/lossy WebP/AVIF or clean vector SVG (preserving exact gold signature artwork — never re-set in a font) to cut payload from 331 KB to ~15–35 KB; (2) remove `priority` from `hero-collage.jpeg` (keep `loading="eager"` without `fetchPriority="high"`/`preload` competition) so the LCP image + critical CSS/fonts load first; (3) tighten `sizes` on `Hero` signature (`(min-width: 1280px) 500px, (min-width: 1024px) 460px, min(86vw, 480px)`) and remove `loading="lazy"` on the Header logo; (4) check if all 6 font weights/axes are actually needed as `preload`.
- **Impact:** H | **Effort:** M | **Risk:** Low (ensure gold signature PNG/SVG maintains pixel-accurate look per `DESIGN.md`).

### F05 — Booking form conversion friction: huge `"noch offen"` preview sheet pushes CTA down, and too many required fields for a quick availability check
- **Area:** CRO / UX/UI
- **Evidence:**
  - `de-390-sec-booking.png` and `BookingForm.tsx:291-305`: the chalk `SO KOMMT DEINE ANFRAGE AN` preview sheet renders 7 empty `"noch offen"` lines between `NACHRICHT *` and `ANFRAGE SENDEN →`, adding ~380 px of dead vertical space on 390 px mobile before the submit button.
  - `de-1440-sec-booking.png`: in the preview sheet, `Datum der Veranstaltung` and `Art der Veranstaltung` wrap awkwardly onto 2 lines in the `10rem` label column (`BookingForm.tsx:296`).
  - `BookingForm.tsx:56-65, 258-288`: 5 fields are required (`name`, `email`, `event_location`, `event_type`, `message >= 10 chars`), including requiring city + event type + 10-char message even when a promoter just wants to check date availability and fee range.
- **Concrete fix:** Keep the chalk request-preview card (`DESIGN.md` Rider rule), but **render it collapsed or in a compact 2-line summary until the user enters at least one field** (or display only filled fields + destination email), keeping `ANFRAGE SENDEN →` immediately visible below the message box on mobile. Widen the preview label column or shorten preview labels (`Datum`, `Anlass` instead of repeating full form labels). Relax `event_location` / `event_type` friction if backend validation allows, or add quick-tap event-type chips / clear microcopy explaining why city & event type speed up an accurate quote (note: backend validation in `/api/booking` must not break).
- **Impact:** H | **Effort:** S–M | **Risk:** Low (do not alter `/api/booking` schema without checking API contract).

### F06 — Setlist & Hero CTAs clip below the fold on 1280×720 laptops and when audio plays
- **Area:** UX/UI / CRO
- **Evidence:**
  - `Playwright desktop-1280x720`: `ctasRects` sit at `y: 704..752 px` (clipped below `720 px` fold) and `setlistRect` extends to `y: 841 px` (`121 px` below fold). Note `1280×720` falls inside `short: { raw: "(min-width: 1024px) and (max-height: 879px)" }`, yet still overflows vertically.
  - `de-1440-playing-fold.png`: clicking Play expands the inline `Waveform` inside row `01`, pushing rows `06–08` off the bottom and behind the `76 px` `PlayerDock`.
  - On mobile (`de-390-fold.png`, `Playwright mobile-390x844`), the Setlist starts at `y: 1077 px`, completely off-screen on load, because the full-width square collage (`358×358`) stacks above it.
- **Concrete fix:** Under `short:` (`max-height: 879px` / `lg` laptops), tighten vertical margins in `Hero.tsx:50,63,76,86` (`mt-6`/`mt-8` -> `short:mt-4`, `gap-y-14` -> `short:gap-y-8`), slightly compact `Setlist` row padding (`lg:py-1.5` -> `short:py-1`) or cap visible Setlist rows at 5–6 with a clean `"Alle 8 Demos"` expand toggle when playing or on `short` screens so the entire sheet + CTAs fit inside 720 px without colliding with `PlayerDock`.
- **Impact:** H | **Effort:** M | **Risk:** Low.

### F07 — Rich schema (`MusicGroup`) misses `MusicRecording` tracks, `areaServed`, `telephone`, `knowsLanguage`, and Booker FAQ/Service context
- **Area:** SEO-content/local/AI
- **Evidence:**
  - Live JSON-LD (`src/app/[locale]/(site)/page.tsx:118-186`) emits `MusicGroup` with `name`, `genre`, `location`, `email`, and `member`, but **zero** `track` (`MusicRecording` for the 8 demos), **no `telephone`** (`+49 176 64472296`), **no `areaServed`** (Baden-Württemberg / Süddeutschland / Deutschland / DACH), **no `knowsLanguage`** (`["tr", "de", "en"]`), and **no `contactPoint`** (`booking`).
  - Also note: JSON-LD currently outputs `location.name = "Kanzlei Studio"` (`page.tsx:146`), which `PRODUCT.md:63` marks as *undecided by the owner*!
- **Concrete fix:** Enrich JSON-LD on `/[locale]` with `telephone`, `contactPoint` (`ContactPoint`, `contactType: "booking"`, `email`, `telephone`, `availableLanguage: ["German", "English", "Turkish"]`), `areaServed` (`AdministrativeArea`: Baden-Württemberg, `Country`: DE/AT/CH), `knowsLanguage`, and `track` (`MusicRecording` items for each song in `content.songs`). Verify with the owner before keeping `"Kanzlei Studio"` in JSON-LD. Add a concise, truthful on-page Booker Q&A / Rider FAQ block in `#booking` (backed by `FAQPage` JSON-LD if visible on-page) answering core promoter questions (line-up, language, travel radius, response time).
- **Impact:** H | **Effort:** M | **Risk:** Low (only include owner-verified facts).

### F08 — Severe photo duplication across Hero, Band, and Gallery + wrong orientation & solo-singer framing in `Band`
- **Area:** UX/UI / CRO
- **Evidence:**
  - `de-1440-sec-band.png`: the `Band` section features a portrait `lg:aspect-[4/5]` photo of **the singer alone** (`gallery-5.jpg`), which is actually a **landscape** image (`547×376` rendered in `505×632`, upscaling 1.68× vertically and cropping the sides!). This also weakens the *"band, not solo artist with backing musicians"* positioning (`DESIGN.md:288`, `CLAUDE.md:85`).
  - `de-1440-sec-media.png`: live Supabase `gallery` repeats `hero-collage` **twice** (`02` with signature, `09` without signature — already in the Hero and PlayerDock fallback), repeats `gallery-5` (`07` — already in `Band` and `Typhoon` lineup card!), and shows two near-duplicate wide rehearsal-room shots (`01` and `04`).
  - `de-1440-sec-lineup.png`: `MIKA EL JACKSON` uses an extreme wide-angle selfie distortion that clashes with the 8 dark stage/studio portraits, and his name wraps onto 2 lines (`de-390-sec-band.png`). Member photos from Supabase are served at `300×375` into `400×500` desktop slots (`desktop-1440x900` Playwright check), causing mild softness.
- **Concrete fix:** In `Band.tsx:32`, match the container aspect to the actual image (or better: swap `bandinfo_image` in Admin to a genuine multi-musician/full-band or horn-section landscape/4:3 live/studio photo rather than a solo singer shot). In Admin → Gallery, remove the duplicate `hero-collage` entries (`02`, `09`), duplicate singer shot (`07`), and near-duplicate room shot (`04`), leaving a tight, high-impact 5–6 photo contact sheet (matching `src/data/gallery.ts` intent). Request higher-res portrait (`≥800×1000`) for members and a stage/portrait photo for Mika.
- **Impact:** M–H | **Effort:** S (CMS/asset cleanup + `Band.tsx` aspect ratio) | **Risk:** Low.

### F09 — Missing promoter decision-making proof & empty `Shows` conversion bridge
- **Area:** CRO
- **Evidence:**
  - `de-1440-sec-shows.png`: `Shows` has no upcoming or past shows and renders only a generic tape sentence + CTA (`BOOKING ANFRAGEN →`).
  - `de-1440-sec-booking.png`: the Rider facts list `Besetzung`, `Programm`, `Stil`, `Anlässe`, `Basis`, but give promoters **zero operational booking facts** (typical set duration, e.g. 90 min / 2×45 min; whether the band brings instruments/backline or needs PA/FOH; whether a technical rider / stage plot PDF is available on request).
  - Neither `Band` nor `Booking` states clearly *what happens after submitting* beyond `"Verfügbarkeit und Konditionen"` / `"48 Stunden"` (no note about receiving a technical rider/stage plot or sample setlist on request).
- **Concrete fix:** Without inventing any numbers or quotes, add a rider row in `Booking` (once confirmed by owner) for **Bühnen-/Technik-Setup** (e.g., *"PA & Licht nach Absprache, Backline vorhanden"* / *"Tech-Rider auf Anfrage"*) and **Programm-Dauer**; in `Shows` empty state, add a brief line inviting bookers to request private/public showcase dates or join the booking list directly rather than leaving an abrupt 3-line void.
- **Impact:** M–H | **Effort:** S | **Risk:** Low (requires owner confirmation for any set duration/PA wording).

### F10 — Chained 307 redirects on root domain and suboptimal `sitemap.xml` / `manifest.ts`
- **Area:** SEO-technical
- **Evidence:**
  - Live HTTP trace (`steps/78/output.txt:96-97`): `https://typhoon.band/` returns `307` -> `https://www.typhoon.band/`, which then returns `307` -> `/de` (`src/middleware.ts:77`).
  - `src/app/sitemap.ts:8,15-17`: `alternates.languages` omits `x-default`, and `lastModified: new Date()` stamps every build/request with the current timestamp rather than real content modification dates.
  - `src/app/manifest.ts:8`: `start_url: "/"` triggers the middleware 307 redirect instead of landing on `/de` (or localized path).
- **Concrete fix:** Configure Vercel domain redirect from apex `typhoon.band` -> `https://www.typhoon.band` as **308/301 permanent** instead of 307; review `/` -> `/de` (use `308` if `/de` is canonical default or keep Accept-Language `307` only when header explicitly requests `/en` or `/tr` while `x-default` resolves cleanly). Add `"x-default": absoluteUrl("/de" + path)` to `sitemap.ts` alternates, and change `manifest.ts` `start_url` to `"/de"`.
- **Impact:** M | **Effort:** S | **Risk:** Low.

### F11 — Multiple interactive targets violate `DESIGN.md`'s 44 px minimum hit area & WCAG 2.2 AA
- **Area:** A11y / UX/UI
- **Evidence:**
  - `report.json` flags `"Datenschutzerklärung"` (`BookingForm.tsx:310`, `142×18 px` in Playwright) on all home views and `"booking@typhoon.band"` (`LegalShell.tsx:51`) on Imprint/Privacy.
  - Live Playwright check across `1280`, `1440`, `390`, `320` additionally catches:
    - `LocaleSwitcher.tsx:42`: `min-w-10` = **40×44 px** (width < 44 px).
    - `Header.tsx:175`: `BOOKING` button uses `btn-sm` (`min-height: 40px` in `globals.css:352`) -> **91×40 px**.
    - `Header.tsx:135`: mobile logo link = **101×40 px**.
    - `ConsentBanner.tsx:134,137`: both buttons use `btn-sm` (**40 px** tall), inline links are **16 px** tall.
    - `Shows.tsx:111`: ticket links use `btn-sm` (**40 px** tall).
- **Concrete fix:** Update `.btn-sm` in `src/app/globals.css:352` to `min-height: 44px`, change `LocaleSwitcher.tsx:42` to `min-w-11` (`44 px`), ensure mobile header brand link has `min-h-11` (`44 px`), and give inline links in `BookingForm.tsx` / `ConsentBanner.tsx` / `LegalShell.tsx` adequate vertical touch padding (`inline-block py-2.5` or `min-h-11 inline-flex items-center` where layout allows without breaking prose flow).
- **Impact:** M | **Effort:** S | **Risk:** Low.

### F12 — `not-found.tsx` violates the Spike Tape Rule (uses Booking Orange for "Home") and returns homepage metadata
- **Area:** UX/UI / SEO-technical
- **Evidence:**
  - `404-1440-fold.png` and `src/app/[locale]/(site)/not-found.tsx:13`: the `← ZUR STARTSEITE` CTA uses `className="btn-tape"` (orange), violating `DESIGN.md` ("Use it for booking only").
  - `Playwright /de/nonexistent-test-404`: `not-found.tsx` is `"use client"`, renders empty `h1: []` in initial check before hydration, and inherits the homepage `<title>`, `canonical` (`https://www.typhoon.band/de`), and `og:url`!
- **Concrete fix:** Change `not-found.tsx:13` CTA from `btn-tape` to `btn-line` (secondary chalk outline, matching the "Zur Startseite" back link style) or add a secondary `btn-tape` specifically for `#booking`. Add `noindex, nofollow` metadata or remove misleading canonical on 404 routes.
- **Impact:** L–M | **Effort:** S | **Risk:** Low.

### F13 — `hard-coded "acht Musiker"` in `ogAlt` contradicts live 9-member count (and `CLAUDE.md` rule)
- **Area:** SEO-content/local/AI / Brand
- **Evidence:**
  - `src/i18n/dictionaries.ts:291, 537, 781`: `meta.ogAlt` reads *"Typhoon: acht Musiker in einer Sepia-Collage..."* / *"eight musicians"* / *"sekiz müzisyen"*, while live `Band` (`de-1440-sec-band.png`), `Booking` (`de-1440-sec-booking.png`), and JSON-LD display **9 Musiker** (`Tan` + `Malvin`). `CLAUDE.md:85` forbids hard-coding member counts in copy.
- **Concrete fix:** Remove the hard-coded `"acht"` / `"eight"` / `"sekiz"` from `meta.ogAlt` (e.g., *"Typhoon: die Band in einer Sepia-Collage mit goldenem Schriftzug"*), or format it dynamically from live `members.length` if needed.
- **Impact:** L–M | **Effort:** S | **Risk:** Low.

### F14 — Minor typography, localization, and layout polish issues across breakpoints
- **Area:** UX/UI / A11y
- **Evidence:**
  - `de-390-fold.png` & `de-360-fold.png`: the genre line wraps right before the `/` separator (`BLUESROCK / FUNK / SOUL / JAZZ` then `/ SOUTHERN ROCK`), leaving a leading slash on line 2 (`Hero.tsx:79` puts `/` *before* the next item inside the `<span>`).
  - `de-1440-sec-lineup.png`: `Malvin` (`KEYS`) has no bio text, creating an asymmetric blank row gap, and `Lineup.tsx:18` renders **3 columns** at 1440 px while `DESIGN.md:293` specifies **4 from `lg`** (code intentionally checks `members.length % 3 === 0`, so either update `DESIGN.md` or use 4-col consistently).
  - `de-1440-sec-booking.png`: `<input type="date">` renders OS-dependent `dd.mm.yyyy` placeholder even on `/de` (should be `TT.MM.JJJJ` or a clear hint/fallback), and `Gallery.tsx:133` puts `alt=""` on all 9 gallery images instead of descriptive alt attributes (making them invisible to Google Image Search).
  - `tr-1440-fold.png`: track title `"Sakli Kalan"` lacks Turkish dotless `ı` (`Saklı Kalan`), so `uppercase` under `lang="tr"` renders `SAKLİ KALAN` instead of `SAKLI KALAN`.
- **Concrete fix:** Move the `/` separator *after* the preceding genre item (or use CSS `after:content-['/']` / flex gap) so a slash never starts a new line. Give Gallery thumbnail `<img>` tags concise descriptive `alt` text (and mark the button `aria-label` cleanly without duplicating), sync `DESIGN.md` vs `Lineup.tsx` grid rule, and fix `"Sakli Kalan"` -> `"Saklı Kalan"` in Admin/fallback data if confirmed by the band.
- **Impact:** M | **Effort:** S | **Risk:** Low.

---

## 3. Keep — What Is Already Excellent and Must Not Be Touched

1. **The "Bühnenplan & Setlist" visual language (`DESIGN.md`):** Matte deck black (`rgb(18 17 16)`), chalk sheets, zero border-radius everywhere, Big Shoulders + Schibsted Grotesk + Martian Mono with `tabular-nums`, and the strict Spike Tape role system (orange = booking, pink = audio, green = line-up, blue = dates). It looks unmistakably authored and memorable (`de-1440-fold.png`, `de-1440-sec-booking.png`).
2. **Hero Setlist + persistent Web Audio `PlayerDock` + `Waveform`:** One-tap playback directly in the hero, live bass-reactive `--lvl` pulse (`LiveLevel.tsx`), smooth seekable keyboard-accessible waveform (`Waveform.tsx`), Media Session integration, and no audio download controls (`de-1440-playing-fold.png`, `de-390-playing-fold.png`).
3. **Typography & Turkish diacritic support:** `next/font/google` self-hosted with `latin-ext` handles `ğ`, `ı`, `ş`, `İ` cleanly across `/de`, `/en`, `/tr` (`tr-1440-fold.png`).
4. **Honest Shows empty state & Footer road-case label:** Refusing to fabricate fake tour dates (`Shows.tsx:154-164`) and the gaffer-tape contact strip in `Footer.tsx:33-35` (`de-1440-sec-contact.png`).
5. **Security & privacy posture:** Strict CSP in `next.config.mjs`, zero third-party trackers, `noindex, nofollow` + `private, no-store` on `/admin`, honeypot + time-trap in `BookingForm.tsx`.
6. **Zero horizontal overflow** across 320 px, 360 px, 390 px, 768 px, 1280 px, 1440 px, and 1920 px (`report.json` + Playwright verification).

---

## 4. Do Not Do — Tempting Changes That Would Hurt Brand, Truth, or Conversion

1. **Do NOT replace the Setlist in the hero with a generic full-bleed dark photo + centered band name.** That destroys the single biggest differentiator of Version B and pushes instant audio proof off the first screen.
2. **Do NOT re-set the gold signature PNG in a webfont, add gold gradients/glows, or round button/card corners.** That breaks the Gold Signature Rule and Paper-Only Lift Rule in `DESIGN.md`.
3. **Do NOT invent tour dates, testimonials, festival logos, streaming numbers, or fees** to fill the `Shows` section or boost social proof.
4. **Do NOT add Google Analytics, Meta Pixel, or un-gated YouTube/Spotify iframes** to "fix" embeds or tracking — keep the zero-tracker posture and `ExternalMediaGate`.
5. **Do NOT add a download button** to the demo tracks (`CLAUDE.md` / `PRODUCT.md` hard constraint).
6. **Do NOT crop the `hero-collage.jpeg` poster** (`object-contain` must stay so all musicians remain visible).

---

## 5. Open Owner Decisions

1. **Line-up count & slot 8/9 truth:** Live DB currently displays **9 members** (including `Tan – Percussion` in the `jurgen` slot and `Malvin – Keys` with no bio), while `PRODUCT.md` states *"eight-piece"* and `ogAlt` hard-codes *"acht"*. Should the band be communicated as 8 or 9 musicians, is `Tan` permanent, and what is Malvin's bio + high-res photos for Mika/Malvin/members?
2. **Home-base studio name:** `"Kanzlei Studio, Hechingen"` is already live in JSON-LD (`page.tsx:146`), even though `PRODUCT.md:63` lists it as undecided. Should `"Kanzlei Studio"` be publicly named in JSON-LD and visible copy, or removed in favor of `"Hechingen, Baden-Württemberg"` only?
3. **Promoter-critical booking facts (no fabrication):** Can the owner supply factual answers for the Rider & FAQ: typical set length (e.g., 60/90 min), whether Typhoon brings backline/PA for smaller clubs or requires FOH/PA, travel radius beyond Baden-Württemberg, and whether WhatsApp/Signal is accepted on `+49 176 64472296`?
4. **Hero tagline wording (`"SMOOTH. EXZEPTIONELL. FUNK."`):** Is the owner attached to the German loanword *"EXZEPTIONELL"*, or open to tightening the 3-strip tagline / sub-headline so it speaks more clearly to German/international bookers?
5. **Gallery curation & `Band` section photo:** Can the owner remove the duplicate `hero-collage` (`02`, `09`) and duplicate `gallery-5` (`07`) items in Admin → Gallery, and supply a real **full-band live/studio landscape photo** for `bandinfo_image` (replacing the solo singer shot)?
6. **Platform links & live video:** Are real Spotify / YouTube / Instagram URLs ready to publish in Admin → Platform links (currently empty on live), and is there a self-hosted 20–30 s live reel MP4 the band can host without third-party trackers?
7. **Track spelling (`"Sakli Kalan"` vs `"Saklı Kalan"`):** Confirm exact Turkish spelling of the single title in Admin → Music.
