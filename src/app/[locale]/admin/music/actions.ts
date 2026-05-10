"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  createSong,
  deleteSong,
  setFeaturedSong,
  updateSong,
} from "@/lib/admin/songs";
import {
  deleteStorageObject,
  uploadAssetToStorage,
} from "@/lib/storage/upload";
import { sanitizeBaseName } from "@/lib/validation/upload";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function trim(value: FormDataEntryValue | null, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asBool(value: FormDataEntryValue | null, fallback = false): boolean {
  if (typeof value !== "string") return fallback;
  return value === "on" || value === "true" || value === "1";
}

function asInt(value: FormDataEntryValue | null, fallback = 0): number {
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function isFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).size === "number" &&
    typeof (value as File).name === "string"
  );
}

function flashRedirect(
  locale: string,
  status: "created" | "updated" | "deleted" | "error",
  detail?: string,
): never {
  const qs =
    status === "error" && detail
      ? `?error=${encodeURIComponent(detail)}`
      : `?${status}=1`;
  redirect(`/${locale}/admin/music${qs}`);
}

export async function createSongAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const title = trim(formData.get("title"), 160);
  if (title.length < 1) flashRedirect(locale, "error", "Titel fehlt.");

  const slugRaw = trim(formData.get("slug"), 80);
  const slug = (slugRaw || sanitizeBaseName(title)).slice(0, 80);
  if (!slug) flashRedirect(locale, "error", "Slug konnte nicht abgeleitet werden.");

  const audioFile = formData.get("audio_file");
  if (!isFile(audioFile) || audioFile.size === 0) {
    flashRedirect(locale, "error", "MP3-Datei ist Pflicht.");
  }

  const upload = await uploadAssetToStorage({
    bucket: "audio-demos",
    kind: "audio",
    file: audioFile,
  });
  if (!upload.ok) flashRedirect(locale, "error", upload.message);

  let coverUrl: string | null = null;
  let coverPath: string | null = null;
  const coverFile = formData.get("cover_file");
  if (isFile(coverFile) && coverFile.size > 0) {
    const coverUpload = await uploadAssetToStorage({
      bucket: "public-media",
      prefix: "covers",
      kind: "image",
      file: coverFile,
    });
    if (!coverUpload.ok) {
      await deleteStorageObject(upload.bucket, upload.path);
      flashRedirect(locale, "error", coverUpload.message);
    }
    coverUrl = coverUpload.publicUrl;
    coverPath = coverUpload.path;
  }

  const isVisible = asBool(formData.get("is_visible"), true);
  const isFeatured = asBool(formData.get("is_featured"), false);
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const result = await createSong({
    title,
    slug,
    audio_url: upload.publicUrl,
    cover_image_url: coverUrl,
    is_visible: isVisible,
    is_featured: isFeatured,
    sort_order: sortOrder,
  });

  if (!result.ok) {
    await deleteStorageObject(upload.bucket, upload.path);
    if (coverPath) await deleteStorageObject("public-media", coverPath);
    flashRedirect(locale, "error", result.reason);
  }

  if (isFeatured) {
    await setFeaturedSong(result.id);
  }

  revalidatePath(`/${locale}/admin/music`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "created");
}

export async function updateSongAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) flashRedirect(locale, "error", "Ungültige Song-ID.");

  const title = trim(formData.get("title"), 160);
  const slugRaw = trim(formData.get("slug"), 80);
  const slug = slugRaw || sanitizeBaseName(title);
  const isVisible = asBool(formData.get("is_visible"), true);
  const isFeatured = asBool(formData.get("is_featured"), false);
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const patch: Parameters<typeof updateSong>[1] = {
    title,
    slug,
    is_visible: isVisible,
    is_featured: isFeatured,
    sort_order: sortOrder,
  };

  const audioFile = formData.get("audio_file");
  if (isFile(audioFile) && audioFile.size > 0) {
    const upload = await uploadAssetToStorage({
      bucket: "audio-demos",
      kind: "audio",
      file: audioFile,
    });
    if (!upload.ok) flashRedirect(locale, "error", upload.message);
    patch.audio_url = upload.publicUrl;
  }

  const coverFile = formData.get("cover_file");
  if (isFile(coverFile) && coverFile.size > 0) {
    const upload = await uploadAssetToStorage({
      bucket: "public-media",
      prefix: "covers",
      kind: "image",
      file: coverFile,
    });
    if (!upload.ok) flashRedirect(locale, "error", upload.message);
    patch.cover_image_url = upload.publicUrl;
  } else if (asBool(formData.get("clear_cover"), false)) {
    patch.cover_image_url = null;
  }

  const result = await updateSong(id, patch);
  if (!result.ok) flashRedirect(locale, "error", result.reason);

  if (isFeatured) {
    await setFeaturedSong(id);
  }

  revalidatePath(`/${locale}/admin/music`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "updated");
}

export async function deleteSongAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) flashRedirect(locale, "error", "Ungültige Song-ID.");

  const result = await deleteSong(id);
  if (!result.ok) flashRedirect(locale, "error", result.reason);

  revalidatePath(`/${locale}/admin/music`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "deleted");
}
