import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  BOOKING_STATUSES,
  getBookingRequest,
  type RecentBookingRequest,
} from "@/lib/admin/bookings";
import { getAdminShow, type AdminShowRow } from "@/lib/admin/shows";

import { AdminShell } from "../../_components/AdminShell";
import {
  archiveBookingAction,
  changeBookingStatusAction,
  convertBookingToShowAction,
  restoreBookingAction,
} from "./actions";

export const metadata = { title: "Admin · Booking-Detail" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<RecentBookingRequest["status"], string> = {
  new: "Neu",
  read: "Gelesen",
  answered: "Beantwortet",
  accepted: "Angenommen",
  converted: "In Show umgewandelt",
  rejected: "Abgelehnt",
  archived: "Archiviert",
  spam: "Spam",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function isoDateOrEmpty(iso: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

export default async function AdminBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ converted?: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const { converted: convertedParam } = await searchParams;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  if (!UUID_RE.test(id)) notFound();

  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/booking/${id}`,
  });

  const detail = await getBookingRequest(id);
  if (!detail.available) {
    if (detail.reason === "not-found") notFound();
    return (
      <AdminShell locale={locale} current={current} active="booking">
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Anfrage konnte nicht geladen werden. Grund: <code>{detail.reason}</code>
        </div>
      </AdminShell>
    );
  }

  const row = detail.row;
  const isArchived = row.deleted_at !== null;
  const isConverted = Boolean(row.converted_show_id);

  let convertedShow: AdminShowRow | null = null;
  if (row.converted_show_id) {
    const showRes = await getAdminShow(row.converted_show_id);
    if (showRes.available) convertedShow = showRes.row;
  }

  const prefilledDate = isoDateOrEmpty(row.event_date);
  const justConverted = convertedParam === "1";

  return (
    <AdminShell locale={locale} current={current} active="booking">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker">Booking-Anfrage</p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
            {row.name}
          </h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            {STATUS_LABEL[row.status]} · eingegangen {formatDateTime(row.created_at)}
            {isArchived ? " · archiviert" : ""}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/booking`}
          className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
        >
          ← zur Liste
        </Link>
      </header>

      {justConverted ? (
        <div className="panel mt-6 border-[color:var(--gold-soft)] p-4 text-sm text-[color:var(--cream)]">
          Anfrage wurde in eine Show umgewandelt und im öffentlichen Bereich
          hinterlegt.
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="panel p-4">
          <h3 className="kicker">Anfrage</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-[color:var(--muted-cream)]">
            <div>
              <dt className="kicker">E-Mail</dt>
              <dd className="mt-1 break-words text-[color:var(--cream)]">
                <a
                  href={`mailto:${row.email}`}
                  className="text-[color:var(--gold-soft)] underline-offset-2 hover:underline"
                >
                  {row.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="kicker">Telefon</dt>
              <dd className="mt-1 text-[color:var(--cream)]">
                {row.phone ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="kicker">Datum</dt>
              <dd className="mt-1 text-[color:var(--cream)]">
                {formatDate(row.event_date)}
              </dd>
            </div>
            <div>
              <dt className="kicker">Ort</dt>
              <dd className="mt-1 text-[color:var(--cream)]">
                {row.event_location ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="kicker">Art</dt>
              <dd className="mt-1 text-[color:var(--cream)]">
                {row.event_type ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="kicker">Sprache</dt>
              <dd className="mt-1 text-[color:var(--cream)]">
                {row.locale ? row.locale.toUpperCase() : "—"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="kicker">Nachricht</dt>
              <dd className="mt-1 whitespace-pre-line text-[color:var(--cream)]">
                {row.message}
              </dd>
            </div>
          </dl>
        </section>

        <section className="grid gap-4">
          <div className="panel p-4">
            <h3 className="kicker">Status</h3>
            <form
              action={changeBookingStatusAction}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={row.id} />
              <label className="sr-only" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={row.status}
                className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-1.5 text-xs text-[color:var(--cream)]"
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#0b0805]">
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-secondary">
                Speichern
              </button>
            </form>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
              Letzte Aktualisierung: {formatDateTime(row.updated_at)}
            </p>
          </div>

          <div className="panel p-4">
            <h3 className="kicker">Archivieren</h3>
            <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
              Versteckt die Anfrage aus der aktiven Liste. Eine bereits in
              eine Show umgewandelte Anfrage bleibt mit der Show verknüpft.
            </p>
            {isArchived ? (
              <form action={restoreBookingAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={row.id} />
                <button type="submit" className="btn btn-secondary">
                  Wiederherstellen
                </button>
              </form>
            ) : (
              <form action={archiveBookingAction} className="mt-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={row.id} />
                <button type="submit" className="btn btn-secondary">
                  {isConverted ? "Anfrage archivieren" : "Anfrage löschen"}
                </button>
              </form>
            )}
          </div>

          {isConverted ? (
            <div className="panel border-[color:var(--gold-soft)] p-4">
              <h3 className="kicker text-[color:var(--gold-soft)]">
                Show-Verknüpfung
              </h3>
              {convertedShow ? (
                <p className="mt-2 text-xs text-[color:var(--cream)]">
                  Verknüpft mit{" "}
                  <Link
                    href={`/${locale}/admin/shows/${convertedShow.id}/edit`}
                    className="underline-offset-2 hover:underline"
                  >
                    {convertedShow.venue}
                  </Link>{" "}
                  ({convertedShow.is_tba
                    ? "TBA"
                    : formatDate(convertedShow.starts_at)}
                  ).{" "}
                  {convertedShow.is_visible && convertedShow.is_published
                    ? "Auf der Website sichtbar."
                    : "Aktuell nicht öffentlich sichtbar."}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
                  Verknüpfte Show wurde inzwischen gelöscht.
                </p>
              )}
              {row.converted_at ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                  Umgewandelt am {formatDateTime(row.converted_at)}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      {!isConverted ? (
        <section className="panel mt-6 p-4">
          <h3 className="kicker">In Show umwandeln</h3>
          <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
            Datum, Ort und Art sind aus der Anfrage vorbelegt. Werte können
            angepasst werden. Ein Ticket-Link ist optional.
          </p>
          <form action={convertBookingToShowAction} className="mt-4 grid gap-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={row.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Datum" name="date" type="date" defaultValue={prefilledDate} />
              <Field label="Uhrzeit (optional)" name="time" type="time" />
              <Field
                label="Venue / Ort"
                name="venue"
                required
                defaultValue={row.event_location ?? ""}
              />
              <Field label="Stadt" name="city" defaultValue="" />
              <Field
                label="Land"
                name="country"
                defaultValue="Deutschland"
              />
              <Field
                label="Art der Veranstaltung"
                name="event_type"
                defaultValue={row.event_type ?? ""}
              />
              <Field
                label="Ticket-Link (optional)"
                name="ticket_url"
                type="url"
                placeholder="https://"
              />
              <Checkbox label="Datum noch offen (TBA)" name="is_tba" />
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[color:var(--cream)]">
              <Checkbox
                label="Auf Website anzeigen"
                name="is_visible"
                defaultChecked
              />
              <Checkbox
                label="Veröffentlicht"
                name="is_published"
                defaultChecked
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Show anlegen
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </AdminShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none"
      />
    </label>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[color:var(--cream)]">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[color:var(--gold-soft)]"
      />
      {label}
    </label>
  );
}
