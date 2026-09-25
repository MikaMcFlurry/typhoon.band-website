# CLAUDE.md – Typhoon Website

## Purpose

Durable rules for Claude Code in the new `typhoon.band-website` repository.

## Absolute source of truth order

This branch (`claude/typhoon-website-impeccable`) carries **Version B**, an
independent redesign made with the Impeccable design skill (owner request
2026-09-25). Its visual source of truth is the **root `DESIGN.md`** (written
from the built world) together with `PRODUCT.md` and the direction contract in
`.impeccable/surfaces/src-app-locale-site-page-tsx.md`. Version A's
`docs/design/DESIGN.md` (branch `claude/typhoon-website-redesign-7xjozt`) is
an anti-reference here, not a template.

1. Explicit owner instructions, root `DESIGN.md` and `PRODUCT.md` (visuals,
   layout, typography, components, responsive behaviour, product truth).
2. Real uploaded assets in the repository:
   - hero image / band collage (shown whole as the band poster)
   - Typhoon logo (gold signature PNG — never re-set in a font)
   - demo MP3s
   - gallery assets
   - band info card assets for Mika and Typhoon
3. Audio player behavior from the old Claude branch, but ONLY behavior/logic:
   - Repository: `MikaMcFlurry/typhoon.band`
   - Branch: `claude/typhoon-premium-redesign-x01JL`
   - Source behavior files:
     - `src/components/audio/AudioPlayerProvider.tsx`
     - `src/components/audio/Waveform.tsx`
4. These project docs in `/docs` (Version B note: `docs/redesign/VERSION-B.md`;
   parity checklist: `docs/redesign/2026-09-redesign.md`)
5. Claude Design handoff files (`/handoff`) — historical reference only.

Do not use old failed frontend layouts as inspiration.

## Current goal

Ship Version B (branch `claude/typhoon-website-impeccable`) following the
root `DESIGN.md`, as an alternative to Version A, while the architecture stays
ready for Supabase, Resend, Admin, Booking, media/audio and later shop.
Design changes go through the Impeccable skill (`.claude/skills/impeccable`):
refinements inherit DESIGN.md; a new visual world needs a new direction round.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel
- Supabase Auth/Postgres/Storage
- Resend

## Non-negotiable frontend rule

The root `DESIGN.md` controls (public site only; the admin keeps its own
palette and fonts via the `.admin-root` wrapper):
- player size
- player card layout
- spacing
- typography
- buttons
- header
- hero
- panels
- responsive behavior

The old Claude branch controls only:
- audio state management
- Web Audio API analyser behavior
- waveform animation logic
- one-song-at-a-time playback
- seek/progress behavior

Do not copy the old player card visual layout if it conflicts with DESIGN.md.
Backend, admin, API, `src/lib/**`, `src/middleware.ts` and `supabase/**` are
design-agnostic: a visual change never changes their behaviour.

Content rules that stay: the repo fallback lists 8 members in the documented
order (Typhoon, Mika, Schack, Hardy, Stefan, Tom, Buğra, Jürgen — never
"Taifun", never "Daniel"); Supabase admin data overrides per slot (the live
DB currently shows "Tan – Percussion" in the `jurgen` slot — owner to
confirm), so never hard-code member names in copy. Only `booking@typhoon.band`
(no `info@`), never invent show dates, no placeholder badges, no horizontal
overflow on mobile (test 320/390 px).

## Non-negotiable security rules

- No secrets in frontend.
- No service role key in browser.
- Supabase RLS is mandatory.
- Admin routes must be server-protected.
- Uploads must be validated server-side.
- Resend API key must be server-side only.
- No external embeds without consent.
- No analytics without consent.
- No download buttons for demo audio.
- README.md, .env.example, .gitignore and docs must stay updated.

## Quality

Before finishing any implementation batch:

```bash
npm run lint
npm run build
```

Fix all errors.

## Final response expectation from Claude Code

Always summarize:
1. changed files
2. design system (root DESIGN.md, Version B) implementation status
3. audio player behavior integration
4. asset usage for hero, gallery and band info cards
5. backend/Supabase/Resend foundation status
6. content/member/demo correctness
7. lint/build result
8. intentionally unimplemented items and next batch suggestions
