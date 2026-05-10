-- Typhoon — Phase 03b additive migration: initial admin password flow.
-- Apply via: psql -f supabase/migrations/0004_admin_password_flow.sql
--
-- Idempotent and additive. Adds three columns to public.admin_profiles so
-- the Admin shell can force a password change on the first login of every
-- newly provisioned account. Defaults follow Phase 03b's
-- docs/phases/03b-initial-admin-password-flow.md contract: the column
-- defaults to `false`, and the first-owner / "add another admin" SQL
-- inserts explicitly set `must_change_password = true` plus
-- `initial_password_issued_at = now()` (see docs/admin-setup.md).
--
--   must_change_password         — false by default; explicitly set to
--                                  true at insert time for newly
--                                  provisioned admins, then flipped to
--                                  false after the user successfully sets
--                                  a new password through the
--                                  /[locale]/admin/change-password flow.
--   password_changed_at          — timestamptz of the last successful
--                                  password rotation; null until the
--                                  first rotation completes.
--   initial_password_issued_at   — timestamptz captured at provisioning
--                                  time so we can audit when the initial
--                                  password was handed out out-of-band.
--                                  Cleared/left as-is after rotation.

alter table public.admin_profiles
  add column if not exists must_change_password       boolean not null default false,
  add column if not exists password_changed_at        timestamptz,
  add column if not exists initial_password_issued_at timestamptz;

comment on column public.admin_profiles.must_change_password is
  'If true, admin must change password before accessing dashboard.';
comment on column public.admin_profiles.initial_password_issued_at is
  'Timestamp when the initial out-of-band password was issued to the admin.';
