"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { createShow, deleteShow, updateShow } from "@/lib/admin/shows";
import { validateShow } from "@/lib/validation/show";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function parsePayload(formData: FormData) {
  return {
    venue: formData.get("venue"),
    city: formData.get("city"),
    country: formData.get("country"),
    event_type: formData.get("event_type"),
    date: formData.get("date"),
    time: formData.get("time"),
    is_tba: formData.get("is_tba"),
    ticket_url: formData.get("ticket_url"),
    is_visible: formData.get("is_visible"),
    is_published: formData.get("is_published"),
    sort_order: formData.get("sort_order"),
  };
}

export async function createShowAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const validation = validateShow(parsePayload(formData));
  if (!validation.ok) throw new Error(validation.message);

  const created = await createShow(validation.data);
  if (!created.ok) throw new Error(created.reason);

  revalidatePath(`/${locale}/admin/shows`);
  revalidatePath(`/${locale}`);
  redirect(`/${locale}/admin/shows?created=1`);
}

export async function updateShowAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Show-ID.");

  const validation = validateShow(parsePayload(formData));
  if (!validation.ok) throw new Error(validation.message);

  const result = await updateShow(id, validation.data);
  if (!result.ok) throw new Error(result.reason);

  revalidatePath(`/${locale}/admin/shows`);
  revalidatePath(`/${locale}/admin/shows/${id}/edit`);
  revalidatePath(`/${locale}`);
  redirect(`/${locale}/admin/shows?updated=1`);
}

export async function deleteShowAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Show-ID.");

  const result = await deleteShow(id);
  if (!result.ok) throw new Error(result.reason);

  revalidatePath(`/${locale}/admin/shows`);
  revalidatePath(`/${locale}`);
  redirect(`/${locale}/admin/shows?deleted=1`);
}

export async function toggleShowVisibilityAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Show-ID.");

  const next = String(formData.get("next") ?? "");
  const value = next === "1";

  const result = await updateShow(id, { is_visible: value });
  if (!result.ok) throw new Error(result.reason);

  revalidatePath(`/${locale}/admin/shows`);
  revalidatePath(`/${locale}`);
}
