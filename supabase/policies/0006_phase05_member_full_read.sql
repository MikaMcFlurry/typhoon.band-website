-- Typhoon — Phase 05 fix: expose all `band_members` rows (visible AND
-- hidden) so the public reader can merge per-slug with the static
-- fallback list. The previous policy filtered `is_visible = true`,
-- which made hidden rows invisible to the public client — but the
-- frontend needs to *know* a row was hidden so it can drop the
-- corresponding fallback member instead of showing it again.
--
-- Apply via: psql -f supabase/policies/0006_phase05_member_full_read.sql
--
-- Member rows are intentionally public-facing data (names, roles,
-- bios, photo URLs). No sensitive columns live in this table, so a
-- `using (true)` policy is safe.

drop policy if exists "public_read_visible_band_members" on public.band_members;
drop policy if exists "public_read_band_members" on public.band_members;
create policy "public_read_band_members" on public.band_members
  for select using (true);

drop policy if exists "public_read_band_member_translations" on public.band_member_translations;
create policy "public_read_band_member_translations" on public.band_member_translations
  for select using (true);
