// Server-only Admin reader/writer for the `shows` table.
//
// Public visibility is enforced by RLS (`is_visible AND is_published`).
// The Admin operates with the service-role client because it must be
// able to see/edit hidden, unpublished and TBA rows. Always call
// `requireAdmin()` upstream before invoking these helpers.

import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Database, ShowRow } from "@/lib/supabase/types";

type ShowUpdate = Database["public"]["Tables"]["shows"]["Update"];

export type AdminShowRow = ShowRow;

const ROW_COLUMNS =
  "id, starts_at, is_tba, venue, city, country, ticket_url, event_type, source_booking_request_id, is_visible, is_published, sort_order, created_at, updated_at";

export type ListShowsResult =
  | { available: true; rows: AdminShowRow[] }
  | { available: false; reason: string };

export async function listAdminShows(limit = 100): Promise<ListShowsResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  // Admin-side ordering: TBA / no date last, otherwise nearest first.
  const { data, error } = await supabase
    .from("shows")
    .select(ROW_COLUMNS)
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) return { available: false, reason: error.message };
  return { available: true, rows: data ?? [] };
}

export type GetShowResult =
  | { available: true; row: AdminShowRow }
  | { available: false; reason: string };

export async function getAdminShow(id: string): Promise<GetShowResult> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return { available: false, reason: "supabase-not-configured" };
  }
  const { data, error } = await supabase
    .from("shows")
    .select(ROW_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) return { available: false, reason: error.message };
  if (!data) return { available: false, reason: "not-found" };
  return { available: true, row: data };
}

export type ShowInput = {
  venue: string;
  city: string | null;
  country: string | null;
  event_type: string | null;
  starts_at: string | null;
  is_tba: boolean;
  ticket_url: string | null;
  is_visible: boolean;
  is_published: boolean;
  sort_order?: number | null;
  source_booking_request_id?: string | null;
};

export type CreateShowResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

export async function createShow(input: ShowInput): Promise<CreateShowResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const insert = {
    venue: input.venue,
    city: input.city,
    country: input.country,
    event_type: input.event_type,
    starts_at: input.starts_at,
    is_tba: input.is_tba,
    ticket_url: input.ticket_url,
    is_visible: input.is_visible,
    is_published: input.is_published,
    sort_order: input.sort_order ?? 0,
    source_booking_request_id: input.source_booking_request_id ?? null,
  };
  const { data, error } = await supabase
    .from("shows")
    .insert(insert)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data.id };
}

export type UpdateShowResult = { ok: true } | { ok: false; reason: string };

export async function updateShow(
  id: string,
  patch: Partial<ShowInput>,
): Promise<UpdateShowResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const next: ShowUpdate = { updated_at: new Date().toISOString() };
  if (patch.venue !== undefined) next.venue = patch.venue;
  if (patch.city !== undefined) next.city = patch.city;
  if (patch.country !== undefined) next.country = patch.country;
  if (patch.event_type !== undefined) next.event_type = patch.event_type;
  if (patch.starts_at !== undefined) next.starts_at = patch.starts_at;
  if (patch.is_tba !== undefined) next.is_tba = patch.is_tba;
  if (patch.ticket_url !== undefined) next.ticket_url = patch.ticket_url;
  if (patch.is_visible !== undefined) next.is_visible = patch.is_visible;
  if (patch.is_published !== undefined) next.is_published = patch.is_published;
  if (patch.sort_order !== undefined && patch.sort_order !== null) {
    next.sort_order = patch.sort_order;
  }
  const { error } = await supabase.from("shows").update(next).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function deleteShow(id: string): Promise<UpdateShowResult> {
  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false, reason: "supabase-not-configured" };
  const { error } = await supabase.from("shows").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}
