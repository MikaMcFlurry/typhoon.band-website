import Image from "next/image";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminMedia } from "@/lib/admin/media";
import {
  IMAGE_MAX_BYTES,
} from "@/lib/validation/upload";

import { AdminShell } from "../_components/AdminShell";
import {
  deleteGalleryItemAction,
  toggleGalleryVisibilityAction,
  updateGalleryItemAction,
  uploadGalleryImageAction,
} from "./actions";

export const metadata = { title: "Admin · Media" };
export const dynamic = "force-dynamic";

const IMAGE_MAX_MB = (IMAGE_MAX_BYTES / (1024 * 1024)).toFixed(0);

export default async function AdminMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    uploaded?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/media`,
  });
  const result = await listAdminMedia("gallery", 200);

  const flashMessage =
    flash.uploaded === "1"
      ? "Bild wurde hochgeladen."
      : flash.updated === "1"
        ? "Bild wurde aktualisiert."
        : flash.deleted === "1"
          ? "Bild wurde gelöscht."
          : null;

  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="media">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Gallery · Verwaltung</p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
            Galerie-Bilder
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
            Bilder werden über Supabase Storage hochgeladen und über DB-Records
            ausgespielt. Solange keine sichtbaren Records existieren, zeigt die
            öffentliche Galerie weiterhin die statischen Fallback-Bilder aus dem
            Repo. Erlaubt: JPG / PNG / WebP, max. {IMAGE_MAX_MB} MB. SVG und
            HEIC werden abgewiesen.
          </p>
        </div>
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
        <h3 className="kicker">Neues Bild hochladen</h3>
        <form
          action={uploadGalleryImageAction}
          className="mt-3 grid gap-3"
          encType="multipart/form-data"
        >
          <input type="hidden" name="locale" value={locale} />
          <Field
            label="Datei (JPG / PNG / WebP)"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Titel (optional)" name="title" />
            <Field label="Sortierung" name="sort_order" type="number" defaultValue="0" />
          </div>
          <Field label="Alt-Text (optional)" name="alt_text" />
          <div>
            <button type="submit" className="btn btn-primary">
              Hochladen
            </button>
          </div>
        </form>
      </section>

      {!result.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Galerie konnte nicht geladen werden. Grund: <code>{result.reason}</code>
        </div>
      ) : result.rows.length === 0 ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Noch keine Galerie-Records in Supabase. Solange diese Liste leer ist,
          zeigt die öffentliche Galerie die statischen Fallback-Bilder.
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {result.rows.map((row) => (
            <li key={row.id} className="panel p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--line)] md:w-[160px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <Image
                    alt={row.alt_text ?? row.title ?? "Galerie"}
                    className="h-full w-full object-cover"
                    height={240}
                    src={row.file_url}
                    unoptimized
                    width={320}
                  />
                </div>
                <form action={updateGalleryItemAction} className="grid gap-2">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={row.id} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Titel"
                      name="title"
                      defaultValue={row.title ?? ""}
                    />
                    <Field
                      label="Sortierung"
                      name="sort_order"
                      type="number"
                      defaultValue={String(row.sort_order ?? 0)}
                    />
                  </div>
                  <Field
                    label="Alt-Text"
                    name="alt_text"
                    defaultValue={row.alt_text ?? ""}
                  />
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                    Status: {row.is_visible ? "sichtbar" : "ausgeblendet"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" className="btn btn-secondary">
                      Speichern
                    </button>
                  </div>
                </form>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[color:var(--line)] pt-3">
                <form action={toggleGalleryVisibilityAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    type="hidden"
                    name="next"
                    value={row.is_visible ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  >
                    {row.is_visible ? "Ausblenden" : "Anzeigen"}
                  </button>
                </form>
                <form action={deleteGalleryItemAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  >
                    Löschen
                  </button>
                </form>
                <a
                  href={row.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
                >
                  Quelle öffnen ↗
                </a>
              </div>
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
