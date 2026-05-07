Read CLAUDE.md, docs/current-task.md and docs/16-ui-bugfix-v6-exact-requirements.md.

Do a strict UI bugfix batch only. Do not redesign freely.

Use the attached screenshots:
- desktop-aktuell.png
- mobil-aktuell.png

Fix exactly:
1. Desktop hero image left edge must be fully visible; move hero signature ~20px down and ~75px left.
2. Mobile hero image must show the full band composition; move signature much lower so it slightly exits the bottom of the image, and a bit left; hide the hard bottom edge with fade.
3. Mobile menu must have opaque own background; no hero signature or page content visible behind it.
4. Header links on legal pages must route back to /{locale}#section and close any overlay/page context.
5. Add cookie banner with confirmation/localStorage and links to Datenschutz/Cookies. No tracking.
6. Implement real EN and TR UI/content dictionaries, not German fallback.
7. Make demo player prev/next, volume/mute and more-menu functional. No download option.
8. Extend header waveform to fill all free width up to the time/controls; widen all demo-row waveforms.
9. Media items must open in an in-site overlay viewer with close, prev/next, keyboard controls, not new tabs.
10. Fix booking mobile image crop/button alignment; fix date field/input overflow on desktop and mobile.
11. Remove info@typhoon.band everywhere; use only booking@typhoon.band and +49 176 64472296.

Preserve current desktop direction, assets, audio provider/waveform behavior, Supabase/Resend foundation and legal routes.
Do not build Admin CRUD, shop, analytics or external embeds.

Run npm run lint and npm run build, fix errors, then summarize each fix and changed files.
