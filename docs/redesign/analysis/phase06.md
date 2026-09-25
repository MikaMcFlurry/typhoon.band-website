# Recon: typhoon.band-website, branch `origin/claude/phase-06-legal-seo-consent-platforms`

Read-only analysis. No repository was checked out, modified or `npm install`ed. To verify the build, the merged tree was exported with `git archive` into the scratchpad (`scratchpad/p06merge`, with `node_modules` symlinked from the existing install).

## 0. Identity and position

| Item | Value |
|---|---|
| Branch tip | `0cd76d05ac65e563e073ccc2c8328ce5845d1d21` |
| origin/main (LIVE) | `740ff464dba8ed75a78498d8a84ab038582f663c` |
| Merge-base | `d8ee2d716a305bf2193a3b5d39f8439a3d9f40cc` "Add files via upload" (Mika Hertler, 2026-05-11 14:04 -0400). This commit uploaded `docs/current-task.md`, `docs/phases/06-legal-seo-consent-platforms.md` and `docs/prompt-phase-06-legal-seo-consent-platforms.md` |
| Branch commits (main..branch) | 1 commit: `0cd76d0 2026-05-11 20:41:57 +0000 Claude — "Claude Phase 06: add legal/SEO/consent/platform-links admin + public wiring"` |
| Main commits after the merge-base | 2 commits: `4cf812b` "Fix: hide Platzhalter badge when Supabase photo exists" (only `src/lib/content/normalize.ts`, +7/-1), and the merge commit `740ff46` (PR #15) |
| PR | **None.** A GitHub search `head:claude/phase-06-legal-seo-consent-platforms` returned 0 PRs. The branch was pushed but never opened as a PR or merged |
| Also present | `origin/claude/typhoon-website-redesign-7xjozt` points at `740ff46`, the same commit as main. It does NOT contain Phase 06 |

**Correction to the task premise:** Phase 05b (`80d116f`, merged as PR #14 `d7a5d6e`) comes BEFORE the merge-base, so Phase 06 already includes it. The only main change the branch lacks is the member-placeholder fix `4cf812b`.

## 1. What the branch was asked to do (docs on main)

`docs/prompt-phase-06-legal-seo-consent-platforms.md` (main) says, in summary: start from main, create branch `claude/phase-06-legal-seo-consent-platforms`, and do not redesign the public frontend. It asks for the following:
- an Admin legal page editor for imprint, privacy and cookies in each locale
- public legal pages read from Supabase, with a fallback
- an Admin SEO editor plus metadata wiring
- an Admin platform-links editor for Spotify, YouTube, Instagram, Facebook, SoundCloud and Bandcamp
- public display of active platform links
- a cookie consent banner with preferences
- an external media/embed gate
- doc updates
It must not add analytics unless consent-gated, must not add shop or payment, and must not do a public redesign. `npm run lint` and `npm run build` must pass.

`docs/phases/06-legal-seo-consent-platforms.md` (main, 346 lines) sets these details:
- Admin routes: `/[locale]/admin/legal`, `/[locale]/admin/seo`, `/[locale]/admin/platform-links`
- Consent categories: `necessary`, `external_media`, `statistics` (optional/future), `marketing` (optional/future)
- Tables: `legal_pages`, `legal_page_translations`, `seo_entries`, `platform_links`, `consent_settings`. These already exist in `0001_init.sql`
- Validation limits: SEO title ≤80 and description ≤180. Platforms must be in the supported list. URLs must be http/https
- "Important user requirement: As soon as Admin inserts a link for an external platform, that platform link should automatically appear on the website."
- Acceptance checklist of 17 items, including "no external embed loads before consent", "no analytics added" and "public frontend design unchanged"

`docs/current-task.md` on main still lists Phase 06 as the active phase. Phase 06 is therefore the next planned step that was never merged.

## 2. What Phase 06 adds (diffstat: 31 files, +2782 / −145)

```
README.md                                          |  50 ++++-
docs/admin-legal-seo-consent-platforms.md          | 153 (new)
src/app/[locale]/admin/_components/AdminShell.tsx  |  18 +-   (4 new nav tabs)
src/app/[locale]/admin/consent/page.tsx            | 109 (new, read-only)
src/app/[locale]/admin/legal/LegalEditor.tsx       | 153 (new, client)
src/app/[locale]/admin/legal/actions.ts            |  46 (new, server action)
src/app/[locale]/admin/legal/page.tsx              |  97 (new)
src/app/[locale]/admin/page.tsx                    |  29 +-   (dashboard cards "soon" -> "live", + Consent card)
src/app/[locale]/admin/platform-links/actions.ts   |  78 (new)
src/app/[locale]/admin/platform-links/page.tsx     | 242 (new)
src/app/[locale]/admin/seo/actions.ts              |  75 (new)
src/app/[locale]/admin/seo/page.tsx                | 216 (new)
src/app/[locale]/layout.tsx                        |   4 +-   (getPlatformLinks() -> <Footer platformLinks>)
src/app/[locale]/legal/cookies/page.tsx            |  55 +-   (client -> server comp., generateMetadata, Supabase body)
src/app/[locale]/legal/imprint/page.tsx            |  59 +-   (same)
src/app/[locale]/legal/privacy/page.tsx            |  57 +-   (same)
src/app/[locale]/page.tsx                          |  21 +-   (generateMetadata for "/")
src/components/layout/CookieConsent.tsx            | 162 ++-- (rewrite: banner + preferences dialog)
src/components/layout/Footer.tsx                   | 201 ++-- (platform icons from Supabase, 6 icons, "Cookie-Einstellungen" button)
src/components/layout/consent.ts                   |  98 (new: storage contract + events)
src/components/legal/LegalShell.tsx                |  51 +-   (showDraftNote prop, LegalBody mini-renderer)
src/components/media/ExternalMediaGate.tsx         |  90 (new, UNUSED anywhere)
src/i18n/dictionaries.ts                           |  57 +-   (cookie strings DE/EN/TR)
src/lib/admin/consent.ts                           |  29 (new, server-only list)
src/lib/admin/legal.ts                             | 180 (new, server-only list/save)
src/lib/admin/platform-links.ts                    |  93 (new, server-only list/save/delete)
src/lib/admin/seo.ts                               | 111 (new, server-only list/save/delete)
src/lib/content/fallback.ts                        |  13 +-   (page-specific SEO fallback titles)
src/lib/validation/legal-seo-platforms.ts          | 234 (new, server-side validators)
supabase/migrations/0006_legal_seo_consent_platforms.sql | 79 (new)
supabase/policies/0006_legal_seo_consent_platforms.sql   | 67 (new)
```

### 2.1 Legal pages: yes, editable in admin
- `/[locale]/admin/legal` is gated by `requireAdminWithPasswordOk()`. It has slug tabs `Impressum` / `Datenschutz` / `Cookies` and locale tabs `DE`/`EN`/`TR`. Fields: `title` (required, ≤160), `body_md` (plain textarea, ≤16 000, `font-mono`), and the checkbox "Veröffentlicht (überschreibt den Repo-Fallback auf der öffentlichen Seite)". Below the form: "Hinweis: Reine Textbearbeitung. Keine Rechtsberatung. Inhalte gelten erst nach Veröffentlichung."
- `is_published` lives on the parent `legal_pages` row, so **one checkbox publishes all locales of a slug**. Translations are stored per locale in `legal_page_translations`.
- Server action `saveLegalAction` calls `validateLegal`, then `saveLegalPage`, which upserts the parent and the translation through the service-role client. It then calls `revalidatePath` for `/{de,en,tr}/legal/{slug}` and redirects with a `?saved=1` / `?error=` flash.
- The public `imprint`, `privacy` and `cookies` pages were converted from `"use client"` to async server components with `export const dynamic = "force-dynamic"`. Each calls `getLegalPage(slug, locale)` (the provider already existed on main). If the published translation has a non-empty `bodyMd`, the page renders `<LegalBody>` (a mini renderer: blank-line paragraphs, `## ` becomes H2, `whitespace-pre-line`, no Markdown library, no HTML injection) with `showDraftNote={false}`. Otherwise it renders the curated JSX fallback together with the draft note `"Initialer Stand — wird laufend ergänzt."`.

### 2.2 SEO settings: yes
- `/[locale]/admin/seo` offers an upsert per `(path, locale)`. Fields: `title` ≤80, `description` ≤180, `og_image_url` (optional, http/https, ≤500). The path must match `/^\/[a-z0-9\-/]*$/i` and is entered without the locale prefix. The datalist suggests `/`, `/legal/imprint`, `/legal/privacy` and `/legal/cookies`. The form includes a delete button. An entry with every field empty is deleted.
- `generateMetadata` was added to `src/app/[locale]/page.tsx` (it uses `title: { absolute }`) and to the three legal pages (they use the root template `"%s · Typhoon"`). They consume `getSeoEntry(path, locale)`, which was already on main but unused.
- `buildSeoFallback` now returns page-specific titles for legal routes: DE `Impressum` / `Datenschutzerklärung` / `Cookie-Hinweise`, EN `Imprint` / `Privacy policy` / `Cookie notice`, TR `Künye` / `Gizlilik politikası` / `Çerez bildirimi`. For home it returns `Typhoon — ${dict.brand.genreLine}`, which is **`"Typhoon — BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK"`** in DE and `"Typhoon — BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK"` in EN/TR. **This changes the live home `<title>`**, which today is the root default `"Typhoon — Funk · Soul · Jazz · Bluesrock"`. The description becomes `dict.hero.description`, and the OG image falls back to `/assets/hero/hero-collage.jpeg`, a relative URL that resolves through `metadataBase = NEXT_PUBLIC_SITE_URL`; `.env.example` sets it to `https://typhoon.band`.
- **Not added:** `og:title` and `og:description` (only `openGraph.images` is set), twitter card, canonical, hreflang `alternates` for de/en/tr, `sitemap.ts`, `robots.ts`, JSON-LD (`MusicGroup`/`Event`), and a per-locale `<html lang>`. The root layout hard-codes `lang="de"` on main and on the branch. Neither main nor the branch has a sitemap or robots file.

### 2.3 Consent categories
- `src/components/layout/consent.ts` defines localStorage key `typhoon.consent.v1` with the shape `{ v: 1, necessary: true, external_media: boolean, decided_at: ISO }`. It also defines the events `typhoon:consent-changed` and `typhoon:open-consent`, and the helpers `readConsent`, `writeConsent`, `clearConsent` and `hasCategoryConsent`.
- The key is new. Main uses `typhoon.cookie-consent` with `"accepted"|"declined"`, so everyone would be asked again after a merge. That is acceptable.
- Only **two categories are live in the UI**: `necessary` (locked on) and `external_media` (off by default). `statistics` exists only as a DB seed row, and `marketing` does not exist.
- Banner buttons: `Cookie-Einstellungen` opens preferences, `Nur Notwendige` sets external_media=false, `Alle erlauben` sets true. The preferences view has `Auswahl speichern`. The footer "Legal" column gets a `Cookie-Einstellungen` button that dispatches `typhoon:open-consent`.
- New DE copy: `body: "Diese Website verwendet nur technisch notwendige Cookies. Externe Medien (z. B. YouTube, Spotify) werden erst nach Zustimmung geladen. Kein Tracking."`, `categoryExternalMediaDesc: "Eingebettete Inhalte externer Anbieter (z. B. YouTube, Spotify, SoundCloud, Bandcamp) laden erst nach Zustimmung."`, `embedGateNotice: "Externer Inhalt blockiert. Klicke auf Akzeptieren, um diesen einmaligen Embed zu laden – externe Verbindungen werden erst dann aufgebaut."`, `embedGateAccept: "Externe Medien laden"`. The same strings exist in EN and TR.
- `/[locale]/admin/consent` is a **read-only** list of the `consent_settings` rows plus a static "Aktuelles Verhalten" list. Banner copy comes from the dictionary, not the DB.
- `src/components/media/ExternalMediaGate.tsx` is a reusable gate. Before consent it renders a placeholder with an "Externe Medien laden" button and a Preferences button, and it inserts children only after `external_media=true`. **Nothing in the app uses it yet**: `git grep` finds no import and no `<iframe>` in `src`.

### 2.4 Platform links (Spotify / YouTube / Instagram / Facebook / SoundCloud / Bandcamp)
- `/[locale]/admin/platform-links` has a create form (platform select, URL, sort order, "Aktiv"), a list with inline edit, and delete. It shows the hint "Noch offen: …" for platforms that have no link yet.
- The public side works as follows. `src/app/[locale]/layout.tsx` calls `getPlatformLinks()`, which returns only `is_active = true` rows sorted by `sort_order`, and passes them to `<Footer platformLinks>`. The footer renders six SVG icons (the old four plus new SoundCloud and Bandcamp glyphs) with `target="_blank" rel="noreferrer"`. **This removes today's four dead `href="#"` icons**: on main, `site.social.*` are all `""`, so the live footer links to `#`. With no rows, the footer shows "—".
- `revalidatePath('/{de,en,tr}')` runs on save and delete.

### 2.5 Migrations, tables, policies
No new tables. `supabase/migrations/0006_legal_seo_consent_platforms.sql` is idempotent and does four things:
- seeds `legal_pages` with `('imprint',false)`, `('privacy',false)` and `('cookies',false)` using `on conflict (slug) do nothing`
- adds `platform_links_platform_chk CHECK (platform in ('spotify','youtube','instagram','facebook','soundcloud','bandcamp'))`, guarded by a `pg_constraint` existence check. **It will fail if prod already has rows with other platform strings.**
- seeds `consent_settings` rows: `necessary` "Notwendig" (required), `external_media` "Externe Medien", and `statistics` "Statistiken" ("Aktuell nicht aktiv…")
- creates `seo_entries_path_idx`

`supabase/policies/0006_legal_seo_consent_platforms.sql` re-asserts the exact policies from `0001_rls.sql`, with the same names:
- `public_read_published_legal_pages`
- `public_read_legal_translations` (for published parents only)
- `public_read_seo` (`true`)
- `public_read_consent` (`true`)
- `public_read_active_platform_links`
- `<table>_admin_write` for all to authenticated using `is_active_admin()`
It adds nothing new and weakens nothing. Admin writes in the app go through the service-role client (`getAdminSupabase`, `server-only`).

Numbering smell: main already has `supabase/policies/0006_phase05_member_full_read.sql`, so there would be **two `0006_*` policy files**. They are independent and idempotent, so it is cosmetic. The README on the branch lists both.

## 3. Conflicts with main

- `git merge-tree --write-tree --name-only origin/main origin/claude/phase-06-legal-seo-consent-platforms` returns tree `a9ab72fe0b7863dda4c125f06f7d4c6353414bc8` with **exit 0 and no conflicted paths. The merge is clean.**
- The only post-branch main change is `src/lib/content/normalize.ts` (placeholder fix), and Phase 06 does not touch that file.
- **Verified on the merged tree** (exported into the scratchpad): `tsc --noEmit` exits 0, `next lint` reports "✔ No ESLint warnings or errors", and `next build` exits 0. The build lists all new routes (`/[locale]/admin/{legal,seo,platform-links,consent}` and the legal pages).
- Semantic interactions with main: none found. The legal slug mapping in `supabase-content.ts` (`imprint`→`imprint` and so on) matches the admin writer.
- The runtime state of prod Supabase was not checked, because this was repo-only recon. It is unknown whether migration `0006` has been applied or whether `platform_links` has rows.

## 4. Quality assessment

**Good (worth keeping):**
- The architecture is clean and consistent with Phases 02–05: server-only admin data layer, server actions with typed validators (`src/lib/validation/legal-seo-platforms.ts`), `requireAdminWithPasswordOk()` on every page and action, UUID checks on delete, and service role never in the browser.
- The public side degrades gracefully. Without Supabase you get the curated fallback, and nothing is required during the build.
- The consent storage contract is versioned and event-based, withdrawal re-hides gated embeds, and there is no analytics.
- The footer dead-link problem on live is fixed. The legal pages become server components and get proper `<title>`s.

**Bugs and weaknesses found:**
1. **BUG: platform links cannot be deactivated from the UI.** `validatePlatformLink` uses `asBool(r.is_active, true)`. An unchecked checkbox sends no field, so `formData.get()` returns `null`, and `asBool(null, true)` returns `true`. Unticking "Aktiv" therefore saves `is_active=true` again. Only Delete removes a link. This makes manual test step 4 in the branch's own doc fail ("Toggle `is_active` off → icon disappears"). Fix: default to `false`, or add a hidden `is_active=false` input before the checkbox.
2. Doc/code mismatch: the docs say "Saving an empty title + body deletes the translation row", but `title` is `required` on the client and on the server (`"Titel ist Pflicht."`), so that branch in `saveLegalPage` can't be reached. `validateLegal` also `.trim()`s the body even though the comment in `legal.ts` says "do not trim".
3. The publish flag is per slug, but the form is per locale. Ticking "Veröffentlicht" while editing EN also publishes DE. Locales without a translation then fall back to the curated text with the draft note, so nothing breaks, but the UX can surprise.
4. Consent UI gaps:
   - `aria-modal` is set, but there is no focus trap, no Escape handling and no Cancel button in preferences mode.
   - The banner listens only to the `open` event, not `consent-changed`. If a visitor accepts inside an `ExternalMediaGate` while the banner is still showing, the banner stays up, and clicking "Nur Notwendige" afterwards revokes the consent again.
   - Consent never expires and is never re-requested.
5. `ExternalMediaGate` is dead code today. There are no embeds.
6. SEO is minimal: no og:title/description, twitter, canonical, hreflang, sitemap, robots or JSON-LD, and `<html lang="de">` is fixed. The home fallback title becomes the SHOUTY genre line with bullets.
7. The SEO admin has no in-place edit. You retype the path to overwrite an entry.
8. The admin copy is German-only regardless of `/en/admin`. This matches the rest of the admin.
9. The CHECK constraint allowlist is narrow. Apple Music, Deezer, TikTok, Amazon Music and Bandsintown are not supported, so adding one later means changing the DB constraint and the TS list.

**Legal-content facts to preserve or verify.** These are unchanged by Phase 06 and are the same on main. This is not legal advice; flag them to the owner.
- The imprint contact is `site.imprint`: `"Mika Hertler"`, `"Am Schwarzen Steg 5a"`, `"95448 Bayreuth"`, `"Deutschland"`. The contact details are `booking@typhoon.band` and `+49 176 64472296`, and `info@typhoon.band` is intentionally NOT exposed (comment in `src/data/site.ts`).
- The imprint cites `"Angaben gemäß § 5 TMG"` and `"§ 55 Abs. 2 RStV"`. These are outdated: the TMG was replaced by the DDG (`§ 5 DDG`) in May 2024, and the RStV was replaced by the MStV (`§ 18 Abs. 2 MStV`).
- The "Streitbeilegung" paragraph refers to the EU ODR platform, which as far as I know has been discontinued since 20 Jul 2025. The owner should verify this.
- The privacy text says booking data is "nicht an Dritte weitergegeben" and names only Vercel as a processor. It does not mention Supabase (DB and storage of booking requests) or Resend (booking mail), and it has no storage-duration or supervisory-authority sections.
- The cookies fallback DE says "Eure Zustimmung wird ausschließlich lokal in eurem Browser (localStorage) gespeichert."

## 5. Recommendation for the redesign

**Incorporate Phase 06's functionality. Port it rather than merge it blindly.** The feature set is exactly what the owner asked for in the roadmap: `docs/current-task.md` on main still names Phase 06 as active, and the spec states the requirement "As soon as Admin inserts a link … automatically appear". The code is sound, and the merge onto main is conflict-free and builds.

Take over these parts:
1. **Data layer and DB** as-is: `src/lib/admin/{legal,seo,platform-links,consent}.ts`, `src/lib/validation/legal-seo-platforms.ts` (fix `asBool` default for `is_active`), and migration and policy `0006`. Consider renaming the policy file to `0007_…` and widening the platform allowlist (e.g. + `apple_music`, `tiktok`, `deezer`, `bandsintown`) before prod apply.
2. **Admin pages** `/admin/legal`, `/admin/seo`, `/admin/platform-links` and `/admin/consent`: keep the logic and restyle them to the new admin design. Add edit-in-place for SEO and a clearer "Publish applies to all languages" label.
3. **Consent contract** (`consent.ts`: key `typhoon.consent.v1`, events) and the **`ExternalMediaGate`**. The redesign should actually use the gate if it adds Spotify/YouTube/Bandcamp embeds (e.g. a "Watch live" video section). Rebuild the banner UI in the new design with a real modal (focus trap, Esc, Cancel), sync on `consent-changed`, and optionally re-ask after 12 months.
4. **Platform links in the public UI**: render them from `getPlatformLinks()`, not only in the footer. Put them in hero, header or a "Listen on" strip too, and use proper brand-neutral icons. Hide the whole block when there are no rows. Never output `href="#"`.
5. **Legal pages as server components** using Supabase-first with the curated fallback and `LegalBody`. Keep "no rich text, no HTML injection". Update the fallback texts: DDG/MStV, the ODR paragraph, and Supabase and Resend named as processors. Present this to the owner as a draft, not legal advice.
6. **SEO**: go further than Phase 06. Keep `getSeoEntry` + `generateMetadata`, and add these:
   - og:title, og:description, og:locale and twitter card
   - `alternates.canonical` and `languages` (de/en/tr hreflang)
   - `app/sitemap.ts` and `app/robots.ts`
   - JSON-LD `MusicGroup` (+ `Event` for shows)
   - a per-locale `<html lang>`
   - a nicer home fallback title, e.g. keep `"Typhoon — Funk · Soul · Jazz · Bluesrock"`, the current live title
   - an absolute OG image URL
Drop or rework the uppercase genre-line title fallback.

Do NOT take `Footer.tsx` or `CookieConsent.tsx` markup verbatim, because their visual layer belongs to the old design. Reuse their behaviour only.
