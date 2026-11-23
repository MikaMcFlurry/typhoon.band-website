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
4. Fresh independent review of the final preview.

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
| H1 words concatenated, no location/offer near the hero (all three) | **Done:** spaced h1, data-driven fact line ("9 Musiker mit Bläsersatz · Live-Band aus Hechingen, Baden-Württemberg"), titles with "Typhoon Band". Tagline itself kept (owner copy). |
| Thin structured data, unconfirmed "Kanzlei Studio" (all three) | **Done:** one `@graph` (WebSite, WebPage, MusicGroup with tracks + booking ContactPoint + phone, FAQPage). Studio name removed until confirmed. |
| Promoter questions not answered on the page (Google, xAI, OpenAI) | **Done:** FAQ after Booking, six answers built only from owner booking facts. |
| Empty Shows section second on the page (OpenAI, xAI) | **Done:** without dates it moves above Booking as a short lead-in, tape "Auftritte auf Anfrage."; nav follows. With dates it stays second. |
| Mobile LCP 3.4 s, poster preloaded below the fold (all three) | **Done:** poster eager but not preloaded, tighter `sizes`, header logo never lazy. Local Lighthouse mobile 88 → 96, LCP 3.7 → 2.5 s. |
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

- Live imprint at 320 px clipped "Verbraucherstreitbeilegung" by 23 px.
  Legal headings now hyphenate.

## Owner decisions (open)

1. Vercel: apex redirect 307 → 308.
2. "Kanzlei Studio" as public base name (removed from JSON-LD for now).
3. Slot 8: Tan (live data) or Jürgen.
4. Track spelling "Sakli Kalan" vs. Turkish "Saklı Kalan" (Admin → Music).
5. Gallery curation and a whole-band live photo for the band section.
6. Real platform links (enables `sameAs` and the "Auch auf" row).
7. Confirm FAQ wording, in particular "auch Hochzeiten" (taken from the
   form option "Private Feier / Hochzeit") and the 48-hour reply time.
8. Whether any consented, cookieless measurement of requests is wanted.
