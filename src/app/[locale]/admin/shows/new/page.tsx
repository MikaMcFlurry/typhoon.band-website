import Link from "next/link";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";

import { AdminShell } from "../../_components/AdminShell";
import { createShowAction } from "../actions";
import { ShowForm } from "../_components/ShowForm";

export const metadata = { title: "Admin · Show anlegen" };
export const dynamic = "force-dynamic";

export default async function NewShowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/shows/new`,
  });

  return (
    <AdminShell locale={locale} current={current} active="shows">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Shows · Neu</p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
            Neue Show anlegen
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
            Manuell hinterlegen. Für Booking-basierte Shows lieber den Weg
            über die Booking-Detailseite nutzen — dort bleibt die Verknüpfung
            erhalten.
          </p>
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
          mode="create"
          locale={locale}
          action={createShowAction}
          submitLabel="Show anlegen"
        />
      </section>
    </AdminShell>
  );
}
