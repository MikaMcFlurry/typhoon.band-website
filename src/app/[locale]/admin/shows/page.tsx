import Link from "next/link";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminShows } from "@/lib/admin/shows";

import { AdminShell } from "../_components/AdminShell";
import { deleteShowAction, toggleShowVisibilityAction } from "./actions";

export const metadata = { title: "Admin · Shows" };
export const dynamic = "force-dynamic";

function formatDate(iso: string | null, isTba: boolean): string {
  if (isTba || !iso) return "TBA";
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

export default async function AdminShowsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/shows`,
  });
  const result = await listAdminShows(200);

  const flashMessage =
    flash.created === "1"
      ? "Show wurde angelegt."
      : flash.updated === "1"
        ? "Show wurde aktualisiert."
        : flash.deleted === "1"
          ? "Show wurde gelöscht."
          : null;

  return (
    <AdminShell locale={locale} current={current} active="shows">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Shows · Verwaltung</p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
            Termine
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
            Termine anlegen, bearbeiten, ausblenden oder löschen. Sichtbar
            werden öffentlich nur Shows mit „Sichtbar“ und „Veröffentlicht“.
          </p>
        </div>
        <Link href={`/${locale}/admin/shows/new`} className="btn btn-primary">
          + Neue Show
        </Link>
      </header>

      {flashMessage ? (
        <div className="panel mt-5 border-[color:var(--gold-soft)] p-3 text-xs text-[color:var(--cream)]">
          {flashMessage}
        </div>
      ) : null}

      {!result.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Shows konnten nicht geladen werden. Grund: <code>{result.reason}</code>
        </div>
      ) : result.rows.length === 0 ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Noch keine Shows angelegt. Solange diese Liste leer ist, zeigt die
          öffentliche Termine-Sektion die TBA-Platzhalter aus dem Code.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {result.rows.map((show) => {
            const isPublic = show.is_visible && show.is_published;
            return (
              <li key={show.id} className="panel p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base font-semibold tracking-[-0.01em]">
                      {show.venue}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      <span>{formatDate(show.starts_at, show.is_tba)}</span>
                      {show.event_type ? (
                        <>
                          <span>·</span>
                          <span>{show.event_type}</span>
                        </>
                      ) : null}
                      {show.source_booking_request_id ? (
                        <span className="rounded-full border border-[color:var(--gold-soft)] px-2 py-0.5 text-[color:var(--gold-soft)]">
                          aus Booking
                        </span>
                      ) : null}
                      {!isPublic ? (
                        <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5">
                          {show.is_visible ? "Entwurf" : "ausgeblendet"}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[11px] text-[color:var(--muted-cream)]">
                      {[show.city, show.country].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {show.ticket_url ? (
                      <a
                        href={show.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[color:var(--gold-soft)] underline-offset-2 hover:underline"
                      >
                        Ticket-Link
                      </a>
                    ) : null}
                    <Link
                      href={`/${locale}/admin/shows/${show.id}/edit`}
                      className="text-xs uppercase tracking-[0.22em] text-[color:var(--cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
                    >
                      Bearbeiten →
                    </Link>
                    <form action={toggleShowVisibilityAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={show.id} />
                      <input
                        type="hidden"
                        name="next"
                        value={show.is_visible ? "0" : "1"}
                      />
                      <button
                        type="submit"
                        className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                      >
                        {show.is_visible ? "Ausblenden" : "Anzeigen"}
                      </button>
                    </form>
                    <form action={deleteShowAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={show.id} />
                      <button
                        type="submit"
                        className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                      >
                        Löschen
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
