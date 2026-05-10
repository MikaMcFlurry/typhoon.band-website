# Phase 04 – Booking Workflow + Shows Admin

## Goal

The Admin login works and booking requests are visible.

This phase must make the Booking area practically usable and connect it to Shows.

Main workflow:

```text
Booking request arrives
Admin opens booking detail
Admin reviews/answers by mail externally
If accepted: Admin converts booking to a show
Date/location/type are prefilled from booking
Admin can adjust values
Admin can optionally add ticket link
Admin saves
Show appears under public Shows
Booking and show remain linked
```

## Absolute scope

Allowed:
- Admin Booking detail view
- Booking status update
- Booking delete/archive action
- Convert booking to show
- Shows Admin CRUD
- Supabase schema migration for booking/show linking
- RLS updates if needed
- public Shows section wired to visible Supabase shows
- docs/admin-setup correction

Not allowed:
- public frontend redesign
- full content CRUD for all website sections
- member CRUD
- media/audio upload UI
- shop/payment checkout
- analytics
- external embeds

## Important correction: first admin setup order

Update docs because the correct order is:

1. Supabase Dashboard → Authentication → Users → manually create Auth user.
2. Set temporary initial password there.
3. Confirm user / Auto-confirm.
4. Then run SQL to create/link `admin_profiles` row using the Auth user ID/email.
5. Login with temporary password.
6. Forced change-password flow runs.

Do not say that the SQL creates the Auth user. It only links an existing Auth user.

## Existing files to inspect first

```text
src/app/[locale]/admin/page.tsx
src/app/[locale]/admin/booking/page.tsx
src/app/[locale]/admin/_components/AdminShell.tsx
src/lib/admin/auth.ts
src/lib/admin/bookings.ts
src/lib/admin/roles.ts
src/lib/supabase/admin.ts
src/lib/supabase/types.ts
src/lib/content/index.ts
src/lib/content/supabase-content.ts
src/components/sections/Shows.tsx
src/data/shows.ts
supabase/migrations/0001_init.sql
supabase/migrations/0002_supabase_foundation.sql
supabase/migrations/0004_admin_password_flow.sql
supabase/policies/0001_rls.sql
supabase/policies/0002_rls_foundation.sql
README.md
docs/admin-setup.md
```

## Database migration

Create additive migration:

```text
supabase/migrations/0005_booking_show_workflow.sql
```

Required schema additions:

### booking_requests status

Existing status values may be too limited.

Support at least:

```text
new
read
answered
accepted
converted
rejected
archived
spam
```

If current check constraint prevents this, replace it safely.

Do not silently break existing rows.

### booking_requests fields

Add if missing:

```sql
converted_show_id uuid references public.shows(id) on delete set null
converted_at timestamptz
deleted_at timestamptz
```

Decision:
- `deleted_at` means Admin hides/deletes the booking from active lists.
- Do not physically delete converted bookings by default because the show should stay linked.
- For unconverted bookings, a hard delete may be allowed only if implemented safely with a confirmation. If simpler, use soft-delete only in this phase.

### shows fields

Add if missing:

```sql
source_booking_request_id uuid references public.booking_requests(id) on delete set null
event_type text
is_published boolean not null default true
```

Keep existing fields:

```text
starts_at
venue
city
country
ticket_url
is_visible
sort_order
```

If `starts_at` is nullable from Phase 02, keep it.

## RLS

Do not expose booking data publicly.

Public:
- can read visible/published shows only

Public cannot:
- read booking_requests
- read deleted/archived bookings
- mutate shows

Admins:
- active admins can read booking_requests in admin server routes
- active admins can create/update shows through server/admin actions
- service role remains server-only

## Admin Booking UX

### Booking list

Existing route:

```text
/[locale]/admin/booking
```

Improve it with:
- list latest booking requests
- hide `deleted_at is not null` from default view
- show status chip
- show converted indicator if linked to a show
- link to detail page

### Booking detail page

Add route:

```text
/[locale]/admin/booking/[id]
```

