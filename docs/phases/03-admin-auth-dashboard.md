# Phase 03 – Admin Auth + Dashboard

## Goal

Create the secure Admin foundation.

This phase is the first real Admin phase, but it must stay small:
- Auth
- protected admin shell
- dashboard
- read-only booking requests
- no full content CRUD yet

## Absolute scope

Allowed:
- Supabase Auth login/logout
- protected Admin layout/routes
- active admin profile check
- role helpers
- dashboard cards/modules
- read-only booking requests overview
- setup docs for first owner/admin
- minimal Admin styling consistent with the existing Typhoon design

Not allowed:
- public frontend redesign
- full content CRUD
- media/audio uploads
- shop/payment
- analytics
- external embeds
- public UI changes outside admin

## Existing files to inspect first

Inspect before editing:

```text
src/app/[locale]/admin/layout.tsx
src/app/[locale]/admin/page.tsx
src/lib/supabase/admin.ts
src/lib/supabase/server.ts
src/lib/supabase/client.ts
src/lib/supabase/types.ts
src/lib/env.ts
supabase/migrations/0001_init.sql
supabase/migrations/0002_supabase_foundation.sql
supabase/policies/0001_rls.sql
supabase/policies/0002_rls_foundation.sql
README.md
.env.example
```

## Auth approach

Use Supabase Auth.

Preferred MVP:
- email magic link login or email/password if already easier
- do not invent OAuth
- do not expose service role
- keep session handling server-safe

Admin routes should be under:

```text
/[locale]/admin
```

Optional helper routes if needed:

```text
/[locale]/admin/login
/[locale]/admin/logout
```

or route handlers:

```text
/api/admin/auth/...
```

Choose the cleanest approach for Next.js App Router.

## Required access model

Only users who satisfy all of this may access Admin:

```text
Supabase authenticated user exists
AND admin_profiles row exists for auth.users.id
AND admin_profiles.is_active = true
```

Role values:

```text
owner
admin
editor
```

For this phase:
- owner/admin/editor can access dashboard
- role-specific restrictions can be prepared but not overbuilt
- owner-only features are later

## Important

Do not rely only on client-side checks.

Admin protection must be enforced server-side in layout/page/route handlers.

## First owner setup

Because there is no Admin UI yet for creating admins, document a manual SQL setup.

Required docs:
- how to create a Supabase Auth user
- how to insert corresponding `admin_profiles` row
- how to set role `owner`
- how to deactivate an admin

Add this to README or a new doc:

```text
docs/admin-setup.md
```

Suggested SQL pattern:

```sql
insert into public.admin_profiles (user_id, display_name, email, role, is_active)
values ('AUTH_USER_UUID', 'Mika Hertler', 'YOUR_LOGIN_EMAIL', 'owner', true);
```

Do not include real secrets.

## Admin pages to build

### Login page

Route:

```text
/[locale]/admin/login
```

Must include:
- email input
- login submit
- clear success/error message
- German primary copy; EN/TR can be simple
- Typhoon-style dark/gold design
- no public frontend redesign

### Admin layout

For protected routes:
- server-side session/admin check
- redirect unauthenticated users to login
- redirect inactive/non-admin users to login or access-denied
- display admin header/sidebar/shell
- logout action/link

### Dashboard

Route:

```text
/[locale]/admin
```

Show dashboard cards for:

```text
Booking
Shows
Music
Gallery
Members
Legal
SEO
Platform links
Settings
```

For now:
- cards can be placeholders
- no CRUD yet
- show "coming next" style text

### Booking requests view

Add a read-only module/page if feasible:

```text
/[locale]/admin/booking
```

Show:
- latest booking requests
- name
- email
- event_date
- event_location
- event_type
- status
- created_at
- message preview or detail

No editing required yet.

Access:
- active admin only

Important:
- booking_requests is private; read through server/admin client or authenticated admin route.
- do not expose service role to client.

## Supabase helpers

Create or adjust helpers if needed:

```text
src/lib/admin/auth.ts
src/lib/admin/roles.ts
src/lib/admin/bookings.ts
```

or similar.

Recommended functions:

```ts
getCurrentAdmin()
requireAdmin()
isOwner(admin)
isAdminLike(admin)
getRecentBookingRequests()
```

## Route protection

Accepted patterns:
- protected server layout with `redirect()`
- server component data loading
- route handler for auth callback if Supabase magic link requires it

Do not protect admin only with client hooks.

## Session handling

Use Supabase Auth correctly for Next.js App Router.

If cookie/session handling requires `@supabase/ssr`, install it only if needed and document why.

If not installing `@supabase/ssr`, implement a safe MVP consistent with current app setup.

## Admin UI design

Admin may have its own simple shell, but should visually fit Typhoon:
- dark background
- gold accents
- readable cards
- no flashy redesign
- no changes to public frontend

## Security requirements

- no service role in client components
- no public access to `/admin`
- inactive admins denied
- unauthenticated users redirected to login
- no booking data exposed publicly
- no raw secrets committed
- no changes that weaken RLS

## Documentation updates

Update README and/or add `docs/admin-setup.md` with:

- required env vars
- Supabase Auth settings
- first owner creation
- login flow
- how to test admin access
- how to test inactive admin denial
- next phase: Admin Content CRUD

## Acceptance checklist

- `/de/admin` redirects unauthenticated user to login
- login page exists
- authenticated user without admin_profiles row is denied
- inactive admin is denied
- active admin can access dashboard
- dashboard shows planned modules
- booking requests can be viewed read-only by active admin
- service role remains server-only
- public frontend design unchanged
- `npm run lint` passes
- `npm run build` passes
