# Recon: `MikaMcFlurry/Typhoon-Demo` (/home/user/Typhoon-Demo)

Read-only. Nothing in the repo was modified. The zip was extracted to `scratchpad/recon/demo-zip/`, and the logo SVG was rasterized to `scratchpad/recon/demo-logo.png` so it could be viewed.

## 0. Repo identity

| Item | Value |
|---|---|
| Remote | `https://github.com/MikaMcFlurry/Typhoon-Demo` |
| Branches | `main`, `origin/main`, `origin/claude/typhoon-website-redesign-7xjozt`. All three are at **c499c02442da00db3055f2e02f1c707196e38bb7**. The Claude branch has no commits of its own. |
| History | 10 commits, all by Mika Hertler on **2026-03-08**, between 12:09 and 17:16 +0100. Messages are "Add files via upload", "Add Website Demo", "Change" and "Add songs": manual GitHub web uploads of AI-generated drafts |
| Tech | Static HTML, CSS and vanilla JS. No build, no package.json, no framework, no .gitignore, no license |
| Intended hosting | GitHub Pages. `canonical`, `og:url` and the JSON-LD `url` still contain the placeholders `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/`, so it was never finalized for production. The `og:image` path is relative (`typhoon-band.jpg`), which is invalid for OG |
| Repo size | ~67 MB. The 5 MP3s are **committed twice**: `*.mp3` plus `*.mp3.mp3`, byte-identical (same md5), from commit cab3b8f and then c47a7ef. That is about 33.5 MB of duplicates |
| Verdict | **Not the live site.** It is an early (March 2026) static prototype that came before the Next.js projects. `typhoon.band-website` has since replaced it. Treat it only as a source of ideas and copy, and treat its facts with suspicion (see §2.3) |

### Commit timeline (index.html section ids per commit)
| Commit | Time | Sections | Notes |
|---|---|---|---|
| 8988b05 | 12:09 | – | Initial commit, README only |
| 6fa2175 | 12:12 | main, top, about, sound, songs, events, news, contact | "Add Website Demo". Same as the version inside `typhoon-demo-site.zip`. Has a text-only brand "Z"-circle + "Typhoon", a stats strip, a songs list (titles only, no audio) and `booking@example.com` |
| c6c5ebf | 12:42 | top, about, sound, music, events, news, contact | Georgia serif, facts list (8 Musiker / Hechingen Homebase / Kanzlei Studio Proberaum), 4 sound cards incl. "Southern-Vibe", 6 invented demo events, `booking@typhoon-band.de` |
| fdfc9d8 | 13:58 | top, about, songs, events, news, contact | Arial. Per-song "flavor" one-liners, `<audio>` players, "statement" block |
| cab3b8f / c47a7ef | 15:19 / 15:24 | – | MP3 uploads (`.mp3.mp3` first, then correct names) |
| b6ca673 | 15:42 | top, about, music, events, news, contact | First version with Cormorant Garamond + Inter, film grain, hero image + line-up panel, full uncropped band photo section |
| 83fe872 | 15:56 | top, about, sound, gallery, music, events, news | Georgia again. Separate `#gallery` "Bandfoto" section. No contact |
| bb994bb | 15:59 | top, about, music, events, news, contact | Identical in size to b6ca673 (14871 B). Contact card `booking@typhoon-band.de` + region line |
| **c499c02 (HEAD)** | 17:16 | top, about, lineup, music, events, news | Adds `typhoon-logo.svg` as the header brand and **named** members. **Removes the contact section** |

## 1. What the demo site is and what it does

### 1.1 HEAD (c499c02): `index.html` (13,741 B), `script.js` (9,551 B), `styles.css` (8,978 B)
A one-page static site, German by default with an EN toggle.

