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
be `owner`.

The matching `admin_profiles` row is what lets `requireAdmin()` allow the
session through — without it, even an authenticated Supabase user is
rejected (and signed out) by the login action.

## 4. Verify access

1. Run `npm run dev` (or hit production).
2. Visit `/de/admin` → you should be redirected to `/de/admin/login`.
3. Log in with the email + password from step 3a.
4. You should land on the dashboard with the owner role chip and a
   "Booking" tile linking to the read-only requests view.

If something goes wrong:

- "Login fehlgeschlagen" → wrong password or unverified email.
- "Dieser Account hat keinen aktiven Admin-Zugang" → there is no
  matching `admin_profiles` row, or `is_active = false`. Re-run step 3b
  or flip the boolean.

## 5. Add another admin

Repeat step 3 with a different email and pick the right role:

```sql
insert into public.admin_profiles
  (user_id, display_name, email, role, is_active)
values
  ('NEW_USER_UUID', 'Display Name', 'login@example.com', 'admin', true);
```

For now, all three roles (`owner` / `admin` / `editor`) get the same
dashboard access. Owner-only mutations land in later phases.

## 6. Deactivate / re-activate an admin

No user is deleted — flip the `is_active` flag. The next request will fail
the `canAccessAdmin()` check and the session is forced out.

```sql
update public.admin_profiles
set is_active = false, updated_at = now()
where email = 'login@example.com';
```

To re-enable, set it back to `true`.

## 7. Test inactive denial (recommended)

After deactivating yourself in a separate Supabase tab:

1. Reload `/de/admin`.
2. You should be redirected to `/de/admin/login`.
3. Logging in again with the same credentials should fail with the
   "kein aktiver Admin-Zugang" message — proving inactive admins cannot
   reach the dashboard even with valid Supabase credentials.

## 8. Logout

The dashboard header has a Logout button that POSTs to
`/api/admin/auth/logout?locale=<locale>`. The server clears the Supabase
session cookies and redirects back to the login page.

## 9. Next phase

Phase 04 will introduce the first real Admin CRUD (members, songs, shows,
gallery, legal). Until then, all content edits happen through the SQL
editor — see `supabase/migrations/*.sql` and `supabase/policies/*.sql`
for the schema/RLS contract.
