# Phase 05 – Admin Media + Audio Uploads

## Goal

Allow Admin to upload and manage images/audio safely.

## Build

- image upload for hero, band info, members, gallery
- audio upload for demo songs
- cover image upload for songs
- storage validation
- DB record creation/update
- visibility and sort order
- delete/replace flow

## Validation

Images:
- allowed MIME: image/jpeg, image/png, image/webp
- max size documented
- sanitize filenames

Audio:
- allowed MIME: audio/mpeg for MP3
- no WAV/AIFF/FLAC in production upload
- max size documented
- no download button on public site

## Storage

Use Supabase Storage buckets prepared earlier.

## Do not build

- shop
- payment
- public upload
