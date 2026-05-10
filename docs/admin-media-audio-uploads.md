# Admin Media + Audio Uploads (Phase 05)

This document is the operational guide for the Phase 05 admin upload flows.
For the higher-level requirements see
[`docs/phases/05-admin-media-audio-uploads.md`](phases/05-admin-media-audio-uploads.md).

## Routes

| Route                                | Purpose                                           |
| ------------------------------------ | ------------------------------------------------- |
| `/[locale]/admin/media`              | Gallery images (table: `media_items`)             |
| `/[locale]/admin/music`              | Demo songs (table: `songs`)                       |
| `/[locale]/admin/members`            | Band member photos (table: `band_members`)        |
| `/[locale]/admin/settings/assets`    | Hero, hero-signature, bandinfo images (`site_settings`) |

Every route calls `requireAdminWithPasswordOk()` server-side. The forms
post to `"use server"` actions — there is no public upload endpoint.

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
which we use server-side.

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

## Upload pipeline

`src/lib/storage/upload.ts → uploadAssetToStorage()`

1. `getAdminSupabase()` — service-role client. Module is `server-only`.
2. Validate the file (kind = "image" | "audio"); abort with a friendly
   message on failure.
3. Build a stable storage key (`<prefix>/<date>-<slug>-<uuid><ext>`).
4. Upload to Supabase Storage with `upsert: false`.
5. Resolve the public URL via `getPublicUrl()`.
6. Caller writes a DB row referencing the URL.

If the DB write fails after a successful upload, the action calls
`deleteStorageObject()` to remove the orphan blob. We never store DB
rows that point at non-existent files; we accept leaving the previous
file in Storage when an asset is replaced (data-loss safety).

## DB tables

- `media_items` — gallery images. Inserts use `category = "gallery"`,
  `type = "image"`, `is_visible = true`. The Admin can edit title,
  alt-text, sort and visibility, plus delete the row entirely.
- `songs` — demos. Inserts force `is_streamable = true` and
  `is_downloadable = false`. Cover and audio uploads update
  `cover_image_url` / `audio_url`. Featured flag uses
  `setFeaturedSong()` so only one song is featured at a time.
- `band_members` — upserted by slug. Phase 05 only touches
  `photo_url`, `sort_order`, `is_visible`. Names, roles and bios stay
  dictionary-driven and become editable in a later phase.
- `site_settings` — keys `hero_image`, `hero_signature`,
  `bandinfo_image`. Each value is a JSON object `{ "url": "..." }`,
  stored with `is_public = true` so the public anon client can read it.

## Public fallback behaviour

The public content provider (`src/lib/content/index.ts`) reads:

- `getHeroContent()` → dictionary text + `site_settings.hero_image` /
  `site_settings.hero_signature` URLs (fallback `/assets/hero/...`).
- `getBandInfo()` → dictionary text + `site_settings.bandinfo_image`
  (fallback `/assets/gallery/gallery-5.jpg`).
- `getMembers()` → `band_members` rows merged with the static fallback;
  missing photo URLs reuse `src/data/members.ts`.
- `getSongs()` → visible+streamable `songs`; if empty, repo MP3s.
- `getGalleryItems()` → visible `media_items` (category `gallery`); if
  empty, repo images.

## next.config.mjs

`next/image` requires `images.remotePatterns` for Supabase URLs. The
config adds the entry automatically from `NEXT_PUBLIC_SUPABASE_URL`.
Without that env var the site uses repo-only assets and the optimisation
allow-list stays empty.

## Manual test checklist

- [ ] Sign in, finish initial password rotation.
- [ ] Upload one gallery image; confirm it appears on the homepage.
- [ ] Toggle visibility; confirm fallback gallery returns.
- [ ] Upload a demo MP3 + cover; confirm featured player swaps.
- [ ] Upload a member photo; confirm the right card updates.
- [ ] Upload hero + bandinfo assets; confirm Hero/About modules render
      Supabase URLs.
- [ ] Try uploading a `.svg`, a `.wav` and a 12 MB JPG → all rejected
      with a German error.
- [ ] Without `SUPABASE_SERVICE_ROLE_KEY`, an upload returns a friendly
      "Supabase ist nicht konfiguriert" message.
