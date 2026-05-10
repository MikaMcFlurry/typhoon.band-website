# Current Task – Phase 01b Booking Email Design

## Current Phase

Active phase:

```text
docs/phases/01b-booking-email-design.md
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

Booking is already functional.

This phase must only improve the visual quality and clarity of the booking email that is sent to:

```text
booking@typhoon.band
```

## This Phase Must Implement

- visually polished HTML email template
- readable plain-text fallback
- clean booking data formatting
- Reply-To remains sender email
- no frontend design changes
- no new backend feature creep

## This Phase Must Not Implement

- full Admin CRUD
- shop
- payment
- analytics
- external embeds
- frontend redesign
- Supabase schema phase work

## Finish Criteria

Run:

```bash
npm run lint
npm run build
```

Push this phase as its own commit/branch.

Then stop and summarize:
- changed files
- email template changes
- booking behavior preserved
- env vars needed
- lint/build result
- next recommended phase
