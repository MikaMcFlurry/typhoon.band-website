"use server";

import { getCurrentAdmin } from "@/lib/admin/auth";
import {
  prepareSignedUpload,
  type StorageBucket,
} from "@/lib/storage/upload";
import {
  buildStorageKey,
  validateUploadMeta,
  type UploadKind,
} from "@/lib/validation/upload";

// Allow-list of {bucket, prefix, kind} combinations the Admin UI is
// permitted to upload to. Every call goes through this map so a
// compromised client can't redirect uploads to an arbitrary bucket
// (e.g. `legal-assets`).
type Target = {
  bucket: StorageBucket;
  prefix?: string;
  kind: UploadKind;
};

const TARGETS: Record<string, Target> = {
  gallery: { bucket: "gallery", kind: "image" },
  "song-audio": { bucket: "audio-demos", kind: "audio" },
  "song-cover": { bucket: "public-media", prefix: "covers", kind: "image" },
  "member-photo": { bucket: "member-images", kind: "image" },
  "site-hero-image": {
    bucket: "public-media",
    prefix: "site/hero_image",
    kind: "image",
  },
  "site-hero-signature": {
    bucket: "public-media",
    prefix: "site/hero_signature",
    kind: "image",
  },
  "site-bandinfo-image": {
    bucket: "public-media",
    prefix: "site/bandinfo_image",
    kind: "image",
  },
};

export type PreparedUpload = {
  ok: true;
  bucket: StorageBucket;
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string;
  kind: UploadKind;
  mime: string;
  size: number;
};

export type PrepareUploadResult =
  | PreparedUpload
  | { ok: false; message: string };

export type PrepareUploadInput = {
  target: keyof typeof TARGETS | string;
  filename: string;
  size: number;
  mime: string;
  locale?: string;
};

export async function prepareDirectUpload(
  input: PrepareUploadInput,
): Promise<PrepareUploadResult> {
  // Admin gate. We use `getCurrentAdmin()` (not `requireAdminWithPasswordOk`)
  // so unauthenticated calls return a JSON-friendly error instead of
  // throwing a redirect through the server-action JSON channel. Pages
  // that render the upload UI already redirect anonymous visitors at
  // the page level, so this is purely defensive.
  const admin = await getCurrentAdmin();
  if (!admin || admin.mustChangePassword) {
    return { ok: false, message: "Nicht autorisiert." };
  }

  const target = TARGETS[input.target as keyof typeof TARGETS];
  if (!target) {
    return { ok: false, message: "Unbekanntes Upload-Ziel." };
  }

  const meta = validateUploadMeta(
    { filename: input.filename, size: input.size, mime: input.mime },
    target.kind,
  );
  if (!meta.ok) return meta;

  const path = buildStorageKey({
    prefix: target.prefix,
    originalName: meta.filename,
    extension: meta.extension,
  });

  const prepared = await prepareSignedUpload({
    bucket: target.bucket,
    path,
  });
  if (!prepared.ok) return prepared;

  return {
    ok: true,
    bucket: prepared.bucket,
    path: prepared.path,
    token: prepared.token,
    signedUrl: prepared.signedUrl,
    publicUrl: prepared.publicUrl,
    kind: target.kind,
    mime: meta.mime,
    size: meta.size,
  };
}
