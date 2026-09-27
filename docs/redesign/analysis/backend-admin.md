# Recon: typhoon.band-website `main` @ 740ff46: Backend + Admin

Scope: read-only forensic pass over `supabase/**`, `src/lib/**`, `src/app/api/**`, `src/app/[locale]/admin/**`, config, README and docs 04-08 plus `docs/admin-*.md`. The working tree HEAD equals `origin/main` (740ff464).

**RLS was verified empirically.** I applied every SQL file, in the README order plus `policies/0006`, to a throwaway local Postgres 16 with a stub `auth`/`storage` schema. Then I probed it as `anon`, as an `authenticated` editor and as an `authenticated` owner. The throwaway DB has since been deleted. Findings marked **[TESTED]** come from that run.

---

## 0. TL;DR for the redesign

- **Backend stack.** Supabase (Postgres + Auth + Storage) and Resend (REST via `fetch`, no SDK). There is no `zod` and no middleware. Deps are `next 15.5.15`, `react 19.0.0`, `@supabase/ssr ^0.10.3`, `@supabase/supabase-js ^2.105.4`.
- **Public data flow.** The frontend only calls `getPublicPageContent(locale)` from `src/lib/content/index.ts`. The homepage is `force-dynamic`. The content layer is Supabase-first with a static fallback from `src/data/*` and dictionaries.
- **Admin.** It lives at `/[locale]/admin/*`. Login is email + password. A first login forces a password change. There are six live modules: Booking inbox with convert-to-show, Shows CRUD, Gallery, Music (demos), Members, and Site-Assets.
  - Uploads go browser → Supabase Storage through a signed upload URL, then a server action stores the public URL.
- **Booking.** `POST /api/booking` takes JSON. Validation is custom (no zod) and includes a honeypot `hp_field`.
  - The row is inserted with the service role, and the mail goes via Resend to `BOOKING_EMAIL` with Reply-To set to the sender.
  - **There is no rate limiting.**
- **Most important bugs and gaps (details in §6/§7):**
  1. The show forms cannot unpublish or hide a show. An unchecked checkbox becomes `null`, and `asBool(null, true)` returns `true`.
  2. TBA shows from Supabase are never rendered publicly. `page.tsx` filters on `startsAt` being truthy, and TBA rows carry `""`.
  3. The `editor` role has the same power as `owner`, including booking PII and deletes. The role helpers exist but are never used.
  4. **[TESTED]** anon can list every object in every storage bucket, so unpublished or hidden MP3s are enumerable.
  5. There is no rate limiting or CAPTCHA on booking, and `ip_hash` is never populated.
  6. There is no Supabase SSR middleware, so session refresh is likely broken after about 1h.
  7. Server responses are German only, even for EN and TR visitors.
  8. Deleting songs, media or members leaves orphaned storage files.
  9. Once a single song row exists in Supabase, all 6 fallback demos disappear. Members, by contrast, use a per-slug merge.
  10. The privacy page says the data is not passed to third parties ("nicht an Dritte weitergegeben"), yet Supabase and Resend process it. There is no retention or hard delete.

---

## 1. Database schema (complete, as of main)

Apply order: this is the README "Supabase setup checklist" order, plus the member policy file that the README list omits.

```
migrations/0001_init.sql
policies/0001_rls.sql
migrations/0002_supabase_foundation.sql
policies/0002_rls_foundation.sql
migrations/0003_storage_buckets.sql
migrations/0004_admin_password_flow.sql
migrations/0005_booking_show_workflow.sql
policies/0005_booking_show_workflow.sql
policies/0006_phase05_member_full_read.sql
```

The last file is **missing from the README apply list** at README L201-210. It is mentioned only at README L378 and in `docs/admin-media-audio-uploads.md:149`.

**[TESTED]** All of these files apply cleanly and idempotently to PG16.

- Extension: `pgcrypto`, used for `gen_random_uuid()`.
- There are **no Postgres ENUM types**. All enums are `text` plus `CHECK` constraints.

### 1.1 Tables (final shape after all migrations)

**`public.admin_profiles`**

| column | type / constraint |
|---|---|
| id | uuid PK default gen_random_uuid() |
| user_id | uuid NOT NULL UNIQUE → auth.users(id) ON DELETE CASCADE |
| display_name | text |
| email | text |
| role | text NOT NULL default 'editor' CHECK (role in ('owner','admin','editor')) |
| is_active | boolean NOT NULL default true |
| last_login_at | timestamptz |
| must_change_password | boolean NOT NULL default **false** (0004) |
| password_changed_at | timestamptz (0004) |
| initial_password_issued_at | timestamptz (0004) |
| created_at / updated_at | timestamptz NOT NULL default now() |

The column comment (0004) on `must_change_password` reads: `'If true, admin must change password before accessing dashboard.'`

**`public.site_settings`**

- `key text PRIMARY KEY`
- `value jsonb NOT NULL`
- `updated_at timestamptz NOT NULL default now()`
- Added in 0002: `locale text` and `is_public boolean NOT NULL default true`.
- 0002 also adds the partial unique index `site_settings_key_locale_uq ON (key, locale) WHERE locale IS NOT NULL`.
- **Design bug [TESTED]:** the PK stays on `key` alone. That makes a per-locale row impossible. Inserting `('brand', locale 'en')` next to a neutral `'brand'` fails with `duplicate key value violates unique constraint "site_settings_pkey"`.
- Keys used by the code:
  - `hero_image`, `hero_signature` and `bandinfo_image`, each holding `{"url": "..."}` (admin assets).
  - `brand` (`{name, tagline, genreLine}`) and `contact` (`{booking, phone}`), which the public normaliser reads but no admin writes.

**`public.platform_links`**

| column | type / constraint |
|---|---|
| id | uuid PK |
| platform | text NOT NULL |
| url | text NOT NULL |
| is_active | bool NOT NULL default true |
| sort_order | int NOT NULL default 0 |
| created_at / updated_at | timestamptz |

On main there is no CHECK on `platform`. The phase-06 branch adds one (see §7).

**`public.legal_pages`**

- `id`, `slug text NOT NULL UNIQUE`, `is_published bool NOT NULL default false`, `created_at` and `updated_at`.
- Child table `public.legal_page_translations`: `id`, `legal_page_id → legal_pages ON DELETE CASCADE`, `locale text NOT NULL`, `title text NOT NULL`, `body_md text NOT NULL`, with `UNIQUE (legal_page_id, locale)`. It has no timestamps.

**`public.band_members`**

- `id`, `slug text NOT NULL UNIQUE`, `photo_url text`, `sort_order int NOT NULL default 0`, `is_visible bool NOT NULL default true`, `created_at` and `updated_at`.
- Child table `public.band_member_translations`: `id`, `band_member_id → band_members ON DELETE CASCADE`, `locale text NOT NULL`, `name text NOT NULL`, `role text NOT NULL`, `bio_md text`, with `UNIQUE (band_member_id, locale)`.

**`public.songs`**

