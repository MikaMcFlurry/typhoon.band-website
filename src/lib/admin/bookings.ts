// Read-only booking request loader for the Admin dashboard.
//
// `booking_requests` exposes no public RLS read policy on purpose — it
// contains personal data. The service-role client is used here because the
// caller has already been gated by `requireAdmin()`. Do NOT call this
// without an admin guard upstream.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { BookingRequest } from "@/lib/supabase/types";

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
  | "created_at"
  | "updated_at"
>;

export type RecentBookings = {
  available: boolean;
  rows: RecentBookingRequest[];
  reason?: string;
};

export async function getRecentBookingRequests(
  limit = 25,
): Promise<RecentBookings> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, rows: [], reason: "supabase-not-configured" };
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .select(
      "id, name, email, phone, event_date, event_location, event_type, status, locale, message, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { available: false, rows: [], reason: error.message };
  }

  return { available: true, rows: data ?? [] };
}
