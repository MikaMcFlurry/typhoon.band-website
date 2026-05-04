import "server-only";

import { isSupabaseAdminConfigured } from "@/lib/env";

export type ServerSupabase = unknown;

// Server-only Supabase client placeholder. The SERVICE_ROLE_KEY must never
// be imported from a client component — `import "server-only"` enforces that.
//
// The actual `@supabase/supabase-js` SDK is added in a later batch. Until
// then this helper returns `null` so server code can branch into a
// graceful "Supabase nicht konfiguriert" path.
export async function getServerSupabase(): Promise<ServerSupabase | null> {
  if (!isSupabaseAdminConfigured()) return null;
  return null;
}
