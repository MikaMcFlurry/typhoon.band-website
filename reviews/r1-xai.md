# Council round 1 — xAI Grok — www.typhoon.band baseline

Reviewed `main@6871de1` (live production), the baseline screenshots in `scratchpad/before/`, and the live HTML of `https://www.typhoon.band/de` fetched 2026-11-23. The booking form was not submitted. The local checkout also had uncommitted edits; those were ignored. Every claim below is about the frozen revision and the live site.

Lighthouse numbers are the ones supplied in the brief (mobile `/de`: Perf 91, LCP 3.4 s, FCP 1.2 s, CLS 0, TBT 60 ms, A11y/BP/SEO 100). I confirmed the LCP candidate in the live HTML: the hero signature `<img alt="Typhoon" fetchpriority="high">` inside `<h1 id="hero-title">`.

## 1. Verdict

I would not sign off today. The stage world is already a real identity, the setlist plays in one tap, and the form asks for the right facts without inventing a price. What blocks a sign-off is the phone path a booker actually hits: on a first visit at 360 px the privacy sheet covers both the play button and “Booking anfragen”, and under 640 px the header has no booking control on a page that is 9,895 px tall. The loudest words on the page are the slogan, while Hechingen, the horn section and “buchen” show up only late, and the structured data names a studio the owner has not confirmed. Fix the first-visit phone path, the empty-dates wording, and the location/structured-data truth, and this is close to something a senior designer would ship.

## 2. Top findings

### R1 — First visit on a phone hides both primary actions
- **Area:** CRO / UX
- **Evidence:** `de-360-firstvisit-fold.png` shows the chalk “Privatsphäre” sheet starting under the intro sentence. “Sakli Kalan anhören” and “Booking anfragen” are not on screen. `de-390-firstvisit-fold.png` still clips the pink play button and hides the orange button. `de-360-fold.png` (consent already decided) shows both buttons, so the sheet is what removes them. At `6871de1`, `src/components/consent/ConsentBanner.tsx` renders that notice `fixed` at `bottom: calc(var(--dock-h) + 8px)` with a title, two-sentence body, two links and two buttons. `de-1440-firstvisit-fold.png` also covers the hero buttons and the lower setlist, but the header “Booking” button stays visible from 640 px up.
- **Fix:** Keep the consent sheet and the two choices. On viewports under `md`, show one line (“Keine Tracking-Cookies. Externe Player nur nach Zustimmung.”), the existing Datenschutz/Cookies links, and the two buttons. Leave the longer copy in the details dialog. The hero play and booking buttons in `de-360-fold.png` must remain visible above the sheet. Do not add a tracker.
- **Impact:** H. **Effort:** S. **Risk:** Low, as long as both choices and the legal links stay one tap away.

### R2 — After the hero, a phone has no booking control
- **Area:** CRO
- **Evidence:** `de-390-fold.png` and `de-360-fold.png`: header is the small signature plus the hamburger. At `6871de1`, `src/components/site/Header.tsx` puts the orange booking link on `hidden sm:inline-flex`, so it appears only from 640 px. `report.json` records the German home page at 9,895 px (390) and 9,756 px (360). `de-390-menu-open.png` does put Booking on orange tape, plus mailto and tel, but only after opening the menu. Shows and the band section have their own orange links (`Shows.tsx` empty state, `Band.tsx`); the gallery does not. A promoter who is looking at photos has to open the menu or scroll to the form.
- **Fix:** Show the existing `btn-tape btn-sm` label “Booking” at every width, to the left of the hamburger. It already fits the spike-tape rule (orange = booking only) and is 44 px (`globals.css` `.btn-sm`). Check 320 px so the signature, the word Booking and the 44 px menu button still sit on one row.
- **Impact:** H. **Effort:** S. **Risk:** Tight header at 320 px. The label is the short nav word “Booking”, not “Booking anfragen”.

