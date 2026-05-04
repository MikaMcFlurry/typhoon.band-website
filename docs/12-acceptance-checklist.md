# 12 – Acceptance Checklist

## Design

- Frontend follows Claude Design desktop handoff.
- Frontend follows Claude Design mobile handoff.
- Previous failed frontend design is not copied.
- Onepager remains compact.
- Buttons/panels match handoff style.
- Hero uses correct approved image/logo treatment.
- No horizontal overflow.

## Assets

- Uploaded gallery assets are used in the gallery/media teaser.
- Uploaded Mika band-card asset is used for Mika/Posaune.
- Uploaded Typhoon band-card asset is used for Typhoon/Gesang.
- Other members use clean premium placeholders until real photos exist.
- Asset paths are documented.

## Content

- Correct band positioning.
- 8 members listed/accesssible.
- Typhoon is singer.
- Schack is saxophonist.
- Jürgen is guitarist.
- Daniel does not appear.
- Taifun does not appear.
- 6 demos listed/accesssible.
- Booking/contact visible on homepage.
- Legal pages exist.

## Audio

- Demo player retains Claude Design size/layout/style.
- Waveform/audio behavior is copied/recreated from old Claude branch.
- Local MP3 paths.
- Custom player.
- Waveform/audio visualization.
- One song at a time.
- No download button.
- No external player/embed.
- No native browser controls.

## Backend foundation

- Supabase env variables prepared.
- Supabase client/server helpers prepared.
- SQL migrations exist.
- RLS policy files exist.
- Admin shell/protection foundation exists.
- Booking handler server-side.
- Resend server-side only.

## Security

- No secrets in frontend.
- No service role key in browser.
- `.env.example` exists.
- `.gitignore` blocks raw audio/project files.
- No public write access implied.

## Build

- `npm run lint` passes.
- `npm run build` passes.
