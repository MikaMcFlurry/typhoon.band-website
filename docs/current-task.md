# Current Task – Phase 06 Legal, SEO, Consent and Platform Links

## Current Phase

Active phase:

```text
docs/phases/06-legal-seo-consent-platforms.md
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
Only make minimal UI additions required for:
- legal pages
- cookie consent banner/preferences
- platform links
- SEO metadata

## Current Goal

Make the website more launch-ready by finishing:
- editable legal pages
- SEO/OpenGraph metadata
- cookie/consent handling
- platform link management
- external media/embed safeguards

## This Phase Must Implement

- Admin Legal page editor
- Admin SEO editor
- Admin Platform Links editor
- Cookie consent banner and preferences
- no external embeds without consent
- public legal pages from Supabase with fallback
- metadata from content provider / SEO entries
- docs updates

## This Phase Must Not Implement

- analytics unless explicitly configured and consent-gated
- shop
- payment
- full rich-text CMS
- media/audio upload changes
- public frontend redesign

## Finish Criteria

Run:

```bash
npm run lint
npm run build
```

Push this phase as its own branch/commit.

Then stop and summarize:
- changed files
- legal editor behavior
- SEO behavior
- consent behavior
- platform link behavior
- external embed safeguards
- migration/RLS changes if any
- manual test steps
- lint/build result
- next recommended phase
