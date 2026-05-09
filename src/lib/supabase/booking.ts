// Server-only booking writer. Uses the Supabase REST API directly with
// the SERVICE_ROLE_KEY so we don't need the @supabase/supabase-js SDK
// installed yet. The service role bypasses RLS, which is mandatory here
// because `booking_requests` has NO public insert policy.

import "server-only";

import { isSupabaseAdminConfigured } from "@/lib/env";
import type { BookingData } from "@/lib/validation/booking";

export type StoreOutcome = {
  attempted: boolean;
  ok: boolean;
  reason?: string;
  id?: string;
};

type BookingRow = {
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_location: string | null;
  event_type: string | null;
  message: string;
  status: "new";
  user_agent: string | null;
};

export async function storeBookingRequest(
  data: BookingData,
  meta: { userAgent?: string },
): Promise<StoreOutcome> {
  if (!isSupabaseAdminConfigured()) {
    return { attempted: false, ok: false, reason: "supabase missing" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) {
    return { attempted: false, ok: false, reason: "supabase missing" };
  }

  const body: BookingRow = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    event_date: data.event_date || null,
    event_location: data.event_location || null,
    event_type: data.event_type || null,
    message: data.message,
    status: "new",
    user_agent: meta.userAgent ?? null,
  };

  try {
    const res = await fetch(`${url}/rest/v1/booking_requests`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { attempted: true, ok: false, reason: `supabase ${res.status}` };
    }
    const rows = (await res.json().catch(() => null)) as
      | Array<{ id?: string }>
      | null;
    return { attempted: true, ok: true, id: rows?.[0]?.id };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}
