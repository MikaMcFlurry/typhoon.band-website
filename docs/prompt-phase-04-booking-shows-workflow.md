Start from the latest main branch.

Create a new branch:
claude/phase-04-booking-shows-workflow

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/04-booking-shows-workflow.md

Do not change the approved public frontend design.

Focus only on Booking Workflow + Shows Admin:
- correct admin setup docs order: create Supabase Auth user first, then run admin_profiles SQL
- add booking detail page
- add booking status handling
- add delete/archive action for individual bookings
- add convert-booking-to-show flow with prefilled date/location/type and optional ticket link
- add Shows Admin CRUD
- add schema/RLS support for booking/show linking
- ensure public Shows section displays visible Supabase shows while preserving fallback

Do not build full website content CRUD, media/audio uploads, shop, analytics or external embeds.
Do not redesign the public website.

Run npm run lint and npm run build.
Fix errors.
Push the completed phase branch.
Then summarize and stop.
