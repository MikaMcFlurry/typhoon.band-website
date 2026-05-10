"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { saveMember } from "@/lib/admin/members";
import { parseSupabasePublicUrl } from "@/lib/storage/upload";

const SLUG_RE = /^[a-z0-9-]{1,40}$/;

function trim(value: FormDataEntryValue | null, max = 600): string {
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
  status: "saved" | "cleared" | "error",
  detail?: string,
): never {
  const qs =
    status === "error" && detail
      ? `?error=${encodeURIComponent(detail)}`
      : `?${status}=1`;
  redirect(`/${locale}/admin/members${qs}`);
}

const SUPPORTED_LOCALES = ["de", "en", "tr"] as const;

export async function saveMemberAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const slug = String(formData.get("slug") ?? "")
    .toLowerCase()
    .trim();
  if (!SLUG_RE.test(slug)) flashRedirect(locale, "error", "Ungültiger Slug.");

  const isVisible = readCheckbox(formData, "is_visible");
  const sortOrder = asInt(formData.get("sort_order"), 0);

  // Photo handling: a fresh upload sets `photo_url` (the hidden input from
  // DirectUploadField). An explicit "clear" checkbox wipes the value. If
  // neither is set we keep the current photo on the row.
  const rawUrl = String(formData.get("photo_file_url") ?? "").trim();
  const clearPhoto = readCheckbox(formData, "clear_photo");

  let photoUrl: string | null | undefined = undefined;
  if (rawUrl) {
    const parsed = parseSupabasePublicUrl(rawUrl);
    if (!parsed.ok) flashRedirect(locale, "error", parsed.message);
    if (parsed.bucket !== "member-images") {
      flashRedirect(locale, "error", "Falscher Storage-Bucket für Member-Fotos.");
    }
    photoUrl = parsed.publicUrl;
  }

  const translations = SUPPORTED_LOCALES.map((loc) => ({
    locale: loc,
    name: trim(formData.get(`name_${loc}`), 160),
    role: trim(formData.get(`role_${loc}`), 160),
    bioMd: trim(formData.get(`bio_${loc}`), 800),
  }));

  const result = await saveMember({
    slug,
    photoUrl,
    clearPhoto,
    sortOrder,
    isVisible,
    translations,
  });
  if (!result.ok) {
    flashRedirect(locale, "error", `Speichern fehlgeschlagen: ${result.reason}`);
  }

  revalidatePath(`/${locale}/admin/members`);
  revalidatePath(`/${locale}`);
  flashRedirect(locale, "saved");
}
