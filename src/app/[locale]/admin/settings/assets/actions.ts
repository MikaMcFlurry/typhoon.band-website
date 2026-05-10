"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  SITE_ASSET_KEY_LIST,
  upsertAssetSetting,
  type SiteAssetKey,
} from "@/lib/admin/site-settings";
import {
  deleteStorageObject,
  uploadAssetToStorage,
} from "@/lib/storage/upload";

function isFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).size === "number" &&
    typeof (value as File).name === "string"
  );
}

function asAssetKey(value: unknown): SiteAssetKey | null {
  if (typeof value !== "string") return null;
  if ((SITE_ASSET_KEY_LIST as readonly string[]).includes(value)) {
    return value as SiteAssetKey;
  }
  return null;
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
  redirect(`/${locale}/admin/settings/assets${qs}`);
}

export async function uploadSiteAssetAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const key = asAssetKey(formData.get("key"));
  if (!key) flashRedirect(locale, "error", "Unbekannter Asset-Schlüssel.");

  const file = formData.get("file");
  if (!isFile(file) || file.size === 0) {
    flashRedirect(locale, "error", "Bitte eine Datei auswählen.");
  }

  const upload = await uploadAssetToStorage({
    bucket: "public-media",
    prefix: `site/${key}`,
    kind: "image",
    file,
  });
  if (!upload.ok) flashRedirect(locale, "error", upload.message);

  const result = await upsertAssetSetting(key, upload.publicUrl);
  if (!result.ok) {
    await deleteStorageObject(upload.bucket, upload.path);
    flashRedirect(locale, "error", result.reason);
  }

  revalidatePath(`/${locale}/admin/settings/assets`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "saved");
}

export async function clearSiteAssetAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const key = asAssetKey(formData.get("key"));
  if (!key) flashRedirect(locale, "error", "Unbekannter Asset-Schlüssel.");

  const result = await upsertAssetSetting(key, null);
  if (!result.ok) flashRedirect(locale, "error", result.reason);

  revalidatePath(`/${locale}/admin/settings/assets`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "cleared");
}
