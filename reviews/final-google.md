# Final Independent Review (Google Gemini) — `typhoon.band` UX/SEO/Conversion Branch (`903b973`)

**Verdict:** `SHIP_WITH_NON_BLOCKING_FINDINGS`

Reviewed checkout: `repo` (`6871de1..903b973`)  
Reviewed preview (`903b973`): `https://typhoon-band-website-8ot1a014r-mikamcflurrys-projects.vercel.app/de` (and `/en`, `/tr`, legal routes, 404, `/sitemap.xml`, `/robots.txt`, `/llms.txt`)  
Own captures & audit artifacts: `scratchpad/council/google-captures/`

---

## Findings

### P3 — Non-blocking nits

1. **P3-1 · Inline links and toggle switches in `ConsentBanner` are below 44 px height**
   - **Evidence:** `src/components/consent/ConsentBanner.tsx:118-126` (`Datenschutz · Cookies` links have no `min-h-11` / `py-3`) and `src/components/consent/ConsentBanner.tsx:221` (`Switch` button is `h-7 w-12` = 28 px tall).
   - **Why it matters:** `BookingForm.tsx:1332` fixed its inline privacy link to 48 px (`py-[15px]`), but `ConsentBanner` still has sub-44 px targets when its preferences dialog is opened from the footer (or when `ExternalMediaGate` renders the notice in the future).
   - **Concrete fix:** Add `inline-flex min-h-11 items-center` (or `py-3`) to the `ConsentBanner` legal links and wrap or pad the `Switch` hit target to `min-h-11` (`44px`).

2. **P3-2 · Short-viewport edge tightness on `1280×800` and `320×640`**
   - **Evidence:** `google-captures/de-1280-fold.png` (at `1280×800`, all 8 setlist tracks fit above `y = 800`, while the bottom caption `"Tippen zum Abspielen · nur Stream, kein Download"` is clipped right below `y = 800`, matching `main` in `pairs/04-laptop-first-visit-1280.png`); `google-captures/de-320-fold.png` (`playCta` spans `y = 596..644` at 640 px height and `bookCta` sits at `y = 656..704`, though the persistent 64 px header keeps the orange `BOOKING` button at `y = 9.5..53.5`).
   - **Why it matters:** On `1280×800` laptops the setlist sheet's bottom rule/note sits right on the fold; on `320×640` phones the two hero CTAs do not both sit cleanly inside 640 px.
   - **Concrete fix:** Optional follow-up: slightly tighten hero vertical spacing on `short:` / `<360px` only if owner wants the setlist note inside 800 px; not a regression and no action required for merge.