Show:
- all booking fields
- message
- status
- created_at
- converted show link if available
- actions

Actions:
- mark as read
- mark as answered
- accept
- reject
- archive/delete
- convert to show

No email sending required in this phase. The user said bookings are often handled by mail externally.

### Delete/archive behavior

Because bookings may contain personal data, the Admin needs a delete action.

Implementation decision:
- Use soft delete with `deleted_at = now()` as default.
- Label in UI may say `Löschen`, but explain/implement as hiding from active list.
- If booking is converted to a show, do not remove the show.
- Optional: if already converted, button text can be `Anfrage archivieren`.
- Hard delete is not required in this phase.

Acceptance:
- Admin can remove individual booking from active list.
- Deleted/archived booking no longer appears in default booking overview.
- Booking data is not public.

## Convert booking to show

### Route / UI

On booking detail page add a conversion form or button.

Possible route:

```text
/[locale]/admin/booking/[id]/convert
```

or inline form on detail page.

### Prefill fields from booking

Use booking fields:

```text
event_date → starts_at date part
event_location → venue or location field
event_type → event_type
message → internal reference only, not public by default
```

Admin can adjust before saving.

Required show form fields:

```text
Datum
Uhrzeit optional
Venue / Ort
Stadt optional
Land default Deutschland
Art der Veranstaltung
Ticket-Link optional
Auf Website anzeigen boolean
```

Default:
- `is_visible = true`
- `is_published = true`
- `country = Deutschland`

If no exact time is known:
- allow date-only or TBA-safe behavior
- do not fake a time

### On save

Create show row:
- copied/adjusted fields
- `source_booking_request_id = booking.id`
- ticket_url optional
- visible/published according to form

Update booking row:
- `status = converted`
- `converted_show_id = new show id`
- `converted_at = now()`

Result:
- show appears in public Shows section if visible/published
- booking detail shows link/reference to converted show

## Shows Admin CRUD

Add Admin route:

```text
/[locale]/admin/shows
```

Features:
- list shows
- create new show manually
- edit show
- delete/archive/hide show
- visibility toggle
- ticket_url field
- source booking indicator if show was created from booking

Keep it simple. No complex calendar UI.

Suggested routes:

```text
/[locale]/admin/shows
/[locale]/admin/shows/new
/[locale]/admin/shows/[id]/edit
```

Server actions are acceptable.

## Public Shows behavior

The public onepager already has a Shows/Termine section.

Ensure:
- it uses content provider/Supabase visible shows if available
- it keeps static fallback/TBA if Supabase has no visible shows
- no public redesign
- converted show appears after save and deployment/runtime fetch if app supports dynamic content

If current public homepage is static and does not fetch Supabase at runtime, make the minimal backend-safe adjustment required to show Supabase shows without changing design.

## Validation

Validate server-side:

Show:
- venue required
- event type optional but preferred
- date optional only if TBA
- ticket_url optional but if present must be valid URL
- city/country optional
- is_visible boolean

Booking actions:
- id must be valid UUID
- active admin required
- no client-only protection

## Security

- no service role in client
- all mutations server-side
- require admin with password OK
- no public booking access
- no public mutation access
- validate all form input
- do not expose deleted bookings publicly
- do not weaken RLS

## Documentation updates

Update:
- README
- docs/admin-setup.md if needed
- optionally new docs/admin-booking-shows-workflow.md

Document:
- correct first admin setup order
- booking statuses
- soft delete/archive behavior
- convert booking to show workflow
- how linked shows work
- how to test public show visibility

## Acceptance checklist

- Admin can open booking list
- Admin can open booking detail
- Admin can delete/archive a single booking
- Deleted/archived booking disappears from default list
- Admin can convert booking to show
- Form is prefilled from booking
- Admin can adjust date/location/type/ticket link
- Save creates show
- Booking row links to created show
- Show row links to source booking
- Public Shows section displays visible converted show
- Admin can create/edit/hide/delete shows manually
- Public frontend design remains unchanged
- no service role in browser
- `npm run lint` passes
- `npm run build` passes
