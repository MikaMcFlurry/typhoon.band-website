# 01 – Claude Code Implementation Prompt

Use this prompt in Claude Code.

```text
You are working in the repository MikaMcFlurry/typhoon.band-website.

This is a fresh implementation based on an approved Claude Design handoff.

Read first:
- CLAUDE.md
- docs/00-start-here.md
- docs/02-design-handoff-instructions.md
- docs/03-content-facts.md
- docs/04-technical-architecture.md
- docs/05-supabase-data-model.md
- docs/06-security-rls.md
- docs/07-admin-scope.md
- docs/08-booking-resend.md
- docs/09-assets-audio-gallery.md
- docs/10-dsgvo-consent.md
- docs/11-batch-plan.md
- docs/12-acceptance-checklist.md
- docs/13-audio-player-source.md

Also inspect the uploaded Claude Design handoff files:
- desktop HTML
- mobile HTML
- handoff / transfer protocol

Also inspect uploaded assets:
- hero image
- Typhoon logo
- demo audio files
- gallery images/assets
- band info card assets for Mika and Typhoon

The Claude Design handoff is the visual source of truth for layout and styling.

Do not use previous failed frontend implementations as design reference.

Build/implement:
1. Next.js App Router + TypeScript + Tailwind project foundation if not present.
2. Public onepager frontend matching the Claude Design desktop/mobile handoff.
3. Separate legal pages: imprint, privacy, cookies.
4. Anchor-based navigation for the public onepager.
5. Correct Typhoon content, members and demos.
6. Use uploaded gallery assets for the first gallery/media teaser.
7. Use uploaded band info card assets for Mika and Typhoon where appropriate.
8. Demo player:
   - Keep the Claude Design player size, layout, spacing and styling.
   - Do NOT replace it with the old card layout.
   - Reuse/recreate only the old Claude branch audio behavior:
     - AudioPlayerProvider
     - Web Audio API analyser
     - live waveform bars
     - deterministic idle waveform
     - progress coloring
     - one-song-at-a-time playback
     - seek/progress behavior
9. Supabase-ready architecture:
   - typed clients
   - server/client separation
   - SQL migration files for schema
   - RLS policy files
   - admin route structure
   - no service role key in browser
10. Resend-ready booking flow:
   - booking form UI from design
   - server-side validation structure
   - no frontend secrets
   - store booking request in Supabase when env is configured
   - send email through Resend when env is configured
   - graceful disabled/dev fallback if env is missing
11. README, .env.example and .gitignore updates.

Important scope:
- Implement backend foundation and wiring, but do not overbuild the full Admin CRUD yet.
- Create admin shell/routes and auth protection foundation.
- Full Admin content editing is a later batch.
- Shop/tickets are later batches.
- Analytics/external embeds are not part of this batch.

Critical visual requirement:
The frontend must visually follow the Claude Design desktop and mobile HTML handoff closely.

Critical audio requirement:
The final player should LOOK like the Claude Design demo player but BEHAVE like the old Claude branch audio player.
Do not copy the old visual layout if it conflicts with the design handoff.

Critical content requirement:
Use exactly the correct member list:
- Typhoon – Gesang
- Mika – Posaune
- Schack – Saxophon
- Hardy – Trompete
- Stefan – Funk-Bass
- Tom – Schlagzeug
- Buğra – Gitarre
- Jürgen – Gitarre
No Taifun, no Daniel.

Before finishing:
- run npm run lint
- run npm run build
- fix errors

Final summary:
1. created/changed files
2. how the design handoff was implemented
3. how the Claude Design player layout was preserved
4. how waveform/audio behavior was integrated
5. how gallery and Mika/Typhoon band-card assets were used
6. Supabase/Resend/backend foundation status
7. member/demo/content correctness
8. lint/build result
9. next batches
```
