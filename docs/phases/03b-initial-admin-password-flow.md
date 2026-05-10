# Phase 03b – Initial Admin Password Flow

## Goal

Make sure no admin keeps using the temporary password their owner set in
the Supabase Dashboard. Phase 03 wired up Auth + the admin shell; this
phase plugs the obvious gap: every newly provisioned admin must rotate
their password before reaching the dashboard.

## Absolute scope

Allowed:
- additive migration adding `must_change_password` and
  `password_changed_at` to `public.admin_profiles`
- a `requireAdminWithPasswordOk()` guard that re-uses the existing
  `requireAdmin()` and additionally redirects to the change-password
  page when the rotation flag is still set
- `/[locale]/admin/change-password` route (server page + client form +
  server action)
- Supabase Auth password update for the signed-in user
- mark the rotation as done by flipping
  `must_change_password = false` and writing `password_changed_at = now()`
  via the service-role client
- docs updates (`docs/admin-setup.md`, `README.md`)

Not allowed:
- full content CRUD
- Admin user management UI
- public frontend redesign
- shop / payment / analytics / external embeds
- media/audio uploads

## Existing files to inspect first

```text
src/app/[locale]/admin/page.tsx
src/app/[locale]/admin/booking/page.tsx
src/app/[locale]/admin/login/actions.ts
src/app/[locale]/admin/login/page.tsx
src/lib/admin/auth.ts
src/lib/admin/roles.ts
src/lib/supabase/server-auth.ts
src/lib/supabase/admin.ts
src/lib/supabase/types.ts
supabase/migrations/0001_init.sql
supabase/policies/0001_rls.sql
docs/admin-setup.md
README.md
```

## Required schema changes

Additive only — new columns, no rewrites:

```sql
alter table public.admin_profiles
  add column if not exists must_change_password boolean not null default true,
  add column if not exists password_changed_at  timestamptz;
```

Existing rows pick up `true` from the default, which means every admin
provisioned before this migration will be funnelled through the new
flow on their next login.

## Required access model

All three roles (`owner` / `admin` / `editor`) must rotate the initial
password the same way. The flow:

```text
auth user exists (Supabase)
AND admin_profiles row exists for auth.users.id
AND admin_profiles.is_active = true
AND admin_profiles.must_change_password = false   -- enforced for /admin and /admin/booking
```

`/admin/change-password` itself only requires the first three (otherwise
the user can never satisfy the flag), but redirects back to `/admin`
when `must_change_password` is already false.

## Important

- Do not rely on client-side checks. The redirect must happen server-side
  inside the protected layout/page or its data loader.
- Admins must be able to log out from the change-password page in case
  they were enrolled with a wrong account.
- Do not loosen RLS on `admin_profiles`. The rotation flags are written
  through the service-role client, the same pattern Phase 03 uses for
  `last_login_at`.

## Pages / actions to build

### /[locale]/admin/change-password

Server page:
- `requireAdmin(locale, { from })` to ensure an authenticated active
  admin is on the page (no rotation check, otherwise we'd loop).
- Redirect to `/[locale]/admin` when `mustChangePassword` is already
  false (e.g. user navigated here manually after the rotation).

Client form:
- New password + confirmation.
- Minimum length 12.
- German primary copy. EN/TR can stay simple.

Server action:
- Validate non-empty + length + match.
- Re-fetch the current admin server-side.
- `supabase.auth.updateUser({ password })`.
- On success, service-role update on `admin_profiles`:
  `must_change_password = false`, `password_changed_at = now()`,
  `updated_at = now()`.
- Redirect to `/[locale]/admin`.

### Login action

After a successful sign-in + active-admin check, read
`must_change_password` and redirect to
`/[locale]/admin/change-password` instead of the dashboard if the flag
is still true.

### Login page

If a user is already signed in as an active admin who still needs to
rotate their password, redirect them straight to
`/[locale]/admin/change-password`.

### Dashboard + booking

Switch their data loaders from `requireAdmin()` to
`requireAdminWithPasswordOk()`.

## Security requirements

- No service-role key in client components.
- The change-password action must require an authenticated session.
- The action must update only the signed-in user's own
  `admin_profiles` row (filter by `user_id = current.userId`).
- Passwords must never be logged. Errors surface as user-facing text
  only.
- Inactive admins must still be denied — `requireAdmin()` already
  enforces this.
- No public access to `/admin/change-password`.

## Documentation updates

- `docs/admin-setup.md` — describe the rotation flow, how to force a
  rotation manually (`update admin_profiles set must_change_password =
  true …`), and the logout escape hatch.
- `README.md` — note the new route, the new helper, and the new
  migration in the Supabase apply list.

## Acceptance checklist

- new admin row is created with `must_change_password = true`
- `/de/admin/login` → after correct credentials, redirect to
  `/de/admin/change-password`
- `/de/admin` and `/de/admin/booking` redirect to
  `/de/admin/change-password` while the flag is still true
- after a successful password change:
  - `must_change_password = false` and `password_changed_at` populated
  - user lands on `/de/admin`
  - `/de/admin/change-password` redirects back to `/de/admin`
- inactive admin is still denied (no regression)
- no service-role key reaches the browser
- `npm run lint` passes
- `npm run build` passes
