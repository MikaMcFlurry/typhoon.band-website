# Current Task – Phase 02 Supabase Schema, RLS and Storage

## Current Phase

Active phase:

```text
docs/phases/02-supabase-schema-rls-storage.md
```

## Working Rule

Claude Code must work step by step.

Read only:
1. `CLAUDE.md`
2. `docs/00-project-source-of-truth.md`
3. `docs/02-claude-workflow.md`
4. the active phase file listed above

Only open other docs if the active phase explicitly references them.

## Critical Rule

The frontend design is approved.

Do not redesign the frontend.
Do not change visual layout.

## Current Goal

Finalize the Supabase backend foundation so later Admin phases can safely manage:
- texts
- images
- audio demos
- members
- shows
- legal pages
- SEO
- platform links
- booking requests

## This Phase Must Implement

- install/configure `@supabase/supabase-js`
- replace REST-only Supabase booking writer with a safe server-side Supabase client implementation
- finalize SQL migrations for schema and RLS
- prepare Supabase Storage buckets and policies
- make content provider capable of real Supabase reads for public published/visible content
- keep static fallback behavior
- update README/.env/docs

## This Phase Must Not Implement

- full Admin CRUD
- Admin UI pages beyond existing shell
- upload UI
- shop
- payment
- analytics
- external embeds
- frontend redesign

## Finish Criteria

Run:

```bash
npm run lint
npm run build
```

Push this phase as its own commit/branch.

Then stop and summarize:
- changed files
- Supabase SDK/client setup
- schema/migration changes
- RLS/storage policy changes
- content provider read status
- booking storage status
- env vars needed
- lint/build result
- next recommended phase
