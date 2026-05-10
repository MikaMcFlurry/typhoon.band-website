// Browser-safe Supabase client. Uses ONLY the public anon key. Returns
// `null` when env vars are missing so the public site keeps rendering and
// public-content loaders can fall back to seed data without crashing.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export type BrowserSupabase = SupabaseClient<Database>;

let cached: BrowserSupabase | null = null;

export function getBrowserSupabase(): BrowserSupabase | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
  return cached;
}
