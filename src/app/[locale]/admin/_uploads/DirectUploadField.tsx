"use client";

import { useCallback, useRef, useState } from "react";

import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  acceptAttr,
  allowedFormatLabel,
  clientValidateFile,
  maxSizeLabel,
  type UploadKind,
} from "@/lib/validation/upload";

import { prepareDirectUpload } from "./actions";

// Direct-to-Supabase upload field.
//
// Why: passing real demo MP3s or band photos through a Next.js Server
// Action sends the entire file body through Vercel's serverless request
// body, which crashes on real files. This field instead:
//
//   1. validates locally,
//   2. asks the server for a signed upload URL,
//   3. PUTs the file directly into Supabase Storage from the browser,
//   4. exposes the resulting `<name>_path` / `<name>_url` hidden inputs
//      so the parent <form> submits only metadata to the server action.
//
// The server-side service-role key never reaches the browser; we only
// receive a one-shot signed token bound to the exact storage path the
// server picked.

type FieldStatus =
  | { phase: "idle" }
  | { phase: "validating"; filename: string; size: number }
  | { phase: "uploading"; filename: string; size: number; progress: number }
  | { phase: "done"; filename: string; size: number; publicUrl: string }
  | { phase: "error"; message: string };

export type UploadFieldPhase =
  | "idle"
  | "validating"
  | "uploading"
  | "done"
  | "error";

export type DirectUploadFieldProps = {
  /** Form-input base name. The submitted hidden input is `${name}_url`. */
  name: string;
  /** Upload target key registered server-side in `_uploads/actions.ts`. */
  target: string;
  /** Kind, used for client-side validation messages + file picker accept attr. */
  kind: UploadKind;
  locale: string;
  /** Visible label above the input. */
  label: string;
  /** Optional helper text shown beneath the input. */
  helper?: string;
  /** Whether a successful upload is required for the parent form to submit. */
  required?: boolean;
  /** Optional explicit accept attribute override. */
  accept?: string;
  /** Reports phase transitions so the parent can en/disable submit. */
  onPhaseChange?: (phase: UploadFieldPhase) => void;
};

export function DirectUploadField({
  name,
  target,
  kind,
  locale,
  label,
  helper,
  required,
  accept,
  onPhaseChange,
}: DirectUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<FieldStatus>({ phase: "idle" });

  const setPhase = useCallback(
    (next: FieldStatus) => {
      setStatus(next);
      onPhaseChange?.(next.phase);
    },
    [onPhaseChange],
  );

  const reset = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setPhase({ phase: "idle" });
  }, [setPhase]);

  const startUpload = useCallback(
    async (file: File) => {
      setPhase({
        phase: "validating",
        filename: file.name,
        size: file.size,
      });

      const local = clientValidateFile(file, kind);
      if (!local.ok) {
        setPhase({ phase: "error", message: local.message });
        return;
      }

      let prepared;
      try {
        prepared = await prepareDirectUpload({
          target,
          filename: file.name,
          size: file.size,
          mime: file.type || "",
          locale,
        });
      } catch (err) {
        setPhase({
          phase: "error",
          message:
            "Upload konnte nicht vorbereitet werden (Netzwerkfehler). " +
            (err instanceof Error ? err.message : ""),
        });
        return;
      }

      if (!prepared.ok) {
        setPhase({ phase: "error", message: prepared.message });
        return;
      }

      const supabase = getBrowserSupabase();
      if (!supabase) {
        setPhase({
          phase: "error",
          message:
            "Supabase ist nicht konfiguriert (NEXT_PUBLIC_SUPABASE_URL fehlt).",
        });
        return;
      }

      setPhase({
        phase: "uploading",
        filename: file.name,
        size: file.size,
        progress: 0,
      });

      try {
        // `uploadToSignedUrl` PUTs directly into Storage without an
        // intermediate hop through Next.js. The signed token is bound
        // to the exact path the server selected, so we can't write to
        // any other location.
        const result = await supabase.storage
          .from(prepared.bucket)
          .uploadToSignedUrl(prepared.path, prepared.token, file, {
            contentType: prepared.mime || file.type || undefined,
            upsert: false,
          });
        if (result.error) {
          setPhase({
            phase: "error",
            message: `Upload fehlgeschlagen: ${result.error.message}`,
          });
          return;
        }
      } catch (err) {
        setPhase({
          phase: "error",
          message:
            "Upload fehlgeschlagen: " +
            (err instanceof Error ? err.message : "Netzwerkfehler."),
        });
        return;
      }

      setPhase({
        phase: "done",
        filename: file.name,
        size: file.size,
        publicUrl: prepared.publicUrl,
      });
    },
    [kind, locale, target, setPhase],
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      void startUpload(file);
    },
    [startUpload],
  );

  const sizeLabel = maxSizeLabel(kind);
  const formatLabel = allowedFormatLabel(kind);

  const isReady = status.phase === "done";
  const isWorking =
    status.phase === "validating" || status.phase === "uploading";
  const publicUrl = isReady ? status.publicUrl : "";

  return (
    <div
      className="grid gap-1 text-xs text-[color:var(--muted-cream)]"
      data-upload-state={status.phase}
    >
      <span className="kicker">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? acceptAttr(kind)}
        required={required && !isReady}
        onChange={onChange}
        className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] file:mr-3 file:rounded-md file:border file:border-[color:var(--line)] file:bg-[rgba(11,8,5,0.6)] file:px-2 file:py-1 file:text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none"
        disabled={isWorking}
      />
      <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-cream)]">
        Erlaubt: {formatLabel} · max. {sizeLabel}
        {helper ? ` · ${helper}` : ""}
      </p>

      <StatusLine status={status} onClear={reset} />

      {/* Hidden submission field. Empty unless an upload completed. The
          server validates the URL belongs to the configured Supabase
          project and lives under `/storage/v1/object/public/`. */}
      <input type="hidden" name={`${name}_url`} value={publicUrl} />
    </div>
  );
}

function StatusLine({
  status,
  onClear,
}: {
  status: FieldStatus;
  onClear: () => void;
}) {
  if (status.phase === "idle") return null;

  if (status.phase === "validating") {
    return (
      <p className="text-[11px] text-[color:var(--muted-cream)]">
        {status.filename} ({formatBytes(status.size)}) — wird geprüft …
      </p>
    );
  }

  if (status.phase === "uploading") {
    return (
      <p className="text-[11px] text-[color:var(--muted-cream)]">
        {status.filename} ({formatBytes(status.size)}) — wird hochgeladen …
      </p>
    );
  }

  if (status.phase === "done") {
    return (
      <p className="flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--gold-soft)]">
        ✓ {status.filename} ({formatBytes(status.size)}) hochgeladen.
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
        >
          Andere Datei wählen
        </button>
      </p>
    );
  }

  return (
    <p className="flex flex-wrap items-center gap-2 text-[11px] text-[#fca5a5]">
      Fehler: {status.message}
      <button
        type="button"
        onClick={onClear}
        className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-cream)] underline-offset-2 hover:text-[color:var(--gold-soft)] hover:underline"
      >
        Erneut versuchen
      </button>
    </p>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