| column | type / constraint |
|---|---|
| id | uuid PK |
| title | text NOT NULL |
| slug | text NOT NULL UNIQUE |
| audio_url | text |
| cover_image_url | text |
| status | text NOT NULL default 'demo' CHECK (status in ('demo','single','album_track','unreleased')) |
| is_streamable | bool NOT NULL default true |
| is_downloadable | bool NOT NULL default false |
| is_featured | bool NOT NULL default false |
| sort_order | int NOT NULL default 0 |
| is_visible | bool NOT NULL default true |
| created_at / updated_at | timestamptz |

There is no DB constraint for "only one featured". The app enforces it with two UPDATEs.

**`public.shows`**

| column | type / constraint |
|---|---|
| id | uuid PK |
| starts_at | timestamptz, **nullable** since 0002 |
| is_tba | bool NOT NULL default false (0002) |
| venue | text NOT NULL |
| city | text |
| country | text |
| ticket_url | text |
| event_type | text (0005) |
| source_booking_request_id | uuid → booking_requests(id) ON DELETE SET NULL (0005) |
| is_visible | bool NOT NULL default true |
| is_published | bool NOT NULL default true (0005) |
| sort_order | int NOT NULL default 0 |
| created_at / updated_at | timestamptz |

- CHECK `shows_tba_or_starts_at_chk`: `(is_tba = true OR starts_at IS NOT NULL)`.
- Partial index `shows_source_booking_idx ON (source_booking_request_id) WHERE source_booking_request_id IS NOT NULL`.
- Child table `public.show_translations`: `id`, `show_id → shows ON DELETE CASCADE`, `locale NOT NULL`, `notes text`, with `UNIQUE (show_id, locale)`. **It is unused by the code.**

**`public.booking_requests`**

| column | type / constraint |
|---|---|
| id | uuid PK |
| name | text NOT NULL |
| email | text NOT NULL |
| phone | text |
| event_date | date |
| event_location | text |
| event_type | text |
| message | text NOT NULL |
| status | text NOT NULL default 'new' CHECK `booking_requests_status_check` (status in ('new','read','answered','accepted','converted','rejected','archived','spam')) |
| ip_hash | text (**never written**) |
| user_agent | text |
| locale | text (0002) |
| converted_show_id | uuid → shows(id) ON DELETE SET NULL (0005) |
| converted_at | timestamptz (0005) |
| deleted_at | timestamptz (0005, soft delete) |
| created_at / updated_at | timestamptz |

- 0005 swapped the CHECK. The legacy value `'done'` is migrated to `'answered'`.
- Indexes: `booking_requests_active_idx ON (created_at desc) WHERE deleted_at IS NULL`, and `booking_requests_converted_show_idx ON (converted_show_id) WHERE converted_show_id IS NOT NULL`.
- Note the circular FK pair: `booking_requests.converted_show_id` ↔ `shows.source_booking_request_id`.

**`public.media_items`**

| column | type / constraint |
|---|---|
| id | uuid PK |
| type | text NOT NULL CHECK (type in ('image','video')) |
| file_url | text NOT NULL |
| thumbnail_url | text |
| category | text; admin always writes `'gallery'` |
| sort_order | int NOT NULL default 0 |
| is_visible | bool NOT NULL default true |
| alt_text | text (0002) |
| title | text (0002) |
| created_at / updated_at | timestamptz |

**`public.seo_entries`**

- `id`, `path text NOT NULL`, `locale text NOT NULL`, `title`, `description`, `og_image_url`, with `UNIQUE (path, locale)`.
- It has no timestamps.

**`public.consent_settings`**

- `id`, `category text NOT NULL UNIQUE`, `label text NOT NULL`, `description`, `is_required bool NOT NULL default false`, `updated_at`.
- On main it is unused by the code.

### 1.2 Functions and triggers

- `public.set_updated_at()`: plpgsql, sets `new.updated_at := now()`. A trigger `trg_<t>_updated_at BEFORE UPDATE ... FOR EACH ROW` exists on:
  - admin_profiles, site_settings, platform_links, legal_pages
  - band_members, songs, shows, booking_requests
  - media_items, consent_settings
  - The translation tables and `seo_entries` have none.
- `public.is_active_admin()`: `language sql stable`, **not SECURITY DEFINER** and with no `search_path` set. Body: `exists(select 1 from admin_profiles where user_id = auth.uid() and is_active)`.
- `public.is_owner()`: same shape, plus `role = 'owner'`.
  - **[TESTED]** Both work with the current policy set. There is no recursion error, because the self-read policy lets the helper see its own row.
  - They are still fragile. They depend on `admin_profiles_self_read`, and recommended Supabase practice is `SECURITY DEFINER` plus `set search_path = ''`.

### 1.3 RLS policies (final state)

RLS is **enabled** on all 14 public tables (0001_rls).

| table | policy | cmd / role | expression |
|---|---|---|---|
| band_members | `public_read_band_members` (0006) | SELECT, all | `true`: hidden rows are readable too, on purpose, for the fallback merge |
| band_member_translations | `public_read_band_member_translations` (0006) | SELECT | `true` |
| songs | `public_read_streamable_songs` | SELECT | `is_visible = true and is_streamable = true` |
| shows | `public_read_visible_shows` (0005) | SELECT | `is_visible = true and is_published = true` |
| show_translations | `public_read_show_translations` (0005) | SELECT | EXISTS parent show visible AND published |
| media_items | `public_read_visible_media` | SELECT | `is_visible = true` |
| platform_links | `public_read_active_platform_links` | SELECT | `is_active = true` |
| legal_pages | `public_read_published_legal_pages` | SELECT | `is_published = true` |
| legal_page_translations | `public_read_legal_translations` | SELECT | EXISTS parent published |
| seo_entries | `public_read_seo` | SELECT | `true` |
| consent_settings | `public_read_consent` | SELECT | `true` |
| site_settings | `public_read_public_site_settings` (0002) | SELECT | `is_public = true` |
| site_settings, platform_links, legal_pages, legal_page_translations, band_members, band_member_translations, songs, shows, show_translations, media_items, seo_entries, consent_settings | `<t>_admin_write` | ALL **to authenticated** | USING/WITH CHECK `public.is_active_admin()` |
| legal_pages | `legal_pages_owner_only_delete` | DELETE to authenticated | `public.is_owner()`. **Ineffective**: permissive policies are OR'ed with `legal_pages_admin_write`, so any active admin can delete |
| admin_profiles | `admin_profiles_owner_all` | ALL to authenticated | `is_owner()` |
| admin_profiles | `admin_profiles_self_read` | SELECT to authenticated | `user_id = auth.uid()` |
| booking_requests | *(none)* | n/a | no public or authenticated access at all. Only the service role (`drop policy if exists public_read_booking_requests / public_write_booking_requests` asserts this) |

**[TESTED] results:**

- anon: `admin_profiles` 0 rows, `booking_requests` 0 rows, hidden songs 0 rows.
- An anon insert into `booking_requests` or `songs` fails with `new row violates row-level security policy`.
- An editor that is an active admin can `UPDATE songs` directly through PostgREST using the anon key plus its own JWT.
- An editor **cannot** self-escalate its role; the `UPDATE admin_profiles` changes 0 rows.
- An editor sees 0 `booking_requests` through RLS. The app reads bookings through the service role anyway.
- An owner sees all `admin_profiles` rows.
- `must_change_password` is **not** enforced in RLS. An admin who has not rotated the initial password can still write content through PostgREST directly.

