// Server-only Admin reader/writer for booking_requests.
//
// `booking_requests` exposes no public RLS read or write policy on
// purpose — it contains personal data. The service-role client is used
// here because every caller has already been gated by `requireAdmin()`.
// Do NOT import this module without an admin guard upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { BookingRequest, BookingStatus } from "@/lib/supabase/types";

export type RecentBookingRequest = Pick<
  BookingRequest,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "event_date"
  | "event_location"
  | "event_type"
  | "status"
  | "locale"
  | "message"
  | "converted_show_id"
  | "converted_at"
  | "deleted_at"
  | "created_at"
  | "updated_at"
>;

export type RecentBookings = {
  available: boolean;
  rows: RecentBookingRequest[];
  reason?: string;
};

const ROW_COLUMNS =
  "id, name, email, phone, event_date, event_location, event_type, status, locale, message, converted_show_id, converted_at, deleted_at, created_at, updated_at";

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  "new",
  "read",
  "answered",
  "accepted",
  "converted",
  "rejected",
  "archived",
  "spam",
] as const;

export function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    typeof value === "string" &&
    (BOOKING_STATUSES as readonly string[]).includes(value)
  );
}

type ListOptions = {
  includeDeleted?: boolean;
};

export async function getRecentBookingRequests(
  limit = 25,
  options: ListOptions = {},
): Promise<RecentBookings> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, rows: [], reason: "supabase-not-configured" };
  }

  let query = supabase
    .from("booking_requests")
    .select(ROW_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!options.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    return { available: false, rows: [], reason: error.message };
  }

  return { available: true, rows: data ?? [] };
}

export type BookingDetailResult =
  | { available: true; row: RecentBookingRequest }
  | { available: false; reason: string };

export async function getBookingRequest(
  id: string,
): Promise<BookingDetailResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("booking_requests")
    .select(ROW_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) return { available: false, reason: error.message };
  if (!data) return { available: false, reason: "not-found" };
  return { available: true, row: data };
}

export type MutationResult = { ok: true } | { ok: false; reason: string };

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase
    .from("booking_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function softDeleteBooking(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("booking_requests")
    .update({
      deleted_at: now,
      status: "archived",
      updated_at: now,
    })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function restoreBooking(id: string): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase
    .from("booking_requests")
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export type LinkConvertedArgs = {
  bookingId: string;
  showId: string;
};

export async function markBookingConverted(
  args: LinkConvertedArgs,
): Promise<MutationResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("booking_requests")
    .update({
      status: "converted",
      converted_show_id: args.showId,
      converted_at: now,
      updated_at: now,
    })
    .eq("id", args.bookingId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
