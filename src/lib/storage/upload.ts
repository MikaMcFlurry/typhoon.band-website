// Server-only Supabase Storage upload helper.
//
// Phase 05 (docs/phases/05-admin-media-audio-uploads.md): the Admin uploads
// validated images and MP3s through this module. The service-role client
// bypasses RLS, but every caller must run `requireAdminWithPasswordOk()`
// upstream so we never accept anonymous uploads.
//
// Buckets used (created in supabase/migrations/0003_storage_buckets.sql):
//   public-media   → hero/bandinfo, song covers
//   audio-demos    → song MP3s
//   member-images  → member photos
//   gallery        → gallery images
//   legal-assets   → reserved for later phases
//
// `uploadAssetToStorage()` returns the public URL for a public bucket. We
// store this URL directly in DB rows; the public site reads the URL from
// the DB record and never scans Storage.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import {
  buildStorageKey,
  validateUpload,
  type UploadKind,
} from "@/lib/validation/upload";

export type StorageBucket =
  | "public-media"
  | "audio-demos"
  | "member-images"
  | "gallery"
  | "legal-assets";

export type UploadResult =
  | {
      ok: true;
      bucket: StorageBucket;
      path: string;
      publicUrl: string;
      size: number;
      mime: string;
    }
  | { ok: false; message: string };

export type UploadAssetArgs = {
  bucket: StorageBucket;
  prefix?: string;
  kind: UploadKind;
  file: unknown; // typically the result of FormData.get(...)
};

export async function uploadAssetToStorage(
  args: UploadAssetArgs,
): Promise<UploadResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return {
      ok: false,
      message:
        "Supabase ist nicht konfiguriert. SUPABASE_SERVICE_ROLE_KEY fehlt.",
    };
  }

  const validation = validateUpload(args.file, args.kind);
  if (!validation.ok) return { ok: false, message: validation.message };

  const path = buildStorageKey({
    prefix: args.prefix,
    originalName: validation.file.name,
    extension: validation.extension,
  });

  let buffer: ArrayBuffer;
  try {
    buffer = await validation.file.arrayBuffer();
  } catch {
    return { ok: false, message: "Datei konnte nicht gelesen werden." };
  }

  const { error } = await supabase.storage
    .from(args.bucket)
    .upload(path, buffer, {
      contentType: validation.mime,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    return {
      ok: false,
      message: `Upload fehlgeschlagen: ${error.message}`,
    };
  }

  const { data: pub } = supabase.storage.from(args.bucket).getPublicUrl(path);
  if (!pub?.publicUrl) {
    return { ok: false, message: "Public URL konnte nicht gebildet werden." };
  }

  return {
    ok: true,
    bucket: args.bucket,
    path,
    publicUrl: pub.publicUrl,
    size: validation.size,
    mime: validation.mime,
  };
}

// Best-effort cleanup helper. Used when a DB write fails after a
// successful upload so we don't leak orphaned files. Errors are
// swallowed because the DB write is the source of truth.
export async function deleteStorageObject(
  bucket: StorageBucket,
  path: string,
): Promise<void> {
  const supabase = getAdminSupabase();
  if (!supabase) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {
    /* noop */
  }
}

// Direct-to-Storage upload preparation.
//
// Returns a one-shot signed upload URL for a server-controlled object
// path. The browser PUTs the file body directly into Supabase Storage,
// so neither Next.js Server Actions nor the Vercel request body limits
// see the file bytes. After the upload completes, the browser submits
// `{ bucket, path }` to a `finalizeUpload`-style server action that
// writes the DB record.
//
// We use the service-role client purely to mint the signed URL — the
// browser never receives the service-role key.
export type PrepareSignedUploadArgs = {
  bucket: StorageBucket;
  path: string; // exact storage key the browser must use
};

export type PrepareSignedUploadResult =
  | {
      ok: true;
      bucket: StorageBucket;
      path: string;
      token: string;
      signedUrl: string;
      publicUrl: string;
    }
  | { ok: false; message: string };

export async function prepareSignedUpload(
  args: PrepareSignedUploadArgs,
): Promise<PrepareSignedUploadResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return {
      ok: false,
      message:
        "Supabase ist nicht konfiguriert. SUPABASE_SERVICE_ROLE_KEY fehlt.",
    };
  }

  const signed = await supabase.storage
    .from(args.bucket)
    .createSignedUploadUrl(args.path);
  if (signed.error || !signed.data) {
    return {
      ok: false,
      message: `Upload konnte nicht vorbereitet werden: ${
        signed.error?.message ?? "unbekannt"
      }.`,
    };
  }

  const { data: pub } = supabase.storage
    .from(args.bucket)
    .getPublicUrl(args.path);
  if (!pub?.publicUrl) {
    return {
      ok: false,
      message: "Public URL konnte nicht gebildet werden.",
    };
  }

  return {
    ok: true,
    bucket: args.bucket,
    path: args.path,
    token: signed.data.token,
    signedUrl: signed.data.signedUrl,
    publicUrl: pub.publicUrl,
  };
}

// Server-side reconstructor for the public URL once the browser
// submits a previously-prepared path back to a finalize action. Used
// to validate that the path points to a real bucket+key pair.
export function publicUrlForPath(
  bucket: StorageBucket,
  path: string,
): string | null {
  const supabase = getAdminSupabase();
  if (!supabase) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

// Sanity-check that a Supabase public URL submitted by the browser
// after a direct upload (a) belongs to the configured Supabase project
// and (b) sits under a known bucket. Returns the bucket+path if it
// looks legitimate so a finalize action can reject foreign URLs.
const KNOWN_BUCKETS: readonly StorageBucket[] = [
  "public-media",
  "audio-demos",
  "member-images",
  "gallery",
  "legal-assets",
];

export type ParsedPublicUrl =
  | { ok: true; bucket: StorageBucket; path: string; publicUrl: string }
  | { ok: false; message: string };

export function parseSupabasePublicUrl(rawUrl: string): ParsedPublicUrl {
  if (typeof rawUrl !== "string" || rawUrl.length === 0) {
    return { ok: false, message: "Upload-URL fehlt." };
  }
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!projectUrl) {
    return { ok: false, message: "Supabase ist nicht konfiguriert." };
  }
  if (!rawUrl.startsWith(projectUrl)) {
    return { ok: false, message: "URL gehört nicht zu dieser Supabase-Instanz." };
  }
  const marker = "/storage/v1/object/public/";
  const idx = rawUrl.indexOf(marker);
  if (idx < 0) {
    return { ok: false, message: "URL zeigt nicht auf einen Public-Bucket." };
  }
  const after = rawUrl.slice(idx + marker.length);
  const slash = after.indexOf("/");
  if (slash <= 0 || slash === after.length - 1) {
    return { ok: false, message: "URL ist unvollständig." };
  }
  const bucket = after.slice(0, slash);
  const path = after.slice(slash + 1);
  if (!(KNOWN_BUCKETS as readonly string[]).includes(bucket)) {
    return { ok: false, message: "Unbekannter Storage-Bucket." };
  }
  return {
    ok: true,
    bucket: bucket as StorageBucket,
    path,
    publicUrl: rawUrl,
  };
}
