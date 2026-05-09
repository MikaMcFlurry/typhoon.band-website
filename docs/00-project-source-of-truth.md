# 00 – Project Source of Truth

## Project

Website for the band Typhoon.

Production domain:

```text
typhoon.band
www.typhoon.band
```

## Current status

The frontend design for desktop and mobile is approved.

From now on, Claude Code must not reinterpret or redesign the frontend unless a phase explicitly asks for a bug fix.

## Core goal

The finished website must be a professional, self-hostable, secure band website with:

- public onepager
- legal pages
- local/demo audio playback
- gallery/media
- shows
- booking request flow
- protected Admin area
- Supabase backend
- Resend booking email
- future shop readiness for merch, tickets and albums

## Stack

```text
Next.js App Router
TypeScript
Tailwind CSS
Vercel
Supabase Auth/Postgres/Storage
Resend
GitHub
```

## Approved frontend rule

The existing frontend visual design is approved.

Do not change:
- hero layout
- mobile/desktop layout
- audio player visual style
- button style
- member cards
- gallery design
- booking layout
- typography/color system

Unless:
- a phase explicitly says to fix a specific bug

## Content rule

The user will finalize texts, images and audio later inside Admin.

Therefore current repo data and assets are not final content. They are only fallback/seed content.

## Content source order

```text
1. Supabase published/visible records
2. Static fallback data from src/data/*
3. Static fallback assets from public/assets/*
```

## Important

Do not scan Supabase Storage folders directly for public content.

Correct flow:

```text
Admin uploads file to Supabase Storage
Admin creates/updates DB record
Admin publishes record
Frontend reads published DB record
Frontend uses asset URL stored in DB record
```

## Active email

Use:

```text
booking@typhoon.band
+49 176 64472296
```

Do not use:

```text
info@typhoon.band
```

## Members

There are exactly 8 musicians:

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

Wrong names must not appear:

```text
Taifun
Daniel
```

## Demo songs

```text
Sen-Benim
Karanfil
Gece Yine Düştün
Farksilin
Çılgın
Bir Tek Sen
```

Rules:
- local/self-hosted playback
- no download button
- custom player/waveform behavior
- one song at a time

## Legal

Legal pages exist for:

```text
Impressum
Datenschutz
Cookies
```

They must later be editable by owner/admin.

## Privacy / DSGVO

Preferred MVP behavior:
- no analytics
- no tracking pixels
- no external embeds without consent
- local audio/images
- cookie banner only for necessary/consent information unless optional tools are added later
