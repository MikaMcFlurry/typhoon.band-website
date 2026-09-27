# Recon: typhoon.band-website `main` @ 740ff46: PUBLIC frontend

Read-only forensic recon. Nothing was checked out, modified or installed. HEAD of the local clone = `origin/main` = `740ff464dba8ed75a78498d8a84ab038582f663c` (merge of PR #15 `claude/band-member-placeholder-fix-87jwb9`, 2026-06-17).
Only one unmerged remote branch: `origin/claude/phase-06-legal-seo-consent-platforms` (0cd76d0, 2026-05-11, branched from d8ee2d7). **It is NOT live.** It is summarized in section 6 as donor material.

Stack (package.json): next 15.5.15, react 19.0.0, @supabase/ssr ^0.10.3, @supabase/supabase-js ^2.105.4, tailwindcss 3.4.17, TypeScript 5.7.3. The project has no UI library and no animation library.

---

## 0. Route and file map (public)

| Route | File | Notes |
|---|---|---|
| `/` | `next.config.mjs` `redirects()` | `{ source: "/", destination: "/de", permanent: false }`. No Accept-Language detection. |
| `/[locale]` (de, en, tr) | `src/app/[locale]/page.tsx` | `export const dynamic = "force-dynamic"`. The one-pager. |
| `/[locale]/legal/imprint` | `src/app/[locale]/legal/imprint/page.tsx` | `"use client"`, hard-coded JSX per locale |
| `/[locale]/legal/privacy` | `.../legal/privacy/page.tsx` | `"use client"` |
| `/[locale]/legal/cookies` | `.../legal/cookies/page.tsx` | `"use client"` |
| `POST /api/booking` | `src/app/api/booking/route.ts` | runtime nodejs |
| `/[locale]/admin/**` | admin (out of scope) | Sits under the same `[locale]/layout.tsx`, so the admin also gets the public Header, Footer, CookieConsent and AudioPlayerProvider |

Missing: `middleware.ts`, `not-found.tsx`, `error.tsx`, `loading.tsx`, `robots.ts/txt`, `sitemap.ts/xml`, `icon`/`favicon.ico`, `opengraph-image`, `manifest`.

Layout tree: `src/app/layout.tsx` (html/body, Inter via next/font, metadata) → `src/app/[locale]/layout.tsx` (`generateStaticParams` de/en/tr; `isLocale` else `notFound()`; `<DictProvider dict locale><AudioPlayerProvider><Header/><main>{children}</main><Footer/><CookieConsent/></AudioPlayerProvider></DictProvider>`).

---

## 1. FEATURE INVENTORY (user-facing)

### 1.1 Section order on `/[locale]` (page.tsx)
1. `<PlaylistRegistrar playlist>` (invisible). It registers all songs for next/prev and auto-advance.
2. `<Hero>` `id="home"`
3. `<FeaturedPlayer>` overlaps the hero bottom (`-mt-9` / `md:-mt-12`). It has no section id.
4. `<Shows>` `id="shows"`. The source comment says "Termine directly under the featured player per docs/v5 §3".
5. `<About>` `id="about"` (the band info card)
6. `<Members>` `id="band"`
7. `<Demos>` `id="music"`
8. `<Gallery>` `id="media"`
9. `<Booking>` `id="booking"`
10. `<Footer>` `id="contact"` (in the layout)
11. `<CookieConsent>` (fixed bottom banner, in the layout)

The handoff (`handoff/desktop.html`) also has a **News** section (`id="news"`, "Alle News ansehen →"). **The live site does not implement it.**

### 1.2 Header / nav (`src/components/layout/Header.tsx`, client)
- The header is fixed (`fixed inset-x-0 top-0 z-[1000] h-[60px] md:h-[72px]`) and **fully transparent at all times**: it has no background, no scrolled state and no blur. The outer element is `pointer-events-none` and the inner one `pointer-events-auto`.
- Logo: `next/image` `/assets/branding/typhoon-signature-gold-bold.png` (2099×724 PNG, 282 KB), rendered at h-38px mobile / h-48px desktop, with `drop-shadow(0 2px 10px rgba(0,0,0,0.8))`, `priority`. It links to `/${locale}`.
- Nav items come from `HASHES = ["home","band","music","shows","media","booking","contact"]`, labelled from `dict.nav`. The nav order (Home, Band, Music, Termine, Media, Booking, Kontakt) **does not match the scroll order** (Termine comes before Band on the page). `#about` is not in the nav.
- `linkFor(h)`: on home it uses a plain `<a href="#h">`. On other routes it uses `<Link href="/${locale}#h">` (home → `/${locale}`). A source comment claims smooth scroll, but **no `scroll-behavior: smooth` exists anywhere** and there is **no `scroll-margin-top`**, so anchors land under the fixed header.
- Desktop (≥md): nav `aria-label="Hauptnavigation"` (German on all locales), items `text-[11px] font-semibold uppercase tracking-[0.18em]` in muted-cream with hover to cream, then the `<LocaleSwitcher/>`.
- Mobile (<md): LocaleSwitcher plus a burger button (40×40). `aria-controls="mobile-drawer"`, `aria-expanded`, `aria-label` = `dict.media.close` when open, else the literal `"Menu"`.
- Mobile drawer: `<nav id="mobile-drawer" aria-label="Mobile Navigation">`, `fixed inset-0 z-[1100]`, opaque `#030201`. The top bar holds the logo and a close button. Items are `font-display text-2xl font-bold` rows with bottom borders. The drawer footer shows the static text `booking@typhoon.band · +49 176 64472296`, which is **not a link**. It animates with opacity and translate-y via `transition`. Body scroll is locked while it is open (`document.body.style.overflow`). It closes on pathname change and on link click.
  - A11y bug: when closed it sets `aria-hidden` but keeps its links **focusable** (it is only `pointer-events-none opacity-0`, with no `inert` and no `hidden`). It has no focus trap and no Esc handler.
- No active-section highlighting (scrollspy) and no sticky mini-player.

### 1.3 Locale switch and routing
- `src/i18n/locales.ts`: `LOCALES = ["de","en","tr"]`, `DEFAULT_LOCALE = "de"`, `isLocale()`. The code comment calls this "middleware-less locale routing".
- `src/components/layout/LocaleSwitcher.tsx` (client): a pill `<ul aria-label="Sprache wählen">` (German label on all locales) with DE / EN / TR `<Link>`s. `pathFor(code)` replaces the first path segment and keeps the rest of the path (e.g. `/de/legal/privacy` → `/en/legal/privacy`). The **hash is dropped**. The active locale gets a gold fill (`bg-gold text-[#060403]`) and `aria-current="true"`.
- `src/i18n/dictionaries.ts`: a typed `Dict` with full de / en / tr objects. `getDict(locale)`. `DictProvider` / `useDict()` pass `{dict, locale}` through React context, so most sections are client components.
- An unknown locale calls `notFound()`, which renders the default unstyled Next 404 because no custom page exists.
- `<html lang="de">` is **hard-coded** in the root layout for every locale.
- There is no locale cookie, no browser-language redirect and no hreflang.
- Likely bug (verify in a browser): switching locale changes the `[locale]` layout segment, so `AudioPlayerProvider` remounts. The provider has **no unmount cleanup**: it never pauses, never removes the `new Audio()` element and never closes the AudioContext. A playing track therefore keeps playing with no UI left to stop it, and pressing play again starts a second element, which breaks one-at-a-time. On `/legal/*` (same segment) the provider persists, so audio keeps playing, but no player UI is shown there.

### 1.4 Hero (`src/components/sections/Hero.tsx`, client)
- The props `imageUrl` and `signatureUrl` come from the server via `getHeroContent()`. **Text comes from `dict.hero` directly**, not from `content.hero`.
- Container: `min-h-[600px] md:min-h-[640px]`, background `radial-gradient(circle at 75% 30%, rgba(199,154,75,0.20), transparent 38%), linear-gradient(90deg,#030201 0%,#050302 38%,#0c0805 100%)`.
- Desktop image: `absolute inset-y-0 right-0 w-[68%]`, `object-contain object-right`, filter `sepia(0.4) saturate(0.85) contrast(1.08) brightness(0.78)`, plus two gradient overlays (a left fade and a vignette with top/bottom fades). `priority`, no `sizes`.
- Mobile image: full-bleed `object-cover object-left`, filter `sepia(0.38) saturate(0.85) contrast(1.06) brightness(0.72)`, a left-to-right dark gradient and a bottom fade to `#030201`. `priority`, `sizes="100vw"`. Both hero images are `priority`, so both may preload.
- Signature overlay (the handwritten gold "Typhoon" PNG, `alt="" aria-hidden`) uses `mix-blend-mode: screen` and `rotate(-4deg)`:
  - desktop: `right: calc(-2% + 75px); bottom: -60px; width: 700px`
  - mobile: `right: -2%; bottom: 30px; width: 94%`
- Text block: `pt-[96px] md:pt-[132px]`, `max-w-[240px] md:max-w-[420px]`. The h1 is `font-display` (Georgia) 40px / 76px, bold, `leading-[0.96] tracking-[-0.04em]`, cream, with line 3 in `--gold`. The description is 12px / 14px muted-cream, `max-w-[220px]/[360px]`.
- CTAs: `btn btn-primary` with a play icon, `href="#music"`, label `dict.hero.ctaListen`. `btn btn-secondary`, `href="#booking"`, label `dict.hero.ctaBook`. The 3rd CTA "Live erleben" exists in `site.ts` and docs but is **not rendered**.
- The hero collage image (`hero-collage.jpeg`, 1254×1254) has a paper-texture frame at its top and bottom edges. `object-contain` on desktop shows those edges.

### 1.5 Audio system
**Provider (`src/components/audio/AudioPlayerProvider.tsx`)**
- One shared `HTMLAudioElement` is created lazily with `new Audio()`. `crossOrigin = "anonymous"` is set before any `src` assignment (so Supabase Storage MP3s are not CORS-tainted for the analyser), and `preload = "metadata"`.
- State: `{ currentId, isPlaying, progress (0..1), duration, position, volume (0..1), muted }`.
- API: `toggle(id, src)`, `seek(id, ratio)`, `setVolume(v)`, `toggleMute()`, `setPlaylist(list)`, `next()`, `previous()`, `getAnalyser()`. Plus the exported `formatTime(s)` → `m:ss` (returns `"0:00"` for 0 or NaN).
- **One-at-a-time**: `toggle` pauses the current track when switching; the same track toggles play/pause.
- Web Audio: a lazy `AudioContext` (or `webkitAudioContext`) feeds a `MediaElementSource` into an `AnalyserNode` (`fftSize 256`, `smoothingTimeConstant 0.78`) and then the destination. It is created on the first play (a user gesture) and a suspended context is resumed. Setup is best-effort; failures are swallowed.
- Listeners, assigned as `el.on*` properties and reattached per track:
  - `timeupdate` updates position, duration and progress.
  - `play` / `pause` update `isPlaying`.
  - `ended` **auto-advances** to the next playlist entry. It does not wrap at the end; after the last track it stops and resets the position.
  - `error` resets the state silently, with no user-facing error message.
  - `loadedmetadata` sets the duration. `volumechange` syncs volume and mute.
- `next()` / `previous()` go through `skipBy(±1)`, which wraps around modulo the playlist length. With no current track, next starts at index 0 and prev at the last track. `previous()` restarts the current track instead if `currentTime > 3`.
- `seek(id, ratio)` only works if `id === currentId` and the duration is finite. Clicking the waveform of a non-playing song therefore does nothing; it does not start that song.
- A rejected `play()` (e.g. by autoplay policy) resets the state to initial.
- Not present: MediaSession API (lock-screen / hardware keys), keyboard shortcuts, persisted volume, buffering / loading state, a global persistent player bar.
- `PlaylistRegistrar.tsx` calls `setPlaylist(playlist)` in an effect. The playlist is `songsForUi.map(({id, src}))` in page order.
- `useTrackDuration(src)`: a throwaway `new Audio()` with `preload="metadata"` reads each demo row's duration on mount (6 parallel metadata fetches) and cleans up with `removeAttribute('src'); load()`.

**Waveform (`src/components/audio/Waveform.tsx`)**
- `bars` defaults to 64. The idle shape is deterministic per `songId` (xfnv1a hash seeding a mulberry32 PRNG), with envelope `0.5+0.4·sin(πt)+0.18·sin(3πt)`, jitter `0.55+0.85·rng`, clamped to [0.16, 1].
- While the song is current and playing, a rAF loop reads `getByteFrequencyData` over the lower 72% of bins, applies `target = avg^0.7`, holds peaks with `peak = max(target, peak*0.85)`, clamps the minimum to 0.08, and writes `transform: scaleY()` directly to DOM refs.
- When paused, bars return to the idle shape with a `transform 360ms cubic-bezier(0.22,1,0.36,1)` transition. The `flatWhenPaused` prop exists but is unused.
- Progress colouring: bars with index `< floor(progress*bars)` are `--gold-soft`; the rest are `--bronze`. Bars are `flex-1 max-w-[3px]` with a 2px gap and radius 1px.
- Seek: an `onClick` on the container computes a ratio from `clientX`. The container is **`aria-hidden`, has no role and cannot be operated from the keyboard**.
- No `prefers-reduced-motion` handling.

**FeaturedPlayer (`src/components/audio/FeaturedPlayer.tsx`)**
- The song is the entry with `isFeatured`, else `songsForUi[0]`. In fallback data the featured song is `sen-benim`. Cover = `featured.cover ?? content.hero.imageUrl` (the hero collage). The artist defaults to `"Typhoon"`.
- Card: `rounded-[var(--radius-card)] border-line`, background `rgba(11,8,5,0.92)` (mobile) / `0.86` (desktop), `backdrop-blur-md`, shadow `inset 0 1px 0 rgba(255,255,255,0.04), 0 22px 44px rgba(0,0,0,0.5)`.
- Top row: cover 56px / 76px (sepia), eyebrow `dict.demos.featuredTag` (8px / 10px), h3 title 17px / 24px Georgia, artist line.
- **Mobile controls** (grid `36px 30px 1fr auto auto`): play/pause (`btn-icon-sm` 36px), **next only (no prev)**, waveform with 32 bars at h-24px, `position / duration`, and a mute toggle (with a `title` giving the volume %). There is no volume slider.
- **Desktop controls** (grid `44px 36px 36px 1fr auto auto`): play/pause (44px gold circle), prev, next, waveform with 96 bars at h-9, `position / duration`, a mute button and a `<input type=range class="volume-slider">` (0..1, step 0.01) whose `aria-label` is `dict.player.volumeUp` (labelled "Lauter", i.e. "louder").
- Duration shows `"—"` until the track is current. Unlike DemoRow, this player does not use `useTrackDuration`.

**Demos / DemoRow (`src/components/sections/Demos.tsx`, `src/components/audio/DemoRow.tsx`)**
- Section `id="music"`, kicker `dict.demos.kicker`, one row per song in a column with `gap-2`. The featured song also appears as row 01 and shares state with the featured player.
- Row card: `rgba(11,8,5,0.55)` background, border-line; on hover the border becomes line-strong.
- Mobile: row 1 = cover (36px), index `01`, play button (30px), title (Georgia 14px, truncated), time. Row 2 = waveform with 48 bars at h-5.
- Desktop: one grid row `44px 28px 44px minmax(140px,.9fr) minmax(0,3fr) auto auto` holding cover (44px), index, play (36px), title (15px), waveform (72 bars, h-7), time and a **per-row mute button** that mutes globally, which is confusing.
- Time label: `position / duration` when the row is current, else the metadata duration or `"—:—"`.
- Play button `aria-label` = `"{Abspielen|Pause} {title}"` (localized). Cover `alt="Cover {title}"`. The default cover for every row is `/assets/hero/hero-collage.jpeg`, so all six rows look identical.
- **No download button, no native controls** (as the rules require).

### 1.6 Shows / Termine (`src/components/sections/Shows.tsx`)
- Section `id="shows"`. SectionHeader shows kicker `dict.shows.kicker` and a link `dict.shows.link` ("Alle Termine ansehen →"), which **points to `#booking`**. No shows page or archive exists.
- Data flow: `page.tsx` computes `supabaseShows = content.shows.filter(s => Boolean(s.startsAt))` and passes `rows` only if that list is non-empty. Otherwise `Shows` builds 4 **TBA placeholder cards** from `dict.shows.placeholderTitles/Region/Time`, with `dateLabel "TBA"` and `year` hard-coded to **"2025"**, which is stale.
- Supabase rows (`formatShowCard`): `dateLabel = toLocaleDateString("de-DE",{day:"2-digit",month:"short"})` (always de-DE, e.g. "12. Okt."), year = `getFullYear()`, `region = "city, country"`. `time` is the same de-DE date label again because `normaliseShows` sets `time: day`, so **the date is shown twice**. The page shows no time of day, weekday or event_type.
- **Past vs. upcoming logic: NONE.** No filter compares `starts_at` with now. Past shows stay visible until an admin hides or unpublishes them. `fetchShows()` orders by `starts_at` asc (nulls last) then `sort_order`, and `normaliseShows` then **re-sorts by `sort_order`**.
- Bug: TBA shows from Supabase (`is_tba = true`, `starts_at null`) become `starts_at: ""` → `startsAt: ""` and are **filtered out by page.tsx**. Admin-created TBA shows therefore never appear publicly.
- Layout: desktop `grid-cols-4` showing **only the first 4 cards** (`slice(0,4)`). Mobile uses a horizontal `.scroll-rail` (scroll-snap, hidden scrollbar) with cards at `w-[78%] max-w-[280px]`.
- Card: a date column (Georgia 24px / 28px in gold-soft, plus a 9px year) and an info column (title 13px / 14px, `◉` region, time). If `ticketUrl` is set, the whole card is an `<a target=_blank rel="noopener noreferrer">`; there is no visible "Tickets" affordance.

### 1.7 About / band info card (`src/components/sections/About.tsx`)
- Section `id="about"`, kicker `dict.about.kicker`. An article grid with image left and text right (`md:grid-cols-[5fr_7fr]`); on mobile the image sits on top with `aspect-[5/3]`.
- Image: `content.bandInfo.imageUrl` (fallback `/assets/gallery/gallery-5.jpg`, which is Typhoon singing live), `fill`, filter `saturate(0.92) contrast(1.05) brightness(0.92)`, two gradient overlays, `alt="Typhoon — Live"`.
- Text: eyebrow `dict.about.eyebrow` ("Typhoon"), h2 headline (Georgia 22px / 34px), body (13px / 14px), the genre line as an eyebrow, and CTAs `btn-secondary` "Mehr über die Band" → `#band` plus `btn-primary` "Booking Anfrage" → `#booking`.
- **Text comes from `dict.about` directly, not from `content.bandInfo`.** The longer `site.about.lead` paragraph is never rendered.

### 1.8 Members (`src/components/sections/Members.tsx`)
- Section `id="band"`, kicker `dict.members.kicker`. Grid of 2 columns (mobile) / 4 columns (md+), 8 cards.
- Card: photo at `aspect-[4/3]`, `object-cover sepia-img`, `alt="{name} – {role}"`. When `isPlaceholder`, a badge reading **"Platzhalter"** (German on all locales) sits top-right. Below: h3 name (Georgia 15px / 17px), role (9px / 10px uppercase gold-soft) and bio (11px / 12px).
- The card has no click interaction, no modal and no social links.
- 6 of the 8 photos are **low-res crops of the hero collage** (see 2.4).

### 1.9 Gallery + lightbox (`src/components/sections/Gallery.tsx`, `src/components/media/MediaLightbox.tsx`)
- Section `id="media"`, kicker `dict.media.kicker`. Grid of 4 columns on mobile and **8 on desktop** with square thumbnails (`aspect-square`), so the tiles are about 130px on desktop.
- Each tile is a `<button>` with `aria-label="{dict.media.open}: {alt}"` and a focus-visible gold outline. Images use `sepia-img` and `hover:scale-105` over 500ms.
- The lightbox renders `role="dialog" aria-modal="true" aria-label={dict.media.kicker}`, `fixed inset-0 z-[1300]`, background `rgba(3,2,1,0.94)` with `backdrop-blur-md`.
  - Controls: 44px round buttons for close, prev and next (localized aria-labels), an `index+1 / total` counter pill and the image with `object-contain max-h-[85vh]`, `priority`.
  - Keyboard: Esc closes; ← and → navigate with wrap-around. Body scroll is locked while open.
  - Missing: focus trap, initial focus, focus return to the thumbnail, backdrop click-to-close, swipe gestures, captions and preloading of neighbouring images.
- Images only. `media_items.type === "video"` rows are filtered out, so there is no video support.
- `useLightbox()` is exported but unused.

### 1.10 Booking (`src/components/sections/Booking.tsx` + `src/app/api/booking/route.ts` + `src/lib/validation/booking.ts`)
- Section `id="booking"`. Grid `md:grid-cols-[1.45fr_1fr]` with the form on the left and an image card on the right.
- The form has `id="booking-form"` and `noValidate`. Fields use **placeholders only; there are no `<label>` elements**:
  | name | type | required | placeholder (de) |
  |---|---|---|---|
  | `hp_field` | text, off-screen honeypot (`absolute -left-[9999px]`, `tabIndex=-1`, `aria-hidden`) | — | — |
  | `name` | text | yes | `Name *` |
  | `email` | email | yes | `E-Mail *` |
  | `phone` | tel | no | `Telefon (optional)` |
  | `event_date` | date | no | `Veranstaltungsdatum` |
  | `event_location` | text | yes | `Ort *` |
  | `event_type` | text (free text, **not a select**) | yes | `Art der Veranstaltung *` |
  | `message` | textarea | yes | `Nachricht *` |
- **The submit button sits outside the form**, inside the image aside (`<button form="booking-form" type="submit">`). On mobile it renders below a square image, far from the fields.
- The aside image is `/assets/gallery/gallery-3.jpg`, the poster with the Typhoon logo baked in. It uses `object-contain` on mobile and `object-cover` on desktop, `alt="Typhoon — Band mit Signatur"`. On mobile only, the aside also shows `booking@typhoon.band · +49 176 64472296` as plain text.
- A notice under the form (9px / 10px uppercase): `dict.booking.backendNotice` ("Anfragen gehen direkt an booking@typhoon.band. Antwort innerhalb von 48 Stunden.").
- Client flow:
  1. A filled honeypot makes the submit return silently.
  2. Presence check on name, email, event_location, event_type and message; a missing field shows `dict.booking.requiredErr`.
  3. `fetch('/api/booking', POST JSON {...fields, locale})`.
  4. An unparseable response shows `networkErr`. `ok:false` shows `body.message` (German, from the server). `status:"fallback"` shows the fallback message. Otherwise the success message is shown and `form.reset()` runs.
  5. The notice box uses `role="alert"` for errors and `role="status"` otherwise, with `aria-live="polite"`. Success is gold, fallback is neutral and error is red (`#f4c8b3` text).
  6. The button label switches to `dict.booking.submitting` and the button is disabled while submitting.
- The client ignores `body.field`, so there is no per-field error highlighting or focus.
- **Server** `validateBooking` checks, in order:
  - honeypot
  - `name` ≥ 2 characters (max 120)
  - email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (max 200)
  - `event_location` ≥ 2
  - `event_type` ≥ 2
  - `message` ≥ **10** characters (max 4000)
  - `event_date` empty or `/^\d{4}-\d{2}-\d{2}$/`
  - `phone` max 60, `locale` must be de/en/tr (else de)
  All validation messages are **German only**, e.g. "Bitte schreibe uns ein paar Zeilen mehr.", and are shown to EN and TR users as well.
- **Server flow**:
  1. Invalid JSON → 400.
  2. A honeypot hit → `{ok:true,status:"fallback"}` (masks the check from bots).
  3. Invalid input → 400 `{ok:false,status:"validation",field,message}`.
  4. `Promise.all([storeBookingRequest (Supabase service-role insert into booking_requests, status "new", locale, user_agent, ip_hash null), deliverEmail (Resend REST, to BOOKING_EMAIL, from WEBSITE_FROM_EMAIL, reply_to = sender, subject "Neue Booking-Anfrage über typhoon.band", HTML+text template)])`.
  5. Neither channel configured → `{ok:true,status:"fallback",message:"Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden."}`.
  6. **Both** channels failed → 502 error. **Any other combination → "sent"**.
- **Bug**: if one channel is configured and fails while the other is not configured (e.g. Supabase insert fails and no RESEND_API_KEY), the user sees success and the request is lost.
- No rate limiting, CAPTCHA or Turnstile, no privacy-consent checkbox or link at the form, no auto-reply or confirmation mail to the sender.

### 1.11 Cookie consent (`src/components/layout/CookieConsent.tsx`)
- A fixed bottom banner (`z-[1200]`, `max-w-[840px]`, background `#080604`). `role="dialog"` with `aria-label` = title; not modal and without focus management.
- It renders only after hydration: the state starts `undefined` and the effect reads `localStorage["typhoon.cookie-consent"]`.
- Buttons: "Nicht jetzt" (secondary) stores `"declined"`; "Verstanden" (primary) stores `"accepted"`. Either choice hides the banner permanently. A blocked `localStorage` hides it for the session only.
- It links to `/${locale}/legal/privacy` and `/${locale}/legal/cookies`.
- **It gates NOTHING.** The public site loads no trackers and no embeds, and nothing reads the stored value. There is no way to reopen or change preferences. The public site sets no cookies at all (only this localStorage key).

### 1.12 Footer (`src/components/layout/Footer.tsx`)
- `<footer id="contact">`, border-top, grid `md:grid-cols-[1.4fr_1fr_1fr_0.8fr]`:
  1. Logo `typhoon-signature-gold.png` (h-12 / h-14) plus `dict.footer.blurb`.
  2. `h4` `dict.footer.contact` with a `mailto:booking@typhoon.band` link and `+49 176 64472296` as **plain text** (no `tel:`).
  3. `h4` `dict.footer.follow` with 4 round icon links: Instagram, Facebook, YouTube, Spotify. All have **`href="#"`** because `site.social.*` is empty, so they are dead links. Supabase `platform_links` are fetched in `getPublicPageContent` but **never rendered**.
  4. `h4` `dict.footer.legal` with links to imprint, privacy and cookies.
- Bottom line: `dict.footer.copyrightTemplate` with `{year}` = the current year.
- Contact data comes from the static `src/data/site.ts`, **not** from Supabase `siteSettings`.

### 1.13 Legal pages
- `LegalShell` (`src/components/legal/LegalShell.tsx`): "← {backToHome}" link, kicker, h1 (Georgia 34px / 48px), `dict.legal.draftNote` shown on every page ("Initialer Stand — wird laufend ergänzt." / "Initial draft — extended over time." / "İlk taslak — zaman içinde genişletilecektir."), and a content panel.
- Content is **hard-coded JSX per locale** (see 2.8). `getLegalPage()` (Supabase `legal_pages`) exists but is **not used** by the public pages.
- The pages are client components, so they export no metadata and every page shares the root title.

### 1.14 SEO / metadata
- Root `metadata` only (`src/app/layout.tsx`):
  - title default `"Typhoon — Funk · Soul · Jazz · Bluesrock"` (omits Southern Rock), template `"%s · Typhoon"`.
  - description (German, for all locales) `"Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock."`
  - `metadataBase = NEXT_PUBLIC_SITE_URL` (`.env.example`: `https://typhoon.band`).
- Missing: `generateMetadata` per locale or page, OpenGraph and Twitter cards and OG image, canonical, `alternates.languages` / hreflang, favicon, apple-touch icon and manifest, robots and sitemap, JSON-LD (`MusicGroup`, `MusicEvent`), `themeColor`. `getSeoEntry()` exists but is unused.
- `html lang="de"` for every locale.

### 1.15 Accessibility summary
- Present:
  - localized aria-labels on the player buttons
  - `aria-expanded` / `aria-controls` on the burger
  - `aria-current` in LocaleSwitcher
  - focus-visible outlines on `.btn`, gallery tiles and the volume slider
  - lightbox Esc and arrow keys
  - `role=alert` / `role=status` on the booking notice
  - decorative SVGs `aria-hidden`
- Missing or broken:
  - no skip link
  - **no `prefers-reduced-motion` anywhere** (waveform rAF, transitions, hover scale, drawer)
  - drawer links focusable while hidden
  - no focus trap or focus return in the drawer and lightbox
  - waveform seek is mouse-only
  - placeholder-only form fields
  - broken heading outline: h1 in the hero, then section kickers are `<span>`s. Only About has an h2; Members and the player use h3 directly, and the footer uses h4.
  - very small type: 8, 9, 10 and 11 px text is common
  - German-only aria and alt strings ("Hauptnavigation", "Sprache wählen", "Platzhalter", "Typhoon — Band Live Collage", "Typhoon live, Foto N", "Typhoon — Band mit Signatur") plus the English "Menu" and "Mobile Navigation"
  - gallery alt texts are inaccurate: they say "live" although most images are rehearsal-room and instrument shots

### 1.16 Other
- There is no newsletter, press kit / EPK, video, streaming-platform links, merch or news section.
- `site.bookingDisabledNotice` ("Booking-Versand wird im nächsten Batch angebunden.") is unused publicly.

---

## 2. CONTENT FACTS (verbatim)

### 2.1 Brand / genre
- `site.brand.name`: `Typhoon`. Tagline: `Bluesrock · Funk · Soul · Jazz · Southern Rock`.
- Genre line: de `BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK`; en and tr `BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK`.
- Spelling rule (from `src/data/members.ts`): **"Typhoon (not Taifun), Schack on Sax, Jürgen on guitar, no Daniel."** The docs also require exactly 8 musicians in that order.

### 2.2 Hero (dict)
| | de | en | tr |
|---|---|---|---|
| line1 | SMOOTH. | SMOOTH. | SMOOTH. |
| line2 | EXZEPTIONELL. | EXCEPTIONAL. | OLAĞANÜSTÜ. |
| line3 (gold) | FUNK. | FUNK. | FUNK. |
| description | Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie. | Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock — powerful, warm, full of live energy. | Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir — güçlü, sıcak ve sahnede dolu enerjik. |
| ctaListen | Songs anhören | Listen to songs | Şarkıları dinle |
| ctaBook | Booking Anfrage | Booking request | Booking talebi |
- Unused: `site.hero.ctaLive` = `Live erleben`.

### 2.3 About / band description
| | de | en | tr |
|---|---|---|---|
| kicker | Über Typhoon | About Typhoon | Typhoon Hakkında |
| eyebrow | Typhoon | Typhoon | Typhoon |
| headline | Amerikanisches Feeling. Europäische Seele. Türkische Texte. | American feeling. European soul. Turkish lyrics. | Amerikan tını. Avrupalı ruh. Türkçe sözler. |
| body | Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet. | Typhoon breaks genre boundaries without losing their handwriting: punchy blues riffs, funky grooves, soulful melodies, jazz finesse and Turkish-language lyrics. An experienced band that ignites the moment they hit the stage. | Typhoon, kendi imzasını kaybetmeden tür sınırlarını aşar: vurucu blues riff'leri, funky groove'lar, ruhlu melodiler, jazz incelikleri ve Türkçe sözler. Sahneye çıktığı an alev alan tecrübeli bir grup. |
| cta | Mehr über die Band | More about the band | Grup hakkında daha fazla |
| ctaBook | Booking Anfrage | Booking request | Booking talebi |

Unused DE long text, `site.about.lead` (verbatim):
> Typhoon präsentiert einen kraftvollen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit amerikanisch-europäischem Sound. Selbstkomponierte Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen. Türkischsprachige Texte geben den Songs Tiefe und kulturelle Eigenständigkeit.

Footer blurb:
- de: `Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.`
- en: `Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock.`
- tr: `Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir.`

### 2.4 Members (8, in this order; `src/data/members.ts` plus dict maps)
| # | id | name | role de / en / tr | photo (fallback) | placeholder |
|---|---|---|---|---|---|
| 1 | typhoon | Typhoon | Gesang / Vocals / Vokal | `/assets/band-cards/typhoon-band-card.jpg` (1440×929, live shot of him singing at a red Nord keyboard, sunglasses, white tee) | no |
| 2 | mika | Mika | Posaune / Trombone / Trombon | `/assets/band-cards/mika-band-card.jpg` (3024×4032, 1.57 MB festival selfie with trombone; poor fit for a 4:3 crop) | no |
| 3 | schack | Schack | Saxophon / Saxophone / Saksofon | `/assets/members/schack-sax.jpeg` | yes |
| 4 | hardy | Hardy | Trompete / Trumpet / Trompet | `/assets/members/hardy-trumpet.jpeg` | yes |
| 5 | stefan | Stefan | Funk-Bass / Funk Bass / Funk Bas | `/assets/members/stefan-bass.jpeg` | yes |
| 6 | tom | Tom | Schlagzeug / Drums / Davul | `/assets/members/tom-drums.jpeg` | yes |
| 7 | bugra | Buğra | Gitarre / Guitar / Gitar | `/assets/members/bugra-guitar.jpeg` | yes |
| 8 | jurgen | Jürgen | Gitarre / Guitar / Gitar | `/assets/members/jurgen-guitar.jpeg` | yes |

- Unused: `/assets/members/typhoon-vocals.jpeg` and `mika-trombone.jpeg` exist but are not referenced.
- **All `/assets/members/*.jpeg` files are actually PNGs** (RGBA, about 250–376 px wide, e.g. schack 339×477). They are low-res crops of the hero collage, with neighbours' body parts visible at the edges.

Bios (verbatim, de | en | tr):
- **typhoon**: Frontmann, türkischsprachige Texte und direkte Energie im Zentrum der Band. | Frontman — Turkish-language lyrics and the live energy at the heart of the band. | Sahnenin önünde Türkçe sözler ve grubun merkezindeki canlı enerji.
- **mika**: Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien. | Young trombone sound, raw live character, warm brass lines. | Genç trombon tonu, sahnedeki ham karakter ve sıcak nefesli partileri.
- **schack**: Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion. | Experience, warm phrasing and a soulful tone driving the brass section. | Tecrübe, sıcak frazeler ve nefesli grubuna soul katan bir saksofon tonu.
- **hardy**: Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck. | Punchy brass voice between funk, blues rock and stage power. | Funk, blues rock ve sahne gücü arasında etkileyici bir trompet sesi.
- **stefan**: Groovendes Fundament, präziser Druck und warme Tiefe. | Grooving foundation, precise punch and warm low end. | Groove temeli, isabetli vuruş ve sıcak alt bant.
- **tom**: Treibender Puls, Live-Energie und rhythmische Stabilität. | Driving pulse, live energy and rhythmic stability. | Sürükleyici nabız, sahne enerjisi ve sağlam ritim zemini.
- **bugra**: Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung. | Guitar lines with a Turkish accent, groove and melodic tension. | Türk müzik izi taşıyan, groove ve melodik gerilim dolu gitar partileri.
- **jurgen**: Gitarrensound zwischen Rhythmus, Wärme und rockiger Kante. | Guitar tone balancing rhythm, warmth and a rock edge. | Ritim, sıcaklık ve rock kenarını birleştiren gitar tonu.

Section kicker: `Band Mitglieder` / `Band Members` / `Grup Üyeleri`.

### 2.5 Songs (6 demos, `src/data/songs.ts`; featured = `songs[0]`)
Durations were computed from the MP3 Xing/Info frame headers and are approximate where marked.
| # | id | title | src | size | duration | featured |
|---|---|---|---|---|---|---|
| 1 | sen-benim | Sen Benim | `/assets/audio/demos/Sen-Benim.mp3` | 9.01 MB | 5:35 (VBR) | **yes** |
| 2 | karanfil | Karanfil | `/assets/audio/demos/karanfil-demo.mp3` | 8.42 MB | 5:30 (VBR) | |
| 3 | gece-yine-dustun | Gece Yine Düştün | `/assets/audio/demos/gece-yine-dustun-demo.mp3` | 8.72 MB | 9:05 (CBR 128k) | |
| 4 | farksilin | Farksilin | `/assets/audio/demos/farksilin-demo.mp3` | 3.87 MB | ≈4:02 (CBR 128k, no Xing header, estimated) | |
| 5 | cilgin | Çılgın | `/assets/audio/demos/cilgin-demo.mp3` | 6.19 MB | 3:20 (VBR) | |
| 6 | bir-tek-sen | Bir Tek Sen | `/assets/audio/demos/bir-tek-sen-demo.mp3` | 6.37 MB | 3:34 (VBR) | |

- Total audio is about 42.6 MB.
- Discrepancies to confirm with the owner:
  - `docs/03-content-facts.md` lists `Sen-Benim` (hyphen) and **`Karanfill`** (double l).
  - `public/assets/audio/demos/README.md` expects `karanfill.mp3`.
  - The code uses the titles "Sen Benim" and "Karanfil".
- Featured tag: `Aktueller Demo · Single` / `Current demo · Single` / `Güncel demo · Single`. Demos kicker: `Demos` / `Demos` / `Demolar`.

### 2.6 Shows data
- There are no real show dates anywhere; the source comment says "We never invent fake events".
- Static `src/data/shows.ts`: 4 TBA entries (`day "TBA"`, `month "2025"`).
- Dict placeholders:
  - de titles: `Neue Termine in Vorbereitung`, `Festival-Saison`, `Club-Tour`, `Privat- & Firmenevents`. Regions: `Deutschland`, `Süddeutschland`, `DE / AT`, `Anfrage`. Times: `Demnächst`×3, `Booking offen`.
  - en: `New dates in preparation`, `Festival season`, `Club tour`, `Private & corporate events`. Regions: `Germany`, `Southern Germany`, `DE / AT`, `On request`. Times: `Soon`×3, `Booking open`.
  - tr: `Yeni tarihler hazırlanıyor`, `Festival sezonu`, `Kulüp turnesi`, `Özel & kurumsal etkinlikler`. Regions: `Almanya`, `Güney Almanya`, `DE / AT`, `Talep üzerine`. Times: `Yakında`×3, `Booking açık`.
- Kicker: `Termine` / `Shows` / `Tarihler`. Link: `Alle Termine ansehen →` / `All shows →` / `Tüm tarihler →`.
- Supabase `shows` columns: id, starts_at (nullable since 0002), is_tba, venue, city, country, ticket_url, event_type, is_visible, is_published, sort_order, source_booking_request_id, plus `show_translations(notes)`.

### 2.7 Contact / social
- Booking email: **`booking@typhoon.band`**. It is the only active address; the code comment says "info@typhoon.band is not yet provisioned and is intentionally not exposed anywhere". `docs/03-content-facts.md` still lists `info@typhoon.band` for contact and the imprint.
- Phone: **`+49 176 64472296`**.
- Server env defaults: `BOOKING_EMAIL=booking@typhoon.band`, `WEBSITE_FROM_EMAIL=website@typhoon.band`.
- Social: `instagram`, `facebook`, `youtube`, `spotify`, `soundcloud` and `bandcamp` are all `""`. No real platform URLs exist in the repo.
- Booking backend notice: de `Anfragen gehen direkt an booking@typhoon.band. Antwort innerhalb von 48 Stunden.` / en `Requests go straight to booking@typhoon.band. Reply within 48 hours.` / tr `Talepler doğrudan booking@typhoon.band adresine ulaşır. Yanıt 48 saat içinde.`
- Booking messages (de): submit `Booking anfragen`, submitting `Wird gesendet…`, requiredErr `Bitte fülle alle Pflichtfelder aus.`, ok `Danke für deine Anfrage. Wir melden uns so schnell wie möglich.`, fallback `Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden.`, error/network `Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.`
- Booking messages (en): submit `Send booking request`, labels `Name *`, `Email *`, `Phone (optional)`, `Event date`, `Location *`, `Type of event *`, `Message *`.
- Booking messages (tr): submit `Booking talebi gönder`, labels `İsim *`, `E-posta *`, `Telefon (isteğe bağlı)`, `Etkinlik tarihi`, `Yer *`, `Etkinlik türü *`, `Mesaj *`.

### 2.8 Imprint / privacy / cookies
- Imprint (`site.imprint`): **Mika Hertler, Am Schwarzen Steg 5a, 95448 Bayreuth, Deutschland**, contact `booking@typhoon.band` and `+49 176 64472296`.
- Imprint sections (de):
  - "Angaben gemäß § 5 TMG"
  - "Kontakt"
  - "Verantwortlich für den Inhalt" ("Verantwortlich nach § 55 Abs. 2 RStV: Mika Hertler, …")
  - "Haftung für Inhalte" (§ 7 Abs. 1 TMG, §§ 8–10 TMG)
  - "Streitbeilegung": "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
  - EN and TR versions are equivalent translations.
- Privacy sections (de):
  - Intro "Wir nehmen den Schutz personenbezogener Daten ernst … (DSGVO, BDSG)…"
  - "Verantwortlicher" (address plus email · phone)
  - "Booking-Anfragen": data = Name, E-Mail, Telefon, Veranstaltungsdatum, Ort, Art der Veranstaltung, Nachricht; legal basis Art. 6 Abs. 1 lit. b DSGVO; "Die Daten werden nicht an Dritte weitergegeben."
  - "Hosting" (Vercel, log data, AV contract per Art. 28)
  - "Externe Plattformen": plain links only, no embeds
  - "Eure Rechte": Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, via booking@
- Cookies sections (de):
  - "only technically necessary cookies, no trackers"
  - "Technisch notwendige Cookies" (Art. 6 Abs. 1 lit. f)
  - "Optionale Embeds" (a consent banner will appear once embeds are enabled)
  - "Cookie-Banner" (the choice is stored in localStorage only)
- Legal-quality issues, to be verified by a lawyer:
  - TMG and RStV are outdated; they have been replaced by **DDG § 5** (since 14 May 2024) and **MStV § 18 Abs. 2**.
  - The privacy policy omits the actual processors **Supabase** (booking DB) and **Resend** (mail, US), third-country transfers, retention periods and the right to complain to a supervisory authority (Art. 77).
  - "nicht an Dritte weitergegeben" is inaccurate given these processors.
  - The ODR platform sentence has no link, and the EU ODR platform was discontinued in July 2025.
  - The site claims to use "technically necessary cookies" while the public site sets none.

### 2.9 Other assets
- `public/assets/hero/hero-collage.jpeg` (1254×1254): a sepia composite of all 8 members with paper-texture borders.
- `hero/singer-stage.jpeg` (1391×956): unused in code.
- `branding/typhoon-signature-gold.png` and `-bold.png` (2099×724, transparent gold handwritten "Typhoon" with an extended underline stroke).
- Gallery (`alt="Typhoon live, Foto N"`):
  1. rehearsal room with Nord keyboards and a Hammond organ (1440×1393)
  2. wide rehearsal room with drums and Persian rugs (2016×1512)
  3. **poster**: the sepia collage with the gold "Typhoon" logo baked in (2048×2048)
  4. black-and-white Fender Strat lying on a Hammond B3 (1080×712)
  5. Typhoon singing live, white tee (1391×956). This is also the About image.
  6. wide rehearsal room with a bağlama/saz (1440×1019)
  7. rehearsal room, a near-duplicate of #2 (1077×787)
  8. Hammond B3 organ (1438×1391)
  Images 3 and 5 are reused in Booking and About, so they are duplicated on the page.
- `handoff/assets/typhoon-data.js` contains **fictional placeholder data**. **Never copy it**: Istanbul location, `info@typhoonband.com`, `+90 532 123 45 67`, fake members "Taner Yücel" and others, fake songs "Find A Way" and others, fake shows at Zorlu PSM and elsewhere, fake news items. The same fictional contact block appears in the handoff footer HTML.

---

## 3. DESIGN TOKENS

`src/app/globals.css` `:root` (ported from `handoff/assets/typhoon-shared.css`):
```
--bg #030201  --bg-2 #060403  --bg-3 #100a06  --panel #0b0805  --panel-strong rgba(11,8,5,.94)
--bronze #6f4a1f  --deep-gold #b8873b  --gold #c79a4b  --gold-soft #e8c982
--cream #f2e6cf  --muted-cream #c9bda5  --muted #b9aa90
--line rgba(232,201,130,.22)  --line-strong rgba(232,201,130,.42)
--radius-card 10px   --radius-button 999px (pill)
```
- The handoff's own values differ: `--radius-card 8px`, `--radius-button 7px`, `--container 1280px`.
- `tailwind.config.ts` maps the colours to the vars, `borderRadius.card 8px` and `button 7px` (**both unused**, since components use `var(--radius-card)` = 10px), and `maxWidth.container 1180px`.
- Body background: radial gold and bronze glows over a vertical gradient with `background-attachment: fixed`. `body::before` adds a fixed SVG fractal-noise overlay at `opacity .05`, `mix-blend-mode: overlay`, `z-index 99`.
- Sepia filters (`.sepia-img` = `sepia(.32) saturate(.78) contrast(1.05)`; `.sepia-img-strong`) are applied at runtime.
- Buttons (`.btn`):
  - geometry: pill, `padding 10px 18px` (md `11px 22px`), Inter 600, uppercase, `letter-spacing .16em`, 10.5px / 11px.
  - `.btn-primary`: gold background, `#060403` text, inset highlight; hover `--gold-soft`.
  - `.btn-secondary`: transparent with a `rgba(232,201,130,.32)` border.
  - `.btn-icon`: 44px gold circle; `-sm` 36px, `-xs` 30px.
  - `.btn-ghost-icon`: 36px, no fill.
- Kicker: 9px / 10px, 600, `.22em`, muted-cream. Eyebrow: 10px, 700, `.22em`, gold-soft.
- Fields: `rgba(232,201,130,.04)` background, radius 6px, 12px / 13px text; on focus the border turns gold.
- `.scroll-rail`: horizontal snap. `.volume-slider`: 3px track with a 12px gold thumb.
- `.panel` is defined but unused.
- Spacing and layout: every section uses `mt-7` (28px), which is very tight for a "cinematic" site; container `max-w-[1180px] px-4 md:px-8`; header 60px / 72px; hero min-h 600px / 640px.
- Z-index map: noise 99, header 1000, drawer 1100, cookie banner 1200, lightbox 1300.
- **Fonts:**
  - Inter is loaded via `next/font/google` (`subsets latin`, weights 300–700, `variable: "--font-inter"`, `display: swap`) and only applied as the `--font-inter` class on `<html>`.
  - The display face is **Georgia, the system serif** (`fontFamily.display = ["Georgia","Times New Roman","ui-serif","serif"]`), with no web font. Headlines are bold with negative tracking.
  - **Probable bug:** `<body className="font-sans">` resolves to the literal `font-family: Inter, system-ui, sans-serif` (Tailwind `fontFamily.sans`). `.btn`, `.kicker` and `.eyebrow` also hard-code `Inter`. next/font registers the face under a hashed family name (`__Inter_xxxx`) that is only reachable through `var(--font-inter)`, and the `html, body { font-family: var(--font-inter, Inter) }` rule loses to the `.font-sans` class on specificity. The result is that **Inter is downloaded and preloaded but the UI renders in system-ui** (unless the visitor has Inter installed locally). This should be verified in a browser.

---

## 4. WEAKNESSES

**UX / content**
- The header is transparent over all content, with no scrolled background, so nav text collides with the page. There is no smooth scroll, no scroll offset and no active state. The nav order differs from the section order.
- "Alle Termine ansehen →" goes to `#booking`; there is no shows archive. The desktop shows only 4 cards. There is no past/upcoming split, the placeholder year is stale ("2025" in 2026), the date is shown twice on Supabase cards, dates are always de-DE, and **TBA shows from Supabase are hidden** (bug).
- All 6 demo rows use the same cover. The mobile featured player lacks prev and volume. The featured player duration shows "—" until play. A per-row mute button mutes globally. Clicking the waveform of a non-active track does nothing.
- There is no persistent or sticky mini-player, so playback continues on legal pages without controls. Ghost playback is likely after a locale switch.
- 6 of 8 member photos are blurry placeholder crops with a visible German "Platzhalter" badge. The Mika photo is a wide-angle selfie.
- The gallery is 8 tiny 1:1 tiles. Alt texts are generic or wrong, there is a near-duplicate pair, and images are re-used in About and Booking. There is no video.
- The booking submit button is visually detached from the form. Fields are placeholder-only, `event_type` is free text, and there are no inline field errors. Server errors are German-only.
- **The booking result is misreported as success when the single configured channel fails.** There is no rate limit.
- Social icons are dead `#` links, and fetched platform links are never shown. The phone number is not `tel:` and the drawer email is not `mailto:`.
- The cookie banner is shown although nothing is gated. "Nicht jetzt" suppresses it forever and it cannot be reopened.
- Legal pages show a "draft" note and use outdated legal references (TMG / RStV).
- Hero / About text and contact data ignore Supabase: the dictionary and `site.ts` are hard-wired.
- No News section, although the handoff has one. No streaming links, EPK or newsletter. "Live erleben" is missing.

**Visual**
- Spacing is uniformly cramped (28px between sections). Type is small (8–11 px) throughout.
- The Georgia display face feels generic. Inter is probably not applied at all.
- Radius tokens are inconsistent (10 / 8 / 7 / 6 px and pills). Sections are box-in-box panels, so everything reads as "cards on black".
- The desktop hero collage uses `object-contain`, so the paper frame edges and a letterbox can show.

**A11y**
- See 1.15: no skip link, no reduced-motion handling, focusable hidden drawer, no focus traps, mouse-only waveform seek, missing labels, broken heading hierarchy, fixed `lang="de"`, German-only aria and alt text, mislabelled volume slider ("Lauter").

**Performance**
- `force-dynamic` on the home page with no caching or `revalidate` means about 9 Supabase round-trips per request. `site_settings` is read 3 times (`fetchSiteSettings` plus `fetchPublicAssetSettings` twice).
- Nearly every section is a client component because of `useDict` context, which ships the full de/en/tr dictionary to the client.
- Both hero images are `priority`. The fixed full-viewport blend-mode noise overlay plus `background-attachment: fixed` cost scroll performance. Runtime CSS filters run on large images.
- The provider's `timeupdate` `setState` re-renders every audio consumer about 4× per second. There are 6 extra metadata fetches on load. The MP3s are 3.9–9 MB each.
- A 282 KB PNG is used as a 38px logo, with no SVG.
- next.config sets no security headers (CSP, Permissions-Policy and others).

**Code quality**
- Dead code or data: `site.hero.*` (duplicated by the dict), `site.about.lead`, `ctaLive`, `bookingDisabledNotice`, `useLightbox`, `flatWhenPaused`, `.panel`, Tailwind radius tokens, `getSeoEntry`, `getLegalPage` (public), `platformLinks`, `siteSettings`, and `data/shows.ts` placeholders duplicated in the dict.
- Duplicated icon components (FeaturedPlayer and DemoRow).
- The hard-coded contact line in the Header duplicates `site.ts`.
- Legal texts are JSX per locale instead of data.
- `normaliseShows` stores the date label in `time`.
- The audio provider has no unmount cleanup and assigns listeners via `on*` properties.
- Admin pages render inside the public chrome (Header, Footer, cookie banner).

---

## 5. CONTENT LAYER: Supabase vs. fallback (exact)

Files: `src/lib/content/{index.ts, fallback.ts, normalize.ts, supabase-content.ts, types.ts}` and `src/lib/admin/site-settings.ts` (`fetchPublicAssetSettings`).

1. **Configuration gate:** `isSupabaseConfigured()` in `src/lib/env.ts` returns `Boolean(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)`. `getServerSupabase()` in `src/lib/supabase/server.ts` returns `null` when unconfigured; otherwise it returns a cached anon `createClient<Database>` with no session persistence (RLS-bound, `server-only`).
2. **Fetchers** (`supabase-content.ts`, `import "server-only"`) return `Maybe<T> = T | null`:
   - `null` means "Supabase had no answer" (not configured, or an error inside `safeQuery`).
   - `[]` means "Supabase is the source of truth and is empty".
   - Functions: `fetchSiteSettings()` (site_settings `is_public`), `fetchHero()` (**always null**), `fetchBandInfo()` (**always null**), `fetchMembers(locale)` (band_members incl. hidden rows plus band_member_translations for the locale, joined in JS), `fetchSongs()` (`is_visible && is_streamable`, ordered by sort_order), `fetchGallery()` (media_items `is_visible`), `fetchShows()` (`is_visible && is_published`, ordered by starts_at then sort_order; null starts_at → `""`), `fetchLegalPage(type, locale)`, `fetchPlatformLinks()` (`is_active`), `fetchSeoEntry(path, locale)`.
3. **Loaders** (`index.ts`) wrap every fetcher in `safe()` (try/catch → null), then:
   - `getSiteSettings()`: rows null or empty → `buildSiteSettingsFallback()`; else `normaliseSiteSettings(rows, fb)` (keys `brand{name,tagline,genreLine}` and `contact{booking,phone}`).
   - `getHeroContent(locale)`: `fetchHero` is null, so it uses `buildHeroFallback(locale)` (dict text plus `/assets/hero/hero-collage.jpeg` and `/assets/branding/typhoon-signature-gold.png`). It then overrides `imageUrl` and `signatureUrl` from `fetchPublicAssetSettings()` keys `hero_image` and `hero_signature` (value `{url}`).
   - `getBandInfo(locale)`: dict plus `/assets/gallery/gallery-5.jpg`, with `imageUrl` overridden by the `bandinfo_image` key.
   - `getMembers(locale)`: null → fallback. **An empty array or any rows go through the `normaliseMembers(rows, fallbacks)` merge.** The 8 static members are the canonical base. Supabase overlays name, role, bio, photo and sort_order per slug. `is_visible === false` hides only that member. Extra slugs are appended. `isPlaceholder = false` whenever Supabase has a `photo_url`. The result is sorted by sortOrder.
   - `getSongs()`: null or empty → `buildSongsFallback()` (`isFeatured = id === "sen-benim"`). Otherwise `normaliseSongs` keeps visible rows that have an `audioUrl` and fills missing fields from the fallback by slug. An empty result falls back again.
   - `getGalleryItems()`: null or empty → fallback. Otherwise `normaliseGallery` keeps images only.
   - `getShows(locale)`: null or empty → `buildShowsFallback(locale)` (dict TBA placeholders with `startsAt: null`). Otherwise `normaliseShows`.
   - `getLegalPage(type, locale)`, `getPlatformLinks()` (null → `[]`), `getSeoEntry(path, locale)`: defined but not consumed by the live public UI (only `platformLinks` is fetched, and then dropped).
   - `getPublicPageContent(locale)`: `Promise.all` of the 8 loaders above, merged over `buildPublicPageFallback(locale)`. It returns `PublicPageContent { locale, siteSettings, hero, bandInfo, members, songs, gallery, shows, platformLinks }`.
4. **Normalised types** (`types.ts`): `SiteSettings`, `HeroContent`, `BandInfo`, `Member {id,name,role,bio,photoUrl,isPlaceholder,sortOrder}`, `SongItem {id,title,audioUrl,coverImageUrl,isFeatured,sortOrder}`, `GalleryItem {id,src,alt,thumbnailUrl,sortOrder}`, `ShowItem {id,title,region,time,startsAt,ticketUrl,sortOrder}`, `LegalPage`, `PlatformLink`, `SeoEntry`, `ContentSource = "supabase" | "fallback"` (unused).
5. **What the page actually consumes:** hero and band-info **images** only (their text comes from the dict), members, songs, gallery and shows (with the startsAt filter). Header, Footer, Booking and legal pages read the static `src/data/site.ts` directly.
6. `next.config.mjs` adds a `next/image` `remotePattern` for `<NEXT_PUBLIC_SUPABASE_URL host>/storage/v1/object/public/**` only when that env var is set.

---

## 6. Unmerged donor branch (NOT live): `origin/claude/phase-06-legal-seo-consent-platforms` @ 0cd76d0
31 files, +2782 / −145, based on d8ee2d7, so it predates the final placeholder fix 4cf812b. Public-facing changes:
- `src/components/layout/consent.ts`: versioned consent in `localStorage` key `typhoon.consent.v1` = `{v:1, necessary:true, external_media:boolean, decided_at}`, events `typhoon:consent-changed` and `typhoon:open-consent` (reopen from the footer), helpers `readConsent / writeConsent / clearConsent / hasCategoryConsent`.
- `src/components/media/ExternalMediaGate.tsx`: a click-to-load gate for embeds.
- The Footer renders Supabase `platformLinks` (the layout calls `getPlatformLinks()`) and gains a cookie-preferences link.
- Home `generateMetadata` uses `getSeoEntry("/", locale)` (title absolute, description, OG image). The SEO fallback gets per-legal-page titles.
- Legal pages are read from Supabase with a fallback.
- Admin editors for legal pages, SEO, platform links and consent, plus migration `0006_legal_seo_consent_platforms.sql` and policies.
- `docs/current-task.md` on main names this Phase 06 as the active phase, but the work was never merged.
