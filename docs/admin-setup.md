# Admin Setup

How to bring the Typhoon Admin online for the first time and how to manage
admin accounts going forward. The Admin shell ships behind Supabase Auth +
the `admin_profiles` table; there is no public sign-up.

## 1. Required environment variables

The Admin login uses the cookie-aware Supabase SSR client, so the same
public values that power the homepage are enough — plus the service-role
key for the server-side booking reader.

```text
NEXT_PUBLIC_SUPABASE_URL          # browser + server
NEXT_PUBLIC_SUPABASE_ANON_KEY     # browser + server
SUPABASE_SERVICE_ROLE_KEY         # SERVER ONLY — never expose
NEXT_PUBLIC_SITE_URL              # used for absolute redirects
```

Copy from `.env.example` and fill in `.env.local` for development. In Vercel,
set them under **Project → Settings → Environment Variables** and keep the
service-role key off the "Public" toggle.

## 2. Supabase Auth provider settings

In the Supabase Dashboard:

1. **Authentication → Providers → Email** → enable.
2. Email confirmation can stay **on** for new users; the first owner is
   created with a known password (next step), so confirmation is unnecessary
   for them — mark them confirmed manually.
3. **URL Configuration → Site URL**: set to your production origin
   (`https://typhoon.band`). Add `http://localhost:3000` to the additional
   redirect URLs for development.

No magic-link / OTP flow is wired up in this phase. Email + password is the
only login path.

## 3. Create the first owner account

Two manual steps — both happen in the Supabase Dashboard / SQL editor.

### 3a. Create the auth user

In the Dashboard → **Authentication → Users → Add user → "Create new user"**:

- Email: your login address (for example `mika@typhoon.band`).
- Password: pick a strong password, store in your password manager.
- "Auto Confirm User" → **on**.

Copy the new user's UUID from the user detail page — you need it for the
admin profile insert below.

### 3b. Insert the matching admin profile

Open **SQL Editor** and run (replace the placeholders):

```sql
insert into public.admin_profiles
  (user_id, display_name, email, role, is_active)
values
  ('AUTH_USER_UUID', 'Mika Hertler', 'YOUR_LOGIN_EMAIL', 'owner', true);
```

`role` accepts `owner`, `admin`, or `editor`. Only the first account should
be `owner`. `must_change_password` defaults to `true`, so the new account
will be forced through the rotation flow on first login (see step 5).

The matching `admin_profiles` row is what lets `requireAdmin()` allow the
session through — without it, even an authenticated Supabase user is
rejected (and signed out) by the login action.

## 4. Verify access

1. Run `npm run dev` (or hit production).
2. Visit `/de/admin` → you should be redirected to `/de/admin/login`.
3. Log in with the email + password from step 3a.
4. Because `must_change_password` defaults to `true`, the login redirects
   to `/de/admin/change-password` (see section 5). After setting a new
   password you'll land on the dashboard with the owner role chip and a
   "Booking" tile linking to the read-only requests view.

If something goes wrong:

- "Login fehlgeschlagen" → wrong password or unverified email.
- "Dieser Account hat keinen aktiven Admin-Zugang" → there is no
  matching `admin_profiles` row, or `is_active = false`. Re-run step 3b
  or flip the boolean.

## 5. First-login password rotation

Every freshly provisioned admin row starts with `must_change_password =
true`. The Admin shell honours that flag:

- After login, the user is redirected to `/[locale]/admin/change-password`.
- `requireAdminWithPasswordOk()` blocks `/admin` and `/admin/booking`
  until the rotation succeeds, so there is no path to the dashboard while
  the initial password is still active.
- The password form requires a minimum length of 12 characters and a
  matching confirmation. Supabase's password policy (configured in the
  Auth settings) is also applied.
- On success the action runs `supabase.auth.updateUser({ password })` for
  the signed-in user, then sets `must_change_password = false` and
  `password_changed_at = now()` on the matching `admin_profiles` row via
  the service-role client (the row has no self-update RLS policy by
  design).
- The user is then redirected to the dashboard.

If you want to force another rotation later (e.g. after a leak, or for a
new owner taking over an existing account):

```sql
update public.admin_profiles
set must_change_password = true, updated_at = now()
where email = 'login@example.com';
```

Their next request to any protected admin route will redirect them to
`/[locale]/admin/change-password` until they set a new password.

## 6. Add another admin

Repeat step 3 with a different email and pick the right role:

```sql
insert into public.admin_profiles
  (user_id, display_name, email, role, is_active)
values
  ('NEW_USER_UUID', 'Display Name', 'login@example.com', 'admin', true);
```

For now, all three roles (`owner` / `admin` / `editor`) get the same
dashboard access. Owner-only mutations land in later phases. The new
account will be forced through the password rotation on first login,
just like the owner.

## 7. Deactivate / re-activate an admin

No user is deleted — flip the `is_active` flag. The next request will fail
the `canAccessAdmin()` check and the session is forced out.

```sql
update public.admin_profiles
set is_active = false, updated_at = now()
where email = 'login@example.com';
```

To re-enable, set it back to `true`.

## 8. Test inactive denial (recommended)

After deactivating yourself in a separate Supabase tab:

1. Reload `/de/admin`.
2. You should be redirected to `/de/admin/login`.
3. Logging in again with the same credentials should fail with the
   "kein aktiver Admin-Zugang" message — proving inactive admins cannot
   reach the dashboard even with valid Supabase credentials.

## 9. Logout

The dashboard header has a Logout button that POSTs to
`/api/admin/auth/logout?locale=<locale>`. The server clears the Supabase
session cookies and redirects back to the login page. The
change-password page exposes the same logout, so an admin who is stuck
on a forced rotation can always sign out.

## 10. Next phase

Phase 04 will introduce the first real Admin CRUD (members, songs, shows,
gallery, legal). Until then, all content edits happen through the SQL
editor — see `supabase/migrations/*.sql` and `supabase/policies/*.sql`
for the schema/RLS contract.
