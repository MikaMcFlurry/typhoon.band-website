Start from the latest main branch.

Create a new branch:
claude/phase-01b-booking-email-design

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/01b-booking-email-design.md

Do not change the approved website frontend design.

Improve only the booking email design:
- polished HTML email
- plain text fallback
- clean booking field formatting
- safe user input rendering
- Reply-To remains sender email
- recipient remains booking@typhoon.band
- no info@typhoon.band
- no tracking/external scripts

Preserve existing booking behavior, Supabase insert, Resend send and API response contract.

Run npm run lint and npm run build.
Fix errors.
Push the completed phase branch.
Then summarize and stop.
