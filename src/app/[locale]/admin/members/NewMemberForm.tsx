"use client";

import { useState } from "react";

import {
  DirectUploadField,
  type UploadFieldPhase,
} from "../_uploads/DirectUploadField";

import { createMemberAction } from "./actions";

// Adds a musician to the line-up. DE name + instrument are required; EN/TR
// fall back to the German text. The slug (URL-safe id) is derived from the
// name unless one is given.
export function NewMemberForm({ locale, nextSort }: { locale: string; nextSort: number }) {
  const [phase, setPhase] = useState<UploadFieldPhase>("idle");
  const busy = phase === "validating" || phase === "uploading";
  const input =
    "rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none";

  return (
    <form action={createMemberAction} className="mt-4 grid gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-xs">
          <span className="kicker">Name (DE) *</span>
          <input className={input} name="name_de" placeholder="z. B. Malvin" required minLength={2} />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="kicker">Instrument / Rolle (DE) *</span>
          <input className={input} name="role_de" placeholder="z. B. Keys & Klavier" required minLength={2} />
        </label>
      </div>
      <label className="grid gap-1 text-xs">
        <span className="kicker">Kurze Bio (DE, optional)</span>
        <textarea className={input} name="bio_de" rows={2} />
      </label>

      <details className="rounded-md border border-[color:var(--line)] p-3">
        <summary className="kicker cursor-pointer">Englisch / Türkisch (optional)</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(["en", "tr"] as const).map((l) => (
            <div className="grid gap-2" key={l}>
              <label className="grid gap-1 text-xs">
                <span className="kicker">Name ({l})</span>
                <input className={input} name={`name_${l}`} />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="kicker">Instrument ({l})</span>
                <input className={input} name={`role_${l}`} />
              </label>
              <label className="grid gap-1 text-xs">
                <span className="kicker">Bio ({l})</span>
                <textarea className={input} name={`bio_${l}`} rows={2} />
              </label>
            </div>
          ))}
        </div>
      </details>

      <div className="grid gap-3 md:grid-cols-[1fr_140px_1fr] md:items-end">
        <DirectUploadField
          name="photo_file"
          target="member-photo"
          kind="image"
          locale={locale}
          label="Foto (optional, JPG/PNG/WebP)"
          onPhaseChange={setPhase}
        />
        <label className="grid gap-1 text-xs">
          <span className="kicker">Sortierung</span>
          <input className={input} name="sort_order" type="number" defaultValue={nextSort} />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="kicker">Slug (optional)</span>
          <input className={input} name="slug" placeholder="wird aus dem Namen gebildet" pattern="[a-z0-9-]{1,40}" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-[color:var(--cream)]">
          <input type="hidden" name="is_visible" value="" />
          <input className="h-4 w-4 accent-[color:var(--gold-soft)]" defaultChecked name="is_visible" type="checkbox" />
          Auf der Website anzeigen
        </label>
        <button className="btn btn-primary" disabled={busy} type="submit">
          Mitglied anlegen
        </button>
      </div>
    </form>
  );
}
