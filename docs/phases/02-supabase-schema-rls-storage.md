# Phase 02 – Supabase Schema, RLS and Storage

## Goal

Finalize the Supabase foundation without changing the approved frontend design.

This phase prepares the backend for later Admin content management and file uploads.

## Absolute scope

Allowed:
- install/configure `@supabase/supabase-js`
- server/client Supabase helper cleanup
- Supabase DB types, manually defined or generated if feasible
- additive SQL migrations if needed
- RLS policy review/update
- Storage bucket/policy preparation
- content provider real Supabase reads for public published/visible records
- booking writer through Supabase server client
- README/.env/docs updates

Not allowed:
- frontend redesign
- full Admin CRUD
- upload UI
- shop
- payment
- analytics
- external embeds

## Existing files to inspect first

Inspect before editing:

```text
package.json
src/lib/env.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/types.ts
src/lib/supabase/booking.ts
src/lib/content/index.ts
src/lib/content/supabase-content.ts
src/lib/content/types.ts
src/app/api/booking/route.ts
supabase/migrations/0001_init.sql
supabase/policies/0001_rls.sql
.env.example
README.md
```

Important:
- `0001_init.sql` already contains many core tables.
- `0001_rls.sql` already contains initial RLS.
- Do not duplicate blindly.
- Prefer additive migration `supabase/migrations/0002_supabase_foundation.sql` if schema/policy changes are needed.

## Supabase SDK

Install if missing:

```bash
npm install @supabase/supabase-js
```

Use current package manager/lockfile style.

## Supabase helper rules

Create or adjust helpers so the app has clear separation:

```text
src/lib/supabase/client.ts       # browser-safe anon client only
src/lib/supabase/server.ts       # server anon client / SSR-safe where needed
src/lib/supabase/admin.ts        # server-only service-role client
src/lib/supabase/types.ts        # DB types
src/lib/supabase/booking.ts      # server-only booking insert
```

Rules:
- `admin.ts` must import `"server-only"`.
- `SUPABASE_SERVICE_ROLE_KEY` must only be used in server-only files.
- Browser client may only use:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Missing env vars must not crash public pages.
- If env missing, helpers return `null` or safe fallback.

## Booking storage

Replace or improve the existing REST booking writer.

Required:
- use server-side Supabase admin client if configured
- insert into `booking_requests`
- do not expose service role
- do not change booking API response contract
- do not change booking frontend design
- keep Resend mail flow intact
- missing Supabase env must not crash

Booking fields must align with validation:

```text
name
email
phone
event_date
event_location
event_type
message
status
locale if column exists
user_agent
ip_hash optional
```

If `locale` column is missing, add it through migration.

## Schema requirements

Ensure these tables exist and support future Admin editing:

```text
admin_profiles
site_settings
platform_links
legal_pages
legal_page_translations
band_members
band_member_translations
songs
shows
show_translations
booking_requests
media_items
seo_entries
consent_settings
```

## Add/ensure these practical fields

If missing, add through an additive migration.

### site_settings

Should support:
```text
key
value jsonb
locale optional
is_public boolean default true
updated_at
```

### platform_links

Should support:
```text
platform
url
is_active
sort_order
```

### legal pages/translations

Should support:
```text
slug
is_published
locale
title
body_md
```

### members

Should support:
```text
slug
photo_url
sort_order
is_visible
locale translations
name
role
bio_md
```

### songs

Should support:
```text
title
slug
audio_url
cover_image_url
status
is_streamable
is_downloadable default false
is_featured
sort_order
is_visible
```

### shows

Should support:
```text
starts_at nullable or TBA support
venue
city
country
ticket_url
is_visible
sort_order
```

Important:
If current website uses TBA shows without real dates, schema must allow a TBA/placeholder show. Current `starts_at timestamptz not null` may be too strict. Prefer adding:

```text
is_tba boolean default false
```

