import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminSongs } from "@/lib/admin/songs";

import { AdminShell } from "../_components/AdminShell";

import { deleteSongAction } from "./actions";
import { CreateSongForm, EditSongForm } from "./SongForms";

export const metadata = { title: "Admin · Music" };
export const dynamic = "force-dynamic";

export default async function AdminMusicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/music`,
  });
  const result = await listAdminSongs(200);

  const flashMessage =
    flash.created === "1"
      ? "Song wurde angelegt."
      : flash.updated === "1"
        ? "Song wurde aktualisiert."
        : flash.deleted === "1"
          ? "Song wurde gelöscht."
          : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="music">
      <header>
        <p className="kicker">Music · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Demo-Songs
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          MP3 und Cover werden direkt aus dem Browser in Supabase Storage
          hochgeladen, anschließend speichert der Server nur die URL. Solange
          in Supabase keine sichtbaren Songs liegen, spielt das öffentliche
          Demo-Modul die statischen Fallback-MP3s aus dem Repo. Kein
          Download-Button im Frontend, `is_streamable=true` &amp;
          `is_downloadable=false` werden serverseitig erzwungen.
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

      <section className="panel mt-6 p-4">
        <h3 className="kicker">Neuen Song anlegen</h3>
        <CreateSongForm locale={locale} />
      </section>

      {!result.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Songs konnten nicht geladen werden. Grund: <code>{result.reason}</code>
        </div>
      ) : result.rows.length === 0 ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Noch keine Songs in Supabase. Solange diese Liste leer ist, zeigt das
          öffentliche Demo-Modul die statischen Fallback-MP3s.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {result.rows.map((row) => (
            <li key={row.id} className="panel p-4">
              <EditSongForm locale={locale} row={row} />
              <form
                action={deleteSongAction}
                className="mt-3 border-t border-[color:var(--line)] pt-3"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={row.id} />
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                >
                  Song löschen
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
