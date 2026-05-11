# Phase 06 – Legal, SEO, Consent and Platform Links

## Goal

The Admin can already manage bookings, shows, media, music and member assets.

This phase prepares the website for launch by completing:

```text
Legal pages
SEO metadata
Cookie/consent handling
Platform links
External media/embed safeguards
```

Do not redesign the public website.

## Absolute scope

Allowed:
- Legal page Admin editor
- SEO Admin editor
- Platform Links Admin editor
- Cookie consent banner/preferences
- public legal pages from Supabase with fallback
- SEO metadata via content provider
- OpenGraph image URL support
- external platform links
- embed placeholders that require consent
- docs updates

Not allowed:
- public frontend redesign
- shop/payment
- analytics unless explicitly consent-gated and configured
- full rich-text CMS
- media/audio upload changes
- unrelated Admin CRUD

## Existing files to inspect first

```text
src/app/[locale]/legal/imprint/page.tsx
src/app/[locale]/legal/privacy/page.tsx
src/app/[locale]/legal/cookies/page.tsx
src/components/legal/LegalShell.tsx
src/lib/content/index.ts
src/lib/content/supabase-content.ts
src/lib/content/normalize.ts
src/lib/content/types.ts
src/lib/supabase/types.ts
src/app/[locale]/admin/_components/AdminShell.tsx
src/app/[locale]/admin/page.tsx
src/data/site.ts
src/i18n/dictionaries.ts
supabase/migrations/0001_init.sql
supabase/migrations/0002_supabase_foundation.sql
supabase/policies/0001_rls.sql
supabase/policies/0002_rls_foundation.sql
README.md
```

## Legal pages

Existing public routes:

```text
/[locale]/legal/imprint
/[locale]/legal/privacy
/[locale]/legal/cookies
```

Required:
- Public legal pages should use content provider.
- Supabase legal content should override fallback if published.
- Fallback legal content must remain if Supabase is empty.
- Legal pages must show draft/legal disclaimer if content is still initial/draft.

Admin route:

```text
/[locale]/admin/legal
```

Features:
- list legal pages:
  - imprint
  - privacy
  - cookies
- edit per locale:
  - de
  - en
  - tr
- fields:
  - title
  - body_md textarea
  - is_published
- save/update existing legal page + translation
- create missing page/translation if absent

Important:
- This is not legal advice.
- Use plain textarea/Markdown-like text only.
- No rich text editor.
- No AI legal generation.
- Do not claim GDPR compliance as guaranteed.

## SEO

Admin route:

```text
/[locale]/admin/seo
```

Features:
- edit SEO entries for important paths:
  - /de, /en, /tr
  - /de/legal/imprint
  - /de/legal/privacy
  - /de/legal/cookies
  - equivalent EN/TR routes if feasible
- fields:
  - path
  - locale
  - title
  - description
  - og_image_url optional
- save/update entries

Public:
- metadata should use content provider SEO entries if present.
- fallback metadata from static site data if empty.

Implementation:
- Use Next.js `generateMetadata` where appropriate.
- Do not break static fallback.
- Do not require Supabase during build.
- Avoid huge metadata rewrites if current app structure makes it risky; implement minimal clean version.

OpenGraph:
- `og_image_url` may point to uploaded Supabase asset.
- must not crash if absent.

## Platform links

External platforms to support:

```text
Spotify
YouTube
Instagram
Facebook
SoundCloud
Bandcamp
```

Admin route:

```text
/[locale]/admin/platform-links
```

Features:
- list links
- create/update/delete or hide
- fields:
  - platform
  - url
  - is_active
  - sort_order
- platform should be limited to supported list or validated strongly
- URL must be valid http/https
- inactive links hidden publicly

Public:
- platform links should appear wherever current site expects social/platform links.
- If no Supabase links exist, fallback links can remain empty/static.
- When Admin adds a link, public site should show it automatically.

Important user requirement:
- As soon as Admin inserts a link for an external platform, that platform link should automatically appear on the website.

## Cookie consent

Add a real consent banner/preferences mechanism.

Required categories:

```text
necessary
external_media
statistics optional/future
marketing optional/future
```

MVP behavior:
- Necessary is always active.
- External media is off until accepted.
- Statistics/marketing are not used yet, but can be shown as future/disabled or not shown.
- Store consent choice in a cookie or localStorage.
- Provide a way to reopen preferences, e.g. footer link/button.

Banner copy:
- German primary copy.
- EN/TR may use simple translations.
- Clearly explain that external media/platform embeds may load third-party content only after consent.
- Do not set analytics cookies because analytics are not implemented.

Public UI:
- dark/gold style consistent with site
- no redesign
- small banner/modal is okay

## External embeds

Currently external platforms are mostly links.

Rules:
- Simple outbound links are allowed without consent.
- Embedded YouTube/Spotify/SoundCloud/Bandcamp players must not load until `external_media` consent is true.
- If embed components do not exist yet, create reusable placeholder/helper for future:
  - `ExternalMediaGate`
  - shows placeholder + accept external media button
  - only renders iframe/embed after consent
- Do not add real embeds unless already present or trivial.
- No tracking before consent.

## Consent settings table

If `consent_settings` table already exists:
- use it if practical for configurable banner text/settings.
- Otherwise keep banner text in code for this phase and document later admin editing.

Do not overcomplicate this phase.

## Migration / RLS

Use existing tables if possible:

```text
legal_pages
legal_page_translations
seo_entries
platform_links
consent_settings
```

Additive migrations only if missing columns are discovered.

RLS:
- public can read:
  - published legal pages/translations
  - active platform links
  - SEO entries
  - public consent settings
- public cannot write
- Admin writes must be server-side/admin-gated
- service role remains server-only

Do not weaken booking/admin/media policies.

## Admin navigation/dashboard

Add Admin nav/dashboard entries if not already present:

```text
Legal
SEO
Platform Links
Consent/Cookies
```

Only mark as active if a real page exists.

## Validation

Server-side validation required.

Legal:
- slug limited to imprint/privacy/cookies
- locale limited to de/en/tr
- title required
- body_md required or warning
- is_published boolean

SEO:
- path required
- locale required
- title max length e.g. 80
- description max length e.g. 180
- og_image_url optional valid URL

Platform links:
- platform in supported list
- url valid http/https
- is_active boolean
- sort_order number

Consent:
- category keys restricted
- no arbitrary script injection

## Documentation updates

Update:

```text
README.md
docs/admin-setup.md if relevant
```

Optionally add:

```text
docs/admin-legal-seo-consent-platforms.md
```

Document:
- legal editor
- SEO editor
- platform links workflow
- consent banner behavior
- embed consent rule
- no analytics yet
- manual test steps

## Acceptance checklist

- Admin can edit imprint/privacy/cookies per locale
- public legal pages use Supabase text when published
- legal fallback remains when empty
- Admin can edit SEO title/description/OG image
- public metadata uses SEO entries when available
- Admin can add Spotify/YouTube/Instagram/Facebook/SoundCloud/Bandcamp links
- active platform links appear publicly
- inactive links are hidden
- cookie consent banner appears for new visitor
- external media consent can be accepted/changed
- preferences can be reopened
- no external embed loads before consent
- no analytics added
- public frontend design unchanged
- no service role in browser
- `npm run lint` passes
- `npm run build` passes
