# Recon: `/home/user/typhoon.band` (MikaMcFlurry/typhoon.band), all branches

Read-only forensic recon, 2026-09-25. No checkout, no modification. Evidence from `git show`, `git ls-tree -r -l`, blob-hash comparison with `/home/user/typhoon.band-website` (all refs), and Vercel API (read-only).

---

## 0. TL;DR

- `typhoon.band` is the **older predecessor repo**. It is **not** the live site. The live site is `typhoon.band-website` (Vercel project `typhoon-band-website`, main @ 740ff46).
- Branch topology:
  - `origin/main` = `origin/claude-design` = `origin/claude/typhoon-website-redesign-7xjozt` = **5178116** (2026-04-28 00:54 +0200). This is the Codex "batch 1" frontend plus raw uploads (MP3s dropped into `docs/`, a new hero image without extension, v2 docs). **Its visible content is wrong** (Taifun / Jürgen on sax / Daniel).
  - `origin/claude/typhoon-premium-redesign-x01JL` = **e2fe2e1** (2026-04-30). This is the "old Claude branch" that CLAUDE.md in the live repo names as the source of audio behaviour. It has a one-page layout, correct member data, real local MP3 playback, Web Audio FFT waveform, and the Redesign Brief v2 plus Checklist v2, with 2 mockup PNGs and 4 photos loose in the repo root.
  - `origin/codex` = **88add85** (2026-04-27). This is Codex "batch 2" (a design rework), which was never merged. It is visually superseded and its content is also wrong (Taifun/Daniel).
- Vercel: project `typhoon-band-test` (prj_LdONuo4CYKsC7IoijwOiCyGD62H5) has exactly 1 deployment, `dpl_91To3JoqDkVxH4UjksxATdW6vUts`, from `main@5178116bdd…`, created 2026-05-04, READY, production. It is SSO-protected and uses only `*.vercel.app` domains (`typhoon-band-test.vercel.app`), no custom domain, `live:false`. A fetch of `/de/band` confirms that it renders **"Taifun", "Jürgen – Saxophon", "Daniel – Gitarre"**. It is stale and has wrong facts. A second project, `typhoon-band` (prj_JBqUKfzrS2mKwKVMKpsG55s8AymH), has 1 deployment of the same SHA in state **CANCELED**. x01JL was **never deployed**.
- The audio stack on live `main` is a **faithful port plus extension** of x01JL: identical analyser, FFT loop and idle-shape math. It adds a playlist (next/prev/auto-advance), volume/mute, `crossOrigin="anonymous"` for Supabase Storage, click-to-seek on the waveform and `useTrackDuration`. It **lost** x01JL's keyboard-accessible `<input type=range>` seek.
- Assets: every photo and MP3 in `typhoon.band` is already in the live repo, re-encoded or renamed. The exceptions are **`typhoon-logo.svg` (vector logo, 970×451, single fill `#efe2c3`)**, which is missing from live (live only has 2099×724 PNG signatures), plus design-reference mockups and the original `Typhoon-info.docx`. The docx holds extra bio facts; see §2.4.

---

## 1. Branches: purpose, history, what is unique

### 1.1 Commit graph (all refs)

```
02001b9 2026-04-26 Initial commit (Mika)
8803386 2026-04-26 Add files via upload         <- docx, datenmodell.md, mockup PNG, member photos, hero jpg, logo.svg
47c99a0 2026-04-26 commit batch 1 (Codex)       <- Next.js scaffold, 54 files
├─ 88add85 2026-04-27 commit batch 2 (Codex)     = origin/codex (unmerged)
f2a07ab 2026-04-26 Merge PR #1 from codex        (merges batch 1 only)
├─ main line (Mika uploads, 2026-04-28 00:21–00:54 +0200):
│   e4ff301 Add new hero image  (public/assets/reference/typhoon-band-hero-new, no extension!)
│   237e191/5ec5c59/b4b23ab  delete docs/missing-source-files.md, docs/typhoon-info.md, docs/Typhoon-info.docx
│   81a924e..46bd7fa  add CLAUDE.md + docs v2 + MP3s into docs/
│   b4ad53a/2daf85a/5007e62  delete cilgin/bir-tek-sen/farksilin demo, then 5178116 re-add
│   5178116  = origin/main = origin/claude-design = origin/claude/typhoon-website-redesign-7xjozt
└─ x01JL line:
    298cf66 2026-04-26 Premium visual rebuild (Claude)
    d72cfd3 2026-04-27 Frontend correction batch: new hero, audio playback, member fixes, gold polish
    36189df 2026-04-27 Onepager refinement: hero logo at lower edge, anchor nav, subpages redirect
    3d6a350 2026-04-27 Hero mockup polish + real-FFT animated waveform on every demo
    fb1f1dc 2026-04-28 Hero polish: premium buttons, logo low across image, refined surfaces
    e52ee5f 2026-04-28 Hero crop fix, expandable onepager, consistent waveform across demos
    b2e920a 2026-04-30 Create "Typhoon Website – Claude Frontend Redesign Brief v2.md" (Mika)
    1854838 2026-04-30 Add "Typhoon Redesign – Claude Checkliste v2" (Mika)
    e2fe2e1 2026-04-30 Add files via upload (6 loose images in repo root)
```

Merge bases: `main`/`x01JL` → f2a07ab; `main`/`codex` → 47c99a0. x01JL copied Mika's main uploads (same blob hashes for the MP3s and hero-new) but never merged main.

### 1.2 `origin/main` (= claude-design = claude/typhoon-website-redesign-7xjozt) @ 5178116

