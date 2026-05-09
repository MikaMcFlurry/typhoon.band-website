# 02 – Claude Code Workflow

## Core workflow

Claude Code must work in small, phase-based steps.

## Read order

For every phase:

1. `CLAUDE.md`
2. `docs/00-project-source-of-truth.md`
3. `docs/02-claude-workflow.md`
4. active phase file from `docs/current-task.md`

Only open supporting docs if needed.

## Do not be influenced by old files

Ignore old archived docs, old prompts, previous failed UI-fix instructions or historical design attempts unless the active phase explicitly references them.

The approved current frontend implementation is the visual baseline.

## Commit strategy

Prefer one branch/commit per phase.

Commit message format:

```text
Phase XX: short description
```

Examples:

```text
Phase 01: add booking and content provider foundation
Phase 02: finalize Supabase schema and RLS
```

## Before finishing every phase

Run:

```bash
npm run lint
npm run build
```

Fix all errors.

## Final phase summary

Always report:

```text
1. changed files
2. what was implemented
3. what was intentionally not implemented
4. env vars needed
5. security notes
6. lint/build result
7. next recommended phase
```

## Design protection

The current frontend design is approved.

Do not alter UI layout/styling unless:
- the active phase explicitly asks for a UI change
- a bug blocks the implementation
- a tiny status message/success/error UI is needed

Any necessary visual change must be minimal.

## Security rules

- no secrets in frontend
- no service role key in browser
- Resend API key server-only
- Supabase RLS required
- Admin routes server-protected
- uploads validated server-side
- no public write access to content tables
- no analytics or embeds without consent

## Fallback rule

Public site must stay online if Supabase/Resend env vars are missing.

Missing env must not cause homepage 500 errors.
