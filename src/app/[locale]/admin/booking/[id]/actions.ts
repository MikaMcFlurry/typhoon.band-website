"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveLocale, requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  isBookingStatus,
  markBookingConverted,
  softDeleteBooking,
  restoreBooking,
  updateBookingStatus,
} from "@/lib/admin/bookings";
import { createShow } from "@/lib/admin/shows";
import { validateShow } from "@/lib/validation/show";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

function bookingPaths(locale: string, id: string): { detail: string; list: string } {
  return {
    detail: `/${locale}/admin/booking/${id}`,
    list: `/${locale}/admin/booking`,
  };
}

export async function changeBookingStatusAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Booking-ID.");
  if (!isBookingStatus(status)) throw new Error("Ungültiger Status.");

  const result = await updateBookingStatus(id, status);
  if (!result.ok) throw new Error(result.reason);

  const paths = bookingPaths(locale, id);
  revalidatePath(paths.detail);
  revalidatePath(paths.list);
}

export async function archiveBookingAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Booking-ID.");

  const result = await softDeleteBooking(id);
  if (!result.ok) throw new Error(result.reason);

  const paths = bookingPaths(locale, id);
  revalidatePath(paths.detail);
  revalidatePath(paths.list);
  redirect(paths.list);
}

export async function restoreBookingAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Booking-ID.");

  const result = await restoreBooking(id);
  if (!result.ok) throw new Error(result.reason);

  const paths = bookingPaths(locale, id);
  revalidatePath(paths.detail);
  revalidatePath(paths.list);
}

export async function convertBookingToShowAction(formData: FormData) {
  const locale = resolveLocale(String(formData.get("locale") ?? ""));
  await requireAdminWithPasswordOk(locale);

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) throw new Error("Ungültige Booking-ID.");

  const validation = validateShow({
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
  });
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const created = await createShow({
    ...validation.data,
    source_booking_request_id: id,
  });
  if (!created.ok) throw new Error(created.reason);

  const linked = await markBookingConverted({
    bookingId: id,
    showId: created.id,
  });
  if (!linked.ok) throw new Error(linked.reason);

  const paths = bookingPaths(locale, id);
  revalidatePath(paths.detail);
  revalidatePath(paths.list);
  revalidatePath(`/${locale}/admin/shows`);
  revalidatePath(`/${locale}`);
  redirect(`${paths.detail}?converted=1`);
}
