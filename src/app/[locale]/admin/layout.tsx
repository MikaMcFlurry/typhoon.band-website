import "server-only";

import { isSupabaseAdminConfigured } from "@/lib/env";

// Admin shell. Real auth-gating against Supabase Auth + admin_profiles is the
// next batch — for now this layout enforces:
//   1. server-only rendering (no public bundle leak)
//   2. a 503-style block until Supabase env is configured
//
// Once the Supabase client is wired up, replace the `disabled` check below
// with a proper session check (cookies → supabase auth → admin_profiles row).

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseAdminConfigured()) {
    return (
      <section className="mx-auto max-w-2xl px-4 pb-16 pt-24 text-sm leading-relaxed text-[color:var(--cream)] md:pt-32">
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
          Admin
        </h1>
        <p className="mt-4 text-[color:var(--muted-cream)]">
          Der Admin-Bereich ist deaktiviert, solange Supabase nicht konfiguriert
          ist. Setze <code>NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>, um ihn zu aktivieren.
        </p>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:pt-32">
      {children}
    </section>
  );
}
