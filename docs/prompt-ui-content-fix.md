Read CLAUDE.md, docs/current-task.md and docs/14-old-site-content-and-ui-fix.md.

Do a focused UI + content completion fix batch only.

Strictly follow the Claude Design handoff. Current code is not the source of truth if it differs from the handoff.

Fix:
- Header/Hero exactly to Claude Design: text block, image block and signature block must be separate; header logo/signature must not sit too low.
- Add/restore the agreed old website content from docs/14-old-site-content-and-ui-fix.md.
- Fix demo player overflow on mobile; waveform must remain visible and inside the card.
- Keep Claude Design player layout; only use old branch logic for waveform/audio behavior.
- Booking form must use the gallery band image with Typhoon signature next to the form.
- Legal pages must match the website style and use the correct imprint data.
- Add compact #shows if navigation links to it.

Do not expand backend/Admin/shop/analytics/embeds.

Run npm run lint and npm run build, fix errors, then summarize.
