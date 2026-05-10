Start from the latest main branch.

Create a new branch:
claude/phase-03-admin-auth-dashboard

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/03-admin-auth-dashboard.md

Do not change the approved public frontend design.

Focus only on Admin Auth + Dashboard:
- Supabase Auth login/logout
- server-side protected /[locale]/admin routes
- active admin_profiles guard
- owner/admin/editor role helper foundation
- Admin dashboard cards
- read-only Booking requests view
- first owner setup documentation

Do not build full content CRUD, upload UI, shop, analytics or external embeds.
Do not redesign the public website.

Run npm run lint and npm run build.
Fix errors.
Push the completed phase branch.
Then summarize and stop.
