import Image from "next/image";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminSongs } from "@/lib/admin/songs";
import {
  AUDIO_MAX_BYTES,
  IMAGE_MAX_BYTES,
} from "@/lib/validation/upload";

import { AdminShell } from "../_components/AdminShell";
import {
  createSongAction,
  deleteSongAction,
  updateSongAction,
} from "./actions";

export const metadata = { title: "Admin · Music" };
export const dynamic = "force-dynamic";

const AUDIO_MAX_MB = (AUDIO_MAX_BYTES / (1024 * 1024)).toFixed(0);
const IMAGE_MAX_MB = (IMAGE_MAX_BYTES / (1024 * 1024)).toFixed(0);

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
          MP3 und Cover über Supabase Storage hochladen. Solange in Supabase
          keine sichtbaren Songs liegen, spielt das öffentliche Demo-Modul die
          statischen Fallback-MP3s aus dem Repo. Audio: nur MP3, max.{" "}
          {AUDIO_MAX_MB} MB. Cover: JPG/PNG/WebP, max. {IMAGE_MAX_MB} MB. Kein
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
        <form
          action={createSongAction}
          className="mt-3 grid gap-3"
          encType="multipart/form-data"
        >
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Titel" name="title" required />
            <Field label="Slug (optional)" name="slug" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="MP3-Datei"
              name="audio_file"
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3"
              required
            />
            <Field
              label="Cover (optional)"
              name="cover_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              label="Sortierung"
              name="sort_order"
              type="number"
              defaultValue="0"
            />
            <Checkbox label="Sichtbar" name="is_visible" defaultChecked />
            <Checkbox label="Als Featured-Song" name="is_featured" />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              Song anlegen
            </button>
          </div>
        </form>
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
              <form
                action={updateSongAction}
                className="grid gap-3"
                encType="multipart/form-data"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="id" value={row.id} />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr]">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] md:w-[120px]">
                    {row.cover_image_url ? (
                      <Image
                        alt={row.title}
                        className="h-full w-full object-cover"
                        height={240}
                        src={row.cover_image_url}
                        unoptimized
                        width={240}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                        kein Cover
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field
                        label="Titel"
                        name="title"
                        required
                        defaultValue={row.title}
                      />
                      <Field label="Slug" name="slug" defaultValue={row.slug} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field
                        label="MP3 ersetzen"
                        name="audio_file"
                        type="file"
                        accept="audio/mpeg,audio/mp3,.mp3"
                      />
                      <Field
                        label="Cover ersetzen"
                        name="cover_file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Field
                        label="Sortierung"
                        name="sort_order"
                        type="number"
                        defaultValue={String(row.sort_order ?? 0)}
                      />
                      <Checkbox
                        label="Sichtbar"
                        name="is_visible"
                        defaultChecked={row.is_visible}
                      />
                      <Checkbox
                        label="Featured"
                        name="is_featured"
                        defaultChecked={row.is_featured}
                      />
                    </div>
                    {row.cover_image_url ? (
                      <Checkbox
                        label="Cover entfernen (kein Upload nötig)"
                        name="clear_cover"
                      />
                    ) : null}
                  </div>
                </div>

                <p className="text-[11px] text-[color:var(--muted-cream)]">
                  Audio:{" "}
                  {row.audio_url ? (
                    <a
                      href={row.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
                    >
                      Quelle öffnen ↗
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-secondary">
                    Speichern
                  </button>
                </div>
              </form>
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

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  accept,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  accept?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        accept={accept}
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
