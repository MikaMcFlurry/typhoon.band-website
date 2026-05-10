# Phase 03b – Initial Admin Password Flow

## Goal

Phase 03 created the Admin Auth + Dashboard foundation.

This phase corrects the intended first-admin workflow:

The admin should be able to log in with an admin e-mail and an initial password. After the first login, the admin must be forced to change the password before accessing the Admin dashboard.

## Important context

Current Phase 03 behavior:
- `/[locale]/admin/login` uses Supabase e-mail + password login.
- Admin access requires a matching `admin_profiles` row.
- `admin_profiles.is_active` must be true.
- Roles `owner`, `admin`, `editor` exist.
- Dashboard and read-only booking requests already exist.

Required new behavior:
- first login with initial password
- forced one-time password change
- no dashboard access until password was changed

## Absolute scope

Allowed:
- additive DB migration
- admin auth guard improvement
- change-password page
- server/client auth helper adjustments
- docs update

Not allowed:
- public frontend redesign
- full Admin CRUD
- admin user management UI
- uploads
- shop/payment
- analytics
- external embeds

## Existing files to inspect first

```text
src/app/[locale]/admin/layout.tsx
src/app/[locale]/admin/page.tsx
src/app/[locale]/admin/login/page.tsx
src/app/[locale]/admin/login/LoginForm.tsx
src/app/[locale]/admin/login/actions.ts
src/app/api/admin/auth/logout/route.ts
src/lib/admin/auth.ts
src/lib/admin/roles.ts
src/lib/supabase/server-auth.ts
src/lib/supabase/browser-auth.ts
src/lib/supabase/admin.ts
src/lib/supabase/types.ts
docs/admin-setup.md
README.md
supabase/migrations/
```

## Database migration

Create an additive migration:

```text
supabase/migrations/0004_admin_password_flow.sql
```

Add fields to `public.admin_profiles`:

```sql
alter table public.admin_profiles
  add column if not exists must_change_password boolean not null default false,
  add column if not exists password_changed_at timestamptz,
  add column if not exists initial_password_issued_at timestamptz;
```

Optional but useful:

```sql
comment on column public.admin_profiles.must_change_password is
  'If true, admin must change password before accessing dashboard.';
```

Update manual `Database` TypeScript type accordingly.

Do not create a public policy for these fields.

## First owner setup flow

Because there is no Admin user management UI yet, setup remains manual.

Required documented flow:

1. Supabase Dashboard → Authentication → Users → Add user.
2. Create user with:
   - admin e-mail
   - temporary initial password
   - Auto-confirm enabled
3. Copy User UID.
4. Supabase SQL Editor:

```sql
insert into public.admin_profiles
  (user_id, display_name, email, role, is_active, must_change_password, initial_password_issued_at)
values
  ('AUTH_USER_UUID', 'Mika Hertler', 'ADMIN_LOGIN_EMAIL', 'owner', true, true, now());
```

5. Admin logs in at:

```text
/de/admin/login
```

6. Admin is redirected to:

```text
/de/admin/change-password
```

7. Admin sets a new password.
8. After success:
   - `must_change_password = false`
   - `password_changed_at = now()`
   - redirect to `/de/admin`

Important:
- Do not store the initial password in GitHub.
- Do not put initial password into `.env`.
- Do not hard-code admin email or password.
- The initial password must be communicated out-of-band and changed immediately.

## Forced change-password guard

Update admin guard behavior:

If user is not authenticated:
- redirect to `/[locale]/admin/login`

If user is authenticated but has no active admin profile:
- sign out or deny
- redirect to login with clear error if existing behavior supports it

If user is active admin and `must_change_password = true`:
- allow access only to:
  - `/[locale]/admin/change-password`
  - logout route
- redirect all other admin pages to:
  - `/[locale]/admin/change-password`

If user is active admin and `must_change_password = false`:
- allow normal dashboard/admin access

## Change password page

Create route:

```text
/[locale]/admin/change-password
```

Requirements:
- protected route: authenticated active admin only
- dark/gold Typhoon Admin style
- no public frontend redesign
- fields:
  - new password
  - confirm new password
- optional field:
  - current/initial password, only if needed
- submit button
- clear success/error states

Password rules:
- minimum 12 characters
- new password and confirmation must match
- show clear error if too short/mismatch
- after successful change, redirect to `/[locale]/admin`

Use Supabase Auth password update:
- use the current authenticated session
- do not use service role to set user password in the browser
- no password logged
- no password stored in DB

## Updating admin profile after password change

After Supabase Auth password update succeeds, update admin profile:

```text
must_change_password = false
password_changed_at = now()
```

This update must be server-side or through an authenticated/admin-safe path.

Do not expose service role to the browser.

Acceptable implementation patterns:
- server action using server-auth session plus RLS/admin policy
- route handler with server-auth and admin validation
- server-only admin helper gated by current authenticated admin

The simplest safe route is acceptable.

## Login behavior

After successful login:
- load admin profile
- if `must_change_password = true`, redirect to `/[locale]/admin/change-password`
- otherwise redirect to the original admin `from` path or dashboard

Do not allow `from` to bypass the password-change requirement.

## Dashboard behavior

Dashboard must not render when `must_change_password = true`.

Booking requests page must not render when `must_change_password = true`.

## Logout

Logout must remain possible from the change-password page.

## Documentation updates

Update:

```text
docs/admin-setup.md
README.md
```

Include:
- first owner setup with initial password
- SQL insert with `must_change_password = true`
- expected forced password-change flow
- how to reset the flag manually if needed
- how to deactivate an admin
- how to test unauthorized / inactive / change-required states

Manual reset examples:

```sql
update public.admin_profiles
set must_change_password = true,
    initial_password_issued_at = now()
where email = 'ADMIN_LOGIN_EMAIL';
```

Deactivate:

```sql
update public.admin_profiles
set is_active = false
where email = 'ADMIN_LOGIN_EMAIL';
```

## Security requirements

- no initial password in GitHub
- no password in `.env`
- no service role in client components
- no dashboard access before password change
- no booking data exposed before password change
- no public access to admin pages
- inactive admins denied
- session checked server-side
- no weakening of RLS

## Acceptance checklist

- migration adds password-flow fields
- TypeScript DB type updated
- first owner setup docs updated
- admin with `must_change_password=true` is redirected to change-password
- admin cannot open dashboard/booking before password change
- password change validates length and confirmation
- successful password change updates Supabase Auth password
- successful password change sets `must_change_password=false`
- successful password change sets `password_changed_at`
- admin can access dashboard after password change
- logout works from change-password page
- public frontend unchanged
- `npm run lint` passes
- `npm run build` passes