### 1.4 Storage buckets (0003)

- Buckets, all `public = true`: `public-media`, `audio-demos`, `member-images`, `gallery`, `legal-assets`.
- The buckets have **no `file_size_limit` and no `allowed_mime_types`**.
- Policies on `storage.objects`:
  - `typhoon_public_read_<bucket>`: FOR SELECT USING `bucket_id = '<bucket>'`, applying to all roles including anon. **[TESTED]** anon can therefore `select`/list every object. Through the Storage `list` API, **unpublished or hidden uploads such as unreleased demo MP3s are enumerable**. Public buckets would serve files by URL even without a SELECT policy; this policy adds listing.
  - `typhoon_admin_write_<bucket_with_underscores>`: FOR ALL TO authenticated, USING/WITH CHECK `bucket_id = '<b>' and public.is_active_admin()`.
- Upload targets used by the app (`src/app/[locale]/admin/_uploads/actions.ts` `TARGETS`):

| target | bucket | prefix | kind |
|---|---|---|---|
| gallery | gallery | none | image |
| song-audio | audio-demos | none | audio |
| song-cover | public-media | `covers` | image |
| member-photo | member-images | none | image |
| site-hero-image | public-media | `site/hero_image` | image |
| site-hero-signature | public-media | `site/hero_signature` | image |
| site-bandinfo-image | public-media | `site/bandinfo_image` | image |

- Object key format (`buildStorageKey`): `<prefix/><yyyy-mm-dd>-<sanitized-slug max 60>-<uuidv4><.ext>`.

---

## 2. Admin routes: what each one does

**Guarding.**

- There is **no middleware**. Every page and every server action calls a guard itself.
- `src/app/[locale]/admin/layout.tsx` is a pass-through: `<>{children}</>`. Admin pages therefore render inside the public locale layout, including the public Header, Footer and CookieConsent.

Guards live in `src/lib/admin/auth.ts`:

- `getCurrentAdmin()` does the following:
  - Builds a cookie-bound anon SSR client via `@supabase/ssr` `createServerClient`.
  - Calls `auth.getUser()`, which server-validates the JWT.
  - Selects the `admin_profiles` row where `user_id = user.id`. RLS allows this through `admin_profiles_self_read`.
  - Checks `canAccessAdmin(profile)`, which requires `is_active` and a role in `['owner','admin','editor']`.
  - Returns `{userId, email, profile, mustChangePassword}` or `null`.
- `requireAdmin(locale, {from})` redirects to `/${locale}/admin/login?from=<encoded>` when `getCurrentAdmin()` is null.
- `requireAdminWithPasswordOk(locale, {from})` calls `requireAdmin` and then redirects to `/${locale}/admin/change-password` if `must_change_password` is true.

Role helpers in `src/lib/admin/roles.ts` (`isOwner`, `isAdminLike`, `isEditor`) are **never used**. All three roles get identical, full access.

- Data access in admin modules uses the **service-role client** (`getAdminSupabase()`, `import "server-only"`) in `src/lib/admin/*.ts`.
- IDs are checked against `UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`.
- Most actions end with `revalidatePath` and `redirect`. Media, music, members and assets use a flash query string: `?created=1` / `?updated=1` / `?deleted=1` / `?saved=1` / `?cleared=1` / `?error=<msg>`.
- The shows and booking actions `throw new Error(...)` on validation failure. That surfaces as a Next error page, with no inline form errors.

### 2.1 `/[locale]/admin/login`

Files: `page.tsx`, `LoginForm.tsx` (client, `useActionState`), `actions.ts#loginWithPasswordAction`.

- **Page behaviour:**
  - If the visitor is already an admin, redirect to change-password when the flag is set; otherwise redirect to `from`, but only if it starts with `/${locale}/admin`, else to `/${locale}/admin`.
  - If Supabase is not configured, show a notice naming `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Form fields:** `locale` (hidden), `from` (hidden), `email`, `password`.
- **Action:**
  1. Calls `signInWithPassword` on the SSR client, which sets the cookies.
  2. On error, returns `"Login fehlgeschlagen. Bitte prüfe E-Mail und Passwort."`
  3. Loads the profile. If the user is not an admin, signs out and returns `"Dieser Account hat keinen aktiven Admin-Zugang. Bitte wende dich an einen Owner."`
  4. Updates `last_login_at` through the service role.
  5. Redirects to change-password when `must_change_password` is set, otherwise to `ADMIN_PATH(locale, from)`.
- UI copy: `Anmelden`, and the note "Zugang nur für aktive Admins. Owner richten neue Accounts über die Supabase-Konsole + admin_profiles ein."
- There is **no sign-up, no password reset or forgot-password flow, and no magic link**. Accounts are provisioned manually in the Supabase Dashboard plus SQL (see `docs/admin-setup.md`).

### 2.2 `/[locale]/admin/change-password` (forced initial rotation)

Files: `page.tsx` uses `requireAdmin`, not `...WithPasswordOk`, to avoid a redirect loop. `PasswordForm.tsx` and `actions.ts#changePasswordAction`.

- If `mustChangePassword` is false, the page redirects to `/${locale}/admin`. **There is no way to change your password voluntarily later.**
- Copy: "Passwort jetzt setzen" and "Hallo {displayName}. Aus Sicherheitsgründen muss das initiale Passwort einmalig geändert werden, bevor du auf das Dashboard zugreifen kannst."
- Fields: `password` and `confirm`, each with a minimum length of 12 (`PASSWORD_MIN_LENGTH = 12`).
- The action:
  1. Validates length ≥ 12 and that both entries match.
  2. Calls `getCurrentAdmin()`.
  3. Calls `authClient.auth.updateUser({password})`. It does **not** verify the current password.
  4. Uses the service role to set `must_change_password=false`, `password_changed_at=now`, `updated_at=now`. If the service key is missing, the flag never flips and the user loops.
  5. Redirects to `/${locale}/admin`.
- The page also has an "Abbrechen und abmelden" logout form.

### 2.3 Logout: `POST /api/admin/auth/logout?locale=<de|en|tr>`

`src/app/api/admin/auth/logout/route.ts`: calls `supabase.auth.signOut()`, then returns a 303 redirect to `/${locale}/admin/login`. There is no CSRF/Origin check; logout CSRF is low impact.

### 2.4 `/[locale]/admin` (dashboard)

- Guard: `requireAdminWithPasswordOk`.
- Cards marked live (label, description, route):
  - Booking: "Booking-Anfragen ansehen, beantworten, archivieren oder in eine Show umwandeln." → `/admin/booking`
  - Shows: "Termine veröffentlichen, TBA markieren, sortieren."
  - Media: "Galerie-Bilder hochladen, sortieren, ausblenden."
  - Music: "Demos pflegen, MP3 und Cover hochladen, Sichtbarkeit/Featured."
  - Members: "Bandmitglieder-Fotos hochladen und Sichtbarkeit pflegen."
  - Assets: "Hero- und Bandinfo-Bild austauschen, Site-Assets verwalten." → `/admin/settings/assets`
