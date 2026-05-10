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
