import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdmin } from "@/lib/admin/auth";
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
  done: "Erledigt",
  spam: "Spam",
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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const current = await requireAdmin(locale, {
    from: `/${locale}/admin/booking`,
  });
  const recent = await getRecentBookingRequests(50);

  return (
    <AdminShell locale={locale} current={current} active="booking">
      <header>
        <p className="kicker">Booking · Read-only</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Eingegangene Anfragen
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Schreibgeschützter Überblick. Bearbeiten/Antworten und Statuswechsel
          folgen in einer späteren Phase.
        </p>
      </header>

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
          {recent.rows.map((row) => (
            <li key={row.id} className="panel p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold tracking-[-0.01em]">
                    {row.name}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                    {STATUS_LABEL[row.status]} ·{" "}
                    {row.locale ? row.locale.toUpperCase() : "—"} ·{" "}
                    {formatDate(row.created_at)}
                  </p>
                </div>
                <a
                  href={`mailto:${row.email}`}
                  className="text-xs text-[color:var(--gold-soft)] underline-offset-2 hover:underline"
                >
                  {row.email}
                </a>
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

              {row.message ? (
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-[color:var(--cream)]">
                  {row.message}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
