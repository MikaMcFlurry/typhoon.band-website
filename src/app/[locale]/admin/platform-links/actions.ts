"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  deletePlatformLink,
  savePlatformLink,
} from "@/lib/admin/platform-links";
import { validatePlatformLink } from "@/lib/validation/legal-seo-platforms";
import { LOCALES } from "@/i18n/locales";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function flashRedirect(
  locale: string,
  status: "saved" | "deleted" | "error",
  detail?: string,
): never {
  const qs =
    status === "error" && detail
      ? `?error=${encodeURIComponent(detail)}`
      : `?${status}=1`;
  redirect(`/${locale}/admin/platform-links${qs}`);
}

function revalidatePublic() {
  for (const l of LOCALES) revalidatePath(`/${l}`);
}

export async function savePlatformLinkAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "").trim();

  const validation = validatePlatformLink({
    platform: formData.get("platform"),
    url: formData.get("url"),
    is_active: formData.get("is_active"),
    sort_order: formData.get("sort_order"),
  });
  if (!validation.ok) flashRedirect(locale, "error", validation.message);

  const result = await savePlatformLink({
    id: id.length > 0 ? id : null,
    platform: validation.data.platform,
    url: validation.data.url,
    isActive: validation.data.isActive,
    sortOrder: validation.data.sortOrder,
  });
  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
  }

  revalidatePath(`/${locale}/admin/platform-links`);
  revalidatePublic();
  flashRedirect(locale, "saved");
}

export async function deletePlatformLinkAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) flashRedirect(locale, "error", "Ungültige ID.");

  const result = await deletePlatformLink(id);
  if (!result.ok) {
    flashRedirect(locale, "error", `Löschen fehlgeschlagen: ${result.reason}`);
  }

  revalidatePath(`/${locale}/admin/platform-links`);
  revalidatePublic();
  flashRedirect(locale, "deleted");
}
