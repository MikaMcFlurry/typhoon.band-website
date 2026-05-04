# 06 – Security and RLS

## Mandatory

- Enable RLS on all public schema tables.
- Public users can read only published/visible content.
- Public users cannot write content tables.
- Booking form may insert booking_requests through server-side code only.
- Admin writes require authenticated active admin profile.
- Owner-only areas require role = owner.
- Service role key must never be sent to the browser.

## Role model

```text
owner
admin
editor
```

## Public read policy concept

Public can read:
- active platform links
- published legal pages
- visible band members
- visible/streamable songs
- visible shows
- visible media
- SEO entries

Public cannot read:
- admin_profiles
- booking_requests

## Booking security

Booking submission must be server-side validated:
- name required
- email required and valid
- message required
- honeypot or simple spam field
- optional rate-limit placeholder
- do not store raw IP unless necessary; prefer hash or omit

## Critical no-gos

- no `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*`
- no client-side-only admin protection
- no public writable content tables
- no raw unvalidated uploads
- no legal edits by non-owner in final admin
