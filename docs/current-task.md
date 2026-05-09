# Current Task – Phase 01 Booking + Content Foundation

## Current Phase

Active phase:

```text
docs/phases/01-booking-content-foundation.md
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
Do not change visual layout unless the active phase explicitly requires a bug fix.

## Current Goal

Prepare the finished website architecture so all current static content and GitHub assets can later be replaced through Supabase/Admin content.

Booking is the first important production function.

## This Phase Must Implement

- production-ready Booking foundation
- Supabase-first/static-fallback content provider
- Resend-ready booking email flow
- Supabase booking insert if configured
- no hard crash when env vars are missing
- documentation for Vercel/Supabase/Resend setup

## This Phase Must Not Implement

- full Admin CRUD
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
- Booking status
- Supabase content provider status
- fallback behavior
- env vars needed
- lint/build result
- next recommended phase
