# Admin Media + Audio Uploads (Phase 05)

This document is the operational guide for the Phase 05 admin upload flows.
For the higher-level requirements see
[`docs/phases/05-admin-media-audio-uploads.md`](phases/05-admin-media-audio-uploads.md).
The Phase 05 stability fixes (direct-to-Storage upload, member editing,
per-slug fallback merge, visibility persistence) are tracked in
[`docs/phase-05-upload-member-fixes.md`](phase-05-upload-member-fixes.md).

## Routes

| Route                                | Purpose                                           |
| ------------------------------------ | ------------------------------------------------- |
| `/[locale]/admin/media`              | Gallery images (table: `media_items`)             |
| `/[locale]/admin/music`              | Demo songs (table: `songs`)                       |
| `/[locale]/admin/members`            | Band members (name/role/bio/photo, table: `band_members` + `band_member_translations`) |
| `/[locale]/admin/settings/assets`    | Hero, hero-signature, bandinfo images (`site_settings`) |

Every page calls `requireAdminWithPasswordOk()` server-side. The forms
post to `"use server"` actions that **only receive metadata + a
pre-uploaded Supabase URL** — there is no public upload endpoint.

## Storage buckets

Buckets were created in
[`supabase/migrations/0003_storage_buckets.sql`](../supabase/migrations/0003_storage_buckets.sql).
The Phase 05 mapping:

```
gallery        → gallery images
audio-demos    → song MP3 files
public-media   → song covers + hero/bandinfo site assets (prefix site/<key>/)
member-images  → band member photos
legal-assets   → reserved for later
```

Public read is allowed by Storage policy (`typhoon_public_read_*`).
Writes are restricted to authenticated admins, plus the service role
which we use server-side to mint signed upload URLs.

## Direct-to-Storage upload flow (Phase 05 fix)

The original Phase 05 streamed file bodies through Next.js Server
Actions, which crashed on the Vercel preview for real demo MP3s (Vercel
caps the Server Action request body well below 50 MB). The fix moves
file bytes directly from the browser to Supabase Storage:

```
┌── browser ───────────────────────────────────────────────────────┐
│ 1. User picks a file.                                           │
│ 2. clientValidateFile() — size + MIME + extension check.        │
│ 3. await prepareDirectUpload({ target, filename, size, mime })  │  ←─┐
│ 4. supabase.storage.from(bucket).uploadToSignedUrl(             │    │
│        path, token, file, { contentType }                       │    │ JSON
│    )  // direct PUT to Supabase Storage, no Vercel hop          │    │
│ 5. Submit the parent <form>. Hidden `<name>_url` carries the    │    │
│    Supabase public URL.                                         │    │
└──────────────────────────────────────────────────────────────────┘    │
                                                                        ▼
┌── server action (prepareDirectUpload) ───────────────────────────┐
│ - getCurrentAdmin() (no redirect, JSON-friendly)                 │
│ - validate target against an allow-list of {bucket, prefix, kind}│
│ - validateUploadMeta() — size, MIME, extension                   │
│ - buildStorageKey() — date + slug + UUID + extension             │
│ - prepareSignedUpload() → createSignedUploadUrl()                │
│ - return { bucket, path, token, signedUrl, publicUrl }           │
└──────────────────────────────────────────────────────────────────┘
                                                                        │ form post
                                                                        ▼
┌── server action (saveX / uploadXAction) ─────────────────────────┐
│ - requireAdminWithPasswordOk()                                   │
│ - parseSupabasePublicUrl() — confirm URL belongs to our Supabase │
│   project AND lives in the expected bucket                       │
│ - write DB row (media_items / songs / band_members /             │
│   site_settings)                                                 │
└──────────────────────────────────────────────────────────────────┘
```

Key files:

- `src/lib/validation/upload.ts` — kind/mime/size validators + helpers
  (`maxSizeLabel`, `allowedFormatLabel`, `acceptAttr`).
- `src/lib/storage/upload.ts` — `prepareSignedUpload()`,
  `parseSupabasePublicUrl()`. The legacy `uploadAssetToStorage()` stays
  available for server-internal uploads but is no longer used by Admin.
- `src/app/[locale]/admin/_uploads/actions.ts` — `prepareDirectUpload`
  server action with the allow-listed targets.
- `src/app/[locale]/admin/_uploads/DirectUploadField.tsx` — the shared
  client field. Shows filename + size, max-size + format hints, German
  error messages (Format nicht erlaubt / Datei zu groß / Upload
  fehlgeschlagen / Speichern fehlgeschlagen) inline. Exposes
  `onPhaseChange` so parent forms can disable Submit until the upload
  reaches the "done" phase.

The browser never sees `SUPABASE_SERVICE_ROLE_KEY` — only a one-shot
signed URL bound to a specific bucket+path the server already validated.

## Validation

`src/lib/validation/upload.ts`:

- **Images** — MIME `image/jpeg`, `image/png`, `image/webp`. Extensions
  `.jpg`, `.jpeg`, `.png`, `.webp`. Max **10 MB**. Rejects SVG, GIF,
  HEIC/HEIF, executables, unknown MIME.
