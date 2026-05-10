-- Typhoon — Phase 02 RLS hardening.
-- Apply via: psql -f supabase/policies/0002_rls_foundation.sql
--
-- Additive only. Re-runs are safe — each policy is dropped before
-- being recreated. No public read/write is ever opened on
-- booking_requests or admin_profiles.

-- ---------------------------------------------------------------
-- site_settings: limit public reads to rows where is_public = true.
-- The original 0001_rls.sql did not declare a public select policy
-- on site_settings, which means the public site cannot read any
-- settings without a service-role bypass. Open a narrow public read
-- so the content provider can fetch brand/contact text.
-- ---------------------------------------------------------------
drop policy if exists "public_read_public_site_settings" on public.site_settings;
create policy "public_read_public_site_settings" on public.site_settings
  for select using (is_public = true);

-- ---------------------------------------------------------------
-- shows: visible reads must remain visible regardless of is_tba.
-- The 0001_rls.sql public select policy is `is_visible = true`, which
-- already covers TBA shows, so no change is required. Documented here
-- for clarity.
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- consent_settings + seo_entries: stay readable by the public; their
-- 0001_rls.sql policies are already `using (true)`.
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- booking_requests + admin_profiles: explicitly assert there is no
-- public select policy. (DROP POLICY IF EXISTS is a no-op when the
-- policy is missing, which is the desired state.)
-- ---------------------------------------------------------------
drop policy if exists "public_read_booking_requests"  on public.booking_requests;
drop policy if exists "public_read_admin_profiles"    on public.admin_profiles;
