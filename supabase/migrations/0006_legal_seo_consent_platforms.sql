-- Typhoon — Phase 06 additive migration.
-- Apply via: psql -f supabase/migrations/0006_legal_seo_consent_platforms.sql
--
-- Phase 06 covers Legal pages, SEO entries, Platform links and Consent
-- settings. The base tables already exist in 0001_init.sql, so this
-- migration is purely additive / idempotent. It seeds the three legal
-- page rows so the Admin always has imprint/privacy/cookies pages to
-- edit, even on a fresh database, and seeds the default consent
-- categories so the public banner can render labels without the Admin
-- having to seed them by hand.

-- ---------------------------------------------------------------
-- legal_pages: seed rows for imprint/privacy/cookies if absent.
-- Pages start as drafts (is_published = false) so the public fallback
-- from src/data/* keeps rendering until the Admin actively publishes.
-- ---------------------------------------------------------------
insert into public.legal_pages (slug, is_published)
values
  ('imprint', false),
  ('privacy', false),
  ('cookies', false)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------
-- platform_links: enforce platform name validation via a CHECK that
-- only allows the supported list. Existing rows with platforms outside
-- the list will block this migration; the seeded environment ships
-- empty so this is safe on a clean database.
-- ---------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'platform_links_platform_chk'
      and conrelid = 'public.platform_links'::regclass
  ) then
    alter table public.platform_links
      add constraint platform_links_platform_chk
      check (platform in (
        'spotify','youtube','instagram','facebook','soundcloud','bandcamp'
      ));
  end if;
end $$;

-- ---------------------------------------------------------------
-- consent_settings: seed the three categories the public banner cares
-- about. `is_required = true` for "necessary" so the UI cannot toggle
-- it off. Statistics is left as a future placeholder (no analytics
-- ships in Phase 06 — see docs/phases/06-legal-seo-consent-platforms.md).
-- ---------------------------------------------------------------
insert into public.consent_settings (category, label, description, is_required)
values
  (
    'necessary',
    'Notwendig',
    'Technisch erforderliche Cookies für sichere Verbindungen und grundlegende Funktionen.',
    true
  ),
  (
    'external_media',
    'Externe Medien',
    'Eingebettete Inhalte externer Anbieter (z. B. YouTube, Spotify, SoundCloud, Bandcamp). Erst nach Zustimmung wird eine Verbindung aufgebaut.',
    false
  ),
  (
    'statistics',
    'Statistiken',
    'Aktuell nicht aktiv. Falls später Statistik-Tools eingebunden werden, lassen sie sich hier erlauben.',
    false
  )
on conflict (category) do nothing;

-- ---------------------------------------------------------------
-- seo_entries: ensure (path, locale) lookups are cheap. The unique
-- constraint from 0001 already covers this, but a dedicated path-only
-- index helps the Admin list view.
-- ---------------------------------------------------------------
create index if not exists seo_entries_path_idx
  on public.seo_entries (path);