- Cards marked "Coming next": Legal, SEO, Platform Links.
- The intro copy is stale: "Diese Phase liefert nur die Auth-Hülle und einen schreibgeschützten Booking-Überblick."
- The shell (`_components/AdminShell.tsx`) contains:
  - A header showing display_name, role label (Owner/Admin/Editor) and "· aktiv".
  - A Logout button.
  - Pill nav: Dashboard / Booking / Shows / Media / Music / Members / Assets.

### 2.5 `/[locale]/admin/booking` (inbox)

- Calls `getRecentBookingRequests(50, {includeDeleted})`, sorted `created_at desc`. It is **limited to 50, with no pagination, search or status filter**.
- Filter pills: "Aktive Anfragen" and "Inkl. Archiv" (`?archived=1`).
- Each row shows: name, status chip, a "↳ Show" badge when converted, an "archiviert" badge, the locale, created_at (de-DE), a mailto link, "Details →", and Datum / Ort / Art / Telefon.
- Status labels: `new: Neu`, `read: Gelesen`, `answered: Beantwortet`, `accepted: Angenommen`, `converted: In Show umgewandelt`, `rejected: Abgelehnt`, `archived: Archiviert`, `spam: Spam`.
- Opening a request does **not** auto-mark it as read.

### 2.6 `/[locale]/admin/booking/[id]` (detail) plus `actions.ts`

- The page validates the UUID (`notFound` otherwise) and shows every field, with the message rendered using `whitespace-pre-line`.
- **Actions:**
  - `changeBookingStatusAction(locale, id, status)`: `select` over all 8 statuses, then updates `status` and `updated_at`.
  - `archiveBookingAction`: soft delete. Sets `deleted_at=now`, **status='archived'**, `updated_at`, `WHERE deleted_at IS NULL`, then redirects to the list.
    - The button label is "Anfrage löschen", or "Anfrage archivieren" when the booking has been converted.
    - **There is no hard delete anywhere.** That is a GDPR concern.
  - `restoreBookingAction`: sets `deleted_at=null` only. **The status stays `archived`.** Minor bug.
  - `convertBookingToShowAction`: shown only when the booking is not yet converted.
    - Form fields and prefills: date (from event_date), time, venue (event_location), city, country (default "Deutschland"), event_type, ticket_url, is_tba, is_visible (checked), is_published (checked).
    - Steps: `validateShow`, then `createShow({...,source_booking_request_id:id})`, then `markBookingConverted` (status 'converted', converted_show_id, converted_at).
    - After that it revalidates the admin paths and `/${locale}`, then redirects to `?converted=1`.
    - This is not transactional: if the link step fails, an orphan show is left behind.
    - **Bug:** unchecking "Auf Website anzeigen" or "Veröffentlicht" has no effect (see §6).
- A "Show-Verknüpfung" panel links to `/admin/shows/<id>/edit` and states "Auf der Website sichtbar." or "Aktuell nicht öffentlich sichtbar."
- The page says replies go out by external mail: "Antworten erfolgen weiterhin extern per Mail; keine automatischen Mails aus dem Admin."

### 2.7 `/[locale]/admin/shows`, `/shows/new`, `/shows/[id]/edit` plus `actions.ts`

- The list comes from `listAdminShows(200)`, ordered by `starts_at asc, nulls last`.
- Each row shows: venue, date or "TBA", event_type, an "aus Booking" badge, "Entwurf" (visible but unpublished) or "ausgeblendet", city/country, the ticket link, "Bearbeiten →", an Ausblenden/Anzeigen toggle and Löschen.
- Hard delete happens **without confirmation**.
- `ShowForm` fields: `date` (type=date), `time` (type=time), `venue` (required), `city`, `country` (default "Deutschland"), `event_type`, `ticket_url`, `sort_order`, and checkboxes `is_tba`, `is_visible`, `is_published`.
- Actions:
  - `createShowAction`
  - `updateShowAction`, which requires a UUID
  - `deleteShowAction`, a hard delete; `booking.converted_show_id` is set to null by the FK
  - `toggleShowVisibilityAction`, which flips `is_visible` only through a hidden `next=0|1`. It is the only working way to hide a show, and **there is no way to set `is_published=false`**.
- Validation is in `src/lib/validation/show.ts` (custom):
  - `venue` must be ≥ 2 characters; it is trimmed and capped at 200.
  - city is capped at 120. country is capped at 120 and defaults to `"Deutschland"` when empty. event_type is capped at 120.
  - If `is_tba` is off, `date` is required and must match `^\d{4}-\d{2}-\d{2}$`, and an optional `time` must match `^\d{2}:\d{2}$`.
  - `ticket_url` is optional; when present it must be http(s) (`new URL`), capped at 500.
  - `sort_order` goes through parseInt with a default of 0.
  - Messages: "Venue / Ort ist Pflicht.", "Datum angeben oder TBA aktivieren.", "Datumsformat ist ungültig (yyyy-mm-dd).", "Uhrzeitformat ist ungültig (HH:MM).", "Ticket-Link muss eine gültige http(s)-URL sein."
- **Time zone quirk:** `starts_at = \`${date}T${time||"12:00"}:00.000Z\``. The admin types local (Berlin) wall-clock time, but it is stored as UTC.
  - When editing, the form hides "12:00" as if no time had been entered.
  - A redesign that shows times or converts to Europe/Berlin would be off by 1-2h. Either treat the stored value as a floating wall-clock time or migrate it.

### 2.8 `/[locale]/admin/media` (gallery)

- The list is `listAdminMedia("gallery", 200)`, meaning `category='gallery'` ordered by `sort_order asc`. Each item has a thumbnail (next/image `unoptimized`), title, sort_order, alt_text, an `is_visible` checkbox (hidden-input pattern, correct), Speichern, Löschen and "Quelle öffnen ↗".
- `CreateMediaForm` (client) contains:
  - A `DirectUploadField name="file" target="gallery" kind="image" required`.
  - Title (optional), sort_order (default 0) and alt_text (optional).
  - A submit button that stays disabled until the upload phase is `done`.
- Actions:
  - `uploadGalleryImageAction`: `parseSupabasePublicUrl(file_url)`, requires bucket `gallery`, then `createMediaItem({type:'image', category:'gallery', is_visible:true, alt_text: alt||title||null})`.
  - `updateGalleryItemAction`: updates title, alt, sort and visibility.
  - `deleteGalleryItemAction`: deletes the DB row only. **The storage object is orphaned.**
- Video (`type='video'`) is supported by the schema but has no UI, and the public normaliser drops non-images.

### 2.9 `/[locale]/admin/music` (demo songs)

