# Phase 02 – Supabase Schema, RLS and Storage

## Goal

Finalize Supabase schema, RLS policies and Storage bucket plan so the Admin can safely manage content later.

## Build

- review existing migrations
- update tables if needed for Admin-editable content
- ensure locale/translations are possible
- ensure published/visible flags exist
- ensure sort_order exists
- ensure RLS is enabled
- add storage bucket SQL/policies if appropriate
- add seed guidance, not hard-coded production content

## Tables required

At minimum:

```text
admin_profiles
site_settings
platform_links
legal_pages
legal_page_translations
band_members
band_member_translations
songs
shows
show_translations
booking_requests
media_items
seo_entries
consent_settings
```

Add/adjust tables only if needed.

## Storage buckets

Prepare:

```text
public-media
audio-demos
member-images
gallery
legal-assets
```

## RLS

Public can read only:
- published/visible content
- active platform links
- visible media
- visible/streamable songs
- published legal pages
- visible shows

Public cannot read:
- booking requests
- admin profiles
- drafts
- private files

Admin can write only if active admin profile.

Owner-only:
- admin user management
- legal owner controls if needed
- technical settings

## Do not build

- Admin UI
- full upload UI
- shop
- payment
