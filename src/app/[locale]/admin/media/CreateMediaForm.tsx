"use client";

import { useState } from "react";

import {
  DirectUploadField,
  type UploadFieldPhase,
} from "../_uploads/DirectUploadField";

import { uploadGalleryImageAction } from "./actions";

// Client wrapper around the direct-upload field. The submit button is
// disabled until the file actually lives in Supabase Storage so the
// server action only ever receives a real public URL.
export function CreateMediaForm({ locale }: { locale: string }) {
  const [phase, setPhase] = useState<UploadFieldPhase>("idle");

  return (
    <form action={uploadGalleryImageAction} className="mt-3 grid gap-3">
      <input type="hidden" name="locale" value={locale} />
      <DirectUploadField
        name="file"
        target="gallery"
        kind="image"
        locale={locale}
        label="Datei"
        required
        onPhaseChange={setPhase}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Titel (optional)" name="title" />
        <TextField
          label="Sortierung"
          name="sort_order"
          type="number"
          defaultValue="0"
        />
      </div>
      <TextField label="Alt-Text (optional)" name="alt_text" />
      <div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={phase !== "done"}
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
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none"
      />
    </label>
  );
}
