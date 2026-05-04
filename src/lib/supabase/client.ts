// Browser-safe Supabase client. Uses ONLY the public anon key.
//
// The actual `@supabase/supabase-js` SDK is intentionally not yet a
// dependency — it gets added together with the admin/CMS batch. Until then
// this helper returns `null` so calling code falls back to static seed data
// without crashing the build or shipping unused JS.

import { isSupabaseConfigured } from "@/lib/env";

export type BrowserSupabase = unknown;

export async function getBrowserSupabase(): Promise<BrowserSupabase | null> {
  if (!isSupabaseConfigured()) return null;
  // SDK is added in a future batch. Returning null keeps the public site
  // working from static seed data.
  return null;
}
