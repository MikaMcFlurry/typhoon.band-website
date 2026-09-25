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

-- Size + MIME limits enforced by Storage itself (mirror
-- src/lib/validation/upload.ts), so a signed upload URL cannot be used for
-- arbitrary files. Same statements as 0007_security_hardening.sql.
update storage.buckets
   set file_size_limit = 52428800, -- 50 MB
       allowed_mime_types = array['audio/mpeg', 'audio/mp3']
 where id = 'audio-demos';

update storage.buckets
   set file_size_limit = 10485760, -- 10 MB
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id in ('public-media', 'member-images', 'gallery');

update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
 where id = 'legal-assets';

-- ---------------------------------------------------------------
-- No public SELECT policy on storage.objects.
-- Public buckets serve files by URL without one; a SELECT policy would
-- only let anonymous visitors LIST every object (hidden demos included).
-- Older versions of this file created "typhoon_public_read_*" policies;
-- they are dropped here so a re-run can never re-open listing (same as
-- 0007_security_hardening.sql).
-- ---------------------------------------------------------------
drop policy if exists "typhoon_public_read_public_media"  on storage.objects;
drop policy if exists "typhoon_public_read_audio_demos"   on storage.objects;
drop policy if exists "typhoon_public_read_member_images" on storage.objects;
drop policy if exists "typhoon_public_read_gallery"       on storage.objects;
drop policy if exists "typhoon_public_read_legal_assets"  on storage.objects;

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
