Start from the latest main branch.

Create a new branch:
claude/phase-05-admin-media-audio-uploads

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/05-admin-media-audio-uploads.md

Do not change the approved public frontend design.

Focus only on Admin Media + Audio Uploads:
- secure admin-gated upload flow
- image validation and upload to Supabase Storage
- MP3 validation and upload to Supabase Storage
- gallery media admin
- demo song audio/cover admin
- member photo admin
- hero/bandinfo image asset settings
- DB records reference uploaded asset URLs
- public site uses Supabase asset URLs when present and keeps static fallback otherwise

Do not build full text CRUD, rich text editor, shop, analytics or external embeds.
Do not redesign the public website.

Run npm run lint and npm run build.
Fix errors.
Push the completed phase branch.
Then summarize and stop.
