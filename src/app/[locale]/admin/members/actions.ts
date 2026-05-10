"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { upsertMemberBySlug } from "@/lib/admin/members";
import {
  deleteStorageObject,
  uploadAssetToStorage,
} from "@/lib/storage/upload";
import { sanitizeBaseName } from "@/lib/validation/upload";

const SLUG_RE = /^[a-z0-9-]{1,40}$/;

function isFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).size === "number" &&
    typeof (value as File).name === "string"
  );
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

function flashRedirect(
  locale: string,
  status: "saved" | "cleared" | "error",
  detail?: string,
): never {
  const qs =
    status === "error" && detail
      ? `?error=${encodeURIComponent(detail)}`
      : `?${status}=1`;
  redirect(`/${locale}/admin/members${qs}`);
}

export async function uploadMemberPhotoAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const slugRaw = String(formData.get("slug") ?? "");
  const slug = slugRaw.toLowerCase().trim();
  if (!SLUG_RE.test(slug)) flashRedirect(locale, "error", "Ungültiger Slug.");

  const isVisible = asBool(formData.get("is_visible"), true);
  const sortOrder = asInt(formData.get("sort_order"), 0);

  const file = formData.get("photo_file");
  let photoUrl: string | null | undefined = undefined;
  let uploadedPath: string | null = null;

  if (isFile(file) && file.size > 0) {
    const renamedFile =
      typeof File !== "undefined"
        ? new File([file], `${sanitizeBaseName(slug)}-${file.name}`, {
            type: file.type,
          })
        : file;
    const upload = await uploadAssetToStorage({
      bucket: "member-images",
      kind: "image",
      file: renamedFile,
    });
    if (!upload.ok) flashRedirect(locale, "error", upload.message);
    photoUrl = upload.publicUrl;
    uploadedPath = upload.path;
  }

  const result = await upsertMemberBySlug({
    slug,
    photo_url: photoUrl,
    is_visible: isVisible,
    sort_order: sortOrder,
  });

  if (!result.ok) {
    if (uploadedPath) {
      await deleteStorageObject("member-images", uploadedPath);
    }
    flashRedirect(locale, "error", result.reason);
  }

  revalidatePath(`/${locale}/admin/members`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "saved");
}

export async function clearMemberPhotoAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const slug = String(formData.get("slug") ?? "")
    .toLowerCase()
    .trim();
  if (!SLUG_RE.test(slug)) flashRedirect(locale, "error", "Ungültiger Slug.");

  const result = await upsertMemberBySlug({ slug, photo_url: null });
  if (!result.ok) flashRedirect(locale, "error", result.reason);

  revalidatePath(`/${locale}/admin/members`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "cleared");
}