- `SongForms.tsx` (client) contains:
  - **Create form:** `title` (required), `slug` (optional; derived via `sanitizeBaseName(title)`, max 80), `DirectUploadField name="audio" target="song-audio" kind="audio"` (required), `DirectUploadField name="cover" target="song-cover" kind="image"` (optional), `sort_order`, `is_visible` (checked) and `is_featured`.
  - **Edit form (per row):** a cover preview, title, slug, "MP3 ersetzen (optional)", "Cover ersetzen (optional)", sort_order, Sichtbar, Featured, "Cover entfernen (kein Upload nötig)" (`clear_cover`), and an audio "Quelle öffnen ↗" link.
- Actions:
  - `createSongAction`: requires the audio URL in bucket `audio-demos`; the cover must be in `public-media`. `createSong` forces `status:'demo'`, `is_streamable:true`, `is_downloadable:false`. If featured, it calls `setFeaturedSong(id)`, which clears all other rows and then sets this one (two UPDATEs, not atomic).
  - `updateSongAction`: every update **forces `is_streamable=true, is_downloadable=false`**. The title is not validated; an empty string is allowed.
  - `deleteSongAction`: hard delete of the DB row. **The MP3 and cover are orphaned in storage**, and because of the list policy they stay publicly listable and downloadable.

### 2.10 `/[locale]/admin/members`

- **The list is always the 8 static fallback slugs** from `src/data/members.ts`: `typhoon, mika, schack, hardy, stefan, tom, bugra, jurgen`, merged with DB rows by slug.
  - There is **no UI to add a 9th member**, even though the normaliser and the action support extra slugs.
- `MemberForm` fields per member:
  - hidden `locale` and `slug`
  - `DirectUploadField name="photo" target="member-photo"`, submitted as `photo_file_url`
  - `clear_photo` ("Aktuelles Foto entfernen (Fallback wieder anzeigen)")
  - per locale (de, en, tr): `name_<loc>`, `role_<loc>` ("Instrument / Rolle"), `bio_<loc>` ("Kurze Bio")
  - `sort_order` and `is_visible` (hidden-input pattern)
- `saveMemberAction`:
  1. Checks the slug against `^[a-z0-9-]{1,40}$`.
  2. Requires the photo URL to be in bucket `member-images`.
  3. Caps name and role at 160 and bio at 800.
  4. Calls `saveMember`, which upserts `band_members` by slug. On insert: `photo_url`, `sort_order`, `is_visible`. On update: `is_visible` always; the photo only if new or cleared; `sort_order` if given.
  5. Then, per locale, inserts or updates the translation. A trio with all fields empty is **skipped**, so a translation that was once saved can never be removed to fall back to the dictionary again.
- The docs say "DE Pflicht", but that is not enforced server-side.

### 2.11 `/[locale]/admin/settings/assets`

- There are 3 slots:
  - `hero_image`: fallback `/assets/hero/hero-collage.jpeg`
  - `hero_signature`: optional, fallback `/assets/branding/typhoon-signature-gold.png`
  - `bandinfo_image`: fallback `/assets/gallery/gallery-5.jpg`
- `SiteAssetSlotForm` uses `DirectUploadField name="file"` with target `site-hero-image`, `site-hero-signature` or `site-bandinfo-image`.
- `saveSiteAssetAction` requires bucket `public-media`, then calls `upsertAssetSetting(key, url)`. That upserts `site_settings {key, value:{url}, is_public:true}` with `onConflict: key`.
- `clearSiteAssetAction` sets `value = {}`. The old file is orphaned.

### 2.12 Direct-to-storage upload flow (shared)

`_uploads/DirectUploadField.tsx` (client) together with the `_uploads/actions.ts#prepareDirectUpload` server action:

1. The client validates `{filename,size,mime}` with `clientValidateFile`, which wraps `validateUploadMeta`:
   - Images: `image/jpeg|png|webp` with `.jpg|.jpeg|.png|.webp`, at most 10 MB.
   - Audio: `audio/mpeg|audio/mp3` with `.mp3`, at most 50 MB.
   - Rejection messages: "Format nicht erlaubt. Erlaubt: JPG, PNG, WebP. SVG, GIF und HEIC werden nicht akzeptiert." / "Format nicht erlaubt. Nur MP3 ist erlaubt (kein WAV, FLAC, AIFF, M4A)." / "Datei zu groß (max. N MB)."
2. The server action `prepareDirectUpload({target, filename, size, mime, locale})`:
   1. Calls `getCurrentAdmin()` and rejects an admin who still must change password with "Nicht autorisiert.".
   2. Looks the target up in `TARGETS`, otherwise "Unbekanntes Upload-Ziel.".
   3. Re-validates the metadata server-side, but **only the metadata the client declared**.
   4. Calls `buildStorageKey`.
   5. Calls `createSignedUploadUrl(path)` with the service role.
   6. Returns `{bucket, path, token, signedUrl, publicUrl, kind, mime, size}`.
3. The browser calls `getBrowserSupabase().storage.from(bucket).uploadToSignedUrl(path, token, file, {contentType, upsert:false})`.
4. A hidden input `${name}_url` receives the public URL. The parent form's server action then checks it with `parseSupabasePublicUrl`: the URL must start with `NEXT_PUBLIC_SUPABASE_URL`, contain `/storage/v1/object/public/`, and name a known bucket. Each action then enforces its expected bucket.

Other notes:

- `uploadAssetToStorage()`, the server-buffered upload, is legacy and unused. It was replaced because Vercel request bodies are limited.
- `deleteStorageObject()` exists but is **never called**.

---

## 3. Booking API: `POST /api/booking`

File: `src/app/api/booking/route.ts`, `runtime = "nodejs"`.

**Request.** A JSON body. The client sends `Content-Type: application/json` with `{...formFields, locale}`:

```ts
{ name, email, phone?, event_date? /* yyyy-mm-dd */, event_location, event_type, message, hp_field? /* honeypot */, locale? /* de|en|tr */ }
```

**Validation** (`src/lib/validation/booking.ts`, custom, **no zod**):

