-- Typhoon — Phase 03b additive migration: initial admin password flow.
-- Apply via: psql -f supabase/migrations/0004_admin_password_flow.sql
--
-- Idempotent and additive. Adds two columns to public.admin_profiles so the
-- Admin shell can force a password change on the first login of every newly
-- provisioned account. No data is rewritten beyond the `not null` defaults
-- ensured for existing rows.
--
--   must_change_password  — true on insert; flipped to false after the user
--                           successfully sets a new password through the
--                           /[locale]/admin/change-password flow.
--   password_changed_at   — timestamptz of the last successful password
--                           rotation; null until the first rotation.

alter table public.admin_profiles
  add column if not exists must_change_password boolean not null default true,
  add column if not exists password_changed_at  timestamptz;

-- Existing rows already get `true` from the default, but be defensive:
-- treat any NULL (in case the column existed but was nullable) as "must
-- change" so legacy admins are forced through the rotation on next login.
update public.admin_profiles
   set must_change_password = true
 where must_change_password is null;