- Purpose: Codex batch-1 static MVP, plus a staging area where Mika uploaded the v2 docs and demo MP3s.
- Stack: Next 15.5.15, React 19.2.5, Tailwind 4.1.18, TS 5.9.3, no other dependencies. `vercel.json` uses `framework: nextjs`, `npm install`/`npm run build`.
- Routes: `/[locale]` (de|en|tr) with separate pages `band`, `music`, `shows`, `booking`, `legal/imprint`, `legal/privacy`; the root redirects to `/de`.
- Data problems (still rendered on typhoon-band-test):
  - `src/data/members.ts`: order Mika, **Taifun**, **Jürgen – Saxophon**, Hardy, Stefan, Tom, Buğra, **Daniel – Gitarre**.
  - `src/i18n/dictionaries.ts` `band.long`: "Sänger Taifun, Saxophonist Jürgen, … Gitarristen Buğra und Daniel".
  - `src/data/songs.ts`: 6 titles, **no audioSrc**. The player is a UI shell only.
- Unique files: `docs/current-batch.md` (the batch spec that x01JL executed), `CLAUDE.md` (frontend-only phase rules), and MP3s committed under `docs/` with `-demo` names. The hero file `public/assets/reference/typhoon-band-hero-new` has no extension (455002 bytes, blob e481af9, the same as x01JL's `.jpeg`). `src/lib/assets.ts` is a server-side fs `existsSync` asset-fallback helper.
- Duplicate junk: `member-mika-posaune .JPG` (with a space) and `.jpg`, `member-typhoon-singer.PNG` and `.png`, `Website-mockup.PNG` and `website-mockup.png`. Each pair is the same blob.

### 1.3 `origin/claude/typhoon-premium-redesign-x01JL` @ e2fe2e1

- Purpose: the Claude visual rebuild plus correction batch. This is the "old Claude branch" named in the live repo's CLAUDE.md. It has the best predecessor frontend.
- Structure: a **one-page site** at `/[locale]` with sections `#home`, `#band`, `#music`, `#shows`, `#booking`, and `#contact` (inside booking). `/band`, `/music`, `/shows`, `/booking`, `/contact` and `/gallery` are 307 redirect shims, for example `redirect(\`/${locale}#music\`)`. Legal pages remain separate routes.
- Header: sticky, 64–80px tall, logo SVG on the left, centred anchor nav (`Home Band Musik Shows Booking Kontakt`), social icons, a vertical gold divider and a DE/EN/TR switcher. Mobile has a borderless hamburger that opens a drawer with a gold "Booking Anfrage" CTA.
- Hero (`HeroSection.tsx`):
  - Headline lines `["Smooth.", "Exzeptionell.", "Funk."]`.
  - Subline: "Typhoon – die türkisch-funk & soul Band aus Leidenschaft, Groove und Energie."
  - CTAs: "Songs anhören" (→#music) and "Live erleben" (→#shows).
  - Desktop: 2 columns (46/54). The band image is in a rounded 28px card on the right with `typhoon-logo.svg` overlaid low (`.logo-overlay-strong`).
  - Mobile: the image is a backdrop over the top 58–64% and the logo sits at `top:44%`.
  - Bottom row: `HeroFeaturedDemo` (circular cover play button, "Neuer Track", "Listen now →", an 18-bar waveform on lg) and `NextConcertPanel` ("Nächstes Konzert", falling back to TBA / "Venue TBA · Bayreuth / Umgebung", "Alle Termine").
- Band: `BandIntro` shows the image `typhoon-band-hero-new.jpeg` with the caption "Live / Kanzlei Studio · Hechingen". The title is "Amerikanisches Feeling. Europäische Seele. Türkische Texte.", with short copy plus long copy behind a "Mehr über Typhoon" expander (CSS `grid-template-rows` 0fr→1fr).
- Members: `MembersSection` shows 4 cards and expands to all 8 ("Alle Bandmitglieder anzeigen"). Only Typhoon and Mika have photos. The others show a placeholder initial letter.
- Music: `MusicSection` shows `FeaturedDemo` (song[0], Sen-Benim, 72 bars) plus 3 `DemoPlayerCard`s (64 bars), expanding to all 6 ("Alle Demos anzeigen").
- Shows: `ShowsSection` shows 2 upcoming entries and expands to reveal the rest plus past shows. The status badges are gold for scheduled, danger for cancelled and muted otherwise. The data is placeholders only.
- Booking and contact:
  - `BookingFormShell` fields: Name*, E-Mail*, Telefon (optional), Wunschdatum (optional, date), Ort*, Art der Veranstaltung*, Nachricht*. It has a privacy note, and submit only shows "Booking-Versand wird im nächsten Batch angebunden."
  - Contact card: Booking booking@typhoon.band, Allgemein info@typhoon.band, Telefon +49 176 64472296.
  - A **"Was wir mitbringen"** panel with invented claims: "8 Musiker · komplettes Live-Set", "Eigenes Stage-Setup nach Absprache", "Set-Längen 60–120 Minuten", "Festival, Club, Firmenevent, Privat". **Not backed by any doc; do not carry these over as facts without owner confirmation.**
- Footer: logo, tagline "Bluesrock · Funk · Soul · Jazz · Southern Rock · Türkische Texte", social icons, a "Kontakt" block (email, phone, "Am Schwarzen Steg 5a, 95448 Bayreuth, Deutschland"), and "Rechtliches" (Impressum, Datenschutz, "Cookies – kein Tracking im MVP"). The bottom bar reads "© {year} Typhoon · Alle Rechte vorbehalten." with "Bayreuth · Hechingen".
- Design tokens (`globals.css`):
  - Backgrounds: `--bg-0 #030201`, `--bg-1 #060403`, `--bg-2 #100a06`.
  - Ink: `--ink #f2e6cf`, `--ink-soft #d8c69a`, `--ink-mute #b9aa90`.
  - Gold: `--gold #c79a4b`, `--gold-soft #e8c982`, `--gold-deep #b8873b`, `--bronze #6f4a1f`, `--sepia #a07140`.
  - Lines: `--line rgba(199,154,75,.18)`, `--line-strong rgba(232,201,130,.4)`.
  - Radii: `--r-sm 10`, `--r-md 16`, `--r-lg 22`, `--r-xl 28`.
  - Tailwind `amber-*` is remapped to gold, and `body::before` adds film grain.
  - Utility classes: `.poster-frame`, `.btn`, `.btn-gold`, `.btn-ghost`, `.btn-sm`, `.logo-overlay(-strong)`, `.grain`, `.nav-link` (gold underline for aria-current), `input[type=range].audio-range`.
  - Fonts: system only; `.display` is uppercase, weight 900.
- Unique to this branch:
  - `src/components/audio/{AudioPlayerProvider,Waveform}.tsx`
  - `src/components/ui/{DemoPlayerCard,FeaturedDemo,HeroFeaturedDemo,HeroMusicPlayer,SocialIconLinks,PageHero}.tsx`
  - `public/assets/audio/demos/*.mp3` (6 files) plus a README
  - `.gitignore` rules for raw audio (`*.wav *.aiff *.aif *.flac *.m4a *.logicx *.als *.band`, `!public/assets/audio/demos/*.mp3`)
  - `docs/typhoon-info.md` (corrected), `docs/missing-source-files.md`
  - The Brief v2 and Checklist v2
  - 6 loose root images (see §4)
- The Brief refers to mockups `CEB0DFC7-7E26-4C79-8124-A97D01BE07D6.jpeg` (desktop) and `32DDB57C-2BEE-4DC3-9931-AE1CEE797C86.jpeg` (mobile). **Those filenames are not in any branch.** The committed equivalents are `DB2B0C88-280F-447A-9E41-D7C833977F75.png` (desktop, 977×1610) and `CF4A20FB-8C94-45B1-A7C2-63EB9D7B5D4F.png` (mobile, 941×1672).

### 1.4 `origin/codex` @ 88add85 (unmerged "commit batch 2")

- Purpose: a Codex premium design rework of batch 1. It touches 21 files, +477/−170.
- Unique pieces:
  - `src/components/layout/HeaderNav.tsx`: horizontal nav, text social placeholders "fb ig yt sp", and a "Songs anhören" button.
  - `src/components/sections/HomeFeatureGrid.tsx`: a 4-card grid of "Nächste Show / TBA", "Neuer Track / Sen-Benim", "Galerie / Live & Presse" and "Booking / Live anfragen". It includes the copy "Festival, Club-Show oder Firmenevent? Typhoon bringt Groove, Soul und Druck auf die Bühne."
  - Hero headline `"SMOOTH.\nEXCEPTIONAL.\nFUNK."`, eyebrow `"BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK"`, subline "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock - kraftvoll, warm und live voller Energie."
  - A README "Batch 2" section.
- It still has Taifun, Jürgen on sax and Daniel. The only asset beyond main is `docs/Typhoon-info.docx` (also in 8803386).
- Nothing here is worth porting beyond the copy lines above.

---

## 2. Content facts (verbatim)

### 2.1 `docs/typhoon-content-facts.md` (main and x01JL, identical, 2122 bytes)

- Band identity: "Bluesrock, Funk, Soul, Jazz, Southern Rock, Turkish lyrics, American-European sound, strong live energy, experienced musicians".
- Default language `de`; prepared `en`, `tr`.
- Genre line: `BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK`
- Headline options: `SMOOTH. / EXCEPTIONAL. / FUNK.` or `BLUES. / FUNK. / TURKISH SOUL.`
- German hero subline: `Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.`
- CTA labels: `Songs anhören`, `Live erleben`, `Booking Anfrage`
- **Members, exactly 8, in this order:**
  ```
  1. Typhoon – Gesang
  2. Mika – Posaune
  3. Schack – Saxophon
  4. Hardy – Trompete
  5. Stefan – Funk-Bass
  6. Tom – Schlagzeug
  7. Buğra – Gitarre
  8. Jürgen – Gitarre
  ```
  Rules: "Singer is Typhoon, not Taifun." "Saxophonist is Schack, not Jürgen." "Guitarist is Jürgen, not Daniel." "Daniel must not appear unless explicitly added later." "Singer card must be first."
- Demo songs: `Sen-Benim`, `Karanfill`, `Gece Yine Düştün`, `Farksilin`, `Çılgın`, `Bir Tek Sen`. Rules: publicly streamable, no download button, local MP3s.
- Platforms (later): Spotify, YouTube, Instagram, Facebook, SoundCloud, Bandcamp. "no external embeds without consent".
- Legal / imprint: `Mika Hertler / Am Schwarzen Steg 5a / 95448 Bayreuth / Deutschland / E-Mail: info@typhoon.band / Telefon: +49 176 64472296`. "Legal content must later be editable through the admin area and checked before launch."
- Booking: `booking@typhoon.band`

### 2.2 `docs/typhoon-info.md`: the band story

x01JL's corrected version is canonical:

> Typhoon präsentiert sich mit einem beeindruckenden Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock, der einen kraftvollen amerikanisch-europäischen Sound erzeugt. Ihre selbstkomponierten Songs verweben markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen zu einem mitreißenden Ganzen, das die Band deutlich vom Mainstream abhebt.
>
> Ausdrucksstarke türkischsprachige Texte verleihen den Stücken geheimnisvolle Tiefe und unterstreichen die kulturelle Vielfalt, die Typhoon auszeichnet. Diese stilistische Bandbreite sprengt gekonnt Genregrenzen, ohne die charakteristische Handschrift der Band zu verwischen.
>
> Im Zentrum steht ein eingespieltes Kollektiv aus acht erfahrenen Musikern mit über 30 Jahren Bühnenerfahrung: Sänger Typhoon, Posaunist Mika, Saxophonist Schack, Trompeter Hardy, Funk-Bassist Stefan, Schlagzeuger Tom sowie die Gitarristen Buğra und Jürgen.
>
> Im eigenen Kanzlei Studio in Hechingen produziert die Band ihre Arrangements mit viel Liebe zum Detail und moderner Technik. Das Ergebnis ist ein Gesamtpaket aus handwerklicher Präzision und authentischer Spielfreude.

The codex/8803386 version differs only in paragraph 3, which is the wrong version: "…Dazu zählen Sänger Taifun, Saxophonist Jürgen, … Gitarristen Buğra und Daniel."

### 2.3 x01JL dictionary copy (DE, the best existing prose)

- `meta.title` "Typhoon | Bluesrock · Funk · Soul · Turkish Soul". EN/TR use "Typhoon | Blues, Funk & Turkish Soul".
- `home.bandTitle` "Amerikanisches Feeling. Europäische Seele. Türkische Texte."
- `home.bandCopyShort` "Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves und soulige Melodien, getragen von einer Band mit über 30 Jahren Bühnenleben."
- `home.bandCopyLong` "Selbstkomponierte Songs verweben jazzige Finessen, türkische Texte und ein amerikanisch-europäisches Sound-Bild zu einem mitreißenden Ganzen. Im Zentrum steht ein eingespieltes Kollektiv aus acht Musikern: Sänger Typhoon, Posaunist Mika, Saxophonist Schack, Trompeter Hardy, Funk-Bassist Stefan, Schlagzeuger Tom sowie die Gitarristen Buğra und Jürgen. Im eigenen Kanzlei Studio in Hechingen entstehen Arrangements mit handwerklicher Präzision und authentischer Spielfreude."
- `home.membersCopy` "Acht Musiker, ein Sound. Erfahren, eingespielt, kompromisslos live."
- `band.eyebrow` "American feeling · European soul · Turkish lyrics"
- `band.sound` ["Bluesrock & Southern Rock", "Funk & Soul Grooves", "Türkische Texte", "Live-Energie"]
- `bookingPage.intro` "Festival, Club, Firmenevent oder besondere Privatveranstaltung – schick uns die Eckdaten und wir melden uns zeitnah."
- `bookingPage.privacy` "Die Anfrage wird später zur Bearbeitung an booking@typhoon.band übermittelt und im Admin-Bereich gespeichert."
- `contact.intro` "Allgemeine Anfragen, Presse oder Hallo-Sagen."
- The TR and EN translations exist for everything. For example, TR `home.subline` is "Typhoon – tutku, groove ve enerji dolu Türk-funk & soul grubu." and TR `band.long` is "…vokalde Typhoon, trombonda Mika, saksafonda Schack, trompette Hardy, baste Stefan, davulda Tom ve gitarda Buğra ile Jürgen…".
- Member one-liners in `src/data/members.ts` (x01JL). These were written by Claude, not the band, so treat them as placeholders:
  - Typhoon: "Frontmann mit türkischsprachigen Texten und der direkten Energie im Zentrum der Band."
  - Mika: "Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien."
  - Schack: "Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion."
  - Hardy: "Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck."
  - Stefan: "Groove-Fundament, trocken, treibend und nah am Soul."
  - Tom: "Live-Puls, Dynamik und souveräne Bühne für die Band."
  - Buğra: "Live- und Session-Gitarrist mit türkischem Background und Rock-Kante."
  - Jürgen: "Riffs, rhythmische Schwere und southern-rock-getränkte Phrasierung."

### 2.4 `docs/Typhoon-info.docx` (codex, 8803386; deleted on main): extra facts not in any .md

Extracted text, verbatim:

> Typhoon präsentiert sich mit einem beeindruckenden Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock, der einen kraftvollen amerikanisch-europäischen Sound erzeugt. Ihre selbstkomponierten Songs verweben markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen zu einem mitreißenden Ganzen, das die Band deutlich vom Mainstream abhebt. Ausdrucksstarke türkischsprachige Texte verleihen den Stücken geheimnisvolle Tiefe und unterstreichen die kulturelle Vielfalt, die Typhoon auszeichnet. Diese stilistische Bandbreite sprengt gekonnt Genregrenzen, ohne die charakteristische Handschrift der Band zu verwischen. **Jeder Track wirkt live wie im Studio sofort wiedererkennbar und bleibt nachhaltig im Gedächtnis.**
>
> Im Zentrum steht ein eingespieltes Kollektiv aus erfahrener Musikern, die jeweils auf über 30 Jahre Bühnenerfahrung zurückblicken können. Dazu zählen Sänger Taifun **( Düzviraj ,Kapkaç )**, Saxophonist Jürgen, Trompeter Hardy **(unter anderem bekannt aus „Ernest a / & the Hemingway“)**, Funk-Bassist Stefan, Schlagzeuger Tom sowie die Gitarristen Buğra **(Live- und Session-Gitarrist für prominente Künstler in der Türkei, auch solo als Buğra Uzer aktiv)** und Daniel **( Düzviraj und ehemals Rita and the Jetlegs)**. **Diese langjährige Erfahrung verleiht Typhoon einen souveränen, energiegeladenen Auftritt und eine klangliche Tiefe, die sofort spürbar ist.** Im eigenen „Kanzlei Studio“ in Hechingen produzieren sie ihre Arrangements mit viel Liebe zum Detail und moderner Technik. Das Ergebnis ist ein perfektes Gesamtpaket aus handwerklicher Präzision und authentischer Spielfreude – **ein musikalisches Erlebnis, das Festivalveranstalter und Publikum gleichermaßen beeindruckt.**

Usable after owner confirmation. Name and role corrections from content-facts override the docx.
- The singer Typhoon (the docx's "Taifun") has credits "Düzviraj", "Kapkaç".
- Hardy: "bekannt aus „Ernest a / & the Hemingway“". The raw XML has a paragraph break after "Ernest a", so the exact band name is **ambiguous; ask the owner** before using it.
- Buğra: "Live- und Session-Gitarrist für prominente Künstler in der Türkei, auch solo als Buğra Uzer aktiv".
- The "Düzviraj und ehemals Rita and the Jetlegs" credit belonged to **Daniel**, who is now removed. **Do NOT transfer it to Jürgen.**

### 2.5 `docs/typhoon-website-datenmodell-adminstruktur-v1.md` (22624 bytes, all branches identical; dated 2026-04-26)

- Stack table:

  | Area | Decision |
  |---|---|
  | Frontend | Next.js |
  | Hosting | Vercel |
  | Auth | Supabase Auth |
  | Database | Postgres |
  | Storage | Supabase Storage |
  | E-Mail | Resend |
  | Domain | typhoon.band |
  | Languages | DE default, EN, TR |

- Recommended hero: "Blues, Funk & Turkish Soul." with subline "Typhoon verbindet Bluesrock, Funk, Soul, Jazz und Southern Rock mit türkischsprachigen Texten und kraftvoller Live-Energie." and CTAs "Demos anhören" / "Booking anfragen".
- Tables:
  - `admin_profiles` (roles owner / admin / editor)
  - `site_settings` (site_name Typhoon, default_language de, primary_email info@typhoon.band, booking_email booking@typhoon.band, phone +49 176 64472296)
  - `platform_links` (spotify, youtube, instagram, facebook, soundcloud, bandcamp; "URL leer = nicht anzeigen")
  - `legal_pages` + translations (imprint / privacy / cookies; owner-only)
  - `hero_sections` + translations
  - `band_pages` + translations (intro, main, press_short, press_long)
  - `band_members` + translations
  - `songs` (status demo / single / album_track / unreleased; is_streamable, **is_downloadable=false**, is_featured, sort_order)
  - `media_items` + translations (image / video_thumbnail / press_image / logo / other)
  - `videos` + translations (requires_consent; "Vorschaubild → Button „Video laden“ → Consent → Embed laden")
  - `shows` + translations (status scheduled / sold_out / cancelled / private / past; ticket_mode none / external / internal / both; external_ticket_url; internal_ticket_enabled)
  - `booking_requests` (name, email, phone optional, event_date, event_location, event_type, message, status new / read / answered / done / spam, ip_hash)
  - `seo_entries`, `consent_settings` (necessary / external_media / statistics / marketing), `press_assets` (hidden in the MVP)
- Storage buckets: `public-media`, `audio-demos`, `admin-private`, `press-assets`.
- Resend flow: "From: Typhoon Website <website@typhoon.band> / Reply-To: E-Mail des Anfragenden / To: booking@typhoon.band".
- Admin menu: Dashboard, Startseite, Band, Mitglieder, Musik, Galerie, Videos, Shows, Booking, Plattformen, SEO, Rechtliches, Einstellungen, Admin-Nutzer.
- Not in the MVP: Shop, Checkout, Payment, Kundenkonten, Newsletter, Ticket-QR, visible Presse-Downloadbereich, CRM, auto-translation.

### 2.6 `docs/typhoon-design-system.md` (main and x01JL)

- Palette:

  | Name | Hex |
  |---|---|
  | Deep black | `#030201` |
  | Brown black | `#060403` |
  | Warm dark brown | `#100a06` |
  | Dark bronze | `#6f4a1f` |
  | Deep gold | `#b8873b` |
  | Antique gold | `#c79a4b` |
  | Champagne gold | `#e8c982` |
  | Warm cream | `#f2e6cf` |
  | Muted text | `#b9aa90` |

- Card radius "around 18–28px", pill buttons, "No external fonts in current phase".
- Hero layer order: image → gradients → content → player → logo overlay on top ("must not be buried").
- Mobile: no horizontal overflow; the audio player fits the width.

### 2.7 `docs/typhoon-assets.md`

- Hero primary: `/public/assets/reference/typhoon-band-hero-new.jpeg`. This image "already includes: singer Typhoon in color, the band in sepia/grunge mood, no Typhoon text inside the image".
- Logo: `typhoon-logo.svg`, used "1. small functional header logo 2. large separate hero overlay logo".
- Demo folder `/public/assets/audio/demos/`, expected names `sen-benim.mp3 karanfill.mp3 gece-yine-dustun.mp3 farksilin.mp3 cilgin.mp3 bir-tek-sen.mp3`.
- Drive source `Musik/Typhoon/Demos`. Never commit WAV / AIFF / FLAC / M4A / DAW files.

### 2.8 `docs/typhoon-technical-plan-v2.md`

- Frontend-only phase. Future: Supabase Auth / Postgres / Storage, Resend, Vercel env vars.
- Roles owner / admin / editor (MVP owner and admin).
- Security: RLS, no service role in the browser, rate limiting for forms, legal pages owner-only.
- Static data in `src/data/{members,songs,shows,platform-links}.ts`, which should be "easy to replace with Supabase later".

### 2.9 Redesign Brief v2 and Checklist v2 (x01JL only), key points

- "Die zwei neuen Mockups sind die verbindliche Referenz für Look, Layout, Rhythmus…" but also "Die Mockups enthalten falsche Beispielinhalte. Diese Inhalte dürfen nicht übernommen werden."
- Tokens:

  | Token | Value |
  |---|---|
  | `--ty-bg` | `#070604` |
  | `--ty-bg-soft` | `#0e0c09` |
  | `--ty-panel` | `#15120e` |
  | `--ty-panel-2` | `#1c1711` |
  | `--ty-border` | `rgba(214,168,95,.34)` |
  | `--ty-border-strong` | `rgba(214,168,95,.62)` |
  | `--ty-gold` | `#d6a85f` |
  | `--ty-gold-soft` | `#b88645` |
  | `--ty-cream` | `#f1e6d2` |
  | `--ty-muted` | `#b8a98f` |
  | `--ty-danger` | `#b9503e` |

- Typography: "Hero-Headline: große elegante Serif-Anmutung". "Keine externen Google Fonts ohne Consent/DSGVO-Prüfung… lokal einbinden". Cards use a 12–18px radius.
- Homepage order:
  1. Header
  2. Hero
  3. Featured Song / Audio Player (a wide card directly under the hero)
  4. Shows
  5. Members
  6. Media (videos only after consent)
  7. Booking (2 columns, with an image/CTA panel on the right)
  8. News only if the backend supports it
  9. Footer (Impressum, Datenschutz, Cookies/Consent; **no AGB link**; socials only if active)
- Fallbacks: "Blues, Funk & Turkish Soul." plus the Subline, "Demos anhören" / "Booking anfragen", info@typhoon.band, +49 176 64472296.
- Shows: private shows never displayed; cancelled shows clearly marked; ticket button only with a valid mode and link.
- Booking: keep honeypot / spam protection / server validation, with a privacy note at the form.
- **Mockup content to REJECT**, as seen in the PNGs:
  - Names: "Taner Yücel, Ali Can, Selim Sari/San, Murat Öztürk, Emil(y) Yilmaz, Cenk Mercan/Mencetin, Burak Gürpinar"
  - Songs: "Find A Way", "Gel Fırtına"
  - Venues: "Zorlu PSM Studio Istanbul", "Kulturfabrik Esch-sur-Alzette", "Jolly Joker Ankara", "Harbiye Açıkhava", "Blues & Rock Festival Burg Rabenstein"
  - Contact: "info@typhoonband.com", "+90 532 123 45 67", "Istanbul, Türkiye"
  - Links: AGB, News items
- Useful mockup copy (not facts):
  - Hero line "Typhoon bringt den authentischen Sound des türkischen Funk & Soul auf die Bühne – energiegeladen, groovig und einzigartig."
  - `website-mockup.png` hero copy "Ein kraftvoller Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit markanten Riffs, funkigen Grooves und souligen Melodien. Türkischsprachige Texte verleihen unseren Songs Tiefe und machen Typhoon zu einer unverwechselbaren Band zwischen amerikanischem Feeling und europäischer Seele."
  - "Ihr plant ein Festival, Club-Show oder Firmenevent? Lasst uns gemeinsam etwas Besonderes auf die Bühne bringen."
- Visual pattern of the mockups: script logo top-left, serif "Smooth. / Exzeptionell. / **Funk.**" with Funk in gold, a sepia band collage on the right with the giant gold script logo overlapping it, a wide audio bar under the hero (cover, prev/play/next, a full-width waveform, time, volume, …), date cards, a member card row, a media thumbnail row, and a booking form with a microphone-image panel.

### 2.10 Spelling conflicts to resolve

- **Karanfill vs Karanfil.**
  - typhoon.band docs and x01JL use "Karanfill" (file `karanfill.mp3`).
  - Live `src/data/songs.ts` uses **"Karanfil"** (`karanfil-demo.mp3`), and the live `docs/00-project-source-of-truth.md` says "Karanfil". The live `docs/03-content-facts.md` still says "Karanfill".
  - Turkish "karanfil" (carnation) has one L. Mika's own upload is named `karanfil-demo.mp3`. Recommend "Karanfil", with owner confirmation.
- **Sen-Benim vs Sen Benim.** The docs say "Sen-Benim". Live main shows "Sen Benim" (no hyphen). Mika's upload is named `Sen-Benim.mp3`.

---

## 3. Audio player: behaviour contract (x01JL) and comparison with live main

### 3.1 `AudioPlayerProvider.tsx` (x01JL, 173 lines)

- **One shared `HTMLAudioElement`**, created lazily with `new Audio()` (not in the DOM) and `preload="metadata"`. The comment says: "Same-origin static files don't need CORS — leaving crossOrigin unset avoids accidental CORS request mode failures on Safari."
- State: `{ currentId: string|null, isPlaying: boolean, progress: 0..1, duration: s, position: s }`. `initialState` sets all of these to null, false, 0, 0, 0.
- API: `toggle(id, src)`, `seek(id, ratio)`, `getAnalyser()`, and `formatTime(s)` → `"mm:ss"` (zero-padded minutes; `"00:00"` for invalid input). The `useAudioPlayer()` hook throws outside the provider. The provider is mounted in `src/app/[locale]/layout.tsx`, wrapping header, main and footer.
- `toggle` state machine:
  - `!src` → no-op. The consumer disables the button and shows "Bald verfügbar".
  - Same id and playing → `pause()`.
  - Different id → `pause()`, set `el.src`, `attachListeners(id)`, reset state to `{...initial, currentId:id}`. **This enforces one song at a time.**
  - Then `ensureAnalyser()` runs on the user gesture, followed by `el.play()`. A rejection resets to `initialState`.
  - Same id and paused → it resumes, because the src is kept.
- Listeners are assigned as properties (`el.onX = …`) and re-bound on every track switch, so there are no stale handlers:
  - `ontimeupdate` → position, duration, progress
  - `onplay` → isPlaying=true
  - `onpause` → isPlaying=false
  - `onended` / `onerror` → full reset to `initialState` (so the waveform returns to idle)
  - `onloadedmetadata` → duration
- `ensureAnalyser`:
  - Created once. The constructor is `window.AudioContext ?? webkitAudioContext`, then `createMediaElementSource(el)` → `AnalyserNode` → `ac.destination`.
  - Settings: **`fftSize = 256`** (128 bins) and **`smoothingTimeConstant = 0.78`**.
  - On later calls it resumes the context if it is `suspended` (autoplay policy). It is wrapped in try/catch and returns null on failure; playback still works.
- `seek(id, ratio)` does nothing unless `id === currentId` and the duration is finite. It clamps to 0..1 and sets `currentTime = ratio*duration`.

### 3.2 `Waveform.tsx` (x01JL, 154 lines)

- Props: `songId`, `bars=64`, `className`, `heightClass="h-12"`, `flatWhenPaused=false`.
- **Idle shape** is deterministic per song. The seed is FNV-1a (`2166136261`, `Math.imul(h,16777619)`) of the songId, fed into a mulberry32 PRNG. For each bar: `t=i/(bars-1)`, `envelope = 0.5 + 0.4·sin(πt) + 0.18·sin(3πt)`, `jitter = 0.55 + 0.85·rng()`, `h = clamp(envelope·jitter, 0.16, 1)`.
- **Live mode**, only when `currentId===songId && isPlaying` and the analyser exists:
  - A `requestAnimationFrame` loop calls `getByteFrequencyData` and uses the lower **72%** of the bins, mapped evenly across the bars (the average of each bar's range divided by 255).
  - Gamma is **0.7** (`target = avg^0.7`). Peak-hold decay is `peaks[i] = max(target, peaks[i]·0.85)`, and heights are clamped to `[0.08, 1]`.
  - The loop writes `style.transform = scaleY(h)` directly to span refs, with **no React re-render per frame**.
  - Cleanup calls `cancelAnimationFrame`.
- Leaving live mode: the bars get `scaleY(idle[i])`, or `0.32+0.18·sin(i·0.45)` when `flatWhenPaused`, with a CSS transition `transform 360ms cubic-bezier(0.22,1,0.36,1)`. In live mode only the background colour transitions, over 200ms.
- Progress colouring: `playedTo = floor(progress·bars)`. Bars with `i<playedTo` use `bg-[var(--gold-soft)]` (champagne `#e8c982`); the rest use `gold-soft/35`.
- Bar geometry: `w-[2px] flex-1 max-w-[3px] rounded-full origin-center`, `gap-[2px]`, container `aria-hidden`.
- **Seek UI is separate.** Each card renders `<input type="range" class="audio-range" min=0 max=1000 value=progress*1000 disabled={!isCurrent||!duration} aria-label="Position für {title}">` → `seek(id, v/1000)`. This is keyboard-accessible.
- Consumers:

  | Component | Bars | Height | Notes |
  |---|---|---|---|
  | `FeaturedDemo` | 72 | h-16 | |
  | `DemoPlayerCard` | 64 | h-14 | |
  | `HeroMusicPlayer` | 48 | h-7 | |
  | `HeroFeaturedDemo` | 18 | h-7 | flatWhenPaused, lg only |

  All share `currentId`, so the same song animates in every instance simultaneously. Play buttons have `aria-label` "Abspielen/Pausieren: {title}".

### 3.3 Live `typhoon.band-website` main (740ff46) `src/components/audio/*`: a port with extensions

Files: `AudioPlayerProvider.tsx` (276 lines), `Waveform.tsx` (160), `FeaturedPlayer.tsx`, `DemoRow.tsx`, `PlaylistRegistrar.tsx`, `useTrackDuration.ts`.

**Identical to x01JL (a true port):** the lazy singleton Audio, `ensureAnalyser` (FFT 256, smoothing 0.78, resume on suspended), the core `toggle` logic, the `seek` guard, the Waveform idle-shape PRNG and envelope, the FFT loop (72% bins, ^0.7, ×0.85 decay, min 0.08), the idle transition curve, `flatWhenPaused` and `playedTo` colouring. The Waveform docstring explicitly says "Behaviour matches the old Claude branch AudioPlayerProvider/Waveform".

**Differences on live:**

1. `el.crossOrigin = "anonymous"` is set before any src and re-affirmed on each switch, "Cross-origin Supabase Storage MP3s are otherwise silenced once routed through a Web Audio analyser". x01JL deliberately left it unset. The redesign **must keep "anonymous"** if Supabase URLs are used, and needs CORS on the bucket.
2. State adds `volume` and `muted`. The API adds `setVolume(v)`, `toggleMute()`, `setPlaylist(list)`, `next()` and `previous()`. `previous` restarts the track when `currentTime > 3s`; otherwise it goes back one. `skipBy` wraps modulo the list length, and with no current track `next` goes to the first entry and `previous` to the last.
3. **`onended` auto-advances** to the next playlist entry. At the end of the list it keeps `currentId` and sets isPlaying=false and position/progress=0. x01JL instead fully reset to `initialState` on ended.
4. `formatTime` returns `"m:ss"` (`"0:00"`). x01JL returns `"mm:ss"`.
5. Waveform adds an `onSeek` prop that seeks via a click on the container (`(clientX-left)/width`). The default height is `h-9`. Bars are `w-[1px] … rounded-[1px]`. Unplayed bars are `bg-[var(--bronze)]` (#6f4a1f) and played bars are `--gold-soft` (#e8c982), following the handoff `.wave-bar`. The container has `min-w-0 overflow-hidden`.
6. **The range-input seek was removed.** Seeking is click-only on an `aria-hidden` div, so there is **no keyboard or screen-reader seek**, which is an a11y regression. There is no drag-scrub either.
7. `useTrackDuration(src)` uses a throwaway `Audio` with preload=metadata so that non-current rows show their duration. `PlaylistRegistrar` registers the page playlist.
8. Consumers: `FeaturedPlayer` has cover, title and artist "Typhoon", play, prev, next, a 96-bar waveform (32 on mobile), time, mute and a volume slider. It is positioned `-mt-9/-mt-12` to overlap the hero bottom. `DemoRow` is a list row with cover, index, play, title, a 72/48-bar waveform, time and mute. Songs come from a Supabase-first content provider with a static fallback.

**Known risks in both implementations, to fix in the redesign:**

- iOS Safari ignores `el.volume`, so the volume slider is a no-op on iOS. Hide it or use a `GainNode`.
- Seek is only possible on the current track. Clicking a non-current waveform does nothing; it could start that track at the ratio.
- `toggle` closes over `state.currentId`. This is fine in practice but should use a ref.
- A 404 or missing file triggers `onerror`, which resets silently with no user-facing error state.
- No Media Session API (lock-screen controls), no keyboard shortcuts, no `prefers-reduced-motion` handling for the rAF animation.

---

## 4. Assets in `typhoon.band` vs `typhoon.band-website`

The live repo was checked against all of its refs (240 unique blobs) by blob hash, and then by pixel dimensions and visual inspection for re-encoded images.

### 4.1 MP3s: all present on live, byte-identical (same blob hashes)

| typhoon.band (main `docs/` · x01JL `public/assets/audio/demos/`) | bytes | live `public/assets/audio/demos/` | duration* |
|---|---|---|---|
| Sen-Benim.mp3 · sen-benim.mp3 (2c25937) | 9 010 386 | Sen-Benim.mp3 | ≈5:35 |
| karanfil-demo.mp3 · karanfill.mp3 (f5dfb96) | 8 416 682 | karanfil-demo.mp3 | ≈5:30 |
| gece-yine-dustun-demo.mp3 · gece-yine-dustun.mp3 (21ec5d7) | 8 721 389 | gece-yine-dustun-demo.mp3 | ≈9:05 |
| farksilin-demo.mp3 · farksilin.mp3 (3793a67) | 3 873 930 | farksilin-demo.mp3 | ≈4:02 (CBR 128) |
| cilgin-demo.mp3 · cilgin.mp3 (883f90a) | 6 188 170 | cilgin-demo.mp3 | ≈3:20 |
| bir-tek-sen-demo.mp3 · bir-tek-sen.mp3 (2831106) | 6 374 264 | bir-tek-sen-demo.mp3 | ≈3:34 |

\*Durations come from MPEG frame parsing, all at 44.1kHz. They are approximate but good for "—:—" placeholders.

### 4.2 Images: present on live under other names (same pixels, re-encoded)

| typhoon.band path (branch) | dims | live equivalent |
|---|---|---|
| `public/assets/reference/typhoon-band-hero-new(.jpeg)` (main, x01JL), sepia collage without text, singer in colour | 1254×1254 | `public/assets/hero/hero-collage.jpeg` (1254×1254) |
| `public/assets/reference/typhoon-band-hero.jpg` (all), the same collage **with the gold "Typhoon" script baked in** | 2048×2048 | `public/assets/gallery/gallery-3.jpg` (2048×2048) |
| `public/assets/reference/member-mika-posaune(.jpg/ .JPG)` (all), Mika with trombone | 3024×4032 | `handoff/assets/trombone-fan.jpeg` and `trombone-festival.jpeg` (same blob 64a7cb4) |
| `public/assets/reference/member-typhoon-singer(.png/.PNG)` (all), Typhoon singing in a white tee and sunglasses | 1000×687 | `public/assets/hero/singer-stage.jpeg` and `gallery/gallery-5.jpg` (1391×956, a higher-resolution version) |
| x01JL root `a696b4c4-8796-40d8-a24d-c46b1ba47e9f.jpeg`, studio with keyboards and a Hammond organ | 1440×1393 | `gallery/gallery-1.jpg` (1440×1393) |
| x01JL root `1b5f3941-b2af-46e1-b9f7-2578a77f8a99.jpeg`, studio with drums and red carpets | 1077×787 | `gallery/gallery-7.jpg` (1077×787) |
| x01JL root `eb22437c-0af2-47ab-bc95-4d1c6c6467c6.jpeg`, wide studio with a round carpet and a bağlama | 1440×1019 | `gallery/gallery-6.jpg` (1440×1019) |
| x01JL root `5a105e9e-00f1-47e2-b76b-2e6da33ee0cf.jpeg`, Typhoon singing at a red Nord keyboard | 1440×929 | `band-cards/typhoon-band-card.jpg` (1440×929) |

### 4.3 Missing from live (not present in any live branch)

| Asset | Where | Size | Value for the redesign |
|---|---|---|---|
| **`public/assets/reference/typhoon-logo.svg`** | all branches (blob 360abde). Also in Typhoon-Demo as `typhoon-logo.svg` | 44 284 B, viewBox 970×451, 8 paths, single `fill="#efe2c3"` (cream) | **High.** A true vector of the handwritten script logo. It is crisp at every size, recolourable (swap the fill to `currentColor` or use a CSS mask for a gold gradient) and tiny compared with the live 2099×724 PNGs (282–331 KB). It could also serve as the favicon. |
| `CF4A20FB-8C94-45B1-A7C2-63EB9D7B5D4F.png` | x01JL root | 941×1672, 1.96 MB | The Brief v2 **mobile** mockup. Layout reference only; its content is fake. |
| `DB2B0C88-280F-447A-9E41-D7C833977F75.png` | x01JL root | 977×1610, 2.27 MB | The Brief v2 **desktop** mockup. Layout reference only; its content is fake. |
| `public/assets/reference/website-mockup.png` / `Website-mockup.PNG` | all | 1672×941, 2.2 MB | The original ChatGPT-style mockup. Reference only; it has fake song names ("Gel Fırtına") and fake shows. |
| `docs/Typhoon-info.docx` | codex, 8803386 | 14 790 B | The original bio. Holds the extra member credits in §2.4. |
| `public/assets/images/{member,typhoon-hero,typhoon-logo}-placeholder.svg` | all | 768 / 1375 / 547 B | Trivial placeholders; not needed. |

Live has assets that typhoon.band does not: 8 member photos (`public/assets/members/{bugra-guitar,hardy-trumpet,jurgen-guitar,mika-trombone,schack-sax,stefan-bass,tom-drums,typhoon-vocals}.jpeg`), `band-cards/mika-band-card.jpg` (Mika's headband selfie, 3024×4032, which also appears in the Brief mockups), `gallery-2.jpg`, `gallery-4.jpg` (a Stratocaster on a Hammond), `gallery-8.jpg` (a Hammond organ), gold signature PNGs, and the handoff HTML. **The live repo is the asset superset. Only the SVG logo is worth pulling over.**

---

## 5. Implications for the redesign

1. The live repo stays the base. `typhoon.band` contributes: (a) `typhoon-logo.svg`, (b) the x01JL audio a11y pattern (range-input seek), (c) the extra bio credits from the docx (after owner confirmation), (d) the x01JL tri-lingual copy, and (e) the Brief v2 layout order and tokens.
2. Enforce content facts: 8 members in order with singer first; never Taifun or Daniel; Schack on sax; Jürgen on guitar. The canonical contact details are info@typhoon.band, booking@typhoon.band, +49 176 64472296, and the imprint Mika Hertler, Am Schwarzen Steg 5a, 95448 Bayreuth, Deutschland.
3. Never import mockup filler: fake names, "Find A Way", "Gel Fırtına", Istanbul, +90, typhoonband.com, AGB, or News unless a backend exists.
4. Do not present the "Was wir mitbringen" claims (set lengths 60–120 min, own stage setup) as facts.
5. Resolve the Karanfil and Sen-Benim spellings with the owner. The evidence favours "Karanfil".
6. `typhoon-band-test.vercel.app` (and the canceled `typhoon-band` project) serve or served stale, wrong content. Recommend deleting or pausing them, as an owner decision, so the wrong member list does not leak.
