import { isLocale, DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminSeoEntries } from "@/lib/admin/seo";

import { AdminShell } from "../_components/AdminShell";

import { deleteSeoAction, saveSeoAction } from "./actions";

export const metadata = { title: "Admin · SEO" };
export const dynamic = "force-dynamic";

// Suggested paths the Admin can pre-fill. The form still accepts any
// valid path so future routes are not blocked.
const SUGGESTED_PATHS = [
  "/",
  "/legal/imprint",
  "/legal/privacy",
  "/legal/cookies",
];

export default async function AdminSeoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/seo`,
  });

  const result = await listAdminSeoEntries();
  const rows = result.available ? result.rows : [];

  const flashMessage =
    flash.saved === "1"
      ? "SEO-Eintrag wurde gespeichert."
      : flash.deleted === "1"
        ? "SEO-Eintrag wurde gelöscht — Fallback aus dem Repo greift wieder."
        : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="seo">
      <header>
        <p className="kicker">SEO · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Title, Description, OpenGraph
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Pro Pfad und Sprache lassen sich Title (max. 80), Description
          (max. 180) und ein optionales OG-Bild setzen. Leere Felder werden
          gelöscht — dann übernimmt wieder der Repo-Fallback. Pfade ohne
          Locale-Prefix angeben (z. B. <code>/</code>, <code>/legal/privacy</code>).
        </p>
      </header>

      {flashMessage ? (
        <div className="panel mt-5 border-[color:var(--gold-soft)] p-3 text-xs text-[color:var(--cream)]">
          {flashMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="panel mt-5 border-[#ef4444] p-3 text-xs text-[#fca5a5]">
          Fehler: {errorMessage}
        </div>
      ) : null}

      {!result.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          SEO-Einträge konnten nicht aus Supabase geladen werden. Grund:{" "}
          <code>{result.reason}</code>. Anlegen ist erst nach erfolgreichem
          Connect möglich.
        </div>
      ) : null}

      <section className="panel mt-6 p-4 md:p-6">
        <h3 className="font-display text-base font-semibold tracking-[-0.01em] md:text-lg">
          Neuen Eintrag anlegen / aktualisieren
        </h3>
        <p className="mt-1 text-xs text-[color:var(--muted-cream)]">
          Bestehende Kombinationen (Pfad × Sprache) werden überschrieben.
        </p>
        <form action={saveSeoAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            Pfad
            <input
              type="text"
              name="path"
              list="seo-path-suggestions"
              placeholder="/"
              required
              maxLength={200}
              className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            />
            <datalist id="seo-path-suggestions">
              {SUGGESTED_PATHS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            Sprache
            <select
              name="entry_locale"
              defaultValue="de"
              className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] md:col-span-2">
            Title (max. 80)
            <input
              type="text"
              name="title"
              maxLength={80}
              className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] md:col-span-2">
            Description (max. 180)
            <textarea
              name="description"
              maxLength={180}
              rows={3}
              className="resize-y rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] md:col-span-2">
            OG-Bild URL (optional)
            <input
              type="url"
              name="og_image_url"
              placeholder="https://…/og.jpg"
              maxLength={500}
              className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn btn-primary">
              Speichern
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6">
        <h3 className="font-display text-base font-semibold tracking-[-0.01em] md:text-lg">
          Bestehende Einträge
        </h3>
        {rows.length === 0 ? (
          <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
            Noch keine SEO-Overrides. Bis du welche anlegst, kommen Title und
            Description aus dem statischen Fallback.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {rows.map((row) => (
              <li key={row.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <code className="text-xs text-[color:var(--gold-soft)]">
                      {row.path}
                    </code>
                    <span className="ml-2 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      {row.locale}
                    </span>
                  </div>
                  <form action={deleteSeoAction}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="path" value={row.path} />
                    <button
                      type="submit"
                      className="btn btn-secondary text-[10px]"
                    >
                      Löschen
                    </button>
                  </form>
                </div>
                <p className="mt-2 text-sm text-[color:var(--cream)]">
                  {row.title || (
                    <span className="text-[color:var(--muted)]">
                      (kein Title)
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted-cream)]">
                  {row.description || (
                    <span className="text-[color:var(--muted)]">
                      (keine Description)
                    </span>
                  )}
                </p>
                {row.og_image_url ? (
                  <p className="mt-1 break-all text-[10px] text-[color:var(--muted)]">
                    OG: {row.og_image_url}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
