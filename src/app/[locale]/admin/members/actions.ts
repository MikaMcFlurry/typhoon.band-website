"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { members as fallbackMembers } from "@/data/members";
import { deleteMemberBySlug, listMemberSlugs, saveMember } from "@/lib/admin/members";
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
  status: "saved" | "cleared" | "created" | "deleted" | "error",
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
  // The line-up shows on every locale's home page.
  for (const l of SUPPORTED_LOCALES) revalidatePath(`/${l}`);
  flashRedirect(locale, "saved");
}

// "Ümit Çelik" → "umit-celik"; Turkish and German letters folded to ASCII.
function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const FALLBACK_SLUGS = new Set(fallbackMembers.map((m) => m.id));

// New musician: DE name + role are required, EN/TR optional. The slug is
// derived from the name (or given explicitly) and must be unique; the
// site appends every new slug to the line-up automatically.
export async function createMemberAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const nameDe = trim(formData.get("name_de"), 160);
  const roleDe = trim(formData.get("role_de"), 160);
  if (nameDe.length < 2) flashRedirect(locale, "error", "Bitte einen Namen (DE) angeben.");
  if (roleDe.length < 2) flashRedirect(locale, "error", "Bitte Instrument / Rolle (DE) angeben.");

  const wanted = slugify(trim(formData.get("slug"), 60) || nameDe);
  if (!SLUG_RE.test(wanted)) flashRedirect(locale, "error", "Aus dem Namen ließ sich kein gültiger Slug bilden.");

  const taken = await listMemberSlugs();
  if (taken === null) flashRedirect(locale, "error", "Supabase ist nicht erreichbar.");
  if (FALLBACK_SLUGS.has(wanted) || taken.includes(wanted)) {
    flashRedirect(locale, "error", `Der Slug „${wanted}“ ist schon vergeben. Bitte einen anderen Slug eintragen.`);
  }

  const rawUrl = String(formData.get("photo_file_url") ?? "").trim();
  let photoUrl: string | null = null;
  if (rawUrl) {
    const parsed = parseSupabasePublicUrl(rawUrl);
    if (!parsed.ok) flashRedirect(locale, "error", parsed.message);
    if (parsed.bucket !== "member-images") {
      flashRedirect(locale, "error", "Falscher Storage-Bucket für Member-Fotos.");
    }
    photoUrl = parsed.publicUrl;
  }

  const sortOrder = asInt(formData.get("sort_order"), 100);
  const translations = SUPPORTED_LOCALES.map((loc) => ({
    locale: loc,
    name: loc === "de" ? nameDe : trim(formData.get(`name_${loc}`), 160) || nameDe,
    role: loc === "de" ? roleDe : trim(formData.get(`role_${loc}`), 160) || roleDe,
    bioMd: trim(formData.get(`bio_${loc}`), 800),
  }));

  const result = await saveMember({
    slug: wanted,
    photoUrl,
    sortOrder,
    isVisible: readCheckbox(formData, "is_visible"),
    translations,
  });
  if (!result.ok) flashRedirect(locale, "error", `Anlegen fehlgeschlagen: ${result.reason}`);

  revalidatePath(`/${locale}/admin/members`);
  for (const l of SUPPORTED_LOCALES) revalidatePath(`/${l}`);
  flashRedirect(locale, "created");
}

// Deletes a musician that was added in Admin. Repo members (the fallback
// list) can only be hidden. Requires the explicit confirm checkbox.
export async function deleteMemberAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const slug = String(formData.get("slug") ?? "").toLowerCase().trim();
  if (!SLUG_RE.test(slug)) flashRedirect(locale, "error", "Ungültiger Slug.");
  if (FALLBACK_SLUGS.has(slug)) {
    flashRedirect(locale, "error", "Stammmitglieder werden ausgeblendet, nicht gelöscht (Häkchen „Auf der Website anzeigen“ entfernen).");
  }
  if (!readCheckbox(formData, "confirm")) {
    flashRedirect(locale, "error", "Bitte das Löschen bestätigen (Häkchen setzen).");
  }

  const result = await deleteMemberBySlug(slug);
  if (!result.ok) flashRedirect(locale, "error", `Löschen fehlgeschlagen: ${result.reason}`);

  revalidatePath(`/${locale}/admin/members`);
  for (const l of SUPPORTED_LOCALES) revalidatePath(`/${l}`);
  flashRedirect(locale, "deleted");
}
