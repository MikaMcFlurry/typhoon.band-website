# 2026-11 · UX, SEO and conversion pass on the live site

Branch `claude/typhoon-ux-seo-conversion`, base `main@6871de1` (production
deployment `dpl_A1oqT8ExdgUR728iW94JSjgtjomP`). Version B and the root
`DESIGN.md` stay the visual source of truth; this pass changes the booking
path, discoverability and technical quality inside that world. No backend,
API, Supabase or admin behaviour changed.

## Goal

More qualified booking requests without paid ads: organic search (Google,
local, AI answer engines) and phone visitors from social links or
recommendations, who should reach the request form in as few steps as
possible.

## Method

1. Baseline: live site captured with Playwright (Chromium, 360 to 1920 px,
   DE/EN/TR, first visit, playing, menu, legal, 404) and Lighthouse.
2. Independent council: three providers reviewed the same frozen baseline
   without seeing each other's reports: OpenAI GPT-6.2 Sol, Google
   Gemini 4 Hydrogen, xAI Grok 4.7. Findings were adjudicated below.
3. Implementation in two commits, local gates (tsc, lint, build), journey
   checks on the Vercel preview in Chromium, Firefox and WebKit with live
   data (the booking API is always intercepted; no request was sent).
4. Fresh independent review of the final preview (OpenAI GPT-6.2 Sol as
   release red team, Google Gemini 4 Hydrogen for design). Findings and
   fixes are listed below; every blocking finding got its own regression
   check in the journey suite.

## Council findings and decisions

| Finding (raised by) | Decision |
|---|---|
| First-visit privacy notice covers both hero CTAs on phones and desktop (all three) | **Done.** The notice only appears on pages with an `ExternalMediaGate`. The site sets no cookies and embeds nothing, so there was nothing to decide; the footer settings stay. |
| No booking control in the phone header (all three) | **Done.** Orange Booking button on every width. |
| Booking link lands a screen above the first field on phones (OpenAI) | **Done.** Phone order: heading + direct line, form, rider facts. |
| Empty request preview pushes Send down (all three) | **Done.** Preview lists only filled rows; reply time at the submit. |
| Event type select, field order (OpenAI, Google) | **Done.** One-tap chips, core questions first, optional phone last. Same values, API unchanged. |
| Fallback loses the visitor's draft (OpenAI) | **Done.** Fallback and delivery errors offer the draft as a prefilled e-mail. |
| og:url/type/locale/site_name missing (all three) | **Done** for home and legal pages. |
| H1 words concatenated, no location/offer near the hero (all three) | **Done:** spaced h1, data-driven two-line fact block ("9 Musiker mit Bläsersatz" / "Live-Band aus Hechingen"), titles with "Typhoon Band". Tagline itself kept (owner copy). |
| Thin structured data, unconfirmed "Kanzlei Studio" (all three) | **Done:** one `@graph` (WebSite, WebPage, MusicGroup with tracks + booking ContactPoint + phone, FAQPage). Studio name removed until confirmed. |
| Promoter questions not answered on the page (Google, xAI, OpenAI) | **Done:** FAQ after Booking, six answers built only from owner booking facts. |
| Empty Shows section second on the page (OpenAI, xAI) | **Done:** without dates it moves above Booking as a short lead-in, tape "Auftritte auf Anfrage."; nav follows. With dates it stays second. |
| Mobile LCP 3.4 s, poster preloaded below the fold (all three) | **Partly done:** poster eager but not preloaded, tighter `sizes`, header logo never lazy (11.8 → 5 KB). Local Lighthouse, median of 5 runs on the same machine: mobile performance 87 → 88, LCP 3.85 → 3.63 s (within run-to-run noise); desktop 100 → 100. An earlier median of 3 (96 / 2.5 s) was an outlier and is withdrawn. A smaller hero signature on phones was tried and reverted (the poster became the LCP element, no gain). A real LCP gain needs a follow-up (e.g. a lighter signature asset, less client JS). |
| 44 px targets (Google, OpenAI, xAI) | **Done:** `btn-sm`, locale switcher, logo link, inline legal links. |
| Player dock covers focused form fields (xAI) | **Done:** `scroll-padding-bottom`. |
| 404 uses booking orange for "home", home title (Google, OpenAI, xAI) | **Done.** |
| Sitemap x-default/images, manifest start_url (Google, OpenAI) | **Done**, plus `/llms.txt`. |
| Genre line starts a row with "/" (Google) | **Done.** |
| Poster alt hard-codes "acht/eight/sekiz" (all three) | **Done:** no count. |
| Apex `typhoon.band` → `www` is a 307 (all three) | **Owner/Vercel setting**, not code: switch the domain redirect to 308. |
| Gallery leads with an empty studio, duplicates the collage; solo singer as band photo (all three) | **Owner content** (Admin → Gallery / Site assets). Not changed in code. |
| Rewrite hero strips to "Türkische Texte. / Bläsersatz. / Live." (xAI) | **Not done:** owner copy; listed as an owner decision. |
| Sitemap `lastmod` from content dates (OpenAI) | **Deferred:** no reliable change timestamp per page yet. |
| Members as `Person` instead of `OrganizationRole` (xAI) | **Not done:** `OrganizationRole` is a valid schema.org pattern and keeps the roles. |

