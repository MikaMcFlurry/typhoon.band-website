# Current Task – Redesign 2026 (review + go-live preparation)

## Status

The complete redesign lives on branch `claude/typhoon-website-redesign-7xjozt`.
It includes the previously unmerged Phase 06 (legal/SEO/consent/platform
links). Production (`main` → typhoon.band) is unchanged until the owner merges.

Read first:
1. `CLAUDE.md`
2. `docs/design/DESIGN.md` — visual source of truth since the redesign
3. `docs/redesign/2026-09-redesign.md` — analysis, parity checklist, open decisions

## Rules for follow-up work

- The public frontend follows `docs/design/DESIGN.md`; do not revert to the
  handoff layout. Keep the audio behaviour contract (docs/13).
- Every public function listed in the parity checklist of the redesign
  report must keep working.
- Supabase data wins over repo fallbacks; never hard-code member names,
  songs or dates in copy.
- `npm run lint` and `npm run build` must pass; test at 320, 390, 768,
  1024 and 1440 px.

## Next steps (owner)

See "Open owner decisions" in `docs/redesign/2026-09-redesign.md`.
