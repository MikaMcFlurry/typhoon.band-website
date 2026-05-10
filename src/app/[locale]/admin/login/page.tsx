import { redirect } from "next/navigation";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/env";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Admin · Login" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const sp = await searchParams;
  const fromRaw = sp.from;
  const from = typeof fromRaw === "string" ? fromRaw : undefined;

  // Already a valid admin? Skip the form.
  const current = await getCurrentAdmin();
  if (current) {
    const target =
      from && from.startsWith(`/${locale}/admin`) ? from : `/${locale}/admin`;
    redirect(target);
  }

  const supabaseReady = isSupabaseConfigured();

  return (
    <section className="mx-auto w-full max-w-md px-4 pb-16 pt-24 md:pt-32">
      <p className="kicker">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
        Anmelden
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-cream)]">
        Geschützter Bereich für Typhoon-Admins. Bitte melde dich mit deinem
        E-Mail-Account und Passwort an.
      </p>

      {supabaseReady ? (
        <LoginForm locale={locale} from={from} />
      ) : (
        <div className="mt-8 rounded-[10px] border border-[color:var(--line)] bg-[color:var(--panel)] p-4 text-sm text-[color:var(--muted-cream)]">
          Supabase ist nicht konfiguriert. Setze
          <code className="mx-1">NEXT_PUBLIC_SUPABASE_URL</code>
          und
          <code className="mx-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, damit die
          Admin-Anmeldung verfügbar wird.
        </div>
      )}
    </section>
  );
}
