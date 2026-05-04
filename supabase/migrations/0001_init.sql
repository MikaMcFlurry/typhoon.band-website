-- Typhoon — initial schema
-- Drafted from docs/05-supabase-data-model.md
-- Apply via: supabase db push  (requires linked project)

create extension if not exists "pgcrypto";

-- Roles enumeration kept loose via check constraints for portability.

create table if not exists public.admin_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users (id) on delete cascade,
  display_name  text,
  email         text,
  role          text not null default 'editor' check (role in ('owner','admin','editor')),
  is_active     boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null,
  url        text not null,
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.legal_page_translations (
  id            uuid primary key default gen_random_uuid(),
  legal_page_id uuid not null references public.legal_pages (id) on delete cascade,
  locale        text not null,
  title         text not null,
  body_md       text not null,
  unique (legal_page_id, locale)
);

create table if not exists public.band_members (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  photo_url  text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.band_member_translations (
  id              uuid primary key default gen_random_uuid(),
  band_member_id  uuid not null references public.band_members (id) on delete cascade,
  locale          text not null,
  name            text not null,
  role            text not null,
  bio_md          text,
  unique (band_member_id, locale)
);

create table if not exists public.songs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  audio_url       text,
  cover_image_url text,
  status          text not null default 'demo' check (status in ('demo','single','album_track','unreleased')),
  is_streamable   boolean not null default true,
  is_downloadable boolean not null default false,
  is_featured     boolean not null default false,
  sort_order      int not null default 0,
  is_visible      boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.shows (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  venue       text not null,
  city        text,
  country     text,
  ticket_url  text,
  is_visible  boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.show_translations (
  id      uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows (id) on delete cascade,
  locale  text not null,
  notes   text,
  unique (show_id, locale)
);

create table if not exists public.booking_requests (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  phone           text,
  event_date      date,
  event_location  text,
  event_type      text,
  message         text not null,
  status          text not null default 'new' check (status in ('new','read','answered','done','spam')),
  ip_hash         text,
  user_agent      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.media_items (
  id            uuid primary key default gen_random_uuid(),
  type          text not null check (type in ('image','video')),
  file_url      text not null,
  thumbnail_url text,
  category      text,
  sort_order    int not null default 0,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.seo_entries (
  id         uuid primary key default gen_random_uuid(),
  path       text not null,
  locale     text not null,
  title      text,
  description text,
  og_image_url text,
  unique (path, locale)
);

create table if not exists public.consent_settings (
  id          uuid primary key default gen_random_uuid(),
  category    text not null unique,
  label       text not null,
  description text,
  is_required boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- Common updated_at trigger.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'admin_profiles','site_settings','platform_links','legal_pages',
    'band_members','songs','shows','booking_requests','media_items',
    'consent_settings'
  ])
  loop
    execute format(
      'drop trigger if exists trg_%s_updated_at on public.%I; ' ||
      'create trigger trg_%s_updated_at before update on public.%I ' ||
      'for each row execute function public.set_updated_at();',
      t, t, t, t
    );
  end loop;
end $$;
