# 04 – Technical Architecture

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel
- Supabase Auth/Postgres/Storage
- Resend

## Folder structure recommendation

```text
src/
  app/
    [locale]/
      page.tsx
      legal/
        imprint/page.tsx
        privacy/page.tsx
        cookies/page.tsx
      admin/
        page.tsx
        layout.tsx
    api/
      booking/route.ts
  components/
    layout/
    sections/
    ui/
    audio/
    admin/
  config/
  data/
  i18n/
  lib/
    supabase/
    resend/
    validation/
  types/
supabase/
  migrations/
  policies/
docs/
public/
  assets/
    reference/
    gallery/
    band-cards/
    audio/demos/
```

## Architecture rules

- Public frontend reads published content.
- Admin area is protected.
- Backend actions use server-only code.
- Supabase service role key is server-only.
- Resend API key is server-only.
- Upload/storage rules are prepared, but full upload UI can come later.

## First implementation expectation

In this batch:
- implement frontend from handoff
- implement Supabase/Resend foundation
- create schema and RLS migration files
- create admin shell/protected route foundation
- implement booking server route/action with graceful env fallback
- keep full Admin CRUD for next batch

## Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
BOOKING_EMAIL
WEBSITE_FROM_EMAIL
NEXT_PUBLIC_SITE_URL
```

## Locale routing

Default:
```text
de
```

Prepared:
```text
en
tr
```

Root should redirect to `/de`.
