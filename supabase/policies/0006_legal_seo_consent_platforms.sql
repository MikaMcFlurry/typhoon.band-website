-- Typhoon — Phase 06 RLS adjustments.
-- Apply via: psql -f supabase/policies/0006_legal_seo_consent_platforms.sql
--
-- The base policies from 0001_rls.sql already cover the tables this
-- phase touches:
--   - public can read published legal pages + translations
--   - public can read active platform_links
--   - public can read seo_entries
--   - public can read consent_settings
--   - active admins can write all the above
--
-- This file re-asserts those policies idempotently so the Phase 06
-- environment can be brought up from any starting point without having
-- to re-run 0001_rls.sql.

alter table public.legal_pages             enable row level security;
alter table public.legal_page_translations enable row level security;
alter table public.seo_entries             enable row level security;
alter table public.platform_links          enable row level security;
alter table public.consent_settings        enable row level security;

-- Public read — published legal pages only.
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

-- SEO + consent + active platform links are public-readable.
drop policy if exists "public_read_seo" on public.seo_entries;
create policy "public_read_seo" on public.seo_entries
  for select using (true);

drop policy if exists "public_read_consent" on public.consent_settings;
create policy "public_read_consent" on public.consent_settings
  for select using (true);

drop policy if exists "public_read_active_platform_links" on public.platform_links;
create policy "public_read_active_platform_links" on public.platform_links
  for select using (is_active = true);

-- Admin writes — restricted to active admin profiles. This mirrors the
-- generic admin_write policies from 0001_rls.sql and keeps the Phase 06
-- contract self-contained.
do $$
declare t text;
begin
  for t in select unnest(array[
    'legal_pages','legal_page_translations','seo_entries',
    'platform_links','consent_settings'
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
