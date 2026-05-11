// Server-side upload validators for the Admin media/audio flow.
//
// Phase 05 (docs/phases/05-admin-media-audio-uploads.md):
//   - images: jpeg/png/webp, max 10 MB, extensions .jpg .jpeg .png .webp
//   - audio:  mp3 only,       max 50 MB, extension .mp3
//   - reject SVG, GIF, HEIC/HEIF, WAV/AIFF/FLAC/M4A, anything else
//
// `validateUpload()` always returns a discriminated union so callers can
// surface errors back to the Admin form without throwing.

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const AUDIO_MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"] as const;

const AUDIO_MIME = ["audio/mpeg", "audio/mp3"] as const;
const AUDIO_EXT = [".mp3"] as const;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
};

export type UploadKind = "image" | "audio";

export type UploadValidation =
  | {
      ok: true;
      kind: UploadKind;
      mime: string;
      extension: string; // lower-case, leading dot
      size: number;
      file: File;
    }
  | { ok: false; message: string };

function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx).toLowerCase();
}

function isFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).size === "number" &&
    typeof (value as File).type === "string" &&
    typeof (value as File).name === "string" &&
    typeof (value as File).arrayBuffer === "function"
  );
}

export function validateUpload(
  raw: unknown,
  kind: UploadKind,
): UploadValidation {
  if (!isFile(raw)) {
    return { ok: false, message: "Keine Datei empfangen." };
  }
  const file = raw;
  if (file.size === 0) {
    return { ok: false, message: "Datei ist leer." };
  }
  const max = kind === "image" ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
  if (file.size > max) {
    const mb = (max / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      message: `Datei zu groß (max. ${mb} MB).`,
    };
  }

  const mime = (file.type || "").toLowerCase();
  const ext = getExtension(file.name);

  if (kind === "image") {
    const mimeOk = (IMAGE_MIME as readonly string[]).includes(mime);
    const extOk = (IMAGE_EXT as readonly string[]).includes(ext);
    if (!mimeOk || !extOk) {
      return {
        ok: false,
        message:
          "Ungültiges Bildformat. Erlaubt: JPG, PNG, WebP. SVG, GIF und HEIC werden nicht akzeptiert.",
      };
    }
    return {
      ok: true,
      kind,
      mime,
      extension: MIME_TO_EXT[mime] ?? ext,
      size: file.size,
      file,
    };
  }

  // audio
  const mimeOk = (AUDIO_MIME as readonly string[]).includes(mime);
  const extOk = (AUDIO_EXT as readonly string[]).includes(ext);
  if (!mimeOk || !extOk) {
    return {
      ok: false,
      message:
        "Ungültiges Audioformat. Nur MP3 ist erlaubt (kein WAV, FLAC, AIFF, M4A).",
    };
  }
  return {
    ok: true,
    kind,
    mime,
    extension: MIME_TO_EXT[mime] ?? ".mp3",
    size: file.size,
    file,
  };
}

// File name → safe slug for storage paths. Removes accents/special chars,
// lower-cases, replaces non-alphanumerics with hyphens, trims length.
export function sanitizeBaseName(rawName: string): string {
  const noExt = rawName.replace(/\.[^.]+$/, "");
  const ascii = noExt
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/gi, "s")
    .replace(/ğ/gi, "g")
    .replace(/ç/gi, "c")
    .replace(/ö/gi, "o")
    .replace(/ü/gi, "u")
    .replace(/ä/gi, "a")
    .replace(/ß/gi, "ss");
  const slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "asset";
}

// Builds a storage object key:  "<prefix><yyyy-mm-dd>-<slug>-<uuid><ext>"
// `prefix` may be empty, "covers/", "demos/" etc. Keys must be unique
// and stable so we can store them in DB columns.
export function buildStorageKey(args: {
  prefix?: string;
  originalName: string;
  extension: string;
}): string {
  const slug = sanitizeBaseName(args.originalName);
  const date = new Date().toISOString().slice(0, 10);
  const uuid = uuidV4();
  const prefix = args.prefix && !args.prefix.endsWith("/") ? `${args.prefix}/` : (args.prefix ?? "");
  return `${prefix}${date}-${slug}-${uuid}${args.extension}`;
}