## Found during verification

- **Live bug, Chromium (Chrome, Edge, Android):** with normal motion settings
  the tape headings below the first screen never appeared. "Typhoon buchen"
  and the Shows tape stayed fully clipped, because Chromium's
  IntersectionObserver counts the target's own `clip-path` and never reported
  the clipped strip as visible (Firefox and WebKit did). Found by the Google
  reviewer in the final review; reproduced on the live site. MotionInit now
  observes the unclipped parent of each `.lay` strip; a motion-on journey
  check covers it in all three engines.

- Live imprint at 320 px clipped "Verbraucherstreitbeilegung" by 23 px, and
  the privacy title broke as "DATENSCHUTZERK/LÄRUNG". Legal headings now
  carry soft hyphens at the compound joints.
- The new hero fact line first wrapped differently with the fallback font
  than with Martian Mono, which moved the vertically centred hero column on
  font swap (local desktop CLS 0.02 → 0.08). It is now two short lines that
  never wrap; CLS is back to the baseline (0.022).
- Pre-existing, not changed: at 1280 × 800 the setlist is ~17 px taller with
  the fallback font, so the centred hero column moves ~9 px on font swap
  (same on `main`).

## Final review (round 2) and fixes

| Finding | Fix |
|---|---|
| Header Booking left the open menu sheet over the form (OpenAI, P2) | Header button steps aside while the sheet is open and closes it when used. |
| E-mail recovery link kept the draft from before a correction; LF line breaks (OpenAI, P2) | Built from the current fields while the form is on screen; CRLF per RFC 6068; "copy request" in the terminal fallback. |
| FAQ promised weddings and named pricing factors not confirmed by the owner (OpenAI, P2) | Weddings removed (owner facts: "Firmen- und Privatevents"); price answer: "we quote every request individually". The 48-hour reply stays (already live owner copy). |
| Privacy link 42 px, chip outline 2.6:1 (OpenAI, P2) | 44+ px hit area; chip outline `chalk-3` (5.4:1 on deck). |
| 404 head switched back to the home title/canonical after hydration (OpenAI, P2) | Canonical/hreflang/og:url moved from the locale layout to the home and legal pages; 404 metadata also on the matched catch-all route. |
| Tape headings below the fold never appeared in Chromium (Google, see above) | MotionInit observes the unclipped parent. |
| WebKit scrolls focused fields behind the player dock (OpenAI, non-blocking) | Form nudges a focused field above the dock. |
| Sitemap image refresh, fake `lastmod` (OpenAI, non-blocking) | Hourly revalidation, only the image loaders, no `lastmod`. |
| `primaryImageOfPage`, unverified contact languages, legal Twitter title (OpenAI, P3) | Hero `ImageObject`; `availableLanguage`/`knowsLanguage` removed; legal Twitter title. |
| EN/TR wording (OpenAI, P3) | EN "Available for bookings.", "Listen in the setlist…", "signature sound"; TR "Davetlere açığız.", "Grubun merkezi …", "Nefesli grubuyla …", "Acele bir talebiniz varsa …". |
| FAQ answer below a tall intro on phones (OpenAI design note) | Phones: heading, questions, then the booking tape. |
| Vercel toolbar requests on the preview (OpenAI, preview gate) | Preview-only (production CSP never allows `vercel.live`); can be switched off per project in Vercel. Not a code change. |
| Short-phone hero ~60 px longer (OpenAI design note) | Kept: the two fact lines are the booker qualifier; the header Booking button is always in reach. |

## Owner decisions (open)

1. Vercel: apex redirect 307 → 308.
2. "Kanzlei Studio" as public base name (removed from JSON-LD for now).
3. Slot 8: Tan (live data) or Jürgen.
4. Track spelling "Sakli Kalan" vs. Turkish "Saklı Kalan" (Admin → Music).
5. Gallery curation and a whole-band live photo for the band section.
6. Real platform links (enables `sameAs` and the "Auch auf" row).
7. Confirm the FAQ wording, in particular the 48-hour reply time and
   whether weddings should be named explicitly (the form option says
   "Private Feier / Hochzeit"; the FAQ currently says "Privatevents").
8. Whether any consented, cookieless measurement of requests is wanted.
