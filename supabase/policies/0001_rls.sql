-- Typhoon — RLS policies
-- Source: docs/06-security-rls.md
-- Apply via: psql -f supabase/policies/0001_rls.sql  (or include in migrations)

-- Enable RLS on every public.* table.
alter table public.admin_profiles          enable row level security;
alter table public.site_settings           enable row level security;
alter table public.platform_links          enable row level security;
alter table public.legal_pages             enable row level security;
alter table public.legal_page_translations enable row level security;
alter table public.band_members            enable row level security;
alter table public.band_member_translations enable row level security;
alter table public.songs                   enable row level security;
alter table public.shows                   enable row level security;
alter table public.show_translations       enable row level security;
alter table public.booking_requests        enable row level security;
alter table public.media_items             enable row level security;
alter table public.seo_entries             enable row level security;
alter table public.consent_settings        enable row level security;

-- Helper: is the auth.uid() linked to an active admin profile?
create or replace function public.is_active_admin()
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.is_active = true
  )
$$;

create or replace function public.is_owner()
returns boolean language sql stable as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = auth.uid()
      and ap.is_active = true
      and ap.role = 'owner'
  )
$$;

-- Public read policies (visible/published rows only).

drop policy if exists "public_read_visible_band_members" on public.band_members;
create policy "public_read_visible_band_members" on public.band_members
  for select using (is_visible = true);

drop policy if exists "public_read_band_member_translations" on public.band_member_translations;
create policy "public_read_band_member_translations" on public.band_member_translations
  for select using (
    exists (
      select 1 from public.band_members bm
      where bm.id = band_member_id and bm.is_visible = true
    )
  );

drop policy if exists "public_read_streamable_songs" on public.songs;
create policy "public_read_streamable_songs" on public.songs
  for select using (is_visible = true and is_streamable = true);

drop policy if exists "public_read_visible_shows" on public.shows;
create policy "public_read_visible_shows" on public.shows
  for select using (is_visible = true);

drop policy if exists "public_read_show_translations" on public.show_translations;
create policy "public_read_show_translations" on public.show_translations
  for select using (
    exists (
      select 1 from public.shows s
      where s.id = show_id and s.is_visible = true
    )
  );

drop policy if exists "public_read_visible_media" on public.media_items;
create policy "public_read_visible_media" on public.media_items
  for select using (is_visible = true);

drop policy if exists "public_read_active_platform_links" on public.platform_links;
create policy "public_read_active_platform_links" on public.platform_links
  for select using (is_active = true);

drop policy if exists "public_read_published_legal_pages" on public.legal_pages;
create policy "public_read_published_legal_pages" on public.legal_pages
  for select using (is_published = true);

drop policy if exists "public_read_legal_translations" on public.legal_page_translations;
create policy "public_read_legal_translations" on public.legal_page_translations
  for select using (
    exists (
      select 1 from public.legal_pages lp
      where lp.id = legal_page_id and lp.is_published = true
    )
  );

drop policy if exists "public_read_seo" on public.seo_entries;
create policy "public_read_seo" on public.seo_entries
  for select using (true);

drop policy if exists "public_read_consent" on public.consent_settings;
create policy "public_read_consent" on public.consent_settings
  for select using (true);

-- Booking requests: NO public read or write. Server-side service role only.
-- Admin profiles: NO public read.

-- Admin write policies — only active admins may write content tables.
do $$
declare t text;
begin
  for t in select unnest(array[
    'site_settings','platform_links','legal_pages','legal_page_translations',
    'band_members','band_member_translations','songs','shows',
    'show_translations','media_items','seo_entries','consent_settings'
  ])
  loop
    execute format('drop policy if exists "%s_admin_write" on public.%I;', t, t);
    execute format(
      'create policy "%s_admin_write" on public.%I for all to authenticated ' ||
      'using (public.is_active_admin()) with check (public.is_active_admin());',
      t, t
    );
  end loop;
end $$;

-- Owner-only mutations on legal pages once admin is enforced.
drop policy if exists "legal_pages_owner_only_delete" on public.legal_pages;
create policy "legal_pages_owner_only_delete" on public.legal_pages
  for delete to authenticated
  using (public.is_owner());

-- admin_profiles is readable/writable only by owner; admins read self.
drop policy if exists "admin_profiles_owner_all" on public.admin_profiles;
create policy "admin_profiles_owner_all" on public.admin_profiles
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

drop policy if exists "admin_profiles_self_read" on public.admin_profiles;
create policy "admin_profiles_self_read" on public.admin_profiles
  for select to authenticated
  using (user_id = auth.uid());