### R3 — “Neue Termine sind in Planung” reads as a band with no work
- **Area:** CRO
- **Evidence:** `de-390-sec-shows.png` and `de-1440-sec-shows.png`. The section is a short block in a large black field: heading “Termine”, tape “Neue Termine sind in Planung.”, then “Festival, Club, Stadtfest oder Firmenevent: Holt Typhoon auf eure Bühne.” and an orange button. Live JSON-LD has no `event` entries, which matches an empty Supabase table. The body and the button are the useful part. The tape sentence is the one a booker remembers, and it sounds like the season has not started. Copy is `shows.emptyTitle` in `src/i18n/dictionaries.ts` at `6871de1`.
- **Fix:** Keep the empty state and do not invent dates. Change the tape to an availability line that is already true in the body, in German “Auftritte auf Anfrage.”, with the same EN/TR meaning. Leave the occasion sentence and the orange button. The unused `placeholderTitles` / `placeholderRegion` strings in the dictionary must stay unused.
- **Impact:** H. **Effort:** S. **Risk:** The owner may prefer the more cautious sentence. The replacement does not claim a booked show.

### R4 — A booker cannot see where the band is based until the form, and the imprint says Bayreuth
- **Area:** SEO-content / local / CRO
- **Evidence:** `de-390-fold.png` and `de-1440-fold.png`: the first screen is the signature, “Smooth. Exzeptionell. Funk.”, the five genres, and “Typhoon verbindet türkischsprachige Texte…”. No city. Hechingen appears in the meta description (“Typhoon aus Hechingen…”) and in the booking facts (“Hechingen, Baden-Württemberg – gerne auch weiter weg”) on `de-390-sec-booking.png`. `imprint-390-fold.png` gives the legal address as Mika Hertler, Am Schwarzen Steg 5a, 95448 Bayreuth. Live JSON-LD puts the `MusicGroup` in Hechingen. Google and answer engines now have two cities, and the city a human sees first in the legal page is Bayreuth.
- **Fix:** Keep the Bayreuth address in the imprint. It is the legal notice. Add one mono fact under the genre line, using the booking fact that already exists: “Hechingen · Baden-Württemberg”. Make room for it by drawing the hero signature smaller below `lg` (the header already shows it). Put the same locality in the title, for example “Typhoon · Live-Band aus Hechingen”. Do not invent a street in Hechingen, and do not move the imprint.
- **Impact:** H. **Effort:** S. **Risk:** Low if the imprint address stays untouched.

### R5 — Structured data states an unconfirmed studio and drops the public phone
- **Area:** SEO-technical / AI
- **Evidence:** Live `<script type="application/ld+json">` on `/de` is one `MusicGroup`. `location.name` is “Kanzlei Studio”. `PRODUCT.md` lists “Kanzlei Studio, Hechingen” as undecided. The visible site never says that name. The same script has `email` and nine `member` entries (Typhoon, Mika El Jackson, Schack, Hardy, Stefan, Tom, Buğra, Tan, Malvin) and no `telephone`, no `contactPoint`, no `sameAs`. At `6871de1`, `src/app/[locale]/(site)/page.tsx` `buildJsonLd` hard-codes the studio name and maps each member as `@type: OrganizationRole`. `MusicGroup.member` expects a `Person` or `MusicGroup`, so the names sit one level too deep for many consumers. There is no FAQ block in the HTML (the full-page shots end at the form and footer).
- **Fix:** Emit `addressLocality: Hechingen` with no place name until the owner confirms the studio. Add `telephone` `+4917664472296` and a `ContactPoint` of type booking, both already public. List members as `Person` with `jobTitle` set from the live role. Add `FAQPage` only for answers that are already on the page (see R14), in the same `@graph`. Add `sameAs` only when real platform URLs exist. Do not add a price, a rating or a show date.
- **Impact:** H. **Effort:** M. **Risk:** Naming “Kanzlei Studio” in the current JSON-LD is the risk. Removing it until confirmation is the safe change.