- If `hp_field` is non-empty, the route treats the request as a bot and returns **200** `{ok:true, status:"fallback", message:"Danke für deine Anfrage. Wir melden uns so schnell wie möglich."}`, a silent success.
- Trims and caps: name 120, email 200, message 4000, phone 60, event_date 40, event_location 200, event_type 200, locale 8. The locale falls back to `"de"`.
- Rules and error messages:
  - name ≥ 2: "Bitte gib deinen Namen an."
  - email must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`: "Bitte gib eine gültige E-Mail-Adresse an."
  - event_location ≥ 2: "Bitte gib einen Veranstaltungsort an."
  - event_type ≥ 2: "Bitte gib die Art der Veranstaltung an."
  - message ≥ 10: "Bitte schreibe uns ein paar Zeilen mehr."
  - event_date, if set, must match `^\d{4}-\d{2}-\d{2}$`, which is regex only; `2026-13-45` passes: "Datumsformat ist ungültig."
- The client-side check additionally requires name, email, event_location, event_type and message, with the message "Bitte fülle alle Pflichtfelder aus."
- **There is no consent checkbox and no privacy notice next to the form.**

**Processing** (parallel via `Promise.all`):

- `storeBookingRequest` (`src/lib/supabase/booking.ts`) inserts through the service role:
  - `{name, email, phone||null, event_date||null, event_location||null, event_type||null, message, status:'new', locale, user_agent, ip_hash: null}`
  - `ipHash` is never passed.
- `deliverEmail` uses `sendEmail` (`src/lib/resend/client.ts`), which is raw `fetch("https://api.resend.com/emails")` with `Authorization: Bearer RESEND_API_KEY` and the body:
  - `from: WEBSITE_FROM_EMAIL` (default `website@typhoon.band`)
  - `to: [BOOKING_EMAIL]` (default `booking@typhoon.band`)
  - `reply_to: <sender email>`
  - `subject: "Neue Booking-Anfrage über typhoon.band"`
  - text and html

**Email template** (`src/lib/email/booking-email.ts`):

- Dark, gold, table-based HTML with inline styles. There are no external images or trackers, and all user input goes through `escapeHtml`.
- Kicker `TYPHOON BOOKING`, title `Neue Booking-Anfrage`, sub `Typhoon Website`.
- Intro: "Über das Booking-Formular auf typhoon.band ist eine neue Anfrage eingegangen. Direkt antworten geht über Reply — die Antwort landet bei der anfragenden Person."
- Fields: Name, E-Mail, Telefon, Veranstaltungsdatum, Ort, Art der Veranstaltung, Sprache, and "Eingegangen am" (de-DE, Europe/Berlin). Empty optional fields show "Nicht angegeben".
- Footer: "Diese Nachricht wurde über das Booking-Formular auf typhoon.band gesendet."
- Colours: bg `#030201`, card `#0b0805`, text `#f3e7d3`, gold `#c79a4b` / `#e8c982`.
- **There is no confirmation or auto-reply email to the requester.**

**Responses:**

| case | HTTP | body |
|---|---|---|
| Invalid JSON | 400 | `{ok:false,status:"validation",message:"Ungültige Anfrage."}` |
| Validation error | 400 | `{ok:false,status:"validation",field,message}` |
| Honeypot | 200 | `{ok:true,status:"fallback",message:MESSAGES.ok}` |
| Neither Supabase nor Resend configured | 200 | `{ok:true,status:"fallback",message:"Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden."}` |
| Both configured channels failed | 502 | `{ok:false,status:"error",message:"Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut."}` |
| Otherwise, including when only one channel succeeded | 200 | `{ok:true,status:"sent",message:"Danke für deine Anfrage. Wir melden uns so schnell wie möglich."}` |

Gaps:

- **All server messages are German.** The client displays `body.message` in preference to the translated dictionary text, so EN and TR users see German.
- **Rate limiting: none.** There is no CAPTCHA or Turnstile, no Origin check, and no IP hashing.
- A text/plain cross-origin POST still parses, because the route calls `request.json()` regardless of content type.
- When a single channel fails, nothing is logged; there is no `console.error`.
- The booking UI copy (`dict.booking.backendNotice`, DE) reads: "Anfragen gehen direkt an booking@typhoon.band. Antwort innerhalb von 48 Stunden."

---

## 4. Environment variables

| var | exposure | used in | purpose / default |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | `lib/env.ts` publicEnv and readServerEnv; `lib/storage/upload.ts` parseSupabasePublicUrl; `next.config.mjs` (next/image remotePatterns `/storage/v1/object/public/**`); all Supabase clients | project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | `client.ts` (browser, used only for `uploadToSignedUrl`), `server.ts` (public content reads), `server-auth.ts` (SSR auth), `browser-auth.ts` (**unused, dead code**) | RLS-bound |
| `NEXT_PUBLIC_SITE_URL` | public | `src/app/layout.tsx` metadataBase only | `.env.example`: `https://typhoon.band` |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | `lib/supabase/admin.ts` (`import "server-only"`) → every `lib/admin/*`, `lib/supabase/booking.ts`, `lib/storage/upload.ts`, and the login and change-password actions | bypasses RLS |
| `RESEND_API_KEY` | **server-only** | `lib/resend/client.ts` (server-only), `isResendConfigured()` | |
| `BOOKING_EMAIL` | server-only | `readServerEnv().bookingEmail` → mail recipient | default `booking@typhoon.band` |
| `WEBSITE_FROM_EMAIL` | server-only | `readServerEnv().fromEmail` → mail sender | default `website@typhoon.band`. Docs recommend `Typhoon Website <website@typhoon.band>`, and it must be a Resend-verified domain |

`src/lib/env.ts` is imported by client components. The non-public vars compile to `undefined` in the browser bundle, so nothing leaks. **No secret ever reaches the client.**

---

## 5. Public content API (the redesign must stay compatible)

The frontend consumes these through `src/lib/content/index.ts`, which uses the server anon client (RLS-bound). Every loader is wrapped in `safe()` and never throws.

```ts
getSiteSettings(): Promise<SiteSettings>                 // site_settings is_public; keys 'brand' {name,tagline,genreLine}, 'contact' {booking,phone}
getHeroContent(locale): Promise<HeroContent>             // text = dictionary; imageUrl/signatureUrl overridden by site_settings hero_image/hero_signature .url
getBandInfo(locale): Promise<BandInfo>                   // text = dictionary; imageUrl overridden by site_settings bandinfo_image .url
getMembers(locale): Promise<Member[]>                    // per-slug MERGE with 8 fallback members (see below)
getSongs(locale): Promise<SongItem[]>                    // songs visible+streamable; if ANY rows → fallback fully REPLACED
getGalleryItems(locale): Promise<GalleryItem[]>          // media_items visible, type=image (NO category filter); rows → fallback replaced
getShows(locale): Promise<ShowItem[]>                    // shows visible+published, order starts_at asc nulls last, then sort_order; rows → fallback replaced
getLegalPage(type, locale): Promise<LegalPage>           // legal_pages published + translation   (UNUSED on main — legal pages are static client components)
getPlatformLinks(): Promise<PlatformLink[]>              // platform_links active                   (returned in bundle but UNUSED by UI on main)
getSeoEntry(path, locale): Promise<SeoEntry>             // seo_entries                             (UNUSED on main)
getPublicPageContent(locale): Promise<PublicPageContent> // homepage bundle: parallel all of the above except legal/seo
```

Types, verbatim from `src/lib/content/types.ts`:

```ts
type SiteSettings = { brandName; tagline; genreLine; contactBookingEmail; contactPhone; bookingDisabledNotice: string };
type HeroContent  = { line1; line2; line3; description; ctaListen; ctaBook; imageUrl; signatureUrl: string };
type BandInfo     = { eyebrow; headline; body; cta; ctaBook; imageUrl: string };
type Member       = { id: string /*slug*/; name; role; bio; photoUrl: string; isPlaceholder: boolean; sortOrder: number };
type SongItem     = { id: string /*slug*/; title; audioUrl: string; coverImageUrl: string|null; isFeatured: boolean; sortOrder: number };
type GalleryItem  = { id; src; alt: string; thumbnailUrl: string|null; sortOrder: number };
type ShowItem     = { id; title /*=venue*/; region /*"city, country"|"—"*/; time /*de-DE "dd. MMM" or "TBA"*/; startsAt: string|null; ticketUrl: string|null; sortOrder: number };
type LegalPageType = "imprint" | "privacy" | "cookies";
type LegalPage    = { slug: LegalPageType; title; bodyMd: string; draftNote: string|null };
type PlatformLink = { id; platform; url: string; sortOrder: number };
type SeoEntry     = { path: string; title; description; ogImageUrl: string|null };
type PublicPageContent = { locale; siteSettings; hero; bandInfo; members: Member[]; songs: SongItem[]; gallery: GalleryItem[]; shows: ShowItem[]; platformLinks: PlatformLink[] };
type ContentSource = "supabase" | "fallback";
```

