import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { getAdminShow } from "@/lib/admin/shows";

import { AdminShell } from "../../../_components/AdminShell";
import { deleteShowAction, updateShowAction } from "../../actions";
import { ShowForm } from "../../_components/ShowForm";

export const metadata = { title: "Admin · Show bearbeiten" };
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditShowPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  if (!UUID_RE.test(id)) notFound();

  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/shows/${id}/edit`,
  });

  const result = await getAdminShow(id);
  if (!result.available) {
    if (result.reason === "not-found") notFound();
    return (
      <AdminShell locale={locale} current={current} active="shows">
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Show konnte nicht geladen werden. Grund: <code>{result.reason}</code>
        </div>
      </AdminShell>
    );
  }

  const show = result.row;

  return (
    <AdminShell locale={locale} current={current} active="shows">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="kicker">Shows · Bearbeiten</p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
            {show.venue}
          </h2>
          {show.source_booking_request_id ? (
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)]">
              ↳ aus{" "}
              <Link
                href={`/${locale}/admin/booking/${show.source_booking_request_id}`}
                className="underline-offset-2 hover:underline"
              >
                Booking-Anfrage
              </Link>
            </p>
          ) : null}
        </div>
        <Link
          href={`/${locale}/admin/shows`}
          className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
        >
          ← zur Liste
        </Link>
      </header>

      <section className="panel mt-6 p-4">
        <ShowForm
          mode="edit"
          locale={locale}
          action={updateShowAction}
          show={show}
          submitLabel="Speichern"
        />
      </section>

      <section className="panel mt-6 border-[color:var(--line)] p-4">
        <h3 className="kicker">Show löschen</h3>
        <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
          Entfernt die Show endgültig. Eine verknüpfte Booking-Anfrage bleibt
          bestehen, der Verweis wird automatisch gelöst.
        </p>
        <form action={deleteShowAction} className="mt-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={show.id} />
          <button type="submit" className="btn btn-secondary">
            Show löschen
          </button>
        </form>
      </section>
    </AdminShell>
  );
}
