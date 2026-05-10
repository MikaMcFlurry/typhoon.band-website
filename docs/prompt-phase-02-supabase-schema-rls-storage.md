Start from the latest main branch.

Create a new branch:
claude/phase-02-supabase-schema-rls-storage

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/02-supabase-schema-rls-storage.md

Do not change the approved frontend design.

Focus only on Supabase backend foundation:
- install/configure @supabase/supabase-js
- create clean client/server/admin Supabase helpers
- keep service role server-only
- replace/improve Booking storage with server-side Supabase client
- finalize additive migrations/RLS if needed
- prepare Storage buckets and policies
- implement real public Supabase reads in the content provider while preserving static fallback
- update README/.env.example/docs

Do not build full Admin CRUD, upload UI, shop, analytics or external embeds.
Do not redesign the frontend.

Run npm run lint and npm run build.
Fix errors.
Push the completed phase branch.
Then summarize and stop.