Behaviour that matters (`normalize.ts`, `fallback.ts`, `page.tsx`):

- **Members:**
  - The fallback order is slugs `typhoon`(Gesang), `mika`(Posaune), `schack`(Saxophon), `hardy`(Trompete), `stefan`(Funk-Bass), `tom`(Schlagzeug), `bugra`(Buğra, Gitarre), `jurgen`(Jürgen, Gitarre).
  - The first two use band-card photos. Slugs 3-8 have `isPlaceholder: true` unless Supabase has a photo.
  - A DB row overrides name, role, bio, photo and sort per slug. `is_visible=false` drops only that member.
  - Unknown slugs are appended. The result is sorted by sortOrder.
- **Songs:** the fallback has 6 tracks, in this order:

  | id | title | file |
  |---|---|---|
  | sen-benim | Sen Benim | `/assets/audio/demos/Sen-Benim.mp3` |
  | karanfil | Karanfil | `karanfil-demo.mp3` |
  | gece-yine-dustun | Gece Yine Düştün | `gece-yine-dustun-demo.mp3` |
  | farksilin | Farksilin | `farksilin-demo.mp3` |
  | cilgin | Çılgın | `cilgin-demo.mp3` |
  | bir-tek-sen | Bir Tek Sen | `bir-tek-sen-demo.mp3` |

  - `featuredSong = songs[0]` (Sen Benim).
  - Songs from Supabase are keyed by `slug`. A matching fallback slug is used only to fill a missing title or audio.
  - `page.tsx` picks featured as the first song with `isFeatured`, otherwise `songs[0]`.
- **Shows:** `page.tsx` passes `content.shows.filter(s => Boolean(s.startsAt))` to `<Shows rows>`. When that is empty, it falls back to the 4 dictionary placeholders (tba-1..4: "Neue Termine in Vorbereitung", "Festival-Saison", "Club-Tour", "Privat- & Firmenevents").
  - `is_tba`, `event_type` and separate city/country are **not** exposed in `ShowItem`.
  - There is **no past-date filter**.
  - The `time` label is always de-DE and ignores the locale.
- **Gallery:** `alt = alt_text ?? title ?? fallback alt ?? "Typhoon"`.
- **Site settings:** read by `getSiteSettings` but **not consumed by the UI**. `Booking.tsx` and the footer import the static `site` from `src/data/site.ts`:
  - `contact.booking: "booking@typhoon.band"`, `contact.phone: "+49 176 64472296"`.
  - Imprint: "Mika Hertler, Am Schwarzen Steg 5a, 95448 Bayreuth, Deutschland".
  - All `social.*` are empty strings.
- **Performance:** the homepage is `force-dynamic`, with about 10 Supabase queries per request. `fetchPublicAssetSettings` runs twice, once for hero and once for bandinfo.
- `buildSeoFallback` gives title `Typhoon — ${dict.brand.genreLine}`, description `dict.hero.description`, and og `/assets/hero/hero-collage.jpeg`.

---

## 6. Security and correctness review

Legend: **H** high, **M** medium, **L** low. [TESTED] means reproduced against the local PG. [CODE] means confirmed by reading the code.

| # | sev | finding | evidence |
|---|---|---|---|
| 1 | **M** | **No rate limiting or bot protection on `POST /api/booking`.** There is only a honeypot. Each request is 1 DB insert plus 1 Resend mail, so spam floods the inbox, burns Resend quota and bloats the DB. `ip_hash` exists in the schema but is never computed. There is no Origin check, and the route parses JSON regardless of content-type | route.ts L71-77; booking.ts meta has no ipHash |
| 2 | **M** | **The editor role equals owner.** `canAccessAdmin` admits `editor`, and no route checks role. An editor can read all booking PII, change statuses, hard-delete shows, songs and media, and swap the hero. `docs/07-admin-scope.md` says the opposite: "editor … no publish/delete/legal/booking/admins" | roles.ts helpers are unused (grep) |
| 3 | **M** [TESTED] | **Storage buckets are listable by anon.** `typhoon_public_read_*` is a SELECT policy on `storage.objects`, so anyone can list objects in `audio-demos` and the other buckets. Hidden songs, deleted songs and orphaned uploads stay discoverable and downloadable, so unreleased demos are not private | anon `select count(*) from storage.objects where bucket_id='audio-demos'` returned 1 |
| 4 | **M** [CODE] | **Show publish controls are broken.** `ShowForm` and the booking convert form post plain checkboxes, and an unchecked box is absent, so `formData.get` returns `null`. `asBool(null, true)` in validation/show.ts returns `true`. As a result `is_visible` and `is_published` are always saved as true: editing cannot unpublish or hide, and a converted booking is always published | show.ts L50-56, L145-146; ShowForm.tsx L96-105. Media, music and members use the hidden-input pattern correctly |
| 5 | **M** (PLAUSIBLE) | **No Supabase SSR middleware.** `server-auth.ts` swallows `setAll` in RSC, so refreshed tokens are never persisted on page loads. With refresh-token rotation and reuse detection, admins will likely be logged out about 1h after login, or see flaky auth. Supabase requires `middleware.ts` calling `updateSession` for `@supabase/ssr` | no `src/middleware.ts` |
| 6 | **M** (GDPR) | **Booking PII has no hard delete and no retention.** "Anfrage löschen" is only a soft delete. `user_agent` is stored. The privacy page claims "Die Daten werden nicht an Dritte weitergegeben" but does not name Supabase or Resend as processors. There is no privacy link or notice at the form | bookings.ts softDeleteBooking; legal/privacy/page.tsx L40-46 |
| 7 | L | **Non-atomic multi-step writes.** Convert-to-show (createShow then markBookingConverted) and setFeaturedSong (clear then set) can leave partial state. saveMember is also multi-step | actions |
| 8 | L | **Uploads trust client-declared size and MIME.** The signed upload URL does not enforce size or type, and the buckets have no `file_size_limit` or `allowed_mime_types`. An admin, or a stolen admin session, can put arbitrary bytes into public buckets | upload.ts, 0003 |
| 9 | L | `parseSupabasePublicUrl` uses `rawUrl.startsWith(projectUrl)`, so `https://<ref>.supabase.co.evil.tld/storage/v1/object/public/gallery/x` passes. This is admin-only input, but it lets a foreign-host URL be stored | upload.ts L235 |
| 10 | L | **Orphaned storage objects.** Deleting or replacing a song, media item, member photo or asset never calls `deleteStorageObject` | grep: the only definition is in upload.ts |
| 11 | L | `must_change_password` is enforced only in the Next app, not in RLS. A non-rotated admin can write through PostgREST with the anon key plus its JWT | [TESTED] |
| 12 | L | `legal_pages_owner_only_delete` is ineffective, because it is OR'ed with the permissive `legal_pages_admin_write` | 0001_rls |
| 13 | L | `is_active_admin()` and `is_owner()` are not `SECURITY DEFINER` and have no fixed `search_path` | 0001_rls |
| 14 | L | Logout is a POST route with no Origin or CSRF check. Server actions do get the Next.js built-in Origin/Host check | logout/route.ts |
| 15 | L | There are no security headers or CSP in `next.config.mjs`. There is no `robots.txt`, sitemap or `noindex` for `/admin` | next.config.mjs, src/app |
| 16 | L | Admin pages render inside the public layout, with the public Header, Footer and CookieConsent | admin/layout.tsx |
| 17 | L | No voluntary password change and no forgot-password flow. The change-password action does not re-verify the current password | change-password |
| 18 | info | Public sign-up must be disabled in the Supabase Dashboard ("no public sign-up" per docs). Nothing in the repo enforces it. Being authenticated without a profile is harmless under RLS | |
| 19 | OK | Secrets: the service role and Resend key are only in `server-only` modules. HTML email escaping is present. Open-redirect protection on `from` checks the prefix `/${locale}/admin`. Hidden songs and unpublished shows do not leak through tables [TESTED]. `booking_requests` has zero public access [TESTED] | |

