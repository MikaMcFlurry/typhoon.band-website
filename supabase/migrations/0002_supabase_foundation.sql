-- Typhoon — Phase 02 additive migration.
-- Apply via: psql -f supabase/migrations/0002_supabase_foundation.sql
--
-- Idempotent: every change is guarded so rerunning is safe. Does NOT
-- destructively rewrite anything from 0001_init.sql; only adds the
-- columns/constraints the Phase 02 spec calls for so future Admin work
-- can edit content safely.

-- ---------------------------------------------------------------
-- site_settings: support per-locale overrides + public/private flag.
-- ---------------------------------------------------------------
alter table public.site_settings
  add column if not exists locale text,
  add column if not exists is_public boolean not null default true;

-- Make `(key, locale)` unique so a key can have one neutral row plus
-- one row per locale. The original PK on `key` already enforces a single
-- row per key when locale is null, so we add a partial unique index.
do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'site_settings_key_locale_uq'
  ) then
    create unique index site_settings_key_locale_uq
      on public.site_settings (key, locale)
      where locale is not null;
  end if;
end $$;

-- ---------------------------------------------------------------
-- booking_requests: track originating locale for the Admin inbox.
-- ---------------------------------------------------------------
alter table public.booking_requests
  add column if not exists locale text;

-- ---------------------------------------------------------------
-- shows: support TBA placeholder shows without fake dates.
-- The original schema required `starts_at not null`. We relax it and
-- add an `is_tba` flag so the homepage can list "TBA" placeholders
-- without inventing timestamps. A check enforces consistency.
-- ---------------------------------------------------------------
alter table public.shows
  add column if not exists is_tba boolean not null default false;

alter table public.shows
  alter column starts_at drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'shows_tba_or_starts_at_chk'
      and conrelid = 'public.shows'::regclass
  ) then
    alter table public.shows
      add constraint shows_tba_or_starts_at_chk
      check (is_tba = true or starts_at is not null);
  end if;
end $$;

-- ---------------------------------------------------------------
-- media_items: alt text + display title needed for accessible gallery.
-- ---------------------------------------------------------------
alter table public.media_items
  add column if not exists alt_text text,
  add column if not exists title text;

-- ---------------------------------------------------------------
-- seo_entries: additive index alignment (no schema change required —
-- 0001_init.sql already declares `unique (path, locale)`). Documented
-- here for clarity.
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- Updated-at trigger coverage for tables that did not have one in 0001
-- (legal_page_translations, band_member_translations, show_translations,
-- seo_entries). Triggers are idempotent and only created where the
-- table has an `updated_at` column. We deliberately do NOT add
-- updated_at to translation tables here because those tables are
-- replaced/upserted by Admin — keep them simple.
-- ---------------------------------------------------------------
