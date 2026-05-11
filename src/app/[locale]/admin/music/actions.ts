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
import { parseSupabasePublicUrl } from "@/lib/storage/upload";
import { sanitizeBaseName } from "@/lib/validation/upload";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function trim(value: FormDataEntryValue | null, max = 200): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asInt(value: FormDataEntryValue | null, fallback = 0): number {
  if (typeof value === "string") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function readCheckbox(formData: FormData, name: string): boolean {
  const values = formData.getAll(name);
  return values.some((v) => v === "on" || v === "true" || v === "1");
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

function readUploadedUrl(
  formData: FormData,
  base: string,
  expectedBucket: string | null,
): { ok: true; url: string } | { ok: false; message: string } | { ok: "empty" } {
  const raw = trim(formData.get(`${base}_url`), 800);
  if (!raw) return { ok: "empty" };
  const parsed = parseSupabasePublicUrl(raw);
  if (!parsed.ok) return { ok: false, message: parsed.message };
  if (expectedBucket && parsed.bucket !== expectedBucket) {
    return {
      ok: false,
      message: `URL gehört zum falschen Bucket (erwartet: ${expectedBucket}).`,
    };
  }
  return { ok: true, url: parsed.publicUrl };
}

export async function createSongAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const title = trim(formData.get("title"), 160);
  if (title.length < 1) flashRedirect(locale, "error", "Titel fehlt.");

  const slugRaw = trim(formData.get("slug"), 80);
  const slug = (slugRaw || sanitizeBaseName(title)).slice(0, 80);
  if (!slug) flashRedirect(locale, "error", "Slug konnte nicht abgeleitet werden.");

  const audio = readUploadedUrl(formData, "audio", "audio-demos");
  if (audio.ok === "empty") {
    flashRedirect(locale, "error", "Audio-Upload ist Pflicht.");
  }
  if (audio.ok === false) flashRedirect(locale, "error", audio.message);
  const audioUrl = (audio as { ok: true; url: string }).url;

  const cover = readUploadedUrl(formData, "cover", "public-media");
  if (cover.ok === false) flashRedirect(locale, "error", cover.message);
  const coverUrl =
    cover.ok === true ? (cover as { ok: true; url: string }).url : null;

  const isVisible = readCheckbox(formData, "is_visible");
  const isFeatured = readCheckbox(formData, "is_featured");
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const result = await createSong({
    title,
    slug,
    audio_url: audioUrl,
    cover_image_url: coverUrl,
    is_visible: isVisible,
    is_featured: isFeatured,
    sort_order: sortOrder,
  });

  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
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
  const isVisible = readCheckbox(formData, "is_visible");
  const isFeatured = readCheckbox(formData, "is_featured");
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const patch: Parameters<typeof updateSong>[1] = {
    title,
    slug,
    is_visible: isVisible,
    is_featured: isFeatured,
    sort_order: sortOrder,
  };

  const audio = readUploadedUrl(formData, "audio", "audio-demos");
  if (audio.ok === false) flashRedirect(locale, "error", audio.message);
  if (audio.ok === true) {
    patch.audio_url = (audio as { ok: true; url: string }).url;
  }

  const cover = readUploadedUrl(formData, "cover", "public-media");
  if (cover.ok === false) flashRedirect(locale, "error", cover.message);
  if (cover.ok === true) {
    patch.cover_image_url = (cover as { ok: true; url: string }).url;
  } else if (readCheckbox(formData, "clear_cover")) {
    patch.cover_image_url = null;
  }

  const result = await updateSong(id, patch);
  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
  }

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
