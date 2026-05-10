# Current Task – Phase 03b Initial Admin Password Flow

## Current Phase

Active phase:

```text
docs/phases/03b-initial-admin-password-flow.md
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

This phase builds directly on Phase 03 Admin Auth.

Do not redesign the public website.
Do not build Admin content CRUD.
Do not build uploads.

## Current Goal

Adjust the Admin login flow to support:

1. Admin user with e-mail + initial password.
2. Active `admin_profiles` row.
3. Forced one-time password change after first login.
4. No access to Admin dashboard until password was changed.
5. Clear documentation for first owner setup.

## This Phase Must Implement

- additive migration for password-change state
- `must_change_password` guard
- `/[locale]/admin/change-password`
- redirect after first login if password change is required
- secure password update through Supabase Auth
- update `admin_profiles` after successful password change
- admin setup documentation

## This Phase Must Not Implement

- full Admin CRUD
- Admin user management UI
- media/audio uploads
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

Push this phase as its own branch/commit.

Then stop and summarize:
- changed files
- database/migration changes
- initial admin setup flow
- forced password-change behavior
- security notes
- manual test steps
- lint/build result
- next recommended phase
