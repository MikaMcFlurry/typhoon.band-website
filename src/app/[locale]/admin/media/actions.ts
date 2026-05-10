"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  createMediaItem,
  deleteMediaItem,
  updateMediaItem,
} from "@/lib/admin/media";
import {
  deleteStorageObject,
  uploadAssetToStorage,
} from "@/lib/storage/upload";

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

function flashRedirect(
  locale: string,
  status: "uploaded" | "updated" | "deleted" | "error",
  detail?: string,
): never {
  const qs =
    status === "error" && detail
      ? `?error=${encodeURIComponent(detail)}`
      : `?${status}=1`;
  redirect(`/${locale}/admin/media${qs}`);
}

export async function uploadGalleryImageAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const upload = await uploadAssetToStorage({
    bucket: "gallery",
    kind: "image",
    file: formData.get("file"),
  });
  if (!upload.ok) flashRedirect(locale, "error", upload.message);

  const title = trim(formData.get("title"), 160);
  const altText = trim(formData.get("alt_text"), 240);
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const result = await createMediaItem({
    type: "image",
    file_url: upload.publicUrl,
    title: title || null,
    alt_text: altText || title || null,
    category: "gallery",
    sort_order: sortOrder,
    is_visible: true,
  });

  if (!result.ok) {
    await deleteStorageObject(upload.bucket, upload.path);
    flashRedirect(locale, "error", result.reason);
    return;
  }

  revalidatePath(`/${locale}/admin/media`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "uploaded");
}

export async function updateGalleryItemAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) flashRedirect(locale, "error", "Ungültige ID.");

  const title = trim(formData.get("title"), 160);
  const altText = trim(formData.get("alt_text"), 240);
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const result = await updateMediaItem(id, {
    title: title || null,
    alt_text: altText || title || null,
    sort_order: sortOrder,
  });

  if (!result.ok) flashRedirect(locale, "error", result.reason);

  revalidatePath(`/${locale}/admin/media`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "updated");
}

export async function toggleGalleryVisibilityAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) flashRedirect(locale, "error", "Ungültige ID.");

  const next = String(formData.get("next") ?? "");
  const value = next === "1";

  const result = await updateMediaItem(id, { is_visible: value });
  if (!result.ok) flashRedirect(locale, "error", result.reason);

  revalidatePath(`/${locale}/admin/media`);
  revalidatePath(`/${locale}`);
}

export async function deleteGalleryItemAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) flashRedirect(locale, "error", "Ungültige ID.");

  const result = await deleteMediaItem(id);
  if (!result.ok) flashRedirect(locale, "error", result.reason);

  revalidatePath(`/${locale}/admin/media`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "deleted");
}
