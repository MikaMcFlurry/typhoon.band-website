# Current Task – Phase 04 Booking Workflow + Shows Admin

## Current Phase

Active phase:

```text
docs/phases/04-booking-shows-workflow.md
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
Do not change public layout unless required to display real Supabase shows correctly.

## Current Goal

Extend the Admin so bookings can be managed and converted into public shows.

This phase connects the current Booking admin area with the Shows system.

## This Phase Must Implement

- correct admin setup documentation order:
  1. create Supabase Auth user manually
  2. then run SQL to create/link admin_profiles row
- Booking detail view
- Booking delete/archive action
- Booking status handling
- Convert booking to show flow
- Shows admin list/create/edit/delete
- Supabase schema support for booking/show linking
- public Shows section reads visible Supabase shows and keeps fallback if empty

## This Phase Must Not Implement

- full website content CRUD
- member CRUD
- gallery/media uploads
- audio uploads
- shop checkout/payment
- analytics
- external embeds
- public frontend redesign

## Finish Criteria

Run:

```bash
npm run lint
npm run build
```

Push this phase as its own branch/commit.

Then stop and summarize:
- changed files
- booking workflow changes
- booking delete/archive behavior
- convert-to-show behavior
- shows admin CRUD
- public shows behavior
- migration/RLS changes
- setup docs correction
- manual test steps
- lint/build result
- next recommended phase
