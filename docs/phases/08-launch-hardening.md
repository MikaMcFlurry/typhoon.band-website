# Phase 08 – Launch Hardening

## Goal

Final readiness before public launch.

## Check

- Vercel production domain
- www/root redirect
- SSL
- env vars
- Booking test
- Supabase RLS review
- Admin access review
- no secrets in frontend
- legal pages reviewed
- cookie behavior
- mobile Safari
- audio playback
- media viewer
- Lighthouse/performance
- image sizes
- audio sizes
- SEO metadata
- OpenGraph
- sitemap/robots
- 404 page
- broken links

## Final commands

```bash
npm run lint
npm run build
```

## Do not launch if

- booking sends to wrong email
- admin is public
- service role appears in client
- legal pages are missing
- mobile layout broken
- audio downloads exposed
