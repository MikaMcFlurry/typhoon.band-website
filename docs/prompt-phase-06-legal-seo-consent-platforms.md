Start from the latest main branch.

Create a new branch:
claude/phase-06-legal-seo-consent-platforms

Read CLAUDE.md, docs/current-task.md, docs/00-project-source-of-truth.md and docs/02-claude-workflow.md.

Execute only the active phase listed in docs/current-task.md:
docs/phases/06-legal-seo-consent-platforms.md

Do not change the approved public frontend design.

Focus only on Legal, SEO, Consent and Platform Links:
- Admin legal page editor for imprint/privacy/cookies per locale
- public legal pages from Supabase with fallback
- Admin SEO editor and metadata wiring
- Admin platform links editor for Spotify, YouTube, Instagram, Facebook, SoundCloud, Bandcamp
- public active platform links
- cookie consent banner/preferences
- external media/embed gate so no embeds load before consent
- docs updates

Do not add analytics unless explicitly consent-gated and configured.
Do not build shop/payment.
Do not redesign the public website.

Run:
npm run lint
npm run build

Fix errors.
Push the completed phase branch.
Then summarize:
- changed files
- legal editor behavior
- SEO behavior
- consent behavior
- platform link behavior
- embed safeguards
- manual test steps
- lint/build result
