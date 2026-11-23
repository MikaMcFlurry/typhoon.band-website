# Typhoon release recheck · OpenAI · round 6

**Verdict** — **SHIP_WITH_NON_BLOCKING_FINDINGS**

Reviewed frozen head `b83df31b03cd0ef026e5082fbfa3ef86a7b05cf6` and the full `a287264..b83df31` diff. Windows Playwright engines were Chromium 141.0.7390.37, Firefox 142.0.1 and WebKit 26.0. The round-five Booking retry and same-tab legal navigation defects did not reproduce. [Release preview](https://typhoon-band-website-9ql1uph3v-mikamcflurrys-projects.vercel.app/de)

## Findings by severity

### P2 · Existing behavior · Non-blocking for this release

- **R6-01 · WebKit can Tab behind the open mobile menu.** At 390 × 844, open the menu and wait for focus on **Musik**. Press Tab. Playwright WebKit on Windows focuses the obscured **Sakli kalan anhören** button while the sheet remains expanded. Further Tabs visit the covered setlist. It happens on first open and after reopening outside the original race window, and I reproduced the same sequence on live production. Escape closes the menu and restores the toggle. The Booking retry itself no longer moves focus to the booking heading after reopen. Make background content inert while the sheet is open, preserve the close toggle in the focus order, and handle Tab when focus is already outside the sheet. Verify with Safari keyboard navigation on an Apple device. [Header.tsx](repo/src/components/site/Header.tsx:108) · [Live baseline](https://www.typhoon.band/de)

### P3 · Non-blocking regression

- **R6-02 · Opening a consent legal link in a new tab discards unsaved settings in the original tab.** At 390 × 844 in Chromium and WebKit, open **Datenschutz-Einstellungen**, enable **Externe Medien** without saving, then Ctrl-click **Datenschutz**. The legal page opens in a new tab. The original stays on `/de`, dismisses the dialog, and the next open shows **Externe Medien** off. The same sequence on live leaves the original dialog open with the pending choice. Use Next Link's `onNavigate` for the two internal links so the dialog closes on same-tab navigation. [ConsentBanner.tsx](repo/src/components/consent/ConsentBanner.tsx:119)

## Reproduced on the release preview

| Check | Independent result |
| --- | --- |
| R5-01 · Mobile menu reopening after Booking | **Retry fixed in all three engines.** At 390 × 844, ran nine reopen attempts per engine and motion mode with nominal gaps of 0, 25, 50, 75, 100, 125, 150, 175 and 200 ms. Used trusted touch input in Chromium and WebKit and trusted mouse input in Firefox. Measured from the Booking click to the toggle click. The earliest gaps were 20 ms in Chromium, 30 ms in Firefox and 23 ms in WebKit. Each engine had multiple attempts on both sides of 150 ms. One WebKit normal-motion attempt ran late at 323 ms. **Musik** retained focus through the 320 ms observation after every reopen. Five subsequent Tabs stayed within the menu and toggle in Chromium and Firefox. WebKit's separate Tab behavior is R6-01. Escape restored the toggle. |
| R5-02 · Consent dialog legal navigation | **Fixed in all three engines for same-tab navigation.** At 320 × 568, Enter on **Datenschutz** and a click on **Cookies** each opened the matching German legal page and removed the overlay with no consent choice written. The legal heading was present and document horizontal overflow was 0 px. Immediate focus was `BODY` after navigation. The modified-click case is R6-02. |
| Booking heading and quick Tab | **Passed in all three engines** at 390 × 844. The header CTA hid while the sheet was open. Activating menu Booking with Enter closed the sheet, unlocked body scrolling and settled focus on `#booking-title`. Tab at nominal 25, 60 and 100 ms advanced to the booking email in Chromium and Firefox or to Name in WebKit, with focus stable after the retry window. |
| Privacy-and-back motion | **Passed in all three engines** at 390 × 844 with normal motion. From the home booking privacy link, followed **Zur Startseite**. All three hero tapes revealed and a viewport-by-viewport scroll left zero pending tapes or reveals out of 38 elements. |
| Consent dialog at 320 × 568 | **Passed in all three engines.** Panel y=12–556 and heading y=36–68. The explanation fit above the fold and the panel scrolled 88–95 px to expose the lower links. Keyboard opening followed by Escape restored focus to the footer settings button. |
| Localized 404 head | **Passed in all three engines** for DE, EN and TR. Missing paths returned HTTP 404. After hydration, the title and share titles read `404 · Typhoon`, robots was `noindex, follow`, and canonical, hreflang and `og:url` were absent. |
| Mail recovery after a 502 | **Passed in all three engines.** Installed `page.route("**/api/booking", …)` before navigation, disabled service workers, and fulfilled exactly one mock 502 POST per engine. Each had the ten expected payload keys. Editing the location and multiline message updated the draft to `booking@typhoon.band` with the new Unicode text and CRLF line breaks. No booking request reached the backend. |
| WebKit audio dock | **Passed in normal motion.** Started actual playback and confirmed progress on the audio element. Tabbed from Name to Message. The textarea settled at y=344–480 with dock top y=492 at 320 × 568, and y=621–756 with dock top y=768 at 390 × 844. |
| Frozen diff and checkout | **Passed.** `git diff --check` passed for `a287264..b83df31` and `6871de1..b83df31`. The final round changed the menu retry, two consent links, and the decision record. The checkout remained clean. |

**NOT_RUN** — Live booking delivery and persistence, OS mail or clipboard handoff, physical iOS and screen readers, real third-party embed and upcoming-show states, and a full accessibility, SEO, performance, or locale-copy audit. This was a targeted recheck. Builds and deployments were outside the read-only scope. The earlier protected preview returned the Vercel login page in this run. The WebKit Tab and modified-click comparisons used live production.

## Design sign-off

Ready for owner visual approval on the states reviewed. The fresh 390 × 844 and 1280 × 800 preview views agreed with the supplied comparisons. The gold signature, square tape, collage and setlist are intact. Pink Play and orange Booking have distinct roles, and the persistent header Booking keeps the action available as the collage starts near y=820 on mobile. All eight playable setlist rows fit on the laptop fold, with the note below it. The preview toolbar remains visible and is listed in the owner decision record. [Mobile comparison](scratchpad/pairs/01-mobile-first-visit-390.png) · [Laptop comparison](scratchpad/pairs/04-laptop-first-visit-1280.png) · [Owner decisions](repo/docs/redesign/2026-11-ux-seo-conversion.md:140)
