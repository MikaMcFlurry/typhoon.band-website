// Cookie-aware Supabase browser client for the Admin login form.
//
// `createBrowserClient` from `@supabase/ssr` writes the auth cookie in a
// format that the matching server client (`server-auth.ts`) can read, so the
// session survives a full page reload into protected `/admin` routes.

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export type BrowserAuthSupabase = SupabaseClient<Database>;

let cached: BrowserAuthSupabase | null = null;

export function getSupabaseBrowserAuthClient(): BrowserAuthSupabase | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  );
  return cached;
}
