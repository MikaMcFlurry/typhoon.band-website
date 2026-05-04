# 01 – Claude Code Implementation Prompt

Use this prompt in Claude Code.

```text
Read CLAUDE.md and docs/current-task.md.

Execute the current task step by step. Only open the supporting docs when needed:
docs/02-design-handoff-instructions.md
docs/03-content-facts.md
docs/04-technical-architecture.md
docs/05-supabase-data-model.md
docs/06-security-rls.md
docs/08-booking-resend.md
docs/09-assets-audio-gallery.md
docs/13-audio-player-source.md

Use the Claude Design handoff as the visual source of truth.
Keep the Claude Design demo-player layout; only reuse the old branch's Waveform/Audio behavior.

Run npm run lint and npm run build before finishing, fix errors, then summarize the result.
```
