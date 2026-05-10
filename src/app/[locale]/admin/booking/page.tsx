import Link from "next/link";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  getRecentBookingRequests,
  type RecentBookingRequest,
} from "@/lib/admin/bookings";

import { AdminShell } from "../_components/AdminShell";

export const metadata = { title: "Admin · Booking" };
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

const STATUS_TONE: Record<RecentBookingRequest["status"], string> = {
  new: "border-[color:var(--gold-soft)] text-[color:var(--gold-soft)]",
  read: "border-[color:var(--line-strong)] text-[color:var(--cream)]",
  answered: "border-[color:var(--line-strong)] text-[color:var(--cream)]",
  accepted: "border-[color:var(--gold-soft)] text-[color:var(--gold-soft)]",
  converted: "border-[color:var(--gold-soft)] text-[color:var(--gold-soft)]",
  rejected: "border-[color:var(--line)] text-[color:var(--muted-cream)]",
  archived: "border-[color:var(--line)] text-[color:var(--muted-cream)]",
  spam: "border-[color:var(--line)] text-[color:var(--muted-cream)]",
};

function formatDate(iso: string | null): string {
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

function formatEventDate(iso: string | null): string {
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

export default async function AdminBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ archived?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const { archived } = await searchParams;
  const includeDeleted = archived === "1";
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/booking`,
  });
  const recent = await getRecentBookingRequests(50, { includeDeleted });

  return (
    <AdminShell locale={locale} current={current} active="booking">
      <header>
        <p className="kicker">Booking · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Eingegangene Anfragen
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Status setzen, archivieren oder in eine Show umwandeln. Antworten
          erfolgen weiterhin extern per Mail; keine automatischen Mails aus dem
          Admin.
        </p>
      </header>

      <nav
        aria-label="Filter"
        className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em]"
      >
        <Link
          href={`/${locale}/admin/booking`}
          aria-current={!includeDeleted ? "page" : undefined}
          className={
            "rounded-full border px-3 py-1.5 transition " +
            (!includeDeleted
              ? "border-[color:var(--gold-soft)] bg-[color:var(--gold)] text-[#060403]"
              : "border-[color:var(--line)] text-[color:var(--muted-cream)] hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)]")
          }
        >
          Aktive Anfragen
        </Link>
        <Link
          href={`/${locale}/admin/booking?archived=1`}
          aria-current={includeDeleted ? "page" : undefined}
          className={
            "rounded-full border px-3 py-1.5 transition " +
            (includeDeleted
              ? "border-[color:var(--gold-soft)] bg-[color:var(--gold)] text-[#060403]"
              : "border-[color:var(--line)] text-[color:var(--muted-cream)] hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)]")
          }
        >
          Inkl. Archiv
        </Link>
      </nav>

      {!recent.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Booking-Daten konnten nicht geladen werden. Grund:{" "}
          <code>{recent.reason ?? "unbekannt"}</code>
          . Prüfe die Server-Umgebungsvariablen
          (<code>SUPABASE_SERVICE_ROLE_KEY</code>).
        </div>
      ) : recent.rows.length === 0 ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Noch keine Booking-Anfragen.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {recent.rows.map((row) => {
            const isArchived = row.deleted_at !== null;
            const isConverted = Boolean(row.converted_show_id);
            return (
              <li key={row.id} className="panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold tracking-[-0.01em]">
                      {row.name}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      <span
                        className={
                          "rounded-full border px-2 py-0.5 " +
                          STATUS_TONE[row.status]
                        }
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                      {isConverted ? (
                        <span className="rounded-full border border-[color:var(--gold-soft)] px-2 py-0.5 text-[color:var(--gold-soft)]">
                          ↳ Show
                        </span>
                      ) : null}
                      {isArchived ? (
                        <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5">
                          archiviert
                        </span>
                      ) : null}
                      <span>{row.locale ? row.locale.toUpperCase() : "—"}</span>
                      <span>·</span>
                      <span>{formatDate(row.created_at)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`mailto:${row.email}`}
                      className="text-xs text-[color:var(--gold-soft)] underline-offset-2 hover:underline"
                    >
                      {row.email}
                    </a>
                    <Link
                      href={`/${locale}/admin/booking/${row.id}`}
                      className="text-xs uppercase tracking-[0.22em] text-[color:var(--cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[color:var(--muted-cream)] md:grid-cols-4">
                  <div>
                    <dt className="kicker">Datum</dt>
                    <dd className="mt-1 text-[color:var(--cream)]">
                      {formatEventDate(row.event_date)}
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
                    <dt className="kicker">Telefon</dt>
                    <dd className="mt-1 text-[color:var(--cream)]">
                      {row.phone ?? "—"}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
