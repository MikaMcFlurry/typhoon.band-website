-- Typhoon — 0007 security hardening (optional, recommended).
--
-- The redesigned website does NOT require this migration; it only closes
-- gaps found in the redesign audit. Apply after 0001–0006 via the Supabase
-- SQL editor or: psql -f supabase/migrations/0007_security_hardening.sql
-- Idempotent: safe to run more than once.
--
-- 1. Storage listing: the old "typhoon_public_read_*" SELECT policies let
--    anonymous visitors LIST every object in the public buckets (so hidden
--    or deleted demo MP3s were enumerable). Public buckets serve files by
--    URL without any SELECT policy, so dropping them keeps the website
--    working while stopping enumeration. Admin access is unchanged
--    ("typhoon_admin_write_*" covers SELECT for active admins; the service
--    role bypasses RLS).
-- 2. Bucket limits: enforce size + MIME type server-side in Storage, so a
--    signed upload URL cannot be abused for arbitrary files.
-- 3. RLS helper functions: SECURITY DEFINER with an empty search_path, as
--    recommended by Supabase, so they no longer depend on the
--    admin_profiles self-read policy and cannot be hijacked via search_path.

-- ---------------------------------------------------------------
-- 1. Stop anonymous listing of storage objects
-- ---------------------------------------------------------------
drop policy if exists "typhoon_public_read_public_media"  on storage.objects;
drop policy if exists "typhoon_public_read_audio_demos"   on storage.objects;
drop policy if exists "typhoon_public_read_member_images" on storage.objects;
drop policy if exists "typhoon_public_read_gallery"       on storage.objects;
drop policy if exists "typhoon_public_read_legal_assets"  on storage.objects;

-- ---------------------------------------------------------------
-- 2. Bucket size + MIME limits (mirror src/lib/validation/upload.ts)
-- ---------------------------------------------------------------
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
-- 3. Hardened RLS helpers (same semantics as 0001_rls.sql)
-- ---------------------------------------------------------------
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.is_active = true
  )
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.is_active = true
      and ap.role = 'owner'
  )
$$;

revoke all on function public.is_active_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_active_admin() to anon, authenticated, service_role;
grant execute on function public.is_owner() to anon, authenticated, service_role;