### R6 — The only H1 is a slogan, so the differentiator is not the heading
- **Area:** SEO-content / CRO
- **Evidence:** `report.json` records the visible H1 text as “SMOOTH. EXZEPTIONELL. FUNK.” on every German width. Live HTML confirms that string is the text inside `<h1 id="hero-title">`, after an image whose alt is “Typhoon”. The title is stronger: “Typhoon · Bluesrock, Funk & Soul mit türkischen Texten”. It still drops Jazz, Southern Rock, Hechingen and “Live-Band”. The sentence under the tapes does say Turkish lyrics. The better line already exists further down, on `de-1440-full.png`: “Amerikanisches Feeling. Europäische Seele. Türkische Texte.” EN (`en-390-fold.png`) and TR (`tr-390-fold.png`) translate the slogan (“Exceptional.”, “Olağanüstü.”). The German tape spelling matches Duden “exzeptionell”; this is not a typo. It is a boast in the largest type, above the proof.
- **Fix:** Keep three tape strips, square, ink on gaffer/pink, as in `DESIGN.md`. Prefer strips that state the true offer, in the same display style: “Türkische Texte.” / “Bläsersatz.” / “Live.” If the owner keeps the current three words, still add the Hechingen mono line from R4 and retitle the document to “Typhoon · Live-Band aus Hechingen: türkische Texte, Funk & Bluesrock”. The pink strip can stay pink: `DESIGN.md` already assigns pink to the third hero strip.
- **Impact:** H. **Effort:** S. **Risk:** The current three words may be a line the owner wants to keep. The title and the mono line do not depend on that.

### R7 — Mobile LCP spends its time on the signature while the collage is also preloaded
- **Area:** Perf
- **Evidence:** Brief: mobile LCP 3.4 s, element render delay about 1.2 s, FCP 1.2 s, the LCP element is the hero signature. Live `/de` preloads that image (`fetchpriority="high"`, sizes `(min-width: 1024px) 560px, 88vw`) and also preloads the collage (`sizes` falls through to `100vw` below 672 px). `de-390-fold.png` shows only the top tape of the collage, so the second preload is for a below-fold image on the primary device. Source files: `typhoon-signature-gold.png` 331,535 bytes (2099×724), `hero-collage.jpeg` 455,895 bytes. The optimizer rewrites them, and the signature srcset starts at 640w, but the browser still starts both downloads plus six font preloads. Hero.tsx at `6871de1` sets `priority` on both images. Desktop LCP is 0.6 s, so this is a phone problem.
- **Fix:** Leave `priority` and `fetchPriority="high"` on the signature only. Drop `priority` from the collage so a phone does not preload a full-width poster it cannot see. Shrink the signature below `lg` (R4); a smaller LCP box paints less of the delay. Do not re-set the name in a font, and do not crop the collage.
- **Impact:** H. **Effort:** S. **Risk:** Low. The collage still loads when it approaches the viewport.

### R8 — Shared links lose Open Graph identity
- **Area:** SEO-technical
- **Evidence:** Live `/de` `<head>` has `og:title`, `og:description`, `og:image` (1200×630, `https://www.typhoon.band/og-image.jpg`) and `twitter:card` = `summary_large_image`. It has no `og:url`, `og:type`, `og:locale` or `og:site_name`. At `6871de1`, `src/app/[locale]/layout.tsx` sets those fields, and `src/app/[locale]/(site)/page.tsx` `generateMetadata` returns a new `openGraph` object with only title, description and images, which replaces them. Canonical and `hreflang` de/en/tr/`x-default` are present and point at `https://www.typhoon.band/...`. The sitemap alternates repeat de/en/tr and omit `x-default`.
- **Fix:** In the page metadata, spread the layout `openGraph` and set `url`, `type: "website"`, `siteName: "Typhoon"` and `locale` from `OG_LOCALE`. Add `x-default` to the sitemap language map, pointing at `/de`, matching the HTML.
- **Impact:** M. **Effort:** S. **Risk:** Low. WhatsApp, Facebook and iMessage will then keep the canonical URL and the locale instead of guessing.