1. **Sticky header** with a blurred translucent background: the SVG logo (`typhoon-logo.svg`, width `clamp(150px,19vw,250px)`), nav links "Band / Besetzung / Musik / Shows / News" (`#about #lineup #music #events #news`) and a pill button "DE / EN" (`#langSwitch`).
2. **Hero** (`min-height:92vh`): full-bleed `typhoon-band.jpg` darkened to `brightness(.52) saturate(.82)` with two gradient overlays. Left side: eyebrow, H1, text and 2 CTAs ("Demos anhören" → #music, "Termine ansehen" → #events). Right side: a glass "Besetzung" panel listing the 8 members.
3. **Intro strip** (`#about`): H2 plus the paragraph.
4. **About layout**: a card with 2 paragraphs, then 3 "sound point" cards (Riffs & Groove / Bläser mit Charakter / Eigene Handschrift).
5. **Line-up** (`#lineup`): copy on the left, the **full uncropped band photo** in a framed "card-photo" on the right.
6. **Music** (`#music`): "Demos". A 2-column grid of 5 `track-card`s, each with a numbered gold circle (01–05), the title and a **native `<audio controls preload="none">`**.
7. **Events** (`#events`, dark section): "Termine" with 6 event cards. The first is "featured" (spans the full width). Big Cormorant day number, MM/YYYY and a type tag. Carries the explicit disclaimer that the dates are demo content.
8. **News** (`#news`): "Aktuelles", 3 cards labeled "Update 01/02/03".
9. **Footer**: `© <year> Typhoon`.

**JS behavior (script.js)**
- `translations = { de, en }` dictionary, applied via `[data-i18n]` → `textContent`.
- The chosen language is stored in `localStorage['typhoon-language']` (the zip version uses `'typhoon-lang'`). Default is `de`.
- `setLanguage()` also rewrites `document.title`, `meta[name=description]`, `og:title` and `og:description` per language.
- **One-song-at-a-time**: on any `<audio>` `play` event, all other players are paused.
- Sets the footer year from `new Date().getFullYear()`.

**SEO/head:** `<title>Typhoon | Bluesrock, Funk, Soul & Southern Rock aus Hechingen</title>`, meta description and keywords, `robots index,follow`, `theme-color #0f0b09`, OG and Twitter card, `og:locale de_DE`, **JSON-LD `MusicGroup`** (name, genre[], description, image, foundingLocation "Hechingen", url). Google Fonts (Inter 400–800, Cormorant Garamond 500–700) are loaded from fonts.googleapis.com with no consent step, which is a DSGVO issue in Germany.

### 1.2 Zip version (`typhoon-demo-site.zip` = commit 6fa2175)
`unzip -l`:
```
        0  typhoon-demo-site/
        0  typhoon-demo-site/assets/
   678047  typhoon-demo-site/assets/typhoon-band.jpg   (identical md5 to root typhoon-band.jpg)
    10787  typhoon-demo-site/index.html
     7196  typhoon-demo-site/styles.css
    11167  typhoon-demo-site/script.js
     1046  typhoon-demo-site/README.md
```
Differences from HEAD:
- **Data-driven rendering**: `content[lang].songs[]`, `events[]` and `news[]` are rendered by JS, with **empty states** ("Noch keine bestätigten Gigs veröffentlicht. …", "Noch keine weiteren News veröffentlicht.").
- A **skip link** ("Zum Inhalt springen").
- A **stats strip**: 8 Mitglieder / 3 Bläser / 5 Songtitel / DE/EN Website-Sprachen.
- The JSON-LD includes `member[]` (job titles only) and `track[]` `MusicRecording`s, plus `og:locale:alternate en_US`, a twitter title/description/image, and `<link rel=preload as=image>`.
- A **contact section** with `booking@example.com` and "Studio: Kanzlei Studio, Hechingen".
- The events list is a single "TBA – Live-Termine folgen – Hechingen / Region" entry. This is more honest than the invented dates used later.
- The README lists "Optional später ergänzen: echtes Booking-Mailfach, Social Media Links, Audio/Video Embeds, Pressefotos, Impressum / Datenschutz".

### 1.3 Features in the demo (HEAD or history) compared with the live `typhoon.band-website`
The live repo was checked with grep over `src/`. Live has: Hero, About, Members, Demos (custom waveform player), Shows (TBA placeholders), Gallery, Booking form (+ API), Legal, Admin, and i18n in de/en/**tr**.

| Demo feature | In live? | Worth carrying over? |
|---|---|---|
| **News / "Aktuelles" section** (3 update cards; later called "Aktuelles aus dem Proberaum") | **No.** There is no news section or data | **Yes.** A lightweight "News / Aus dem Proberaum" feed that the Admin can manage |
| **JSON-LD `MusicGroup`** (+ `member`, `track` MusicRecording in the zip) | **No.** grep for `ld+json` / `MusicGroup` finds nothing | **Yes.** Add MusicGroup, MusicRecording and MusicEvent structured data |
| OG/Twitter meta + per-language title/description | Live has a basic `metadata` in `src/app/layout.tsx`. No OG image found by grep, no sitemap/robots file found | Yes. Add an OG image, `alternates.languages`, sitemap and robots |
| **Skip link** "Zum Inhalt springen" (zip) | Not found | Yes (a11y) |
| **Stats/facts strip** (8 Musiker · 3 Bläser · 5 Songs; or 8 Musiker / Hechingen Homebase / Kanzlei Studio Proberaum) | No | Yes. A strong band-at-a-glance element. Verify numbers (live now has 6 songs, 3 horns, 8 members) |
| **Location facts: Hechingen + "Kanzlei Studio"** | **No.** grep finds no `hechingen` or `kanzlei` in live `src/`. It *is* in the `typhoon.band` repo (`docs/typhoon-info.md` on the redesign/codex branches, `src/i18n/dictionaries.ts` on main) | **Yes, factual** (confirmed by typhoon-info.md: "Im eigenen Kanzlei Studio in Hechingen …") |
| **Region line** "Raum Hechingen • Balingen • Reutlingen • Tübingen • Stuttgart" | No | Useful for booking and local SEO. Owner should confirm |
| **"Sound" feature cards** (3–4 cards: Groove zuerst / Kräftige Riffs / Bläser mit Biss / Southern-Vibe) | No. Live About is a single editorial image+text card | Yes, as a "Sound DNA" / genre section |
| **Full uncropped band photo section** ("Das ganze Bandbild … ohne Beschnitt, damit die gesamte Besetzung sichtbar bleibt") | Partly. Live has a gallery and hero collage | Maybe. A poster moment showing the full collage |
| Featured first event (full-width) + big serif day numerals | Live Shows are TBA cards | Idea: highlight the next show |
| Per-song one-liners ("song flavor", commit fdfc9d8) | No | Idea only. The copy is AI-invented, so the band must write it |
| Empty states for events and news (zip) | Live uses TBA placeholder rows | Yes. Use a proper empty state instead of fake rows |
| Language persistence in localStorage | Live uses `[locale]` routing, which is better | No |
| Native `<audio>` + pause-others | Live has a custom provider + waveform, which is better | No (live is better) |
| Tour map, press kit/EPK, newsletter, video, lyrics, setlist, social links, merch | **Not present in the demo at any commit.** The zip README only lists "Social Media Links, Audio/Video Embeds, Pressefotos, Impressum/Datenschutz" as later ideas | Consider new: press kit/EPK (the README mentions "Pressefotos"), lyrics or translations for the Turkish songs, consent-gated video |

## 2. Content facts (verbatim)

### 2.1 HEAD texts (DE / EN), verbatim from `script.js`
- nav: `Band · Besetzung · Musik · Shows · News` / `Band · Line-up · Music · Shows · News`
- hero_eyebrow: **"Hechingen • 8-köpfig • Bluesrock, Funk, Soul"** / "Hechingen • 8-piece • Bluesrock, funk, soul"
- hero_title: **"Eigenkompositionen zwischen Druck, Groove und Charakter."** / "Original songs shaped by weight, groove and character."
- hero_text: "Typhoon verbindet Bluesrock, Funk, Soul, Jazz und Southern Rock zu einem eigenständigen Sound. Markante Riffs, groovende Rhythmusarbeit, Bläser mit Biss und türkischsprachige Texte geben der Band ihr klares Profil." / "Typhoon blends bluesrock, funk, soul, jazz and southern rock into a distinctive sound. Strong riffs, deep groove, biting horns and Turkish lyrics give the band a clear identity."
- CTAs: "Demos anhören" / "Termine ansehen" and "Listen to demos" / "View dates"
- about_kicker "Die Band". about_title: **"Ein Sound mit amerikanischer Wucht und europäischer Handschrift."** / "A sound with American weight and a European signature."
- about_text_1: "Typhoon präsentiert einen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock. Die eigenen Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen zu einem Sound, der sofort wiedererkennbar bleibt und sich bewusst abseits des Mainstreams bewegt."
- about_text_2: "Ausdrucksstarke türkischsprachige Texte verleihen den Stücken zusätzliche Tiefe und unterstreichen die kulturelle Vielfalt der Band. Diese stilistische Breite öffnet den Sound, ohne die eigene Handschrift zu verlieren."
- about_text_3: "Im Kanzlei Studio in Hechingen arbeitet Typhoon regelmäßig an Arrangements, Dynamik und Zusammenspiel. Das Ziel ist ein Set, das live dieselbe Energie entfaltet wie im Proberaum: druckvoll, beweglich und mit viel Spielfreude."
- Sound cards:
  - "Riffs & Groove" – "Rhythmusgruppe, zwei Gitarren und Keys schaffen ein Fundament mit Druck, Bewegung und Tiefe."
  - "Bläser mit Charakter" – "Saxophon, Trompete und Posaune setzen prägnante Linien, Akzente und melodische Widerhaken."
  - "Eigene Handschrift" – "Typhoon verbindet verschiedene Einflüsse so, dass jeder Song live wie im Studio klar als Typhoon erkennbar bleibt."
- image_title: "Acht Musiker, viel Erfahrung und ein gemeinsamer Sound."
- image_text: "Im Zentrum stehen Sänger und Keyboarder Taifun, die Gitarristen Buğra Uzer und Daniel, Bassist Stefan, Schlagzeuger Tom, Saxophonist Jürgen, Trompeter Hardy sowie der 24-jährige Posaunist Mika. Gemeinsam verbindet die Band langjährige Bühnenerfahrung mit neuer Energie im Bläsersatz." (**contains outdated members, see §2.3**)
- music: "Musik" / "Demos"
- events: "Shows" / "Termine". Note: "Die folgenden Termine dienen aktuell als Demo-Inhalte zur Website-Gestaltung und sind nicht als bestätigte Buchungen zu verstehen."
- event types: Vorband / Live / Headline Show / City Stage / Festival Slot / Special Set (EN: Support / Live / Headline show / City stage / Festival slot / Special set)
- News:
  1. "Arbeit am Live-Set" – "Typhoon arbeitet in den kommenden Monaten daran, das aktuelle Set weiter zu verdichten und für die Bühne stabil zu machen."
  2. "Regelmäßige Proben im Kanzlei Studio" – "Im eigenen Studio in Hechingen entstehen Arrangements mit Liebe zum Detail, moderner Technik und viel Raum für Zusammenspiel."
  3. "Eigene Songs im Fokus" – "Die aktuellen Demos zeigen die Richtung der Band: markante Riffs, tiefer Groove, Bläser-Farbe und türkischsprachige Texte mit Wiedererkennungswert."
- SEO title DE "Typhoon | Bluesrock, Funk, Soul & Southern Rock aus Hechingen", EN "… from Hechingen". Description DE: "Typhoon aus Hechingen verbindet Bluesrock, Funk, Soul, Jazz und Southern Rock mit türkischsprachigen Texten, markanten Riffs, Bläsersatz und viel Groove."
- og:description: "8-köpfige Band aus Hechingen mit eigenständigem Sound zwischen Bluesrock, Funk, Soul, Jazz und Southern Rock."
- keywords: "Typhoon Band, Hechingen, Bluesrock, Funk, Soul, Jazz, Southern Rock, Live Band, Reutlingen, Balingen, Tübingen, Stuttgart"

### 2.2 Notable copy from earlier commits (good tone, reusable after band approval)
- "Rauer Ton. Viel Druck. Und genug Soul, damit es nicht geschniegelt klingt." (b6ca673/bb994bb hero)
- "Groove mit Druck. Riffs mit Seele." (c6c5ebf/83fe872 hero)
- "Acht Köpfe. Ein Groove." / "Acht Leute, ein gemeinsamer Zug nach vorn."
- "Bluesrock im Kern. Funk und Soul im Blut." (sound title)
- "Bluesrock mit Funk- und Soul-Touch. 8 Köpfe. Viel Groove. Kein Leerlauf." and eyebrow "Aus Hechingen ins nächste verschwitzte Clublicht." (fdfc9d8)
- "Typhoon ist nicht geschniegelt – sondern direkt, warm, druckvoll und ehrlich." (fdfc9d8 statement)
- Sound card "Southern-Vibe": "Ab und zu schimmert eine staubige, warme Weite durch — genau da, wo Groove auf Straße trifft."
- "Groove zuerst": "Der Puls bleibt in Bewegung: Bass und Drums tragen, statt nur zu begleiten." / "Bläser mit Biss": "Saxophon, Trompete und Posaune setzen Hooks, Akzente und Schub."
- News titles: "Set wird verdichtet", "Mehr Bühne in Planung", section title "Aktuelles aus dem Proberaum" / "News aus dem Proberaum"
- Contact: "Booking, Anfrage, Konzert?" / "Booking, Anfragen, Interesse?" and "Bereit für die nächsten Gigs."
- Song one-liners (fdfc9d8, **AI-invented, not verified**): Farksilin "Grooviger Opener mit rauem Zug.", Karanfil "Soul-Touch, Bläserfarbe und Druck nach vorne.", Gece yine düştün "Dunklere Stimmung, tiefer Groove.", Bir Tek sen "Mehr Soul, mehr Raum, mehr Spannung.", Cilgin "Schneller, kantiger, live gebaut."
- Aesthetic statement (c6c5ebf intro_text_1): "… bewusst rauer, dunkler und musikalischer aufgebaut: mit Bühnenlicht, Vintage-Texturen, asymmetrischen Panels und einem Look zwischen Clubposter, Roadcase und altem Konzertflyer." This is a good art-direction brief.

### 2.3 Members: the demo is **outdated or wrong**. Do NOT use its names
Demo HEAD line-up (`lineup_1..8`):
```
Gesang / Keys (Hammond / Keys) — Taifun
Gitarre — Buğra Uzer
Gitarre — Daniel
Bass — Stefan
Drums — Tom
Saxophon — Jürgen
Trompete — Hardy
Posaune — Mika
```
Earlier commits list roles only: "Gesang / Keys (Hammond / Keys)", "2× Gitarre", "Bass", "Drums", "Saxophon", "Trompete", "Posaune".

**Conflicts with the canonical facts** in `typhoon.band-website/docs/03-content-facts.md` and `src/data/members.ts` ("Gold rule: Typhoon (not Taifun), Schack on Sax, Jürgen on guitar, no Daniel."):
```
1. Typhoon – Gesang   2. Mika – Posaune   3. Schack – Saxophon   4. Hardy – Trompete
5. Stefan – Funk-Bass 6. Tom – Schlagzeug 7. Buğra – Gitarre     8. Jürgen – Gitarre
```
The same correction appears in the typhoon.band repo `docs/typhoon-info.md` (redesign branch). typhoon.band `origin/main` dictionaries still carry the old "Sänger Taifun, Saxophonist Jürgen … Gitarristen Buğra und Daniel".

Demo-only claims that need owner confirmation before reuse:
- "Keys (Hammond / Keys)" for the singer. The live site says only "Gesang".
- Surname "**Buğra Uzer**". Live uses only "Buğra".
- "der **24-jährige** Posaunist Mika" (written in March 2026, so it will go stale).
- The "Hammond" sound references.

### 2.4 Songs (demo titles and filenames)
| # | Demo display title (HEAD) | Zip/JSON-LD spelling | File | Size | ~Duration | Live title (typhoon.band-website `src/data/songs.ts`) |
|---|---|---|---|---|---|---|
| 01 | Farksilin | Farksilin | farksilin-demo.mp3 | 3,873,930 B | ~4:02 (CBR 128k estimate, no ID3) | Farksilin |
| 02 | Karanfil | Karanfil | karanfil-demo.mp3 | 8,416,682 B | ~5:30 (Xing) | Karanfil (docs say "Karanfill") |
| 03 | Gece yine düştün | Gece yine düstün | gece-yine-dustun-demo.mp3 | 8,721,389 B | ~9:05 (Info) | Gece Yine Düştün |
| 04 | Bir Tek sen | Bir Tek sen | bir-tek-sen-demo.mp3 | 6,374,264 B | ~3:34 (Xing) | Bir Tek Sen |
| 05 | Cilgin | Cilgin | cilgin-demo.mp3 | 6,188,170 B | ~3:20 (Xing) | **Çılgın** |
| – | (not in demo) | – | – | – | – | **Sen Benim** (`Sen-Benim.mp3`, live only, sortOrder 1) |

Use the live Turkish spellings (Çılgın, Düştün, Bir Tek Sen). The demo has 5 songs; live has 6. Several MP3s carry ffmpeg ID3 junk (`TXXX major_brand M4A`, `TSSE Lavf60.3.100`) from an M4A→MP3 conversion, so there are no title/artist tags.

### 2.5 Events: all **invented demo data**, never real
HEAD (c499c02):
| Date | Type | Title | Place/Time |
|---|---|---|---|
| 07 · 05/2027 (featured) | Vorband | Waldmusikfest Walddorfhäslach | Walddorfhäslach • 19:00 Uhr |
| 21 · 08/2027 | Live | Sudhaus Clubnacht | Tübingen • 20:30 Uhr |
| 11 · 09/2027 | Festival Slot | Sommer am Schloss | Hechingen • 18:00 Uhr |
| 02 · 10/2027 | Headline Show | Clubhaus Sessions | Balingen • 21:00 Uhr |
| 23 · 10/2027 | City Stage | Herbstnacht Reutlingen | Reutlingen • 20:00 Uhr |
| 20 · 11/2027 | Special Set | Late Night Groove | Stuttgart • 21:30 Uhr |

Earlier commits used other fake names ("franz.K Clubnacht", "Sudhaus Sommerbühne", "Altstadt Open Air", "Neckar Groove Nacht", "Kanzlei Studio Session", "Club Cannon Night", "Sommernacht am Schwanenmarkt", "Stadtklang am Marienplatz"). **Only "Waldmusikfest Walddorfhäslach – Vorband – 19:00" appears as the featured entry in every version**, so it *might* be based on a real support gig. Ask the owner. Live correctly refuses to invent events ("We never invent fake events").

### 2.6 Contact, links, emails
- HEAD: **no contact section, no email, no social links.**
- The zip (6fa2175) had `booking@example.com`. c6c5ebf through bb994bb used `mailto:booking@typhoon-band.de`, which is an **AI-guessed placeholder domain**. The canonical addresses are `info@typhoon.band`, `booking@typhoon.band` and `+49 176 64472296` (live docs/03-content-facts.md). Do **not** reuse typhoon-band.de.
- "Studio: Kanzlei Studio, Hechingen", "Hechingen · Deutschland", and region "Raum Hechingen • Balingen • Reutlingen • Tübingen • Stuttgart".
- There are no Impressum or Datenschutz pages. The only external links are Google Fonts and schema.org.

## 3. Visual language

**Palette (HEAD `:root`)**: `--bg #0f0b09`, `--bg-soft #18110d`, `--text #f5ead8` (cream), `--muted #d4bda0`, `--accent #d8ae70`, `--accent-strong #f1d5a1` (pale gold), `--line rgba(227,191,138,.15)`, `--shadow 0 20px 60px rgba(0,0,0,.35)`, `--radius 24px`, `--container 1160px`. The body has a radial glow `rgba(124,86,43,.15)` at the top plus a `#0f0b09→#090605` gradient.
The zip palette is similar: `--gold #e3bb73`, `--gold-strong #f0cd8c`, and a solid gold gradient primary button `linear-gradient(135deg,#d5a95b,#f0cd8c)` with dark text `#1a120d`.

**Type**: Cormorant Garamond 600 for H1/H2 (hero `clamp(3rem,7vw,5.2rem)`, line-height .92, max 12ch, letter-spacing -.02em), Inter for body, and uppercase eyebrows with letter-spacing .18em at .77rem. Earlier drafts used Georgia or Arial.

**Components**: pill buttons (radius 999, 48px min-height, 1px gold hairline, hover translateY(-1px)); cards with a dark-brown vertical gradient, gold hairline and big soft shadow; circular numbered track badges (42px, gold hairline); big serif day numerals (3rem) for events; a fixed **film-grain overlay** (`.site-grain`, 3 tiled radial-dot backgrounds at opacity .07); a hero with two stacked gradients (bottom fade + left-to-right vignette). There are no animations or keyframes, no `prefers-reduced-motion`, and no dark/light switch.

**Responsive**: at ≤980px everything goes to one column; at ≤760px the nav wraps below the logo as a horizontally scrollable row.

**Art-direction ideas worth keeping**
1. "Clubposter / Roadcase / alter Konzertflyer" and "Bühnenlicht, Vintage-Texturen, asymmetrische Panels" (c6c5ebf brief). This matches the sepia poster artwork.
2. Film grain + warm radial stage-light glows (c6c5ebf/83fe872 used `mix-blend-mode: screen`, fdfc9d8 used `soft-light`).
3. A band-at-a-glance facts strip (8 Musiker · 3 Bläser · Hechingen · Kanzlei Studio).
4. Showing the **full uncropped poster/collage** once, because the hero crop cuts members off.
5. Big serif day numerals and a full-width "featured next show" card.
6. A "Sound DNA" card set (Groove zuerst / Kräftige Riffs / Bläser mit Biss / Southern-Vibe).
7. The copy tone: short, punchy German sentence pairs ("Groove mit Druck. Riffs mit Seele.").

Weaknesses to avoid: generic rounded-card grid, native `<audio>` UI, no motion, invented events and emails, fonts from an external CDN without consent, only 2 languages (live has de/en/tr).

## 4. Assets

| File (repo root) | Bytes | md5 | Details | In `typhoon.band-website/public/assets`? |
|---|---|---|---|---|
| `typhoon-band.jpg` | 678,047 | 0bf6912597d6cedbf151874ae7c894c7 | JPEG 2048×2048, progressive. Sepia poster collage of all 8 members **with the gold "Typhoon" script baked in** across the lower middle | **Not byte-identical in live.** Same blob exists in `typhoon.band` repo as `public/assets/reference/typhoon-band-hero.jpg`. Live has a **logo-free variant** `public/assets/hero/hero-collage.jpeg` (1254×1254, 455,780 B) where the singer is cut out in color in front. The demo version is higher resolution (2048²) but the logo is burned in |
| `typhoon-logo.svg` | 44,284 | 1b22135b6e77fc78c365b46a6d3ee057 | viewBox `0 0 970 451`. 8 subpaths, 3,171 `L` segments, **polyline trace with no curves**, single fill `#efe2c3` (cream). Same handwritten "Typhoon" signature as the live PNG. At large sizes the 0.5px-step staircase edges show | **Not in live.** Live uses `branding/typhoon-signature-gold.png` and `…-gold-bold.png` (2099×724 RGBA, gold gradient + texture, higher quality). The same SVG blob is in `typhoon.band` at `public/assets/reference/typhoon-logo.svg`. It could be useful as a lightweight monochrome vector (favicon, mask, `currentColor` fill) after a proper Bezier re-trace |
| `farksilin-demo.mp3` | 3,873,930 | 123a041e… | ~4:02 | **Yes**, identical: `public/assets/audio/demos/farksilin-demo.mp3` |
| `karanfil-demo.mp3` | 8,416,682 | fa76432f… | ~5:30 | **Yes**, identical: `…/karanfil-demo.mp3` |
| `gece-yine-dustun-demo.mp3` | 8,721,389 | 29fa4adf… | ~9:05 | **Yes**, identical: `…/gece-yine-dustun-demo.mp3` |
| `bir-tek-sen-demo.mp3` | 6,374,264 | bacb327d… | ~3:34 | **Yes**, identical: `…/bir-tek-sen-demo.mp3` |
| `cilgin-demo.mp3` | 6,188,170 | 2b6e49a3… | ~3:20 | **Yes**, identical: `…/cilgin-demo.mp3` |
| `*.mp3.mp3` (5 files) | same as above | same md5 | Accidental duplicate uploads | n/a (junk) |
| `typhoon-demo-site.zip` | 681,258 | e1f56d1d… | The 6fa2175 site snapshot + the same band jpg | n/a |

The same 5 MP3 blobs also exist in `typhoon.band` under different names: `farksilin.mp3`, `karanfill.mp3`, `gece-yine-dustun.mp3`, `bir-tek-sen.mp3`, `cilgin.mp3`.

**Assets unique to the demo repo:** none that are unique across all 3 repos. The only files missing from the live repo are `typhoon-band.jpg` (2048² with baked logo) and `typhoon-logo.svg`, and both also exist in `typhoon.band`.

**Assets in live but not in the demo** (for context): `Sen-Benim.mp3`, 8 member photos, 2 band cards (Mika, Typhoon), 8 gallery images, `hero/singer-stage.jpeg`, gold signature PNGs.

## 5. Bottom line for the redesign
- The demo is a superseded static GitHub-Pages prototype from 2026-03-08. It is not live and has no unique assets.
- **Do not reuse its member names** (Taifun, Daniel, Jürgen=Sax), its email (`booking@typhoon-band.de` / `example.com`) or its invented event dates.
- **Reuse:** the Hechingen + Kanzlei Studio facts (confirmed elsewhere), the region list, the News/"Aus dem Proberaum" section concept, JSON-LD MusicGroup, the skip link, the stats/facts strip, Sound-DNA cards, a full uncropped poster moment, a featured next show, film grain + stage-light glows, the Cormorant-style serif display and the punchy German copy lines in §2.2.
- Features the demo does NOT have (so no parity obligation): tour map, press kit, newsletter, video, lyrics, setlist, socials, merch.
