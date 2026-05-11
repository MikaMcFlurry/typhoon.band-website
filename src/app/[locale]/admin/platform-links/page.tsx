import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminPlatformLinks } from "@/lib/admin/platform-links";
import {
  PLATFORM_KEYS,
  PLATFORM_LABELS,
  type PlatformKey,
} from "@/lib/validation/legal-seo-platforms";

import { AdminShell } from "../_components/AdminShell";

import {
  deletePlatformLinkAction,
  savePlatformLinkAction,
} from "./actions";

export const metadata = { title: "Admin · Platform Links" };
export const dynamic = "force-dynamic";

export default async function AdminPlatformLinksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/platform-links`,
  });

  const result = await listAdminPlatformLinks();
  const rows = result.available ? result.rows : [];

  // Group by platform so the Admin can see immediately which platforms
  // already have a link and which ones are still empty.
  const usedPlatforms = new Set(rows.map((r) => r.platform as PlatformKey));
  const missing = PLATFORM_KEYS.filter((p) => !usedPlatforms.has(p));

  const flashMessage =
    flash.saved === "1"
      ? "Platform-Link wurde gespeichert."
      : flash.deleted === "1"
        ? "Platform-Link wurde entfernt."
        : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="platform-links">
      <header>
        <p className="kicker">Platform Links · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Externe Plattformen
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Spotify, YouTube, Instagram, Facebook, SoundCloud und Bandcamp. Sobald
          ein Eintrag aktiv ist, erscheint er automatisch im Footer der Website.
          Nur reine Links — kein Embed lädt vor Cookie-Zustimmung.
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
          Platform-Links konnten nicht aus Supabase geladen werden. Grund:{" "}
          <code>{result.reason}</code>.
        </div>
      ) : null}

      <section className="panel mt-6 p-4 md:p-6">
        <h3 className="font-display text-base font-semibold tracking-[-0.01em] md:text-lg">
          Neuen Link anlegen
        </h3>
        <p className="mt-1 text-xs text-[color:var(--muted-cream)]">
          {missing.length > 0
            ? `Noch offen: ${missing.map((m) => PLATFORM_LABELS[m]).join(", ")}.`
            : "Alle unterstützten Plattformen sind bereits angelegt — bestehende Einträge unten bearbeiten."}
        </p>
        <form
          action={savePlatformLinkAction}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto_auto]"
        >
          <input type="hidden" name="locale" value={locale} />
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            Plattform
            <select
              name="platform"
              required
              defaultValue={missing[0] ?? PLATFORM_KEYS[0]}
              className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            >
              {PLATFORM_KEYS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            URL
            <input
              type="url"
              name="url"
              placeholder="https://…"
              required
              maxLength={500}
              className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            Sortierung
            <input
              type="number"
              name="sort_order"
              defaultValue={0}
              min={0}
              className="w-24 rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[color:var(--muted-cream)]">
            <input type="checkbox" name="is_active" defaultChecked />
            Aktiv
          </label>
          <div className="md:col-span-4">
            <button type="submit" className="btn btn-primary">
              Anlegen
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6">
        <h3 className="font-display text-base font-semibold tracking-[-0.01em] md:text-lg">
          Bestehende Links
        </h3>
        {rows.length === 0 ? (
          <p className="mt-2 text-xs text-[color:var(--muted-cream)]">
            Noch keine Platform-Links angelegt.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {rows.map((row) => {
              const label =
                PLATFORM_LABELS[row.platform as PlatformKey] ?? row.platform;
              return (
                <li key={row.id} className="panel p-4">
                  <form
                    action={savePlatformLinkAction}
                    className="grid gap-3 md:grid-cols-[1fr_2fr_auto_auto_auto]"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={row.id} />
                    <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      Plattform
                      <select
                        name="platform"
                        defaultValue={row.platform}
                        className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
                      >
                        {PLATFORM_KEYS.map((p) => (
                          <option key={p} value={p}>
                            {PLATFORM_LABELS[p]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      URL
                      <input
                        type="url"
                        name="url"
                        defaultValue={row.url}
                        required
                        maxLength={500}
                        className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      Sort
                      <input
                        type="number"
                        name="sort_order"
                        defaultValue={row.sort_order}
                        min={0}
                        className="w-24 rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[color:var(--muted-cream)]">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={row.is_active}
                      />
                      Aktiv
                    </label>
                    <div className="flex items-end gap-2">
                      <button type="submit" className="btn btn-secondary">
                        Speichern
                      </button>
                    </div>
                    <p className="md:col-span-5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                      {label}
                    </p>
                  </form>
                  <form
                    action={deletePlatformLinkAction}
                    className="mt-3 flex justify-end"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="btn btn-secondary text-[10px]"
                    >
                      Löschen
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
