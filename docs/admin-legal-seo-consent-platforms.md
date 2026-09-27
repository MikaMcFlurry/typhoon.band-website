# Admin – Legal, SEO, Consent & Platform Links (Phase 06)

Phase 06 prepares the website for launch by completing the editor surface
for legal pages, SEO metadata, external platform links and cookie
consent, plus an embed gate that blocks third-party iframes until the
visitor accepts the `external_media` category.

The public design is unchanged. The only new public UI elements are:

- the cookie-consent banner gains a "Preferences" dialog with per-category
  toggles
- the footer "Legal" column shows a new **Cookie preferences** entry that
  reopens the dialog
- platform icons in the footer now come from Supabase (no more dead `#`
  links)

## Admin routes

| Route                                  | Purpose                                        |
| -------------------------------------- | ---------------------------------------------- |
| `/[locale]/admin/legal`                | Edit imprint/privacy/cookies per locale.       |
| `/[locale]/admin/seo`                  | Per-(path × locale) Title/Description/OG-Bild. |
| `/[locale]/admin/platform-links`       | Add/edit/delete Spotify/YouTube/…/Bandcamp.    |
| `/[locale]/admin/consent`              | Read-only overview of consent categories.      |

All four are gated by `requireAdminWithPasswordOk()` so a fresh admin
cannot reach them before rotating the initial password.

## Legal editor

- Three slugs hard-coded by the spec: `imprint`, `privacy`, `cookies`.
- Three locales: `de`, `en`, `tr`.
- Per locale: `title` (required, ≤160 chars), `body_md` (plain textarea,
  ≤16 000 chars). The renderer treats lines starting with `## ` as H2 and
  the rest as paragraphs — no full Markdown engine is shipped.
- `is_published` is per-slug (one parent row). Until a slug is published
  the public route serves the curated repo fallback with the draft note.
- Saving an empty title + body deletes the translation row so the
  fallback wins again.
- This is *not legal advice* — text is written by the band, not generated.

## SEO editor

- Per (path, locale) entry. Path examples:
  ```text
  /
  /legal/imprint
  /legal/privacy
  /legal/cookies
  ```
- Fields: `title` (≤80), `description` (≤180), `og_image_url`
  (optional, must be http/https).
- The content provider exposes `getSeoEntry(path, locale)` and the
  affected routes use `generateMetadata` to render it. When no row is
  found, the fallback in `src/lib/content/fallback.ts` ::
  `buildSeoFallback` is used — page-specific for legal routes, brand
  line for the home page.
- Deleting an entry (or saving an entirely empty one) restores the
  fallback.

## Platform Links editor

- Supported platforms (CHECK constraint in migration `0006`):
  `spotify · youtube · instagram · facebook · soundcloud · bandcamp`.
- Each row has `url` (required, http/https), `is_active`, `sort_order`.
- The footer reads `getPlatformLinks()` server-side; only `is_active = true`
  rows appear. As soon as the Admin saves an active link, the public
  footer shows the matching icon without code changes.
- Deleting a row hides the icon publicly.

## Cookie consent

- Storage key: `typhoon.consent.v1` in `localStorage`.
- Shape: `{ v: 1, necessary: true, external_media: boolean, decided_at }`.
- Categories shown on the banner:
  - **Necessary** — always on, locked.
  - **External media** — off until accepted.
- "Necessary only" and "Accept all" are one-click; "Preferences" opens
  the per-category dialog. Footer's **Cookie preferences** dispatches
  `typhoon:open-consent` to reopen the dialog after the banner was
  dismissed.
- No analytics cookies are set. The choice itself is the only client
  state written.
- Banner copy lives in `src/i18n/dictionaries.ts` (DE/EN/TR).
- The `consent_settings` table is read in the Admin overview only; the
  Phase 06 banner is text-driven via dictionaries.

## External media gate

`src/components/media/ExternalMediaGate.tsx` is the only entry point for
new external embeds. It subscribes to the `typhoon:consent-changed`
event and only renders its children when `external_media = true`:

```tsx
<ExternalMediaGate title="YouTube">
  <iframe src="https://www.youtube.com/embed/…" … />
</ExternalMediaGate>
```

Until consent is granted, the iframe is never inserted into the DOM, so
no third-party request leaves the browser. Users can accept inline (the
gate writes consent for this category) or open full preferences.

Phase 06 itself does **not** add real embeds — the gate exists so future
phases can drop them in without breaking the consent contract.

## Migration / RLS

- Migration: `supabase/migrations/0006_legal_seo_consent_platforms.sql`
  - seeds `legal_pages` for the three slugs (`is_published = false`)
  - adds a CHECK constraint on `platform_links.platform`
  - seeds three rows in `consent_settings` (necessary, external_media,
    statistics — only the first two are active in the public banner)
  - adds an index on `seo_entries(path)` for the Admin list view
- Policies: `supabase/policies/0006_legal_seo_consent_platforms.sql`
  - re-asserts the public-read + admin-write policies for the four
    tables. No public write, ever.

## Manual test steps

1. **Without Supabase env** — `npm run dev` and visit `/de/legal/imprint`.
   The curated repo body renders with the draft note. The footer shows
   no platform icons. The cookie banner appears on first visit.
2. **With Supabase env**:
   1. Log in as admin and rotate the initial password.
   2. `/de/admin/legal` → switch to `Datenschutz`, locale `EN`, write a
      one-paragraph body, tick "Veröffentlicht", save. Visit `/en/legal/privacy`
      → only the Supabase body shows, no draft note.
   3. `/de/admin/seo` → create an entry for `/legal/privacy` × `en`
      with a 60-char title and 150-char description. View page source
      on `/en/legal/privacy` → `<title>` and `<meta name="description">`
      reflect the new values. Delete the row → fallback returns.
   4. `/de/admin/platform-links` → add an active Spotify link. Reload
      the homepage → Spotify icon appears in the footer with the saved
      URL. Toggle `is_active` off → icon disappears.
   5. Click the footer's **Cookie preferences** link → dialog opens.
      Toggle "Externe Medien" on, save. Reload — banner stays gone,
      choice persisted in localStorage.
   6. Clear localStorage and reload → banner reappears.
3. **Embed gate** (manual): wrap any iframe in `ExternalMediaGate` and
   verify that the iframe is absent in the DOM before consent and
   inserted only after the visitor accepts.

## Security notes

- All Admin writes go through the service-role client (`getAdminSupabase`),
  which is server-only.
- Public reads use the anon client, filtered by RLS (published legal,
  active platform links, all SEO + consent).
- Validation lives in `src/lib/validation/legal-seo-platforms.ts` —
  every server action calls it before touching the DB.
- No analytics are added in this phase. The `consent_settings` table
  ships a `statistics` row as a placeholder only; nothing reads it yet.
