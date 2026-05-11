Continue on the existing branch:
claude/phase-05-admin-media-audio-uploads

Do not create a new phase branch.
Do not change the approved public frontend design.

Read:
docs/fixes/phase-05-upload-member-fixes.md

Fix only the Phase 05 upload/member issues described there:
- direct-to-Supabase upload flow for real MP3s and images
- clear upload errors and visible max-size/type hints
- member name/instrument/bio editing
- per-member fallback merge by slug
- visibility checkbox persistence
- keep static fallback assets
- no service role key in browser

Do not implement shop, analytics, external embeds, legal editor or unrelated text CRUD.
Do not redesign the public website.

Run:
npm run lint
npm run build

Fix errors.
Push the updated same branch.
Then summarize:
- root cause
- changed files
- direct upload behavior
- member fallback behavior
- member editing behavior
- manual test steps
- lint/build result