Functional correctness bugs that the redesign should fix or preserve knowingly:

- **TBA shows never appear publicly.** `fetchShows` maps `starts_at ?? ""`, and `page.tsx` filters on `Boolean(s.startsAt)`. When only TBA rows exist, the dictionary placeholders show instead.
- **Past shows** stay on the homepage forever unless someone hides them manually.
- **Songs:** adding one Supabase song hides the other 5 repo demos, because the list is replaced rather than merged. Members, by contrast, merge.
- **Restoring an archived booking** leaves `status='archived'`.
- **Booking API messages are German only**, overriding the EN and TR dictionaries.
- **Booking inbox:** 50 items maximum, with no search, status filter or pagination, and opening a request does not auto-mark it read.
- **README apply list** omits `policies/0006_phase05_member_full_read.sql`.
- **README vs code:** the README says the gallery reads "category gallery", but the public reader does not filter by category.
- **Dead code:** `browser-auth.ts` and `uploadAssetToStorage`.

---

## 7. Half-finished work, TODOs and unimplemented items

- **Tables with no UI and no consumer on main:** `legal_pages` / `legal_page_translations`, `seo_entries`, `platform_links`, `consent_settings`, `show_translations` and `songs.status`.
  - The legal pages are static client components (`src/app/[locale]/legal/*`) holding hard-coded DE/EN/TR bodies.
  - The dashboard marks Legal, SEO and Platform Links as "Coming next".
- **Hero and about copy** stay dictionary-driven. `fetchHero` and `fetchBandInfo` return `null`, with the comment "until the Admin phase introduces a dedicated `hero_blocks` table". There are no per-locale site settings, and the PK prevents them (§1.1).
- **No admin-user management UI.** Provisioning is done with SQL in `docs/admin-setup.md`. The first owner is `('AUTH_USER_UUID', 'Mika Hertler', 'YOUR_LOGIN_EMAIL', 'owner', true, true, now())`.
- **Not implemented:** video in the gallery; song cover display beyond the featured player; a confirmation mail to the requester; generated Supabase types (`types.ts` is hand-written, `Relationships: []`).
- **README "Deferred / next batches":**
  - Per-locale text CRUD (hero/about) and a rich-text editor
  - Legal and SEO admin
  - Owner-only mutations
  - Shop/tickets
  - "Launch hardening (rate limit, monitoring, generated Supabase types)"
- **`docs/phases/08-launch-hardening.md`** has not been done: sitemap/robots, 404 page, OpenGraph, rate limiting.
- **Branch `origin/claude/phase-06-legal-seo-consent-platforms`** (commit 0cd76d0, 2026-05-11) is **unmerged and not live**. It is based on d8ee2d7 and is 2 commits behind main (it lacks the Platzhalter-badge fix 4cf812b). It adds:
  - **Migration `0006_legal_seo_consent_platforms.sql`:**
    - Seeds `legal_pages` imprint, privacy and cookies with `is_published=false`.
    - Adds CHECK `platform_links_platform_chk` restricting platform to `('spotify','youtube','instagram','facebook','soundcloud','bandcamp')`.
    - Seeds `consent_settings`: `necessary` ("Notwendig", required), `external_media` ("Externe Medien") and `statistics` ("Statistiken", "Aktuell nicht aktiv").
    - Adds index `seo_entries_path_idx`.
  - **`policies/0006_legal_seo_consent_platforms.sql`:** re-asserts the public-read and admin-write policies. Its filename collides in number with main's `policies/0006_phase05_member_full_read.sql`.
  - **Admin pages:** `/admin/legal` (LegalEditor, title max 160 and body_md max 16000), `/admin/seo` (path regex `^\/[a-z0-9\-/]*$`, title 80, description 180, og 500), `/admin/platform-links` and `/admin/consent`.
  - **Libs:** `src/lib/admin/{legal,seo,platform-links,consent}.ts`, `src/lib/validation/legal-seo-platforms.ts`, `src/components/layout/consent.ts` and `src/components/media/ExternalMediaGate.tsx`. Legal pages would then be read from Supabase with a fallback.
  - **Guards:** `requireAdminWithPasswordOk` only, so legal edits are **not owner-restricted**, contrary to docs/06 and docs/07.
  - This work is a donor for the redesign's Legal, SEO, Consent and Platform features.
- `docs/current-task.md` still names Phase 06 as the active phase.

---

## 8. Files read (main)

- `supabase/migrations/0001..0005`, `supabase/policies/0001, 0002, 0005, 0006`
- `src/lib/env.ts`
- `src/lib/supabase/{admin,booking,browser-auth,client,server-auth,server,types}.ts`
- `src/lib/admin/{auth,roles,bookings,shows,media,members,songs,site-settings}.ts`
- `src/lib/storage/upload.ts`, `src/lib/validation/{booking,show,upload}.ts`, `src/lib/resend/client.ts`, `src/lib/email/booking-email.ts`
- `src/lib/content/{types,index,supabase-content,normalize,fallback}.ts`
- `src/app/api/booking/route.ts`, `src/app/api/admin/auth/logout/route.ts`
- All of `src/app/[locale]/admin/**`
- `src/app/[locale]/page.tsx`, `src/components/sections/Booking.tsx`, `src/data/{site,members,songs,shows}.ts`, `src/app/[locale]/legal/privacy/page.tsx`
- `next.config.mjs`, `package.json`, `.env.example`, `.gitignore`, `README.md`
- `docs/04..08`, `docs/admin-setup.md`, `docs/current-task.md`, `docs/phases/08-launch-hardening.md`
- The phase-06 branch SQL and action guard lines
