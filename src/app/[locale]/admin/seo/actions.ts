"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { deleteSeoEntry, saveSeoEntry } from "@/lib/admin/seo";
import { validateSeo } from "@/lib/validation/legal-seo-platforms";
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
  redirect(`/${locale}/admin/seo${qs}`);
}

function revalidatePublic(path: string) {
  // SEO entries control metadata for public routes. Revalidate every
  // locale variant of the affected path so the new metadata is served
  // on the next request.
  for (const l of LOCALES) {
    revalidatePath(`/${l}${path === "/" ? "" : path}`);
  }
}

export async function saveSeoAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const validation = validateSeo({
    path: formData.get("path"),
    locale: formData.get("entry_locale"),
    title: formData.get("title"),
    description: formData.get("description"),
    og_image_url: formData.get("og_image_url"),
  });
  if (!validation.ok) flashRedirect(locale, "error", validation.message);

  const result = await saveSeoEntry(validation.data);
  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
  }

  revalidatePath(`/${locale}/admin/seo`);
  revalidatePublic(validation.data.path);
  flashRedirect(locale, "saved");
}

export async function deleteSeoAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) flashRedirect(locale, "error", "Ungültige ID.");

  const path = String(formData.get("path") ?? "/");

  const result = await deleteSeoEntry(id);
  if (!result.ok) {
    flashRedirect(locale, "error", `Löschen fehlgeschlagen: ${result.reason}`);
  }

  revalidatePath(`/${locale}/admin/seo`);
  revalidatePublic(path);
  flashRedirect(locale, "deleted");
}
