-- Typhoon — Phase 02 Supabase Storage buckets.
-- Apply via: psql -f supabase/migrations/0003_storage_buckets.sql
--
-- Buckets are created public-read because they hold public website
-- assets only. Frontend code must NOT scan storage directories — it
-- only renders files referenced by published DB records (songs.audio_url,
-- band_members.photo_url, media_items.file_url, …).
--
-- Writes (insert/update/delete) are restricted to:
--   - the service role (server-side), OR
--   - authenticated users with an active admin profile.
--
-- Run this AFTER 0001_init.sql + 0001_rls.sql + 0002_supabase_foundation.sql
-- so the `public.is_active_admin()` helper already exists.

-- ---------------------------------------------------------------
-- Buckets
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('public-media',  'public-media',  true),
  ('audio-demos',   'audio-demos',   true),
  ('member-images', 'member-images', true),
  ('gallery',       'gallery',       true),
  ('legal-assets',  'legal-assets',  true)
on conflict (id) do update set public = excluded.public;

-- ---------------------------------------------------------------
-- Public read policy — one row per managed bucket.
-- Re-runs are safe because each policy is dropped first.
-- ---------------------------------------------------------------
drop policy if exists "typhoon_public_read_public_media"  on storage.objects;
create policy "typhoon_public_read_public_media"
  on storage.objects for select
  using (bucket_id = 'public-media');

drop policy if exists "typhoon_public_read_audio_demos"   on storage.objects;
create policy "typhoon_public_read_audio_demos"
  on storage.objects for select
  using (bucket_id = 'audio-demos');

drop policy if exists "typhoon_public_read_member_images" on storage.objects;
create policy "typhoon_public_read_member_images"
  on storage.objects for select
  using (bucket_id = 'member-images');

drop policy if exists "typhoon_public_read_gallery"       on storage.objects;
create policy "typhoon_public_read_gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "typhoon_public_read_legal_assets"  on storage.objects;
create policy "typhoon_public_read_legal_assets"
  on storage.objects for select
  using (bucket_id = 'legal-assets');

-- ---------------------------------------------------------------
-- Admin write policies — authenticated active admins only. The
-- service role bypasses RLS so server-side writes still work.
-- ---------------------------------------------------------------
do $$
declare b text;
begin
  for b in select unnest(array[
    'public-media','audio-demos','member-images','gallery','legal-assets'
  ])
  loop
    execute format(
      'drop policy if exists "typhoon_admin_write_%s" on storage.objects;',
      replace(b, '-', '_')
    );
    execute format(
      'create policy "typhoon_admin_write_%s" on storage.objects ' ||
      'for all to authenticated ' ||
      'using (bucket_id = %L and public.is_active_admin()) ' ||
      'with check (bucket_id = %L and public.is_active_admin());',
      replace(b, '-', '_'), b, b
    );
  end loop;
end $$;