- **Audio** — MIME `audio/mpeg` or `audio/mp3`. Extension `.mp3`.
  Max **50 MB**. Rejects WAV, AIFF, FLAC, M4A.
- **Filename sanitisation** — strips accents/Turkish-specific chars,
  lower-cases, replaces non-alphanumerics with hyphens, prefixes with
  ISO date and a UUIDv4. Original filenames are not stored verbatim.

Limits and allowed formats are surfaced inline next to every file
input so the Admin sees them before triggering a rejected upload.

## DB tables

- `media_items` — gallery images. Inserts use `category = "gallery"`,
  `type = "image"`, `is_visible = true`. The Admin can edit title,
  alt-text, sort and visibility (hidden-input + checkbox pattern), plus
  delete the row entirely.
- `songs` — demos. Inserts force `is_streamable = true` and
  `is_downloadable = false`. Cover and audio uploads update
  `cover_image_url` / `audio_url`. Featured flag uses
  `setFeaturedSong()` so only one song is featured at a time.
- `band_members` + `band_member_translations` — upserted by slug. The
  member form edits name/role/bio in DE (required) and optionally EN/TR.
  Empty translation trios are skipped so blank rows can't shadow the
  dictionary fallback for the other locales.
- `site_settings` — keys `hero_image`, `hero_signature`,
  `bandinfo_image`. Each value is a JSON object `{ "url": "..." }`,
  stored with `is_public = true` so the public anon client can read it.

## Public fallback behaviour

The public content provider (`src/lib/content/index.ts`) reads:

- `getHeroContent()` → dictionary text + `site_settings.hero_image` /
  `site_settings.hero_signature` URLs (fallback `/assets/hero/...`).
- `getBandInfo()` → dictionary text + `site_settings.bandinfo_image`
  (fallback `/assets/gallery/gallery-5.jpg`).
- `getMembers()` → **per-slug merge** with the static fallback list.
  The 8 fallback musicians always render unless an explicit Supabase
  row with the same slug has `is_visible = false`. A row with text or
  a photo overrides only that member; the other 7 stay visible.
- `getSongs()` → visible+streamable `songs`; if empty, repo MP3s.
- `getGalleryItems()` → visible `media_items` (category `gallery`); if
  empty, repo images.

The matching RLS adjustment lives in
[`supabase/policies/0006_phase05_member_full_read.sql`](../supabase/policies/0006_phase05_member_full_read.sql)
— `band_members` and `band_member_translations` now allow public select
for **all rows**, so the public reader can see "this slug is hidden"
and drop only that member instead of falling back to the repo entry.

## Member editing (Phase 05 fix)

`/[locale]/admin/members` shows one card per static fallback slug.
Per card:

- Photo upload via the direct-to-Storage flow (member-images bucket).
- "Aktuelles Foto entfernen" toggle to re-expose the repo fallback.
- Name / Instrument / Bio inputs for DE, EN, TR — DE acts as the
  required language; empty EN/TR rows are not persisted and the
  dictionary fallback keeps serving those locales.
- Sortierung (`sort_order`) number input.
- "Auf der Website anzeigen" checkbox using the hidden-input pattern
  (`<input type="hidden" name="is_visible" value="" />` plus checkbox)
  so unchecking the box persists `false` instead of silently snapping
  back to `true`.

The same hidden-input pattern is used by the gallery row form and the
song row form so all visibility toggles persist their unchecked state.

## next.config.mjs

`next/image` requires `images.remotePatterns` for Supabase URLs. The
config adds the entry automatically from `NEXT_PUBLIC_SUPABASE_URL`.
Without that env var the site uses repo-only assets and the optimisation
allow-list stays empty.

## Manual test checklist

- [ ] Sign in, finish initial password rotation.
- [ ] Upload a real demo MP3 (10–50 MB) at `/admin/music`. The file
      goes directly to Storage — no Server Action 413/504. Public
      featured player swaps to the uploaded MP3.
- [ ] Upload a real band photo (2–10 MB JPG) at `/admin/members`.
      The card on the homepage updates without an app crash.
- [ ] Pick a `.svg` or `.wav` → inline German error "Format nicht
      erlaubt …". No upload attempt is made.
- [ ] Pick a 12 MB JPG → inline German error "Datei zu groß (max.
      10 MB).". No upload attempt is made.
- [ ] Edit "Mika": set DE name "Mika", role "Posaune", bio. EN/TR
      empty. Save. Reload — values persist. Public site shows DE
      content; EN/TR keep their dictionary fallback.
- [ ] Untick "Auf der Website anzeigen" on a single member, Save.
      That member disappears from the public grid; the other 7 stay.
- [ ] Re-tick visibility → member reappears. Value persists across
      reloads.
- [ ] Hide one gallery image / one song → only that row goes away on
      the public site; everything else still renders.
- [ ] Without `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`,
      Admin upload returns "Supabase ist nicht konfiguriert" inline;
      public site falls back entirely to repo assets.
