# 01 – Typhoon Website Roadmap

## Work method

Claude Code should work phase by phase.

Each phase:
- read `CLAUDE.md`
- read `docs/00-project-source-of-truth.md`
- read `docs/02-claude-workflow.md`
- read the active phase file
- implement only that phase
- run lint/build
- push
- summarize
- stop

## Phase overview

### Phase 01 – Booking + Content Foundation

File:

```text
docs/phases/01-booking-content-foundation.md
```

Goal:
- production-ready Booking foundation
- Supabase-first/static-fallback content provider
- no Admin UI yet

### Phase 02 – Supabase Schema, RLS and Storage

File:

```text
docs/phases/02-supabase-schema-rls-storage.md
```

Goal:
- finalize schema/migrations/RLS/storage buckets
- seed structure
- no full Admin CRUD yet

### Phase 03 – Admin Auth + Dashboard

File:

```text
docs/phases/03-admin-auth-dashboard.md
```

Goal:
- Supabase Auth login
- protected Admin shell
- dashboard
- active admin profile checks

### Phase 04 – Admin Content CRUD

File:

```text
docs/phases/04-admin-content-crud.md
```

Goal:
- edit texts, members, shows, platform links, legal pages, SEO
- no complex media/audio upload yet

### Phase 05 – Admin Media + Audio Uploads

File:

```text
docs/phases/05-admin-media-audio-uploads.md
```

Goal:
- Supabase Storage uploads
- image/audio validation
- gallery/audio/member image management

### Phase 06 – Legal, SEO, Consent and Platforms

File:

```text
docs/phases/06-legal-seo-consent-platforms.md
```

Goal:
- finalize cookie/consent behavior
- platform links
- external embeds only after consent
- SEO/OpenGraph

### Phase 07 – Shop Preparation

File:

```text
docs/phases/07-shop-preparation.md
```

Goal:
- prepare architecture for merch/tickets/albums
- no premature full payment system unless explicitly requested

### Phase 08 – Launch Hardening

File:

```text
docs/phases/08-launch-hardening.md
```

Goal:
- final QA, security, performance, deployment, legal review checklist

## Important

Do not skip phases.

Do not mix large future work into the current phase.

If a phase reveals a critical blocker, document it and stop after a safe partial implementation.
