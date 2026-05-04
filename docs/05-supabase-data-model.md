# 05 – Supabase Data Model

## Purpose

Supabase will provide:
- Auth
- Postgres
- Storage
- later Admin content management
- booking request storage
- media/audio metadata

## Core tables

Create SQL migrations under `supabase/migrations/`.

Required tables:
- admin_profiles
- site_settings
- platform_links
- legal_pages
- legal_page_translations
- band_members
- band_member_translations
- songs
- shows
- show_translations
- booking_requests
- media_items
- seo_entries
- consent_settings

## Important fields

### admin_profiles
```text
id uuid primary key
user_id uuid references auth.users
display_name text
email text
role text check owner/admin/editor
is_active boolean
last_login_at timestamptz
created_at timestamptz
updated_at timestamptz
```

### booking_requests
```text
id uuid primary key
name text
email text
phone text null
event_date date null
event_location text
event_type text
message text
status text check new/read/answered/done/spam
ip_hash text null
user_agent text null
created_at timestamptz
updated_at timestamptz
```

### songs
```text
id uuid primary key
title text
slug text unique
audio_url text
cover_image_url text
status text check demo/single/album_track/unreleased
is_streamable boolean
is_downloadable boolean default false
is_featured boolean
sort_order int
is_visible boolean
created_at timestamptz
updated_at timestamptz
```

### media_items
```text
id uuid primary key
type text
file_url text
thumbnail_url text
category text
sort_order int
is_visible boolean
created_at timestamptz
updated_at timestamptz
```

## Data model note

Static seed data may be used in the frontend initially, but schema/migrations must be ready for later Admin CRUD.