### R9 — The apex host redirects with a temporary 307
- **Area:** SEO-technical
- **Evidence:** `https://typhoon.band/` responds `307` to `https://www.typhoon.band/`. `https://www.typhoon.band/` responds `307` to `/de` (Accept-Language; a German request lands on `/de`). Canonical on `/de` is `https://www.typhoon.band/de`. The locale hop is correctly temporary: a `301` would cache the wrong language. The apex hop is a permanent host canonical and should not be temporary.
- **Fix:** In the Vercel domain setting, make `typhoon.band` → `www.typhoon.band` a `308`. Leave the middleware locale redirect as `307` with `Vary: Accept-Language` (`src/middleware.ts`).
- **Impact:** M. **Effort:** S. **Risk:** Low. Do not 301 the locale redirect.

### R10 — The hero poster says eight musicians; the page lists nine
- **Area:** SEO-content / A11y
- **Evidence:** Live collage alt, from `/de`: “Typhoon: acht Musiker in einer Sepia-Collage mit goldenem Schriftzug”. The same string is `meta.ogAlt` at `6871de1` (`dictionaries.ts`); EN says “eight musicians”, TR says “sekiz müzisyen”. `de-390-sec-lineup.png` shows nine cards, and the booking facts say “9 Musiker…”. Live JSON-LD lists nine people, including Tan – Percussion. The visible count is filled from `members.length` (`Band.tsx`, `Booking.tsx`). The alt is a hard-coded count, which the project forbids, and it contradicts the cards a screen-reader user meets next.
- **Fix:** Alt without a number: “Typhoon, Sepia-Collage der Band”. Same for EN and TR. Leave the on-page “{count} Musiker” as it is, driven by the data. Do not hard-code 8 or 9, and do not rename Tan here (see open decisions).
- **Impact:** M. **Effort:** S. **Risk:** None. The collage stays uncropped.

### R11 — The empty request preview sits between the message and the send button
- **Area:** CRO
- **Evidence:** `de-390-sec-booking.png`: after Nachricht, a chalk sheet “So kommt deine Anfrage an” lists An, Von, Telefon, Datum, Ort, Art and Nachricht, almost all “noch offen”, and only then “Anfrage senden”. `BookingForm.tsx` always renders those rows (`previewRows`, then the message line) above the submit row. On a phone that is a second screen of empty rider between the last field and the only submit. The desktop crop `de-1440-sec-booking.png` has room for it beside the facts, where it earns its place once fields are filled.
- **Fix:** Keep the chalk sheet and the orange tape piece. On widths under `sm`, render a preview row only after that field has a value, and keep the sheet title. The submit button then follows the privacy line as soon as the form is filled. Do not remove fields: name, email, place, type and a 10-character message are the right required set; date and phone stay optional.
- **Impact:** M. **Effort:** S. **Risk:** Low. The preview still appears as the promoter types, which is the point of the rider sheet.

### R12 — “Bilder” shows the studio and the singer, not the nine-piece on a stage
- **Area:** CRO
- **Evidence:** `de-390-sec-media.png`: nine prints. The first, full-width frame is the studio room. Then the sepia collage, keyboards, the studio again, the singer at a keyboard, more keys, the singer with a crowd edge, a piano, and the collage again. A festival booker looking for “will this horn section fill my stage” does not get a wide live frame here. The hero collage is the only whole-band picture, and on a phone it is below the fold (`de-390-fold.png`). Individual proof is good in the line-up (`de-390-sec-lineup.png`: vocals, trombone, sax, trumpet, bass, drums, guitar, percussion, keys).
- **Fix:** Reorder the existing gallery so the first mobile tile is the strongest live frame already in the set (the singer-with-crowd frame, then the collage). Do not crop the collage and do not restyle the prints. A real wide stage photo of the whole band is an owner asset, not something to fake.
- **Impact:** M. **Effort:** S for the reorder. **Risk:** Low. A new photo is separate and optional.

