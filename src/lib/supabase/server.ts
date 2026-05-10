// Server-side Supabase anon client. Uses the public anon key, so it
// reads as "anonymous user" and is bound by the same RLS policies a
// browser client is. Use this for public/published reads from server
// components and route handlers.
//
// For privileged writes that must bypass RLS (e.g. inserting into
// `booking_requests`) use `getAdminSupabase()` from `./admin.ts` —
// that file is `server-only` and uses the service-role key.

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export type ServerSupabase = SupabaseClient<Database>;

let cached: ServerSupabase | null = null;

export function getServerSupabase(): ServerSupabase | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return cached;
}
