# Current Task – Phase 03 Admin Auth + Dashboard

## Current Phase

Active phase:

```text
docs/phases/03-admin-auth-dashboard.md
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

The public frontend design is approved.

Do not redesign the public website.
Do not change the public layout.

## Current Goal

Build the secure Admin foundation:
- Supabase Auth login
- protected Admin route group
- active admin profile guard
- role helpers
- logout
- dashboard overview
- Booking requests list/read-only view

## This Phase Must Implement

- secure Admin login/logout flow
- `/[locale]/admin` protected by server-side checks
- active admin profile lookup from `admin_profiles`
- owner/admin/editor role helper foundation
- Admin dashboard cards
- read-only Booking requests overview using Supabase
- clear setup instructions for creating the first owner admin

## This Phase Must Not Implement

- full content CRUD
- media/audio upload UI
- shop
- payment
- analytics
- external embeds
- public frontend redesign

## Finish Criteria

Run:

```bash
npm run lint
npm run build
```

Push this phase as its own commit/branch.

Then stop and summarize:
- changed files
- auth/login behavior
- admin protection
- dashboard modules
- booking requests view
- first owner setup steps
- env vars needed
- lint/build result
- next recommended phase