3. **P3-3 · Turkish header nav label `"BOOKİNG"` and DB track `"SAKLİ KALAN"`**
   - **Evidence:** `google-captures/tr-390-fold.png`, `google-captures/tr-1280-fold.png`, `src/i18n/dictionaries.ts:877` (`nav.booking: "Booking"` under `<html lang="tr">` + `uppercase` renders `BOOKİNG`), and live DB title `"Sakli kalan"` renders `SAKLİ KALAN` (already logged in `docs/redesign/2026-11-ux-seo-conversion.md` Open Decision #4).
   - **Why it matters:** Dotted `İ` on an English loanword (`BOOKİNG`) looks slightly jarring next to Turkish UI copy (`MÜZİK · GRUP · FOTOĞRAFLAR · KONSERLER`), whereas `tr.hero.ctaBook` (`"Typhoon'u davet edin"`) reads naturally.
   - **Concrete fix:** Owner/copy decision: either choose a concise Turkish nav label (`"Davet"` / `"Teklif"` / `"İletişim"`) or accept `"BOOKİNG"`; fix `"Sakli kalan"` → `"Saklı Kalan"` in Admin → Music.

4. **P3-4 · `ExternalMediaGate` + `ConsentBanner` notice path not exercised live (no embeds on site)**
   - **Evidence:** `src/components/consent/ConsentBanner.tsx:37-60`, `src/components/consent/ExternalMediaGate.tsx:32-40`.
   - **Why it matters:** Code inspection confirms `ConsentBanner` listens for `CONSENT_NEEDED_EVENT` and checks `[data-consent-gate]` on mount, so any future `ExternalMediaGate` triggers the notice. Because no page on the site currently mounts `ExternalMediaGate`, the notice appearance on embed pages is verified by code inspection rather than live UI.

---

## Previous Review Round Fixes — Independently Verified on `903b973`

| Claimed fix | Verification method & engines | Result |
|---|---|---|
| Header Booking steps aside when mobile menu is open & closes menu on click | Playwright on `903b973` (Chromium, Firefox, WebKit at `390×844`) + `google-captures/de-320-menu-open.png`, `de-390-menu-open.png`, `de-768-menu-open.png` | **PASS** — Header link becomes `invisible`, `tabindex="-1"`, `aria-hidden="true"`; clicking menu `Booking` closes sheet, clears `body.style.overflow`, lands with `#bk-name` at `y=540` (Chromium/Firefox) / `y=536` (WebKit). |
| Mail recovery link after editing a field following mocked 502 carries edit + CRLF | Playwright route intercept `502` on `**/api/booking` across Chromium, Firefox, WebKit (`google-captures/de-390-booking-502.png`, `de-1440-booking-502.png`) + mocked `200 fallback` | **PASS** — Editing `#bk-event_location` from `Tübingen` to `Reutlingen` updates the `mailto:` href immediately; body uses `%0D%0A` with zero bare `%0A`. Mocked fallback renders both `mailto:` and `Anfrage kopieren`. |
| FAQ wording (no wedding claim, no unconfirmed pricing factors) | Code inspection (`src/i18n/dictionaries.ts`) + Playwright DOM check on `/de`, `/en`, `/tr` | **PASS** — 6 items across all 3 locales; zero mentions of weddings; pricing answer states every request is quoted individually. |
| Privacy link hit area ≥ 44 px and chip outline contrast ≥ 3:1 | Chromium computed geometry + RGB luminance calculation on `903b973` | **PASS** — Privacy link height `48px`; `.st-chip > span` border is `rgb(142, 137, 128)` (`--chalk-3`), giving `5.43:1` against `deck` (`rgb(18, 17, 16)`) and `5.04:1` against form `deck-2` (`rgb(27, 25, 23)`). |
| 404 head after hydration (`404 · Typhoon`, no canonical/hreflang/og:url) | HTTP check + Playwright settled DOM check (`1000ms` post-load) across Chromium, Firefox, WebKit for `/de/gibt-es-nicht`, `/en/does-not-exist`, `/tr/bulunamadi` | **PASS** — HTTP 404, `robots: noindex, follow`, settled `document.title === "404 · Typhoon"`, `0` canonical, `0` hreflang, `0` `og:url`. |
| Tape headings (`Auftritte auf Anfrage.`, `Typhoon buchen`) visible in Chromium with normal motion | Playwright with `reducedMotion: "no-preference"` on `320, 390, 768, 1280, 1440` step-scroll AND real header `#booking` click at `390×844` (`google-captures/de-390-after-header-booking-click.png`) | **PASS** — `unrevealedLay: []`, `unrevealedReveal: []` across all 5 viewports; header click reveals `Typhoon buchen` (`isIn: true`, `clipPath: "inset(0px)"`). |
| Focused message field stays above audio dock in WebKit | Playwright with audio playing at `390×844` in Chromium, Firefox, WebKit (`google-captures/de-390-dock-focus-webkit.png`, `de-390-dock-focus-chromium.png`) | **PASS** — `body` `paddingBottom = 76px`, `#bk-message` `bottom = 756 <= dockTop = 768` in all three engines. |

---

## Reproduced Checks Summary

- **Visual captures (own Playwright run on `903b973`, Chromium, `reducedMotion: "no-preference"`):** `320×640`, `390×844`, `768×1024`, `1280×800`, `1440×900` (fold, full-page, section crops, menu open, booking filled & mocked 502, legal 320 px, 404 320 px, EN/TR 390 & 1280 px, WebKit/Chromium dock focus).
  - Zero horizontal overflow (`scrollWidth === clientWidth`) across `320, 390, 768, 1280, 1440` (and `/en`, `/tr` at `320`).
  - Zero interactive elements under `44×44 px` on the home page across all 5 viewports (`smallTargets: []`).
  - Zero broken images after full scroll (`brokenImgs: []`).
- **Booking payload contract:** Intercepted `POST **/api/booking` (never reached production) sends exact expected keys: `email, event_date, event_location, event_type, hp_field, locale, message, name, phone, started_at` with unchanged values (`festival`, `club`, `cityfest`, `corporate`, `private`, `other`).
- **Accessibility (`@axe-core/playwright` WCAG 2.2 AA):** 0 violations across `/de` (33 rules), `/en` (33 rules), `/tr` (33 rules), `/de/legal/privacy` (27 rules), `/de/gibt-es-nicht` (26 rules).
- **SEO & discoverability:** Verified `/de`, `/en`, `/tr` canonical, `hreflang` + `x-default`, `og:url`, `og:type`, `og:locale`, `og:site_name`, `og:image`, `twitter:card`; single `@graph` JSON-LD (`WebSite`, `WebPage` with `primaryImageOfPage`, `MusicGroup` with 9 `OrganizationRole` members, 8 `MusicRecording` tracks, booking `ContactPoint`, no `"Kanzlei Studio"`, `FAQPage` with 6 Q&As); `/sitemap.xml` (`x-default`, `<image:loc>`, no fake `<lastmod>`); `/robots.txt`; `/llms.txt`.
- **Not run (`NOT_RUN`):**
  - Local `npm run lint` / `npm run build` / Lighthouse re-run: `NOT_RUN` (read-only review against frozen `903b973` checkout and live Vercel preview; local Lighthouse figures in `docs/redesign/2026-11-ux-seo-conversion.md` were not re-measured).
  - Live booking submission to Supabase/Resend: `NOT_RUN` by rule (always intercepted via `page.route`).
  - Upcoming dated shows state (`showsFirst = true`): `NOT_RUN` in live browser because production Supabase `shows` table currently has 0 upcoming dates; verified via code inspection in `src/app/[locale]/(site)/layout.tsx`, `src/app/[locale]/(site)/page.tsx`, and `src/components/sections/Shows.tsx`.

---

## Design Sign-Off

Inside the Stage/Setlist visual world of `DESIGN.md`, this branch is ready for owner visual approval. It keeps every core brand commitment intact—matte deck black, square cuts, strict spike-tape colour discipline (booking orange strictly reserved for booking actions and focus underlines; pink on audio; green on line-up), uncropped band collage with the setlist sheet taped over its bottom margin, and the gold signature logo—while meaningfully improving conversion and visual clarity across all five tested breakpoints (`320, 390, 768, 1280, 1440` px). Removing the superfluous first-visit consent overlay restores immediate hero clarity on `390×844` phones and `1280×800` laptops, the persistent `44px` header `BOOKING` button plus phone-first Booking order drop visitors straight onto the form, replacing the `<select>` with `5.04:1`-bordered square choice chips and trimming empty preview rows tightens the form rhythm without losing the rider aesthetic, soft-hyphenated legal headings prevent `320px` clipping, and the new `"Fragen von Veranstaltern"` `deck-2` band closes the page with clean typographic hierarchy before the road-case footer.