and make `starts_at` nullable if safe, or add a separate approach that supports TBA without fake dates.

### booking_requests

Should support:
```text
name
email
phone
event_date
event_location
event_type
message
status
locale
ip_hash
user_agent
created_at
updated_at
```

### media_items

Should support:
```text
type
file_url
thumbnail_url
alt_text
title
category
sort_order
is_visible
```

Add `alt_text` and `title` if missing.

### seo_entries

Should support:
```text
path
locale
title
description
og_image_url
```

## Content provider real reads

Phase 01 created public content loader functions.

In this phase:
- implement real Supabase queries where safe
- keep fallback behavior
- do not scan Storage
- only read published/visible records
- map Supabase rows to existing frontend data types
- if Supabase is empty, website must look identical via fallback

Required public loader behavior:
- `getMembers(locale)` reads visible members + translations
- `getSongs(locale)` reads visible/streamable songs
- `getGalleryItems(locale)` reads visible media_items
- `getShows(locale)` reads visible shows
- `getPlatformLinks()` reads active links
- `getLegalPage(type, locale)` reads published legal page + translation
- `getSeoEntry(route, locale)` reads seo entry
- `getSiteSettings(locale)` reads public settings
- `getPublicPageContent(locale)` bundles everything safely

If implementation is too large, implement the query layer and one or two loader examples, but leave clear TODOs. Prefer completing all if simple.

## RLS requirements

RLS must be enabled on all public tables.

Public can read only:
- active platform links
- public site settings
- published legal pages/translations
- visible band members/translations
- visible/streamable songs
- visible shows/translations
- visible media items
- SEO entries
- consent settings

Public cannot read:
- booking_requests
- admin_profiles
- drafts/private rows

Admin writes:
- authenticated user must have active admin profile
- service role is only used server-side

Owner-only:
- admin profile management
- potentially destructive legal/admin actions

## Storage buckets

Prepare buckets for later Admin uploads.

Recommended buckets:

```text
public-media
audio-demos
member-images
gallery
legal-assets
```

## Storage policy rules

MVP decision:
- Buckets are for public website assets only.
- Do not store private/unpublished sensitive files here.
- Frontend should only display files referenced by published DB records.
- Storage directories must not be scanned by the frontend.

Policies:
- public read for these public asset buckets is acceptable for this project MVP
- insert/update/delete only for active admins or service role
- document this clearly

If using private buckets instead, document how signed URLs would work. Do not overcomplicate if it blocks the phase.

## Migration strategy

Do not destructively rewrite previous migrations unless necessary.

Preferred:
- leave `0001_init.sql`
- add `0002_supabase_foundation.sql`
- optionally add `0003_storage_buckets.sql`

The SQL must be safe to run on Supabase.

Include comments for manual application.

## Type safety

Update or create Supabase DB types.

Acceptable:
- manual `Database` type matching current schema
- generated types if available

The code must build without requiring live Supabase during build.

## Documentation updates

Update README with:
- Supabase project setup
- where to find Project URL, anon key and service role key
- Vercel env vars
- how to apply migrations
- how to test booking storage
- storage bucket purpose
- fallback behavior
- next phase: Admin Auth + Dashboard

Update `.env.example` if needed.

## Security checks

Before finishing, verify:
- no service role key in client bundle
- no service role key in `NEXT_PUBLIC_*`
- no raw secrets committed
- no public booking_requests read policy
- no public admin_profiles read policy
- no audio download UI added
- no frontend redesign

## Acceptance checklist

- `@supabase/supabase-js` installed/configured
- server-only admin client exists
- booking insert uses safe server-side Supabase client
- migrations/RLS reviewed and improved if needed
- storage bucket SQL/policies prepared
- content provider performs real public Supabase reads or has clear, typed query layer
- static fallback still works when Supabase env is missing
- homepage build does not require Supabase
- README/.env/docs updated
- `npm run lint` passes
- `npm run build` passes
