"use client";

import { useState } from "react";

import type { AdminSongRow } from "@/lib/admin/songs";

import {
  DirectUploadField,
  type UploadFieldPhase,
} from "../_uploads/DirectUploadField";

import { createSongAction, updateSongAction } from "./actions";

// Both forms (create + edit) live in the same client module so they
// share the upload-phase plumbing. The "Save" button is disabled only
// when an audio upload is required (create) and hasn't finished yet.

export function CreateSongForm({ locale }: { locale: string }) {
  const [audioPhase, setAudioPhase] = useState<UploadFieldPhase>("idle");
  const [coverPhase, setCoverPhase] = useState<UploadFieldPhase>("idle");
  const submitDisabled =
    audioPhase !== "done" ||
    coverPhase === "validating" ||
    coverPhase === "uploading";

  return (
    <form action={createSongAction} className="mt-3 grid gap-3">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Titel" name="title" required />
        <TextField label="Slug (optional)" name="slug" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DirectUploadField
          name="audio"
          target="song-audio"
          kind="audio"
          locale={locale}
          label="MP3-Datei"
          required
          onPhaseChange={setAudioPhase}
        />
        <DirectUploadField
          name="cover"
          target="song-cover"
          kind="image"
          locale={locale}
          label="Cover (optional)"
          onPhaseChange={setCoverPhase}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <TextField
          label="Sortierung"
          name="sort_order"
          type="number"
          defaultValue="0"
        />
        <Checkbox label="Sichtbar" name="is_visible" defaultChecked />
        <Checkbox label="Als Featured-Song" name="is_featured" />
      </div>
      <div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitDisabled}
        >
          Song anlegen
        </button>
      </div>
    </form>
  );
}

export function EditSongForm({
  locale,
  row,
}: {
  locale: string;
  row: AdminSongRow;
}) {
  const [audioPhase, setAudioPhase] = useState<UploadFieldPhase>("idle");
  const [coverPhase, setCoverPhase] = useState<UploadFieldPhase>("idle");
  const submitDisabled =
    audioPhase === "validating" ||
    audioPhase === "uploading" ||
    coverPhase === "validating" ||
    coverPhase === "uploading";

  return (
    <form action={updateSongAction} className="grid gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={row.id} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr]">
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] md:w-[120px]">
          {row.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={row.title}
              className="h-full w-full object-cover"
              src={row.cover_image_url}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
              kein Cover
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Titel"
              name="title"
              required
              defaultValue={row.title}
            />
            <TextField label="Slug" name="slug" defaultValue={row.slug} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <DirectUploadField
              name="audio"
              target="song-audio"
              kind="audio"
              locale={locale}
              label="MP3 ersetzen (optional)"
              onPhaseChange={setAudioPhase}
            />
            <DirectUploadField
              name="cover"
              target="song-cover"
              kind="image"
              locale={locale}
              label="Cover ersetzen (optional)"
              onPhaseChange={setCoverPhase}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <TextField
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
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={submitDisabled}
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
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
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
  // Hidden input + checkbox = standard server-action pattern. With the
  // hidden value "" always submitted, the server sees ["", "on"] when
  // checked vs [""] when unchecked, so the action can reliably persist
  // `false` for unchecked.
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
