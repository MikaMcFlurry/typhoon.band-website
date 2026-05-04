# Typhoon Website

Fresh implementation repository for the Typhoon band website.

## Goal

Build a professional, self-hostable band website using the approved Claude Design frontend handoff and the planned backend architecture.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel
- Supabase Auth/Postgres/Storage
- Resend

## Important docs

Read before implementation:

```text
CLAUDE.md
docs/00-start-here.md
docs/01-claude-code-implementation-prompt.md
docs/02-design-handoff-instructions.md
docs/03-content-facts.md
docs/04-technical-architecture.md
docs/05-supabase-data-model.md
docs/06-security-rls.md
docs/07-admin-scope.md
docs/08-booking-resend.md
docs/09-assets-audio-gallery.md
docs/10-dsgvo-consent.md
docs/11-batch-plan.md
docs/12-acceptance-checklist.md
docs/13-audio-player-source.md
```

## Current implementation approach

1. Use the Claude Design desktop/mobile HTML handoff as the visual source of truth.
2. Implement the onepager frontend in Next.js.
3. Preserve the Claude Design demo-player size/layout, but integrate the old Claude branch waveform/audio behavior.
4. Use uploaded gallery and band info card assets.
5. Add Supabase/Resend-ready backend foundation.
6. Keep all public content correct.
7. Prepare Admin/Shop for later batches.

## Environment variables

See `.env.example`.

## Important

No secrets may be committed.
