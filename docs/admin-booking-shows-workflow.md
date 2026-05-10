# Admin Booking → Shows Workflow

How to handle a booking request from the moment it lands in the inbox up
to a published show on the public website. Phase 04 ships this flow end
to end.

## TL;DR

```text
Booking request arrives via /api/booking
  ↓
Admin opens the booking detail page
  ↓
Admin replies externally by mail (no automated mail from the Admin)
  ↓
If accepted → Admin clicks "Show anlegen"
  ↓
Form is prefilled from the booking (date / Ort / Art)
  ↓
Admin adjusts values, optionally adds a ticket link, saves
  ↓
Show appears in the public Termine section (if visible+published)
Booking row stays linked via converted_show_id
```

## Booking statuses

The Phase 04 migration extends the legacy `new / read / answered / done /
spam` set to:

```text
new        – default for fresh requests
read       – Admin opened it
answered   – Admin replied externally
accepted   – Admin agreed but has not converted yet
converted  – Admin turned it into a show; converted_show_id is set
rejected   – Admin declined
archived   – soft-deleted; hidden from active list
spam       – obvious spam
```

Legacy `done` rows from the original schema are migrated to `answered`
when the Phase 04 migration runs.

## Soft delete / archive

The Admin "Anfrage löschen" button performs a **soft delete**: it stamps
`deleted_at = now()` and flips `status = 'archived'`. The row stays in
the database so any linked show keeps its provenance. The active list
hides archived rows by default — switch the filter to "Inkl. Archiv" to
see them. Each archived row exposes a "Wiederherstellen" button. Hard
deletion is not implemented in this phase by design.

## Convert booking → show

On the booking detail page, the "In Show umwandeln" form is prefilled
with:

- `date`        ← `booking.event_date` (date part only)
- `venue`       ← `booking.event_location`
- `event_type`  ← `booking.event_type`
- `country`     ← `Deutschland` (default)
- `is_visible`  ← true
- `is_published` ← true

When you save:

1. A new `shows` row is inserted with `source_booking_request_id =
   booking.id`.
2. The booking row is updated to `status = 'converted'`,
   `converted_show_id = new show id`, `converted_at = now()`.
3. Both the Admin Shows list and the public homepage are revalidated so
   the new show is visible immediately.

If you tick "Datum noch offen (TBA)" the show is stored without a
timestamp and surfaces as `TBA` on the public site, matching the
existing TBA design.

## Shows admin

`/<locale>/admin/shows` lists every show, including drafts and
TBA placeholders. Each row shows:

- date / venue / city
- "aus Booking" badge if it originated from a booking conversion
- "Entwurf" / "ausgeblendet" badge if it is not currently public

Actions:

- **+ Neue Show** — create a manual show (`/admin/shows/new`).
- **Bearbeiten** — edit fields, ticket link, visibility, publish flag
  (`/admin/shows/<id>/edit`).
- **Ausblenden / Anzeigen** — toggles `is_visible`.
- **Löschen** — hard-deletes the show row. Any linked booking keeps its
  history (`converted_show_id` is nulled by the FK rule).

## Public visibility rule

The public Termine section displays Supabase shows where:

```text
is_visible = true AND is_published = true
```

This is enforced both by RLS (`supabase/policies/0005_*.sql`) and by an
explicit filter in `src/lib/content/supabase-content.ts`. When no public
rows are returned the section falls back to the dictionary TBA copy so
the visual design never collapses.

## Manual test plan

After running the Phase 04 migration in Supabase:

1. Submit a booking via the public form on `/<locale>` → confirm the
   row lands in `/<locale>/admin/booking`.
2. Open it; change status to `read`, then `answered`. Refresh and
   confirm the chip updates.
3. Click "Anfrage löschen". The row should disappear from the active
   list. Switch to "Inkl. Archiv" to see it again, then restore.
4. Click "In Show umwandeln". Adjust the venue, set a date, save.
5. Confirm the booking detail page shows the "↳ Show" badge with a link
   to the new show.
6. Open `/<locale>` in a new tab — the converted show should appear in
   the Termine section.
7. From `/<locale>/admin/shows`, edit the show, toggle "Ausblenden", and
   refresh the public homepage — the show should disappear and the TBA
   fallback should kick back in if no other public shows remain.
8. Re-enable, then delete the show — confirm the booking row's
   `converted_show_id` is cleared (the FK is `on delete set null`) and
   the booking status remains `converted` for audit history.

## Security recap

- `booking_requests` has no public RLS read or write policy. Public can
  only `INSERT` via the server route (`/api/booking`) which uses the
  service-role client.
- `shows` public read is RLS-restricted to
  `is_visible AND is_published`.
- All Admin mutations go through server actions guarded by
  `requireAdminWithPasswordOk()`.
- The service-role key is `import "server-only"` and never reaches the
  browser bundle.
