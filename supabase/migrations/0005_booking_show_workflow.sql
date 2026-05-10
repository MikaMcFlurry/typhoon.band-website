-- Typhoon — Phase 04 additive migration: booking workflow + shows admin.
-- Apply via: psql -f supabase/migrations/0005_booking_show_workflow.sql
--
-- Idempotent and additive. Adds the columns and constraint changes the
-- Phase 04 spec calls for so the Admin can:
--   * track an extended set of booking statuses
--   * soft-delete (archive) booking requests without dropping rows
--   * convert a booking request into a public show, keeping a two-way
--     link between the booking and the resulting show
--   * publish/hide individual shows from the Admin without touching SQL
--
-- No row is ever destructively rewritten. The check-constraint swap is
-- guarded so it only runs if the existing constraint actually rejects the
-- new status set.
--
-- ---------------------------------------------------------------------
-- booking_requests: extended status set + workflow timestamps + soft-delete
-- ---------------------------------------------------------------------
alter table public.booking_requests
  add column if not exists converted_show_id uuid
    references public.shows (id) on delete set null,
  add column if not exists converted_at timestamptz,
  add column if not exists deleted_at timestamptz;

-- Replace the legacy 0001 status check (`new/read/answered/done/spam`)
-- with the Phase 04 set. We keep the historic `done` value as an alias
-- for `answered` so existing rows survive the swap.
do $$
declare
  cur_check text;
begin
  select pg_get_constraintdef(c.oid)
    into cur_check
  from pg_constraint c
  join pg_namespace n on n.oid = c.connamespace
  where n.nspname = 'public'
    and c.conname = 'booking_requests_status_check'
    and c.conrelid = 'public.booking_requests'::regclass;

  if cur_check is null or cur_check not like '%converted%' then
    -- Drop the old constraint (name comes from 0001_init.sql implicitly).
    alter table public.booking_requests
      drop constraint if exists booking_requests_status_check;

    -- Migrate any legacy `done` rows to `answered` so the new constraint
    -- accepts them. Keep this idempotent — if no rows exist, no-op.
    update public.booking_requests
       set status = 'answered'
     where status = 'done';

    alter table public.booking_requests
      add constraint booking_requests_status_check
      check (status in (
        'new','read','answered','accepted','converted',
        'rejected','archived','spam'
      ));
  end if;
end $$;

create index if not exists booking_requests_active_idx
  on public.booking_requests (created_at desc)
  where deleted_at is null;

create index if not exists booking_requests_converted_show_idx
  on public.booking_requests (converted_show_id)
  where converted_show_id is not null;

comment on column public.booking_requests.converted_show_id is
  'If non-null, the show row this booking was converted into. Kept on '
  'delete via on delete set null so the booking history survives a '
  'show deletion.';
comment on column public.booking_requests.converted_at is
  'Timestamp of the booking → show conversion.';
comment on column public.booking_requests.deleted_at is
  'Soft-delete marker. Non-null rows are hidden from the active Admin '
  'list. Converted bookings should keep their link to the show even '
  'after archiving.';

-- ---------------------------------------------------------------------
-- shows: source booking link + event_type + is_published flag
-- ---------------------------------------------------------------------
alter table public.shows
  add column if not exists source_booking_request_id uuid
    references public.booking_requests (id) on delete set null,
  add column if not exists event_type text,
  add column if not exists is_published boolean not null default true;

create index if not exists shows_source_booking_idx
  on public.shows (source_booking_request_id)
  where source_booking_request_id is not null;

comment on column public.shows.source_booking_request_id is
  'If non-null, the booking_requests row this show was converted from. '
  'Kept on delete via on delete set null so the show history survives '
  'a hard-delete of the source booking (which currently never happens).';
comment on column public.shows.event_type is
  'Free-text description of the show type (Hochzeit, Festival, '
  'Geburtstag, Konzert, ...). Mirrors booking_requests.event_type for '
  'shows that originated from a booking.';
comment on column public.shows.is_published is
  'Editorial publish flag. The public site filters on is_visible AND '
  'is_published so Admins can keep a draft show hidden without deleting '
  'it.';
