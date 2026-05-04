# 14 – Old Website Content and UI Fix

## Purpose

Claude Code does not have access to the full old website/project discussion. This file provides missing content and correction context.

The current implementation is visually closer, but not yet correct. It must be brought back to the agreed project scope while strictly following the Claude Design handoff.

## Core project

Typhoon website:
- professional band website
- public onepager
- later password-protected Admin
- later Supabase backend
- later Resend booking mail
- later shop/tickets/merch/albums
- Vercel + GitHub deployment
- domain: typhoon.band

## Visual direction

Use Claude Design exactly.

Do not invent:
- new Header/Hero layout
- different player layout
- different button rhythm
- different typography hierarchy

Current problem:
Header/Hero still diverges.

Required:
- Header must match Claude Design.
- Header signature/logo must not sit too low.
- Hero must not be one blended background blob.
- Hero must have separate visual blocks:
  1. text block
  2. image block
  3. signature/logo block
- The hero image block must be visible like Claude Design.
- The signature must be positioned exactly like Claude Design, not freely placed.

## Band description

Use this content direction, corrected with final names:

Typhoon präsentiert einen kraftvollen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit amerikanisch-europäischem Sound. Selbstkomponierte Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen. Türkischsprachige Texte geben den Songs Tiefe und kulturelle Eigenständigkeit.

Die Band steht für erfahrene Musiker, warme Live-Energie, starke Bläser, groovende Rhythmusgruppe und ein musikalisches Gesamtbild, das sich vom Mainstream abhebt.

Important:
- Source material previously used old names.
- Correct names below are final and must override old source wording.

## Hero content

Headline:
```text
SMOOTH.
EXZEPTIONELL.
FUNK.
```

Hero copy:
```text
Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.
```

Genre line:
```text
BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK
```

CTA:
```text
Songs anhören
Booking Anfrage
```

Optional secondary CTA:
```text
Live erleben
```

## Correct members

There are exactly 8 musicians.

Correct order:
```text
1. Typhoon – Gesang
2. Mika – Posaune
3. Schack – Saxophon
4. Hardy – Trompete
5. Stefan – Funk-Bass
6. Tom – Schlagzeug
7. Buğra – Gitarre
8. Jürgen – Gitarre
```

Wrong old names must not appear:
```text
Taifun
Daniel
Jürgen as Saxophonist
```

Correct:
```text
Typhoon = Gesang
Schack = Saxophon
Jürgen = Gitarre
```

## Member content direction

Typhoon:
- singer/frontman
- expressive stage presence
- Turkish lyrics
- central voice of the band

Mika:
- trombone / Posaune
- part of brass section
- use uploaded Mika band-card asset

Schack:
- saxophone / Saxophon
- part of brass section

Hardy:
- trumpet / Trompete
- part of brass section

Stefan:
- Funk-Bass
- groove foundation

Tom:
- drums / Schlagzeug
- rhythmic drive

Buğra:
- guitar / Gitarre
- Turkish music/session experience may be mentioned carefully

Jürgen:
- guitar / Gitarre

## Demos

Demo songs:
```text
Sen-Benim
Karanfil
Gece Yine Düştün
Farksilin
Çılgın
Bir Tek Sen
```

Use actual audio file names already in repo.

Rules:
- no download button
- local MP3 playback
- custom waveform visible
- one song at a time
- player layout must stay Claude Design
- no overflow on mobile

## Demo player fix

Problem:
Demo rows overflow to the right.

Required:
- all player rows must fit the viewport
- waveform must shrink or reduce bars on mobile
- use `min-w-0` in grid/flex children
- waveform container must use `overflow-hidden`
- row card must use `max-width: 100%`
- no horizontal scroll
- keep visible waveform bars
- do not replace Claude Design player layout

## Gallery / Media

The repo contains 8 JPG assets for gallery/media.

Use all 8 in the media section.

Keep section compact and visually aligned with Claude Design.

## Booking

Booking must be directly visible on homepage.

Fields:
```text
Name *
E-Mail *
Telefon optional
Veranstaltungsdatum optional
Ort
Art der Veranstaltung
Nachricht *
```

Booking recipient:
```text
booking@typhoon.band
```

Contact:
```text
info@typhoon.band
booking@typhoon.band
+49 176 64472296
```

Current required visual correction:
- The image next to the booking form should use the gallery image that shows the band image with Typhoon signature.
- If filename is unclear, inspect all 8 gallery images and choose the band/signature image.
- Do not use the wrong close-up image if the gallery band/signature image exists.
- Booking must visually match Claude Design.

Backend:
- keep current safe fallback if env missing
- do not expand backend in this UI batch

## Legal pages

Routes:
```text
/de/legal/imprint
/de/legal/privacy
/de/legal/cookies
```

Imprint data:
```text
Mika Hertler
Am Schwarzen Steg 5a
95448 Bayreuth
Deutschland
E-Mail: info@typhoon.band
Telefon: +49 176 64472296
```

Legal pages must:
- match website style
- not look like plain unstyled placeholders
- be clear and readable
- be marked as initial draft if needed
- later editable through Admin

## Shows / News

The handoff contains shows/news structures. These are currently missing.

For this batch:
- Add at least a compact `#shows` section if navigation links to it.
- Use TBA/coming soon if no real dates exist.
- Do not create fake real dates.
- News may be compact placeholder if handoff requires it.

## External platforms

Prepared links later:
```text
Spotify
YouTube
Instagram
Facebook
SoundCloud
Bandcamp
```

No embeds without consent.

## Admin/backend future

Prepared but not full CRUD now:
- Admin Login
- Content editing
- media uploads
- SEO
- legal editing
- shows
- songs
- gallery
- booking requests
- platform links

Do not build full Admin in this UI fix batch.