### R13 — With audio playing, the dock covers the form the booker is filling
- **Area:** A11y / CRO
- **Evidence:** `de-390-booking-focus.png`: Name is focused (orange rule) and the player dock (“Sakli Kalan”, pause, next, close) covers the bottom of the message field. `de-390-playing-fold.png` shows the same dock over the hero poster. `globals.css` sets `scroll-padding-top` for the header and `padding-bottom: var(--dock-h)` on the body, and does not set `scroll-padding-bottom`. Keyboard focus and in-page jumps can land under the 76 px dock. Listening while reading is the product (“Die Wiedergabe läuft weiter, während du scrollst”), so this state is the normal booking state, not an edge.
- **Fix:** On `html`, set `scroll-padding-bottom: calc(var(--dock-h) + 12px)` next to the existing top padding. Keep the dock. Do not add a download control.
- **Impact:** M. **Effort:** S. **Risk:** Low.

### R14 — The questions a promoter asks are answered only inside the form, if at all
- **Area:** SEO-content / AI / CRO
- **Evidence:** There is no question block on `de-390-full.png` or `de-1440-full.png`, and the live JSON-LD has no `FAQPage`. The answers already exist as rider facts: line-up from `memberCount`, “Eigene Songs mit türkischen Texten”, the five genres, occasions, “Hechingen … gerne auch weiter weg”, and “Antwort in der Regel innerhalb von 48 Stunden.” Nothing on the page says what an appearance costs, which is correct. Answer engines will either skip the band or invent a fee. Google no longer shows FAQ rich results for a band, so this is for the on-page decision and for citation, not for stars.
- **Fix:** A rider-style list immediately above `#booking`, native `<details>`, first item open, ending on the existing orange “Booking anfragen”. Six questions, answers copied from the facts above, in all three locales. The price answer states only that the fee depends on date, place, duration and the tech on site, and that the band replies with availability and conditions. No number. Mirror those same strings in `FAQPage` JSON-LD. Count stays `{count}` from the data.
- **Impact:** M. **Effort:** M. **Risk:** A specific fee, a set length or a tech rider that has not been confirmed would break the truth rule. The wording above does not.

### R15 — A missing page wears the homepage title and the booking colour
- **Area:** SEO-technical / UX
- **Evidence:** `https://www.typhoon.band/de/diese-seite-gibt-es-nicht` returns HTTP 404 and `<title>Typhoon · Bluesrock, Funk & Soul mit türkischen Texten</title>`, the same title as `/de` (`report.json` `404-390`). The visible H1 is correct: “Diese Seite gibt es nicht.” (`404-390-fold.png`). The only button is orange “Zur Startseite”. `DESIGN.md` reserves orange for booking. `not-found.tsx` at `6871de1` is a client component, so it cannot set its own title, and the link uses `btn-tape`. On a phone the header still has no booking button (R2), so a bad link offers no request.
- **Fix:** Serve the title “Seite nicht gefunden · Typhoon” (and the EN/TR equivalents). Draw “Zur Startseite” as `btn-line`. Add one orange link to `/de#booking`. The road-case label on `404-390-fold.png` wraps the email and phone onto two lines and sits tight on the shell; give that tape the full content width so the address stays readable.
- **Impact:** M. **Effort:** S. **Risk:** Low.

### R16 — The privacy link in the form is the one undersized target
- **Area:** A11y
- **Evidence:** `report.json` flags “Datenschutzerklärung” as the only small target on every German home width, and the matching “privacy policy” / “Gizlilik politikası” on EN and TR. It is the inline link under the form (`BookingForm.tsx`, class `link-u`). Imprint and privacy pages also flag `booking@typhoon.band` twice on the privacy page. The project rule is 44 px. WCAG 2.2 SC 2.5.8 allows an inline link inside a sentence, so this is a project miss rather than an automatic WCAG fail. Lighthouse A11y is 100, and `report.json` shows no horizontal overflow and no missing alts at 320–1920.
- **Fix:** Keep the sentence. Make the privacy link a block under it with `min-h-11` and a clear underline, same pattern as the footer legal links. On the legal pages, make the email a `min-h-11` link, as the footer already does.
- **Impact:** L. **Effort:** S. **Risk:** None.

