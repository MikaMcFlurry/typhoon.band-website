-- Typhoon — Phase 04 RLS hardening for booking workflow + shows admin.
-- Apply via: psql -f supabase/policies/0005_booking_show_workflow.sql
--
-- Additive only. Re-runs are safe — every policy is dropped before being
-- recreated. No public read/write is ever opened on booking_requests or
-- admin_profiles. The public shows policy is tightened so soft-hidden /
-- unpublished shows never leak through the anon client.
--
-- ---------------------------------------------------------------------
-- shows: public reads must respect both is_visible AND is_published.
-- The 0001_rls.sql public select policy was `using (is_visible = true)`
-- only. With the new is_published flag we restrict the public reader to
-- rows that are both visible and published.
-- ---------------------------------------------------------------------
drop policy if exists "public_read_visible_shows" on public.shows;
create policy "public_read_visible_shows" on public.shows
  for select using (is_visible = true and is_published = true);

drop policy if exists "public_read_show_translations" on public.show_translations;
create policy "public_read_show_translations" on public.show_translations
  for select using (
    exists (
      select 1 from public.shows s
      where s.id = show_id
        and s.is_visible = true
        and s.is_published = true
    )
  );

-- ---------------------------------------------------------------------
-- booking_requests: stay private. Document the contract explicitly.
-- All Admin reads/writes go through the service-role client behind a
-- requireAdmin() guard. Public anon must never see anything.
-- ---------------------------------------------------------------------
drop policy if exists "public_read_booking_requests" on public.booking_requests;
drop policy if exists "public_write_booking_requests" on public.booking_requests;
