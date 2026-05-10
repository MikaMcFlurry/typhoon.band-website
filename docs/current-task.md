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

The public frontend design is approved.

Do not redesign the public website.
Do not change the public layout.

## Current Goal

Force every freshly provisioned admin to set their own password before
they can use any other Admin route:
- additive migration for `admin_profiles` password-change fields
- guard that redirects active admins with `must_change_password = true`
  to a dedicated change-password page
- /[locale]/admin/change-password page with Supabase Auth password update
- mark `must_change_password = false` and stamp `password_changed_at`
  after a successful change
- block dashboard and booking access until password is changed

## This Phase Must Implement

- additive SQL migration adding `must_change_password` and
  `password_changed_at` to `admin_profiles`
- typed helpers (`requireAdminWithPasswordOk`) that route
  `must_change_password = true` admins to the change-password page
- a server-protected `/[locale]/admin/change-password` page with a
  client form (new password + confirmation, min length, German copy)
- server action that calls `supabase.auth.updateUser({ password })`,
  then sets `must_change_password = false` and `password_changed_at = now()`
- updated `docs/admin-setup.md` and `README.md` describing the flow

## This Phase Must Not Implement

- full content CRUD
- Admin user management UI
- media/audio upload UI
- shop / payment / analytics / external embeds
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
- password-flow behavior
- admin protection
- env vars needed
- lint/build result
- next recommended phase