## 3. Keep

- The visual system is doing its job and should not be restyled: matte deck, chalk type, square corners, tape colour by role, Big Shoulders / Schibsted Grotesk / Martian Mono, gold signature as a PNG. `de-1440-fold.png` is a distinctive first screen, not a generic band template.
- The setlist lives in the hero and every row plays. The pink button names the song (“Sakli Kalan anhören”). There is no download control. The dock continues playback while the page scrolls (`de-390-playing-fold.png`).
- The band collage is shown whole on desktop (`object-contain`, poster plus setlist over the paper margin only). Do not crop it.
- Empty dates stay empty. The honesty is right. Only the tape sentence in R3 should change.
- The form is the right length: required name, email, place, event type and a short message; optional phone and date; mailto and tel beside it; “Antwort in der Regel innerhalb von 48 Stunden.”; honeypot off screen. No price, no fake testimonial.
- Line-up cards come from data, in one grayscale treatment, green role tape, no stage plot (`de-390-sec-lineup.png`). The on-page musician count is computed, not typed in.
- Three locales of the same page, `lang` on `<html>`, canonical on the www host, `hreflang` including `x-default`. Robots disallow `/api/` and the three admin trees and point at the sitemap.
- Consent copy tells the truth: no tracking cookies, external players only after a choice. That sentence should survive R1.
- Reduced-motion screenshots still show the tapes in their final state. CLS 0 and no horizontal overflow at the measured widths.
- German voice is du-form, short, and specific. EN and TR hero folds carry the same offer.

## 4. Do not do

- Do not invent show dates, press quotes, testimonials, streaming numbers, a fee, a set length, or a tech rider. The dictionary’s `placeholderTitles` must not be rendered as concerts.
- Do not hard-code “8” or “9”, and do not type member names into sentences. Do not rename Tan, and do not put “Jürgen” back, until the owner says which person is in that slot.
- Do not publish “Kanzlei Studio” or “über 30 Jahre Bühnenerfahrung”. Both are still open in `PRODUCT.md`.
- Do not add social or streaming icons without real URLs. Live JSON-LD has no `sameAs`, which is better than a dead icon.
- Do not re-set the gold signature in a font, crop the collage, round corners, add a gradient, or use orange on anything except booking (the 404 home button is the current break).
- Do not put a download control on the demos, and do not embed YouTube or Spotify without the existing consent gate.
- Do not add analytics in this pass. Bookings already land in Supabase; a tracker is a separate consent decision.
- Do not change `/api/booking`, the honeypot, the time trap, or the Supabase insert for a visual fix.
- Do not turn the locale redirect into a 301. A cached German redirect would be wrong for an English or Turkish browser.
- Do not move or “correct” the Bayreuth imprint address. It is the legal person. The band’s playing base is a separate sentence (R4).
- Do not lead the hero with a single member’s photo. The collage is the band.
- Do not promise FAQ stars in Google. The FAQ is for the booker and for answer engines reading the page.

## 5. Open owner decisions

- Who is in the slot that now renders as Tan – Percussion? Live line-up and JSON-LD use Tan. `CLAUDE.md` says the owner still has to confirm that slot against Jürgen. Until then the site should keep the live data and stop hard-coding “eight”.
- Is “Kanzlei Studio” a name the public site may use? It is in the JSON-LD and on no visible surface.
- Which real platform URLs may be linked (the “Auch auf” row is absent, so `sameAs` is absent)?
- Are the hero words “Smooth. Exzeptionell. Funk.” fixed brand copy, or may the strips say “Türkische Texte. / Bläsersatz. / Live.”?
- Is there one wide live photo of the whole band on a stage that can lead the gallery? The current nine frames do not show that.
- May the empty-dates tape say “Auftritte auf Anfrage” instead of “Neue Termine sind in Planung”?
- Is any consented, cookieless measurement wanted later? This review does not add it. Sent requests can already be counted in Supabase.
