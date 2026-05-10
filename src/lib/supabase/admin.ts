// Service-role Supabase client. BYPASSES RLS — must NEVER be reachable
// from the browser bundle.
//
// `import "server-only"` makes Next.js error at build time if this module
// gets pulled into a client component. The service-role key is read from
// `SUPABASE_SERVICE_ROLE_KEY`, which is intentionally not prefixed with
// `NEXT_PUBLIC_`.

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseAdminConfigured, readServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export type AdminSupabase = SupabaseClient<Database>;

let cached: AdminSupabase | null = null;

export function getAdminSupabase(): AdminSupabase | null {
  if (!isSupabaseAdminConfigured()) return null;
  if (cached) return cached;
  const env = readServerEnv();
  cached = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "X-Client-Info": "typhoon-band-website/admin" },
    },
  });
  return cached;
}
