"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  SITE_ASSET_KEY_LIST,
  upsertAssetSetting,
  type SiteAssetKey,
} from "@/lib/admin/site-settings";
import { parseSupabasePublicUrl } from "@/lib/storage/upload";

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

export async function saveSiteAssetAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const key = asAssetKey(formData.get("key"));
  if (!key) flashRedirect(locale, "error", "Unbekannter Asset-Schlüssel.");

  const url = String(formData.get("file_url") ?? "").trim();
  if (!url) {
    flashRedirect(locale, "error", "Bitte zuerst eine Datei hochladen.");
  }
  const parsed = parseSupabasePublicUrl(url);
  if (!parsed.ok) flashRedirect(locale, "error", parsed.message);
  if (parsed.bucket !== "public-media") {
    flashRedirect(locale, "error", "Falscher Storage-Bucket.");
  }

  const result = await upsertAssetSetting(key, parsed.publicUrl);
  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
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
