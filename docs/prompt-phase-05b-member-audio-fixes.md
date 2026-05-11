Start from the latest main branch.

Create a new branch:
claude/phase-05b-member-audio-fixes

Do not change the approved public frontend design.

Read:
docs/fixes/phase-05b-member-audio-fixes.md

Fix only:
- Supabase member role/instrument and bio not appearing publicly
- Admin member card heading still using fallback name
- uploaded Supabase demo songs playing silently on the public website

Do not implement Phase 06 yet.
Do not add unrelated CRUD, shop, analytics, external embeds or redesign.

Run:
npm run lint
npm run build

Fix errors.
Push the completed branch.
Then summarize:
- root causes
- changed files
- member text fix
- admin heading fix
- audio playback fix
- manual test steps
- lint/build result
