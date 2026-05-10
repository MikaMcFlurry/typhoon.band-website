// Cookie-aware Supabase server client for Next.js App Router.
//
// Uses `@supabase/ssr` so the auth session cookie set during the magic-link
// callback is readable by every server component / route handler. The anon
// key is used (not service role) — every read goes through RLS.
//
// `import "server-only"` keeps this file out of the client bundle.

import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

export type ServerAuthSupabase = SupabaseClient<Database>;

export async function getSupabaseServerAuthClient(): Promise<ServerAuthSupabase | null> {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options as CookieOptions);
            }
          } catch {
            // Server Components cannot set cookies. The middleware/route
            // handler that wraps the callback will refresh them — swallowing
            // here keeps reads in pure RSC contexts working.
          }
        },
      },
    },
  );
}
