import Image from "next/image";

import { members as fallbackMembers } from "@/data/members";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminMembers, type AdminMemberRow } from "@/lib/admin/members";
import { IMAGE_MAX_BYTES } from "@/lib/validation/upload";

import { AdminShell } from "../_components/AdminShell";
import {
  clearMemberPhotoAction,
  uploadMemberPhotoAction,
} from "./actions";

export const metadata = { title: "Admin · Members" };
export const dynamic = "force-dynamic";

const IMAGE_MAX_MB = (IMAGE_MAX_BYTES / (1024 * 1024)).toFixed(0);

type RowView = {
  slug: string;
  fallbackName: string;
  fallbackRole: string;
  fallbackPhoto: string;
  fallbackSort: number;
  db: AdminMemberRow | null;
};

function buildRows(rows: AdminMemberRow[] | null): RowView[] {
  const bySlug = new Map<string, AdminMemberRow>();
  for (const r of rows ?? []) bySlug.set(r.slug, r);
  // Use the static fallback as the canonical list of slugs so the Admin
  // sees one card per band member even when nothing is in Supabase yet.
  return fallbackMembers.map((m) => ({
    slug: m.id,
    fallbackName: m.name,
    fallbackRole: m.role,
    fallbackPhoto: m.photo,
    fallbackSort: m.sortOrder,
    db: bySlug.get(m.id) ?? null,
  }));
}

export default async function AdminMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    saved?: string;
    cleared?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/members`,
  });
  const result = await listAdminMembers();
  const rows = buildRows(result.available ? result.rows : []);

  const flashMessage =
    flash.saved === "1"
      ? "Mitglied wurde gespeichert."
      : flash.cleared === "1"
        ? "Foto wurde entfernt — Fallback aus dem Repo greift wieder."
        : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="members">
      <header>
        <p className="kicker">Members · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Bandmitglieder-Fotos
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Diese Phase pflegt nur Foto und Sichtbarkeit pro Mitglied. Namen,
          Rollen und Bios bleiben dictionary-gesteuert. Erlaubt: JPG / PNG /
          WebP, max. {IMAGE_MAX_MB} MB. Fehlt ein Supabase-Foto, wird das
          Repo-Foto angezeigt.
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
          Mitglieder konnten nicht aus Supabase geladen werden. Grund:{" "}
          <code>{result.reason}</code>. Du kannst dennoch unten Fotos hochladen
          — sobald Supabase erreichbar ist, werden die Records angelegt.
        </div>
      ) : null}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((view) => {
          const currentPhoto = view.db?.photo_url || view.fallbackPhoto;
          const source = view.db?.photo_url ? "Supabase" : "Fallback (Repo)";
          return (
            <li key={view.slug} className="panel p-4">
              <header className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold tracking-[-0.01em]">
                    {view.fallbackName}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                    {view.fallbackRole} · slug: {view.slug}
                  </p>
                </div>
                <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                  {source}
                </span>
              </header>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--line)] md:w-[140px]">
                  <Image
                    alt={view.fallbackName}
                    className="h-full w-full object-cover"
                    height={210}
                    src={currentPhoto}
                    unoptimized
                    width={280}
                  />
                </div>

                <form
                  action={uploadMemberPhotoAction}
                  className="grid gap-2"
                  encType="multipart/form-data"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="slug" value={view.slug} />
                  <Field
                    label="Neues Foto (JPG / PNG / WebP)"
                    name="photo_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field
                      label="Sortierung"
                      name="sort_order"
                      type="number"
                      defaultValue={String(
                        view.db?.sort_order ?? view.fallbackSort,
                      )}
                    />
                    <Checkbox
                      label="Sichtbar"
                      name="is_visible"
                      defaultChecked={view.db?.is_visible ?? true}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="submit" className="btn btn-secondary">
                      Speichern
                    </button>
                  </div>
                </form>
              </div>

              {view.db?.photo_url ? (
                <form
                  action={clearMemberPhotoAction}
                  className="mt-3 border-t border-[color:var(--line)] pt-3"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="slug" value={view.slug} />
                  <button
                    type="submit"
                    className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  >
                    Foto entfernen (Fallback wieder anzeigen)
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
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
