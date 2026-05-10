Start from the Phase 03 branch:
claude/phase-03-admin-auth-dashboard-1h4KZ

Create a new branch:
claude/phase-03b-initial-admin-password-flow

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/03b-initial-admin-password-flow.md

Do not change the approved public frontend design.

Focus only on the initial Admin password flow:
- additive migration for admin_profiles password-change fields
- first-login must_change_password guard
- /[locale]/admin/change-password page
- Supabase Auth password update
- set must_change_password=false and password_changed_at after success
- block dashboard and booking access until password is changed
- update docs/admin-setup.md and README

Do not build full Admin CRUD, Admin user management UI, upload UI, shop, analytics or external embeds.
Do not redesign the public website.

Run npm run lint and npm run build.
Fix errors.
Push the completed phase branch.
Then summarize and stop.
