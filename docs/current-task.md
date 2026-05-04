# Current Task – Implement Claude Design Frontend + Backend Foundation

## Goal

Implement the Typhoon website in `MikaMcFlurry/typhoon.band-website`.

Use the Claude Design handoff as visual source of truth.

## Work order

1. Inspect Claude Design handoff files:
   - desktop HTML
   - mobile HTML
   - handoff protocol

2. Inspect assets:
   - `public/assets/reference/`
   - `public/assets/gallery/`
   - `public/assets/band-cards/`
   - `public/assets/audio/demos/`

3. Build frontend:
   - Next.js App Router
   - TypeScript
   - Tailwind
   - onepager public website
   - separate legal pages
   - anchor navigation
   - match Claude Design desktop/mobile closely

4. Use assets:
   - all 8 gallery JPGs in gallery/media teaser
   - Typhoon band-card asset for Typhoon / Gesang
   - Mika band-card asset for Mika / Posaune
   - keep all existing assets if no replacement exists

5. Audio player:
   - keep Claude Design size/layout/style
   - only reuse old Claude branch audio behavior
   - source behavior:
     - `MikaMcFlurry/typhoon.band`
     - branch `claude/typhoon-premium-redesign-x01JL`
     - `AudioPlayerProvider.tsx`
     - `Waveform.tsx`
   - no download button
   - one song at a time
   - local MP3 playback
   - live waveform/visualizer bars

6. Content:
   - Typhoon – Gesang
   - Mika – Posaune
   - Schack – Saxophon
   - Hardy – Trompete
   - Stefan – Funk-Bass
   - Tom – Schlagzeug
   - Buğra – Gitarre
   - Jürgen – Gitarre
   - no Taifun
   - no Daniel

7. Backend foundation:
   - Supabase-ready architecture
   - server/client separation
   - SQL migrations
   - RLS policy files
   - admin shell/protected routes
   - Resend-ready booking flow
   - no full Admin CRUD yet
   - no shop yet

8. Update:
   - README.md
   - .env.example
   - .gitignore
   - docs if needed

## Before finishing

Run:

```bash
npm run lint
npm run build
