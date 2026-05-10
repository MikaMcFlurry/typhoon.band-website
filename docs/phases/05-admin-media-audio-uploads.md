# Phase 05 – Admin Media + Audio Uploads

## Goal

Admins can already log in and manage bookings/shows.

This phase adds safe media/audio management without redesigning the public website.

The goal is that current GitHub assets remain fallback, but once Admin uploads/publishes assets through Supabase, the public website automatically uses Supabase asset URLs.

## Main workflow

```text
Admin logs in
Admin opens Media/Music/Members/Settings asset pages
Admin uploads image or MP3
Server validates file
File is stored in Supabase Storage
Database record is created/updated with public asset URL/path
Public site reads visible/published DB record
If no Supabase record exists, static fallback remains visible
```

## Absolute scope

Allowed:
- secure upload helpers
- gallery image admin
- demo song audio/cover admin
- member photo admin
- hero/bandinfo image settings
- storage validation
- DB record create/update/delete/hide
- public site asset wiring with static fallback
- docs updates

Not allowed:
- public frontend redesign
- full text/content CRUD for all sections
- rich text editor
- shop/payment
- analytics
- external embeds
- public upload

## Existing files to inspect first

```text
src/app/[locale]/admin/_components/AdminShell.tsx
src/app/[locale]/admin/page.tsx
src/lib/admin/auth.ts
src/lib/supabase/admin.ts
src/lib/supabase/types.ts
src/lib/content/index.ts
src/lib/content/supabase-content.ts
src/components/sections/Hero.tsx
src/components/sections/About.tsx
src/components/sections/Members.tsx
src/components/sections/Gallery.tsx
src/components/sections/Demos.tsx
src/components/audio/FeaturedPlayer.tsx
src/components/audio/DemoRow.tsx
src/data/members.ts
src/data/songs.ts
src/data/gallery.ts
src/data/site.ts
supabase/migrations/0003_storage_buckets.sql
README.md
docs/admin-setup.md
```

## Storage buckets

Use the buckets prepared earlier:

```text
public-media
audio-demos
member-images
gallery
legal-assets
```

Recommended mapping:

```text
hero/bandinfo images       → public-media
gallery images             → gallery
member photos              → member-images
song MP3 files             → audio-demos
song cover images          → public-media or audio-demos/covers
legal assets later         → legal-assets
```

Do not create random new buckets unless there is a clear reason.

## Upload architecture

Preferred approach:
- Admin submits form in Admin UI.
- Server action or route handler checks `requireAdminWithPasswordOk()`.
- Server validates file size/type.
- Server uploads using server-only Supabase admin client or authenticated storage client.
- Server writes/updates DB record.
- Client never receives service role key.

Rules:
- no service role in browser
- no upload from public users
- no unauthenticated upload
- no storage folder scanning for public content
- public content must come from DB records that reference file URLs/paths

## File validation

### Images

Allowed MIME types:

```text
image/jpeg
image/png
image/webp
```

Recommended max size:

```text
10 MB
```

Allowed extensions:

```text
.jpg
.jpeg
.png
.webp
```

Reject:
- SVG for upload in this phase
- GIF
- HEIC/HEIF
- executable/script files
- unknown MIME

### Audio

Allowed MIME types:

```text
audio/mpeg
audio/mp3
```

Recommended max size:

```text
50 MB
```

Allowed extensions:

```text
.mp3
```

Reject:
- WAV
- AIFF
- FLAC
- M4A
- unknown MIME

Reason:
- smaller bandwidth
- browser compatibility
- storage cost control
- no accidental huge files

## Filename rules

Sanitize filenames:
- lower-case
- replace spaces with hyphens
- remove special characters
- prefix with timestamp or UUID
- keep original extension after validation

Example:

```text
gallery/2026-05-10-band-live-uuid.jpg
audio-demos/2026-05-10-sen-benim-uuid.mp3
```

## Database usage

### Gallery

Use table:

```text
media_items
```

Records:

```text
type = image
file_url
thumbnail_url optional
title
alt_text
category = gallery
sort_order
is_visible
```

Admin actions:
- upload new gallery image
- edit title/alt_text/sort_order/visibility
- hide/delete image
- replace file

