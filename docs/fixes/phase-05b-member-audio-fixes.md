# Phase 05b Fix – Member Texts + Admin Titles + Supabase Audio Playback

## Context

Phase 05 and its upload/member fix are already merged into `main`.

Current regressions after testing:

1. Public member cards use Supabase name and photo, but still show fallback instrument/role and fallback short bio.
2. Admin member cards still show the initial/fallback name in the card heading after the name was changed in Supabase.
3. Uploaded demo songs have no sound on the website, but the uploaded source URL plays when opened directly from Admin.

Create a new fix branch from latest `main`.

Do not redesign the public website.

## Goal

Fix only these three Phase-05 issues, then stop.

## Issue 1 – Public member role/instrument and bio still use fallback

### Current expected behavior

For each band member slug:

- static fallback remains the base
- Supabase row overrides matching slug only
- Supabase translation should override:
  - name
  - role / instrument
  - bio / short text
- missing Supabase fields should fall back field-by-field

### Current bug

Name and photo are overridden from Supabase, but role/instrument and bio still show fallback.

### Files to inspect

```text
src/lib/content/normalize.ts
src/lib/content/supabase-content.ts
src/lib/admin/members.ts
src/app/[locale]/admin/members/actions.ts
src/app/[locale]/admin/members/MemberForm.tsx
src/components/sections/Members.tsx
src/data/members.ts
src/lib/content/types.ts
```

### Required fix

- Verify `fetchMembers(locale)` loads the correct translation row for the active public locale.
- Verify `band_member_translations` rows are saved with:
  - locale
  - name
  - role
  - bio_md
- Verify `normaliseMembers()` maps:
  - `translation.role` → public member `role`
  - `translation.bio_md` → public member `bio`
- Do not use fallback role/bio when Supabase translation values are non-empty.
- Keep field-by-field fallback only for empty/missing values.
- If necessary, support fallback to German translation when current locale translation is missing.

### Acceptance

- Change Mika's role in Admin.
- Public Mika card shows changed role.
- Change Mika's bio in Admin.
- Public Mika card shows changed bio.
- Other members remain unchanged/fallback.

## Issue 2 – Admin member card heading still uses fallback name

### Current bug

In Admin Members, the heading of each card still uses the initial fallback name, even after the Admin changed the member name.

Known cause:
- `MemberForm.tsx` header currently renders `fallback.name`.

### Required fix

- Admin member card heading must display persisted Supabase name if present.
- Preferred priority:
  1. current admin locale translation name
  2. German translation name
  3. fallback name
- Image alt text should also use the displayed name.
- The slug can remain visible as technical reference.

### Acceptance

- Change a member name in Admin.
- Save and reload Admin Members.
- The card heading uses the changed name.

## Issue 3 – Uploaded Supabase demo songs have no sound on public website

### Current behavior

- Admin source URL opens and plays directly.
- Website player starts/appears to play, but no audio is heard.

### Likely cause

The player connects the `<audio>` element to Web Audio (`createMediaElementSource`) for waveform analysis. Cross-origin media from Supabase Storage can be silent in the Web Audio graph unless CORS/crossOrigin is handled correctly.

Current file to inspect:

```text
src/components/audio/AudioPlayerProvider.tsx
```

### Required fix

- Set `audio.crossOrigin = "anonymous"` before assigning Supabase/public audio URLs.
- Ensure this is done before `el.src = src`.
- Keep local/static audio fallback working.
- Keep waveform analyser working if CORS headers are available.
- If analyser creation fails, audio playback must still work without waveform analysis.
- Do not let analyser errors mute playback.
- Add defensive error logging only if safe, no noisy production console spam.

### Suggested implementation detail

In `ensureAudio()`:

```ts
const el = new Audio();
el.crossOrigin = "anonymous";
el.preload = "metadata";
```

And before changing to a new track:

```ts
el.crossOrigin = "anonymous";
el.src = src;
```

If Web Audio analyser fails due CORS, skip analyser but do not block `el.play()`.

### Acceptance

- Uploaded MP3 from Supabase Storage plays with sound on public page.
- Static fallback MP3 still plays.
- Waveform still works when possible.
- No public download button.

## Additional checks

Run:

```bash
npm run lint
npm run build
```

Manual tests:

1. Admin Members:
   - change name
   - change role/instrument
   - change bio
   - save
   - reload Admin Members
   - heading uses changed name
2. Public site:
   - same member shows changed name, role and bio
   - other members still show fallback data
3. Music:
   - uploaded Supabase MP3 has audible sound in FeaturedPlayer and DemoRows
   - fallback static MP3 still works
4. No public frontend design changes.

## Out of scope

Do not implement:
- Phase 06
- Legal/SEO/Consent
- shop
- analytics
- external embeds
- redesign
- unrelated CRUD
