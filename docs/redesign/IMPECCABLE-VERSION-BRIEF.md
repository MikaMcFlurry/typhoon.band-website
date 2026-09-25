# Brief — Typhoon website, Version B ("Impeccable")

Owner request (2026-09-25): besides the redesign on
`claude/typhoon-website-redesign-7xjozt` (Version A), build **an additional,
independent version of the website with the Impeccable design skill**
(https://impeccable.style). Branch: `claude/typhoon-website-impeccable`.
Production (`main` → typhoon.band) must not be touched.

## Starting point of this branch

- Forked from Version A (commit `0cfa5d0` + later docs). The **backend, admin,
  API, content layer, SEO plumbing, consent contract, legal texts,
  migrations and all bug fixes are reused as-is** — they are design-agnostic
  and already verified.
- The **public visual layer is to be replaced** by a new visual world chosen
  through Impeccable: `src/app/globals.css`, `tailwind.config.ts`,
  `src/components/{sections,site,audio UI,consent UI,legal UI,ui}`, fonts in
  `src/app/[locale]/layout.tsx`. Version A's look (`docs/design/DESIGN.md`)
  is evidence and an anti-reference, not a template — Impeccable's rule:
  "Redesign replaces; never split the difference into polish on the
  discarded look."

## The skill

- Installed as a project skill in `.claude/skills/impeccable/` (v4.4.0,
  upstream commit in `SOURCE_COMMIT`, Apache-2.0) plus its helper subagents
  in `.claude/agents/impeccable-*.md`.
- The auto-hooks from upstream `.claude/settings.json` were deliberately
  **not** installed (they execute a downloaded binary after every edit). The
  launcher `scripts/impeccable` downloads a verified binary from GitHub
  releases on first run; if the environment refuses that, follow SKILL.md's
  "Launcher unavailable" path (read PRODUCT.md / DESIGN.md directly).
- Suggested flow: `/impeccable init` (write PRODUCT.md from the facts
  below) → new-work / `shape` for the visual world → build → `critique` +
  `audit` → one batched fix round → `polish`.

## Everything you need to know (read first)

- `CLAUDE.md` — security and content rules (they still apply).
- `docs/redesign/2026-09-redesign.md` — live version, parity checklist
  (functions 1–18 that must all work), fixed bugs, open owner decisions.
- `docs/redesign/analysis/INVENTORY.md` — full forensic inventory: F01–F44
  feature list, content facts, live Supabase data, contradictions, assets.
- `docs/redesign/analysis/docs-handoff.md` §6 — what the owner repeatedly
  complained about and what he approved.
- `docs/redesign/analysis/anti-slop-checklist.md`.

## Hard constraints (unchanged)

- All functions of the parity checklist keep working (audio engine contract
  from docs/13 incl. one-at-a-time, live Web Audio waveform, no download
  buttons; booking API; consent; DE/EN/TR; admin untouched in behaviour).
- Facts: live Supabase data wins (member slot 8 currently "Tan – Percussion";
  never hard-code member names); only `booking@typhoon.band`; never invent
  show dates; no placeholder badges; the whole band collage must stay fully
  visible if used as hero; the gold signature PNG is the logo (never fake it
  with a font).
- No horizontal overflow at 320/390 px; WCAG AA; `npm run lint` and
  `npm run build` must pass.
- Preview deployments use the production Supabase + Resend env vars — do
  not submit test bookings on the preview.

## Deliverables

1. Commits on `claude/typhoon-website-impeccable`, pushed (Vercel builds a
   preview automatically).
2. Root `PRODUCT.md` + `DESIGN.md` written by the Impeccable flow; update
   `CLAUDE.md` on this branch so DESIGN.md (root) is the visual source of
   truth for Version B.
3. A short comparison note `docs/redesign/VERSION-B.md`: design direction,
   what differs from Version A, verification evidence (screenshots at 320,
   390, 768, 1024, 1440; journeys; lint/build).
