# Typhoon · Independent council review, round 1 · OpenAI

## 1. Verdict

I would withhold sign-off on the booking experience. The desktop hero earns its visual identity through the full-band poster, gold signature and playable paper setlist. On the first mobile visit, the privacy notice covers the booking action, and the booking link lands a screen away from the first field even after that notice is dismissed. Typhoon’s location and live-band offer also need to be clearer in the first screen and in search results.

I inspected the supplied PNGs, the live German page and the English and Turkish page responses, and the checkout at `6871de1`. The worktree was clean when the review began and acquired concurrent edits before it ended. Code citations refer to the frozen revision. Live measurements use CSS pixels. Impact estimates reflect the observed task friction and discovery gaps. The performance numbers are from the supplied Lighthouse baseline. I did not submit the production form.

## 2. Top findings

1. **R1-01 · CRO / A11y · Keep first-visit actions clear of the privacy notice**  
   **Impact H · Effort M · Risk M.** At 390 × 844 the notice starts at y=640 and covers the 48 px orange booking button at y=655. Starting the featured track shifts the notice up 76 px, where it also intercepts the pause button. At 360 × 780 both hero actions disappear under the notice. Keep the chalk sheet and equally reachable choices, but place the notice in normal flow or reserve its measured space. Keep external media off pending explicit consent. Verify focus and access to both actions with the dock open. [390 first visit][first390], [360 first visit][first360], [ConsentBanner.tsx:117][consent].

2. **R1-02 · CRO · Bring the first booking field into the landing viewport**  
   **Impact H · Effort M · Risk L.** After the live `#booking` jump settled at 390 × 844 with the dock open, the booking heading was at y=149 and the first field at y=947. The five rider rows, contact links and reply line all precede the form in the narrow layout. Keep the heading, short intro and direct contact within easy reach, then put the form before the complete rider on mobile. Keep the desktop two-column composition and make the existing anchor land where the first field is visible. [390 full page][mobile], [Booking.tsx:26][rider], [BookingForm.tsx:204][formlayout].

3. **R1-03 · CRO / UX/UI · Recover the first screen on short phones**  
   **Impact H · Effort M · Risk M.** The 390 px fold spends its first 430 px on the header, signature, tape strips and genre labels. At 320 × 568 during playback, the hero play/pause and booking buttons started at y=596 and y=656, below the viewport. Tighten the signature scale, strip spacing and copy margins on short phones, and consolidate repeated genre wording. Aim to show an actionable booking link and a 48 px featured-play control with consent already decided. Keep the three strips, whole collage and hero setlist. Check EN and TR at the same widths. [390 fold][fold390], [768 fold][fold768], [Hero.tsx:50][hero].

4. **R1-04 · CRO · Put Send within reach after the message**  
   **Impact H · Effort S · Risk L.** On live DE at 390 px, the empty chalk request preview is 427 px tall. It repeats the fields and pushes Send well below the message even for a short request. Keep the recipient visible and make the full taped preview a compact, optional disclosure above Send. Group optional phone and date after the core event questions and say that a short message is enough. Keep validation and the submission payload. [390 full page][mobile], [BookingForm.tsx:257][fields].

5. **R1-05 · CRO · Give mobile bookers a one-tap way back to booking**  
   **Impact H · Effort S · Risk L.** Below 640 px, the fixed header drops its booking link. The mid-page playing capture shows the header and dock framing several rows of portraits with no visible booking action. Add a compact orange booking link to the mobile header, including on legal pages, and reuse the existing anchor. Check fit with the signature, 44 px menu and localized labels at 320 px. [390 playing mid-page][playing], [390 open menu][menu], [Header.tsx:173][header].

