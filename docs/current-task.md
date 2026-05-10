# Current Task – Phase 05 Admin Media + Audio Uploads

## Current Phase

Active phase:

```text
docs/phases/05-admin-media-audio-uploads.md
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
Do not change public layout except minimal data wiring needed to use uploaded Supabase assets.

## Current Goal

Extend the existing Admin workflow so admins can safely upload and manage website assets:

- Gallery images
- Demo song MP3 files
- Demo song cover images
- Member photos
- Hero/Bandinfo images through site settings
- Asset replacement without breaking static fallback

## This Phase Must Implement

- secure server-side upload flow
- file validation for images and MP3s
- Supabase Storage upload through admin-gated server actions/routes
- DB record update/create after upload
- gallery media management
- demo song audio/cover management
- member photo management
- hero/bandinfo image setting management
- public site uses uploaded Supabase asset URLs when records exist
- static GitHub assets remain fallback

## This Phase Must Not Implement

- full text CRUD for every website section
- rich text editor
- shop
- payment
- analytics
- external embeds
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
- upload/storage behavior
- validation rules
- admin media pages
- public asset fallback behavior
- security notes
- manual test steps
- lint/build result
- next recommended phase