// Tiny RFC4122-v4 generator. Avoids a runtime dep; `crypto.randomUUID`
// is available in Node 18+ but we fall back for older runtimes anyway.
function uuidV4(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Metadata-only validator used by the direct-to-Storage upload prepare
// step. The browser describes the file (name/size/mime), the server
// confirms the descriptor matches the policy before issuing a signed
// upload URL. No buffering of the file body happens here.
export type UploadMeta = {
  filename: string;
  size: number;
  mime: string;
};

export type UploadMetaValidation =
  | {
      ok: true;
      kind: UploadKind;
      mime: string;
      extension: string;
      size: number;
      filename: string;
    }
  | { ok: false; message: string };

export function validateUploadMeta(
  meta: UploadMeta,
  kind: UploadKind,
): UploadMetaValidation {
  if (typeof meta.filename !== "string" || meta.filename.length === 0) {
    return { ok: false, message: "Dateiname fehlt." };
  }
  if (typeof meta.size !== "number" || !Number.isFinite(meta.size)) {
    return { ok: false, message: "Dateigröße fehlt." };
  }
  if (meta.size <= 0) {
    return { ok: false, message: "Datei ist leer." };
  }
  const max = kind === "image" ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
  if (meta.size > max) {
    const mb = (max / (1024 * 1024)).toFixed(0);
    return { ok: false, message: `Datei zu groß (max. ${mb} MB).` };
  }

  const mime = (meta.mime || "").toLowerCase();
  const ext = getExtension(meta.filename);

  if (kind === "image") {
    const mimeOk = (IMAGE_MIME as readonly string[]).includes(mime);
    const extOk = (IMAGE_EXT as readonly string[]).includes(ext);
    if (!mimeOk || !extOk) {
      return {
        ok: false,
        message:
          "Format nicht erlaubt. Erlaubt: JPG, PNG, WebP. SVG, GIF und HEIC werden nicht akzeptiert.",
      };
    }
    return {
      ok: true,
      kind,
      mime,
      extension: MIME_TO_EXT[mime] ?? ext,
      size: meta.size,
      filename: meta.filename,
    };
  }

  const mimeOk = (AUDIO_MIME as readonly string[]).includes(mime);
  const extOk = (AUDIO_EXT as readonly string[]).includes(ext);
  if (!mimeOk || !extOk) {
    return {
      ok: false,
      message:
        "Format nicht erlaubt. Nur MP3 ist erlaubt (kein WAV, FLAC, AIFF, M4A).",
    };
  }
  return {
    ok: true,
    kind,
    mime,
    extension: MIME_TO_EXT[mime] ?? ".mp3",
    size: meta.size,
    filename: meta.filename,
  };
}

// Browser-side counterpart: cheap structural check before we ever
// reach the network. Same rules, but operates on the File object that
// the user just picked. Errors render inline next to the file input.
export function clientValidateFile(
  file: File,
  kind: UploadKind,
): { ok: true } | { ok: false; message: string } {
  return validateUploadMeta(
    { filename: file.name, size: file.size, mime: file.type ?? "" },
    kind,
  ).ok
    ? { ok: true }
    : (validateUploadMeta(
        { filename: file.name, size: file.size, mime: file.type ?? "" },
        kind,
      ) as { ok: false; message: string });
}

// Convenience max-size labels for the Admin form hints.
export function maxSizeLabel(kind: UploadKind): string {
  const bytes = kind === "image" ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function allowedFormatLabel(kind: UploadKind): string {
  return kind === "image" ? "JPG / PNG / WebP" : "MP3";
}

export function acceptAttr(kind: UploadKind): string {
  return kind === "image"
    ? "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
    : "audio/mpeg,audio/mp3,.mp3";
}