6. **R1-06 · SEO-content/local/AI · Put the band’s search identity up front**  
   **Impact H · Effort S · Risk L.** The live H1 presents the signature and “Smooth. Exzeptionell. Funk.” The next paragraph names the sound, but the first visible city mention is in the booking rider. The German title also omits the city, while the meta description already names Hechingen. Keep the branded hero and put the live-band offer in one visible sentence near its actions, for example “Typhoon ist eine Liveband aus Hechingen mit türkischen Texten und Bläsersatz.” Carry the most useful qualifier into the localized titles. Check the Admin SEO overrides so the deployed titles reflect the change. [390 fold][fold390], [live German page](https://www.typhoon.band/de), [page.tsx:20][metadata].

7. **R1-07 · CRO / UX/UI · Lead the gallery with live performance evidence**  
   **Impact M · Effort M · Risk M.** The gallery leads with an empty rehearsal room, repeats the hero collage, and the largest about image shows the singer. Bookers get strong evidence of sound and instrumentation, but little early visual evidence of the whole band performing. Lead the gallery with the best verified performance photo and group studio images after it. Prefer an owner-cleared ensemble-onstage image when available, use factual captions, and put a booking link at the end of the gallery. Keep the hero collage whole. [1440 full page][desktop], [Gallery.tsx:105][gallery].

8. **R1-08 · CRO · Give the booking fallback the visitor’s draft**  
   **Impact M · Effort S · Risk L.** The API returns `fallback` when neither delivery channel was attempted. The client resets both form and draft before showing a bare mailto link, so the booker has to reconstruct the request. Retain the draft in memory on the fallback path and offer a copyable request or prefilled email. Keep the existing API and verify the UI with a mocked fallback response. [BookingForm.tsx:105][reset], [BookingForm.tsx:223][fallback], [booking route.ts:135][api].

9. **R1-09 · Perf · Tune the signature and poster loading for phones**  
   **Impact M · Effort M · Risk M.** The supplied mobile trace puts LCP at 3.4 s, with about 1.2 s of element render delay on the gold signature. Live HTML preloads both the signature and poster, although the poster begins near the bottom of the 390 px fold. Match image `sizes` to the rendered columns, test removing the poster preload at narrow widths, and compare the logo’s load completion and paint timing on a cold mobile trace. Keep the PNG artwork, desktop poster exposure and CLS baseline. [Council Lighthouse baseline][brief], [390 fold][fold390], [Hero.tsx:52][heroimages].

10. **R1-10 · SEO-content/local/AI · Publish a concise answer to “Can I book this band?”**  
    **Impact M · Effort S · Risk L.** The live rider lists event types and a base, but the first section after the setlist is a full-sized dates section whose only current content is an empty state and booking invitation. Use a compact empty state and expose a short, server-rendered booking summary higher on the page. Use supported facts about event types, original Turkish-language songs, brass and the Hechingen base. Keep the data-driven count, contact and request link. This gives people and search systems a clear passage to read or cite. [390 full page][mobile], [Shows.tsx:138][shows], [live booking rider](https://www.typhoon.band/de#booking).

11. **R1-11 · SEO-content/local/AI · Align structured identity and image descriptions with public facts**  
    **Impact M · Effort S · Risk L.** Live `MusicGroup` markup names “Kanzlei Studio” while the product document calls that public attribution undecided and the visible rider lists Hechingen, Baden-Württemberg. The hero image text hard-codes eight musicians in all locales while the live line-up and schema list nine members. Keep the shared entity ID and data-driven member roles. Use municipality and region in the schema until the studio attribution is approved. Describe the Typhoon band collage without a count and add `sameAs` only for verified official profiles. [PRODUCT.md:63][productfacts], [page.tsx:133][schema], [dictionaries.ts:291][dictalt].

12. **R1-12 · CRO / UX/UI · Make language choice easier to find and booking labels easier to act on**  
    **Impact M · Effort S · Risk L.** At 390 px the language links sit at the bottom of the menu, and the English “Booking request” and Turkish “Booking talebi” are noun labels. Give the current locale a visible entry point on phones, or move named language choices higher in the sheet if header width is tight. Use action labels such as “Request a booking” and the existing Turkish rider wording “Typhoon'u davet edin.” Retain the section hash and confirm the Turkish copy with a native speaker. [390 open menu][menu], [EN 390 fold][en390], [TR 390 fold][tr390], [LocaleSwitcher.tsx:28][locales].

13. **R1-13 · SEO-technical · Complete localized social metadata**  
    **Impact M · Effort S · Risk L.** Live DE, EN and TR emit share title, description and image, but omit `og:url`, `og:type`, `og:locale` and `og:site_name`. The homepage metadata defines its own `openGraph` object, which replaces the locale layout’s fuller object. Return a complete object with canonical URL and locale values, preserve Admin title, description and image overrides, and check the raw head and resulting share card per locale. The likely benefit is to shared-link traffic. [page.tsx:20][metadata], [locale layout.tsx:75][oglayout], [live English page](https://www.typhoon.band/en), [live Turkish page](https://www.typhoon.band/tr).

14. **R1-14 · A11y · Meet the project’s 44 px control requirement**  
    **Impact M · Effort S · Risk L.** At 390 px, the first-visit consent choices and header signature link measured 40 px high. The booking privacy link measured about 142 × 17 px. The language switches use a 40 px minimum width in code. Give these controls a 44 × 44 px hit area while keeping the visible lettering and signature size. Put the booking privacy link on its own tappable row if needed. Check adjacent targets and focus visibility with the notice and dock in view. [report.json][capture], [Header.tsx:133][logolink], [LocaleSwitcher.tsx:40][localehit], [BookingForm.tsx:307][privacyform].

15. **R1-15 · SEO-technical · Make the apex redirect permanent**  
    **Impact L · Effort S · Risk L.** The supplied HTTP baseline shows the apex-to-www hop as 307, while live canonicals and the sitemap point at www. If www is the durable production hostname, use a permanent HTTPS redirect on the apex, preserving paths and queries. The live www root negotiated DE, EN and TR in browser checks. Keep that language choice temporary and the canonical localized URLs directly reachable. [Council redirect baseline][brief], [middleware.ts:63][middleware], [live sitemap](https://www.typhoon.band/sitemap.xml).

16. **R1-16 · SEO-technical · Use meaningful sitemap modification dates**  
    **Impact L · Effort S · Risk L.** The sitemap code assigns every locale home and legal page a shared timestamp from generation time. Populate `lastmod` from a reliable content-change time where available and omit it where there is no such source. Keep the current canonical URLs and alternates. [sitemap.ts:5][sitemapcode], [live sitemap](https://www.typhoon.band/sitemap.xml).

17. **R1-17 · UX/UI · Polish privacy and 404 recovery**  
    **Impact L · Effort S · Risk L.** The 390 px privacy title wraps with a stranded “NG,” and the 404 uses orange for the home link. Give the legal heading a responsive size that fits or a deliberate language-aware break. Use the existing chalk outline button for the localized return-home link so orange continues to signal booking. The live unknown-path check returned HTTP 404 and `noindex`. [Privacy 390 fold][privacy390], [404 390 fold][notfound390], [LegalShell.tsx:33][legal], [not-found.tsx:13][notfound].

## 3. Keep

- Keep the matte deck, square cuts, role-specific tape, gold signature PNG and uncropped collage. At 1440 and 1920 px, the poster and setlist convey the band’s identity and give visitors an immediate way to hear it. [DESIGN.md:207][design], [1440 fold][fold1440], [1920 fold][fold1920].
- Keep one-tap featured playback, the shared audio player, the seekable setlist and playback across the page. The playing states are visually distinct on phone and desktop. Keep reduced-motion support. [1440 playing fold][playing1440], [390 playing mid-page][playing], [DESIGN.md:327][designaudio].
- Keep the real member portraits, data-derived count, data-backed dates and direct mail and phone links. [390 full page][mobile], [page.tsx:105][content].
- Keep the three indexable locale homes, self-canonicals, reciprocal hreflang, `x-default` and crawlable sitemap. [German](https://www.typhoon.band/de), [English](https://www.typhoon.band/en), [Turkish](https://www.typhoon.band/tr), [robots.txt](https://www.typhoon.band/robots.txt).

## 4. Do not do

- Avoid replacing the signature, turning the hero into a solo portrait, or moving the setlist to a separate route. The band image and playback already work together as evidence. [1440 fold][fold1440], [DESIGN.md:284][designlayout].
- Avoid city-by-city doorway pages, fabricated dates or testimonials, and unverified profiles or service areas. Start with the verified regional identity and the band’s own material. [PRODUCT.md:48][productconstraints], [live booking rider](https://www.typhoon.band/de#booking).
- Avoid solving notice coverage by granting automatic consent or adding a third-party player, tracking or audio downloads. Keep explicit choices and user-initiated playback. [PRODUCT.md:48][productconstraints], [ConsentBanner.tsx:117][consent].
- Avoid changing the booking API, storage or delivery rules for a visual update. The mobile landing and draft recovery have frontend fixes. [BookingForm.tsx:72][submit], [booking route.ts:135][api].

## 5. Open owner decisions

- Which event types and travel areas should the site actively solicit? What minimum stage, sound and setup requirements can be published? The rider currently gives event categories and a broad travel statement. [Live booking rider](https://www.typhoon.band/de#booking).
- Which full-band live photos or clips are cleared for publication? Which organizer listings or official profiles can the band link to? The site currently shows a studio-led gallery and the live entity has no `sameAs`. [1440 full page][desktop], [live German page](https://www.typhoon.band/de).
- Is “Kanzlei Studio” an approved public rehearsal-base attribution? The booking rider says Hechingen and the imprint separately lists the legal contact in Bayreuth. Confirm those roles and the disputed live member slot before editing source data. [PRODUCT.md:63][productfacts], [imprint 390 fold][imprint390].
- Can the band reliably keep the “usually within 48 hours” reply wording, and is “new dates are being planned” current? Both are live copy that need operational confirmation. [Live booking rider](https://www.typhoon.band/de#booking), [live dates](https://www.typhoon.band/de#shows).

[brief]: <scratchpad/council/brief-r1.md>
[first390]: <scratchpad/before/de-390-firstvisit-fold.png>
[first360]: <scratchpad/before/de-360-firstvisit-fold.png>
[mobile]: <scratchpad/before/de-390-full.png>
[desktop]: <scratchpad/before/de-1440-full.png>
[fold390]: <scratchpad/before/de-390-fold.png>
[fold768]: <scratchpad/before/de-768-fold.png>
[playing]: <scratchpad/before/de-390-playing-mid.png>
[menu]: <scratchpad/before/de-390-menu-open.png>
[en390]: <scratchpad/before/en-390-fold.png>
[tr390]: <scratchpad/before/tr-390-fold.png>
[capture]: <scratchpad/before/report.json>
[privacy390]: <scratchpad/before/privacy-390-fold.png>
[notfound390]: <scratchpad/before/404-390-fold.png>
[fold1440]: <scratchpad/before/de-1440-fold.png>
[fold1920]: <scratchpad/before/de-1920-fold.png>
[playing1440]: <scratchpad/before/de-1440-playing-fold.png>
[imprint390]: <scratchpad/before/imprint-390-fold.png>
[consent]: <repo/src/components/consent/ConsentBanner.tsx:117>
[rider]: <repo/src/components/sections/Booking.tsx:26>
[formlayout]: <repo/src/components/sections/BookingForm.tsx:204>
[hero]: <repo/src/components/sections/Hero.tsx:50>
[fields]: <repo/src/components/sections/BookingForm.tsx:257>
[header]: <repo/src/components/site/Header.tsx:173>
[metadata]: <repo/src/app/[locale]/(site)/page.tsx:20>
[gallery]: <repo/src/components/sections/Gallery.tsx:105>
[reset]: <repo/src/components/sections/BookingForm.tsx:105>
[fallback]: <repo/src/components/sections/BookingForm.tsx:223>
[api]: <repo/src/app/api/booking/route.ts:135>
[heroimages]: <repo/src/components/sections/Hero.tsx:52>
[shows]: <repo/src/components/sections/Shows.tsx:138>
[productfacts]: <repo/PRODUCT.md:63>
[schema]: <repo/src/app/[locale]/(site)/page.tsx:133>
[dictalt]: <repo/src/i18n/dictionaries.ts:291>
[locales]: <repo/src/components/site/LocaleSwitcher.tsx:28>
[oglayout]: <repo/src/app/[locale]/layout.tsx:75>
[logolink]: <repo/src/components/site/Header.tsx:133>
[localehit]: <repo/src/components/site/LocaleSwitcher.tsx:40>
[privacyform]: <repo/src/components/sections/BookingForm.tsx:307>
[middleware]: <repo/src/middleware.ts:63>
[sitemapcode]: <repo/src/app/sitemap.ts:5>
[legal]: <repo/src/components/legal/LegalShell.tsx:33>
[notfound]: <repo/src/app/[locale]/(site)/not-found.tsx:13>
[design]: <repo/DESIGN.md:207>
[designaudio]: <repo/DESIGN.md:327>
[content]: <repo/src/app/[locale]/(site)/page.tsx:105>
[designlayout]: <repo/DESIGN.md:284>
[productconstraints]: <repo/PRODUCT.md:48>
[submit]: <repo/src/components/sections/BookingForm.tsx:72>
