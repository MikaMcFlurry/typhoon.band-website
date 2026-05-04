# CLAUDE.md – Typhoon Website

## Purpose

Durable rules for Claude Code in the new `typhoon.band-website` repository.

## Absolute source of truth order

1. Claude Design handoff files uploaded by the user:
   - desktop HTML
   - mobile HTML
   - handoff / transfer protocol
2. Real uploaded assets in the repository:
   - hero image
   - Typhoon logo
   - demo MP3s
   - gallery assets
   - band info card assets for Mika and Typhoon
3. Audio player behavior from the old Claude branch, but ONLY behavior/logic:
   - Repository: `MikaMcFlurry/typhoon.band`
   - Branch: `claude/typhoon-premium-redesign-x01JL`
   - Source behavior files:
     - `src/components/audio/AudioPlayerProvider.tsx`
     - `src/components/audio/Waveform.tsx`
4. These project docs in `/docs`

Do not use old failed frontend layouts as inspiration.

## Current goal

Implement the Typhoon website so the frontend visually follows the Claude Design handoff while the technical architecture remains ready for Supabase, Resend, Admin, Booking, media/audio and later shop.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel
- Supabase Auth/Postgres/Storage
- Resend

## Non-negotiable frontend rule

The Claude Design handoff controls:
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

Do not copy the old player card visual layout if it conflicts with the Claude Design handoff.

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
2. design handoff implementation status
3. audio player behavior integration
4. asset usage for hero, gallery and band info cards
5. backend/Supabase/Resend foundation status
6. content/member/demo correctness
7. lint/build result
8. intentionally unimplemented items and next batch suggestions
