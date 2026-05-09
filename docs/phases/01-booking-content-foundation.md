# Phase 01 – Booking + Content Foundation

## Goal

Prepare the approved frontend for production backend behavior without changing the approved design.

This phase focuses on:
- Booking production foundation
- Supabase-first/static-fallback content provider
- Resend-ready mail flow
- documentation

## Do not change

Do not redesign:
- Hero
- Header
- Audio player layout
- Member cards
- Gallery
- Booking visual layout
- Buttons
- Mobile layout

Only minimal UI changes are allowed for:
- booking success/error status
- validation messages

## Booking requirements

Booking is the most important production function.

### Recipient

Use:

```text
booking@typhoon.band
```

Do not use:

```text
info@typhoon.band
```

### Fields

```text
name
email
phone optional
event_date optional
event_location
event_type
message
honeypot hidden
locale
```

### Server validation

Validate server-side:

```text
name required
email required + valid format
event_location required
event_type required
message required
phone optional
event_date optional
honeypot must be empty
```

### Spam protection

Implement:
- hidden honeypot field
- basic validation
- prepare simple rate-limit helper or TODO if not implemented

### Supabase insert

If Supabase admin/server env is configured:
- insert into `booking_requests`
- status default `new`
- store locale
- optionally user_agent
- avoid storing raw IP unless hashed

If Supabase is not configured:
- do not crash

### Resend mail

If Resend env is configured:
- send mail to `booking@typhoon.band`
- Reply-To = sender email
- Subject:

```text
Neue Booking-Anfrage über typhoon.band
```

Email body should include all booking fields.

If Resend is not configured:
- do not crash

### Success/error messages

Success:

```text
Danke für deine Anfrage. Wir melden uns so schnell wie möglich.
```

Backend missing fallback:

```text
Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden.
```

Error:

```text
Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.
```

## Content provider foundation

Create a public content access layer.

Recommended structure:

```text
src/lib/content/
  index.ts
  fallback.ts
  supabase-content.ts
  normalize.ts
  types.ts
```

Adapt if the repo already has a better structure.

## Required loader functions

Prepare:

```ts
getSiteSettings(locale)
getHeroContent(locale)
getBandInfo(locale)
getMembers(locale)
getSongs(locale)
getGalleryItems(locale)
getShows(locale)
getLegalPage(type, locale)
getPlatformLinks()
getSeoEntry(route, locale)
getPublicPageContent(locale)
```

`getPublicPageContent(locale)` may bundle data for the homepage.

## Content provider behavior

Every loader must follow:

```text
1. Build fallback from current src/data/* and public/assets/*
2. If Supabase is not configured → return fallback
3. Try to load published/visible Supabase records
4. If records exist → normalize and return Supabase data
5. If no records/error → return fallback
```

## Supabase content rules

Public content must come from published/visible database records.

Do not scan Supabase Storage directories.

Records may include:

```text
image_url
cover_image_url
audio_url
thumbnail_url
file_url
```

If a Supabase record misses an asset URL, use the existing fallback asset.

## Data types

Create/adjust TypeScript types for public content:
- site settings
- hero
- band info
- member
- song
- gallery item
- show
- legal page
- platform link
- SEO entry

## Environment variables

Ensure `.env.example` contains:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
BOOKING_EMAIL=booking@typhoon.band
WEBSITE_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=https://typhoon.band
```

No real secrets.

## README updates

Update README with:
- Supabase env setup
- Resend env setup
- Vercel env setup
- booking behavior
- content provider behavior
- static fallback behavior
- next Admin phase

## Security

- no secrets in frontend
- service role server-only
- no public write access
- RLS assumptions documented
- booking validation server-side
- no download button for audio

## Acceptance checklist

- Booking route validates input
- Honeypot exists
- Supabase insert attempted only when configured
- Resend mail attempted only when configured
- Missing env does not crash
- Public content provider exists
- Static fallback still renders current website
- Supabase-first behavior documented and implemented
- `info@typhoon.band` not used as active email
- `npm run lint` passes
- `npm run build` passes
