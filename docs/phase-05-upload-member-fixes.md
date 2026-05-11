# Phase 05 Fix – Upload Stability + Member Editing

## Context

Phase 05 is already implemented on:

```text
claude/phase-05-admin-media-audio-uploads
```

Do not create a new phase branch. Continue working on the same branch.

## Goal

Fix the current Phase 05 issues without changing the approved public website design.

## Current problems

### 1. Large uploads fail on Vercel

Short MP3 files and small images work, but real demo songs and many larger member images trigger a client-side application error on the deployed Vercel preview.

Required fix:
- implement direct-to-Supabase Storage upload for Admin uploads
- do not send large file bodies through Vercel Server Actions
- admin-gated server step must create/authorize a safe upload target/path
- browser uploads directly to Supabase Storage
- server then writes/updates the DB record with the public URL/path
- no service role key in the browser
- clear German error messages instead of client crash

### 2. Demo MP3 upload must support real demo files

Keep:

```text
MP3 only
audio/mpeg or audio/mp3
max 50 MB if Supabase Storage allows it
no public download button
```

Required:
- MP3 upload must not pass the whole file through a Server Action
- demo player must use uploaded Supabase MP3 URL if present
- fallback GitHub/static MP3s must still work

### 3. Member image upload must support real images

Keep or improve:

```text
JPG / PNG / WebP
10 MB max minimum
clear visible max-size text in Admin UI
```

Required:
- real band/member images should upload reliably
- invalid file shows clear error
- too-large file shows clear error
- no app crash

### 4. Member text editing is missing

Admin Members must allow editing per member:

```text
display name
instrument / role
short bio / description
sort_order
is_visible
photo
```

Use existing tables:

```text
band_members
band_member_translations
```

Required:
- at minimum clean German editing
- EN/TR may fall back safely if not edited yet
- no rich text editor
- no public redesign

### 5. Per-member fallback is wrong

Current bug:
- as soon as one member exists in Supabase, the other fallback members disappear.

Correct rule:
- static fallback list remains the base list of all 8 musicians
- Supabase overrides only matching `slug`
- if only Mika exists in Supabase, the other 7 fallback members still render
- if a member has Supabase photo/text/order, override only that member
- if a member has `is_visible=false`, hide only that member

### 6. Member visibility checkbox is broken

Current bug:
- unchecking visibility does not persist
- value resets to true

Required fix:
- unchecked saves false
- checked saves true
- use hidden input pattern if needed
- admin list displays persisted value correctly
- public site hides only the selected member if `is_visible=false`

### 7. Upload UI / error UX

Required:
- show allowed formats beside every file input
- show max file size beside every file input
- show selected file name/size where feasible
- clear German errors:
  - Datei zu groß
  - Format nicht erlaubt
  - Upload fehlgeschlagen
  - Speichern fehlgeschlagen
- no generic client-side exception
- errors should stay inside Admin UI

## Files to inspect

```text
src/lib/validation/upload.ts
src/lib/storage/upload.ts
src/app/[locale]/admin/media/actions.ts
src/app/[locale]/admin/media/page.tsx
src/app/[locale]/admin/music/actions.ts
src/app/[locale]/admin/music/page.tsx
src/app/[locale]/admin/members/actions.ts
src/app/[locale]/admin/members/page.tsx
src/app/[locale]/admin/settings/assets/actions.ts
src/app/[locale]/admin/settings/assets/page.tsx
src/lib/admin/members.ts
src/lib/content/index.ts
src/lib/content/supabase-content.ts
src/components/sections/Members.tsx
src/data/members.ts
next.config.mjs
README.md
docs/admin-media-audio-uploads.md
```

## Direct upload architecture

Preferred implementation:

1. Admin page verifies authenticated active admin via existing admin guard.
2. Client asks a server action/route for upload target/path.
3. Server validates:
   - admin access
   - intended bucket
   - file metadata
   - filename
   - kind image/audio
4. Server returns a safe upload instruction for Supabase Storage.
5. Browser uploads directly to Supabase Storage using anon/auth client or signed upload URL.
6. Browser/server finalizes by sending only metadata/path/public URL to a server action.
7. Server validates again and writes DB record.
8. Public site reads the DB record through existing content provider.

Rules:
- no service role key in client
- no raw upload body through Vercel Server Action for large media
- no public upload
- no Storage scanning for public display
- DB records remain the source of truth

## Validation rules to preserve

Images:

```text
Allowed MIME: image/jpeg, image/png, image/webp
Allowed extensions: .jpg, .jpeg, .png, .webp
Reject: SVG, GIF, HEIC/HEIF
Recommended max: at least 10 MB
```

Audio:

```text
Allowed MIME: audio/mpeg, audio/mp3
Allowed extension: .mp3
Reject: WAV, AIFF, FLAC, M4A
Recommended max: 50 MB
```

## Member editing details

Admin form per member should include:

```text
slug readonly
name editable
role/instrument editable
bio/description editable textarea
sort_order number
is_visible checkbox
photo upload/replace
clear photo button / fallback photo option
```

Use German labels.

Expected behavior:
- saving without a new photo must still persist text/visibility/order
- clearing photo makes static fallback photo visible again
- if member row does not exist, create it
- if translation row does not exist for locale `de`, create it
- if translation row exists, update it

## Public member fallback merge

Expected pseudo-logic:

```text
fallbackMembers = all 8 static members
supabaseRowsBySlug = map by slug

for each fallback member:
  if no supabase row:
    return fallback member
  if supabase row is_visible=false:
    hide this member
  else:
    return fallback member with Supabase overrides:
      photo_url if present
      name/role/bio translation if present
      sort_order if present

also include any extra visible Supabase member row not known in fallback, sorted safely
```

Do not let one Supabase row replace the whole fallback list.

## Documentation updates

Update:

```text
README.md
docs/admin-media-audio-uploads.md
```

Must document:
- direct upload flow
- allowed file types
- max sizes
- fallback behavior per asset/member
- known behavior for old replaced files
- manual test steps

## Acceptance checklist

- Large MP3 upload no longer crashes Vercel page
- MP3 upload uses direct Supabase Storage path
- Uploaded MP3 plays in public demo player
- Large member image upload no longer crashes Vercel page
- Invalid files show clear German errors
- Admin Members can edit name/instrument/bio/order/visibility/photo
- Unchecked visibility persists as false
- Public members merge fallback per slug
- If only one Supabase member exists, remaining fallback members still show
- If one member is hidden, only that member disappears
- Public frontend design unchanged
- No service role key in browser
- `npm run lint` passes
- `npm run build` passes
