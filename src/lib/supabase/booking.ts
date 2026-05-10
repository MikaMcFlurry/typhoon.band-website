// Server-only booking writer. Uses the service-role Supabase client so
// the insert bypasses RLS — `booking_requests` deliberately exposes no
// public insert policy, only the server route may write to it.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { BookingRequestInsert } from "@/lib/supabase/types";
import type { BookingData } from "@/lib/validation/booking";

export type StoreOutcome = {
  attempted: boolean;
  ok: boolean;
  reason?: string;
  id?: string;
};

export async function storeBookingRequest(
  data: BookingData,
  meta: { userAgent?: string; ipHash?: string | null },
): Promise<StoreOutcome> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { attempted: false, ok: false, reason: "supabase missing" };
  }

  const row: BookingRequestInsert = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    event_date: data.event_date || null,
    event_location: data.event_location || null,
    event_type: data.event_type || null,
    message: data.message,
    status: "new",
    locale: data.locale,
    user_agent: meta.userAgent ?? null,
    ip_hash: meta.ipHash ?? null,
  };

  try {
    const { data: inserted, error } = await supabase
      .from("booking_requests")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      return { attempted: true, ok: false, reason: error.message };
    }
    return { attempted: true, ok: true, id: inserted?.id };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}
