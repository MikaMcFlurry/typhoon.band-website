import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminConsentSettings } from "@/lib/admin/consent";

import { AdminShell } from "../_components/AdminShell";

export const metadata = { title: "Admin · Consent" };
export const dynamic = "force-dynamic";

export default async function AdminConsentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/consent`,
  });

  const result = await listAdminConsentSettings();
  const rows = result.available ? result.rows : [];

  return (
    <AdminShell locale={locale} current={current} active="consent">
      <header>
        <p className="kicker">Consent · Übersicht</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Cookie- &amp; Consent-Kategorien
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Die Kategorien, die das öffentliche Cookie-Banner anzeigt. Aktuell
          sind sie im Code gepflegt und werden hier nur zur Übersicht aufgelistet.
          Editierbar wird das in einer späteren Phase, sobald analytische Tools
          dazukommen.
        </p>
      </header>

      {!result.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Consent-Einstellungen konnten nicht geladen werden. Grund:{" "}
          <code>{result.reason}</code>.
        </div>
      ) : null}

      <section className="mt-6">
        <h3 className="font-display text-base font-semibold tracking-[-0.01em] md:text-lg">
          Aktuelle Kategorien
        </h3>
        {rows.length === 0 ? (
          <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
            Noch keine Kategorien in der DB. Das Banner nutzt dann die im Code
            hinterlegte Default-Liste (Notwendig, Externe Medien).
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {rows.map((row) => (
              <li key={row.id} className="panel p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-semibold tracking-[-0.01em]">
                    {row.label}
                  </span>
                  <span
                    className={
                      "rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] " +
                      (row.is_required
                        ? "border-[color:var(--gold-soft)] text-[color:var(--gold-soft)]"
                        : "border-[color:var(--line)] text-[color:var(--muted-cream)]")
                    }
                  >
                    {row.is_required ? "Pflicht" : "Optional"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  <code>{row.category}</code>
                </p>
                {row.description ? (
                  <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted-cream)]">
                    {row.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel mt-6 p-4 text-xs leading-relaxed text-[color:var(--muted-cream)] md:p-6">
        <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-[color:var(--cream)]">
          Aktuelles Verhalten der Website
        </h3>
        <ul className="mt-2 list-disc pl-4">
          <li>Banner erscheint einmal beim ersten Besuch.</li>
          <li>Notwendige Cookies sind immer aktiv.</li>
          <li>
            Externe Medien (Spotify/YouTube/SoundCloud/Bandcamp Embeds) laden
            erst, wenn die Kategorie zugestimmt wurde.
          </li>
          <li>Reine Outbound-Links sind ohne Zustimmung erlaubt.</li>
          <li>Es findet kein Tracking statt — keine Analytics gesetzt.</li>
          <li>
            Wahl wird unter <code>typhoon.consent.v1</code> im localStorage
            gespeichert.
          </li>
        </ul>
      </section>
    </AdminShell>
  );
}
