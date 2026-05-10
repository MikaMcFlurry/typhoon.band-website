"use client";

import { useState } from "react";

import type {
  AdminMemberRow,
  AdminMemberTranslationRow,
} from "@/lib/admin/members";

import {
  DirectUploadField,
  type UploadFieldPhase,
} from "../_uploads/DirectUploadField";

import { saveMemberAction } from "./actions";

type Translation = Pick<AdminMemberTranslationRow, "locale" | "name" | "role" | "bio_md">;

export type MemberFormProps = {
  locale: string;
  slug: string;
  // Static fallback values per locale, used to prefill placeholders.
  fallback: {
    name: string;
    role: string;
    bio: string;
    photoUrl: string;
    sortOrder: number;
  };
  fallbackByLocale: Record<string, { name: string; role: string; bio: string }>;
  db: (AdminMemberRow & { translations: AdminMemberTranslationRow[] }) | null;
};

const LOCALES = ["de", "en", "tr"] as const;

const LOCALE_LABEL: Record<(typeof LOCALES)[number], string> = {
  de: "Deutsch",
  en: "Englisch",
  tr: "Türkisch",
};

function findTranslation(
  list: Translation[] | undefined,
  locale: string,
): Translation | null {
  return list?.find((t) => t.locale === locale) ?? null;
}

export function MemberForm({
  locale,
  slug,
  fallback,
  fallbackByLocale,
  db,
}: MemberFormProps) {
  const [phase, setPhase] = useState<UploadFieldPhase>("idle");
  const photoUrl = db?.photo_url || fallback.photoUrl;
  const photoSource = db?.photo_url ? "Supabase" : "Fallback (Repo)";
  const isVisible = db?.is_visible ?? true;
  const sortOrder = db?.sort_order ?? fallback.sortOrder;

  return (
    <form action={saveMemberAction} className="grid gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />

      <header className="flex items-baseline justify-between gap-2">
        <div>
          <p className="font-display text-base font-semibold tracking-[-0.01em]">
            {fallback.name}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            slug: {slug}
          </p>
        </div>
        <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
          {photoSource}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr]">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--line)] md:w-[140px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={fallback.name}
            className="h-full w-full object-cover"
            src={photoUrl}
          />
        </div>

        <div className="grid gap-2">
          <DirectUploadField
            name="photo_file"
            target="member-photo"
            kind="image"
            locale={locale}
            label="Neues Foto (optional)"
            onPhaseChange={setPhase}
          />
          {db?.photo_url ? (
            <CheckboxField
              label="Aktuelles Foto entfernen (Fallback wieder anzeigen)"
              name="clear_photo"
            />
          ) : null}
        </div>
      </div>

      <fieldset className="grid gap-3 border-t border-[color:var(--line)] pt-3">
        <legend className="kicker">Texte (DE Pflicht, EN/TR fallen sonst auf Fallback zurück)</legend>
        {LOCALES.map((loc) => {
          const tr = findTranslation(db?.translations, loc);
          const fb = fallbackByLocale[loc] ?? {
            name: fallback.name,
            role: fallback.role,
            bio: fallback.bio,
          };
          return (
            <div
              key={loc}
              className="grid gap-2 rounded-md border border-[color:var(--line)] p-3"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)]">
                {LOCALE_LABEL[loc]} ({loc})
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <TextField
                  label="Name"
                  name={`name_${loc}`}
                  defaultValue={tr?.name ?? ""}
                  placeholder={fb.name}
                />
                <TextField
                  label="Instrument / Rolle"
                  name={`role_${loc}`}
                  defaultValue={tr?.role ?? ""}
                  placeholder={fb.role}
                />
              </div>
              <TextArea
                label="Kurze Bio"
                name={`bio_${loc}`}
                defaultValue={tr?.bio_md ?? ""}
                placeholder={fb.bio}
              />
            </div>
          );
        })}
      </fieldset>

      <div className="grid gap-3 md:grid-cols-2">
        <TextField
          label="Sortierung"
          name="sort_order"
          type="number"
          defaultValue={String(sortOrder)}
        />
        <CheckboxField
          label="Auf der Website anzeigen"
          name="is_visible"
          defaultChecked={isVisible}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={phase === "validating" || phase === "uploading"}
        >
          Speichern
        </button>
      </div>
    </form>
  );
}

function TextField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={3}
        className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none"
      />
    </label>
  );
}

function CheckboxField({
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
      <input type="hidden" name={name} value="" />
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
