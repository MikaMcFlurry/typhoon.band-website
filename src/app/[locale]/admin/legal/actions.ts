"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { saveLegalPage } from "@/lib/admin/legal";
import { validateLegal } from "@/lib/validation/legal-seo-platforms";
import { LOCALES } from "@/i18n/locales";

function flashRedirect(
  locale: string,
  status: "saved" | "error",
  detail?: string,
): never {
  const qs =
    status === "error" && detail
      ? `?error=${encodeURIComponent(detail)}`
      : `?${status}=1`;
  redirect(`/${locale}/admin/legal${qs}`);
}

export async function saveLegalAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const validation = validateLegal({
    slug: formData.get("slug"),
    locale: formData.get("entry_locale"),
    title: formData.get("title"),
    body_md: formData.get("body_md"),
    is_published: formData.get("is_published"),
  });
  if (!validation.ok) flashRedirect(locale, "error", validation.message);

  const result = await saveLegalPage(validation.data);
  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
  }

  revalidatePath(`/${locale}/admin/legal`);
  for (const l of LOCALES) {
    revalidatePath(`/${l}/legal/${validation.data.slug}`);
  }
  flashRedirect(locale, "saved");
}