Public:
- visible media_items should appear in Gallery
- static gallery fallback if no visible Supabase media exists

### Demo songs

Use table:

```text
songs
```

Admin actions:
- upload/replace MP3
- upload/replace cover image
- edit title if already supported by current data model
- set is_visible
- set is_featured
- set sort_order
- keep is_downloadable false
- keep is_streamable true

Public:
- visible/streamable songs appear in player
- if Supabase songs are empty, static fallback MP3s remain
- no download button

### Member photos

Use table:

```text
band_members
```

Admin actions:
- upload/replace photo_url
- set visibility/order only if already simple
- do not build full member text CRUD here unless trivial and already supported

Public:
- if Supabase member row has photo_url, use it
- otherwise keep static fallback photo/placeholder

### Hero and Bandinfo images

Use `site_settings` public setting keys.

Recommended keys:

```text
hero_image_url
bandinfo_image_url
hero_signature_url optional
```

Admin route can be:

```text
/[locale]/admin/settings/assets
```

or:

```text
/[locale]/admin/media/site-assets
```

Keep it simple.

Public:
- if setting exists, use Supabase image URL
- otherwise use static fallback

## Admin routes to add or improve

Add Admin navigation entries:

```text
Media
Music
Members
Assets/Settings
```

Routes:

```text
/[locale]/admin/media
/[locale]/admin/music
/[locale]/admin/members
/[locale]/admin/settings/assets
```

Minimum acceptable:

### `/[locale]/admin/media`

- list gallery images
- upload image
- edit title/alt_text/sort_order/is_visible
- hide/delete

### `/[locale]/admin/music`

- list songs
- upload/replace audio
- upload/replace cover
- set visible/featured/order
- no download UI

### `/[locale]/admin/members`

- list members
- upload/replace member photo
- set visibility/order if safe
- no full biography editor required in this phase

### `/[locale]/admin/settings/assets`

- upload/replace Hero image
- upload/replace Bandinfo image
- show current URL/source
- fallback note

If scope gets too large:
1. implement Media gallery + Music first
2. create placeholders for Members/Assets
3. clearly document what is deferred

Prefer completing all four if feasible.

## Public frontend wiring

Do not redesign components.

Only adjust data props/source so they can use Supabase asset URLs.

Required:
- Gallery uses Supabase `media_items` if available, fallback otherwise
- Demos use Supabase `songs.audio_url` and `cover_image_url` if available, fallback otherwise
- Members use Supabase `band_members.photo_url` if available, fallback otherwise
- Hero/Bandinfo images use Supabase site settings if present, fallback otherwise

Keep current visual layout exactly.

## Content provider

Extend existing content provider instead of bypassing it.

Rules:
- public pages request content from content provider
- content provider tries Supabase
- fallback remains static
- no direct storage scan
- no hard crash when Supabase missing

## Deletion strategy

Prefer soft delete / visibility toggles for records:

```text
is_visible = false
```

For files:
- It is acceptable to leave old files in Storage for now when replacing, to avoid accidental data loss.
- If deleting physical files, do it only server-side and after DB update is safe.
- Document behavior.

## Security

- require `requireAdminWithPasswordOk()` for every admin media route
- no service role in client
- no public upload
- validate MIME and extension
- validate file size
- sanitize filenames
- no SVG upload
- no MP3 download button
- no raw user input rendered unsafely
- do not weaken RLS
- do not make booking data public

## Documentation updates

Update:
- README
- optionally create `docs/admin-media-audio-uploads.md`

Document:
- upload limits
- allowed file types
- bucket mapping
- fallback behavior
- how to test media upload
- how to test MP3 playback
- note that GitHub assets remain fallback

## Acceptance checklist

- Admin can upload gallery image
- Uploaded gallery image appears publicly
- Admin can hide gallery image
- Admin can upload/replace demo MP3
- Demo player uses uploaded MP3
- Admin can upload/replace song cover
- Admin can upload/replace member photo
- Public member card uses uploaded photo
- Admin can upload/replace hero/bandinfo image or at least site asset settings page exists
- Public site keeps static fallback if Supabase has no asset records
- no service role in browser
- invalid file types rejected
- too-large files rejected
- `npm run lint` passes
- `npm run build` passes
