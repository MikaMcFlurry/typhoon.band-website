import { redirect } from "next/navigation";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdmin } from "@/lib/admin/auth";

import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Admin · Passwort setzen" };
export const dynamic = "force-dynamic";

export default async function AdminChangePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  // No `requireAdminWithPasswordOk()` here — that would loop. We only need
  // an authenticated active admin to be allowed onto this page; if the
  // rotation already happened, send them back to the dashboard.
  const current = await requireAdmin(locale, {
    from: `/${locale}/admin/change-password`,
  });
  if (!current.mustChangePassword) {
    redirect(`/${locale}/admin`);
  }

  const displayName =
    current.profile.display_name?.trim() ||
    current.email ||
    current.profile.email ||
    "Admin";

  return (
    <section className="mx-auto w-full max-w-md px-4 pb-16 pt-24 md:pt-32">
      <p className="kicker">Admin · Erstanmeldung</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
        Passwort jetzt setzen
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-cream)]">
        Hallo {displayName}. Aus Sicherheitsgründen muss das initiale Passwort
        einmalig geändert werden, bevor du auf das Dashboard zugreifen kannst.
      </p>

      <PasswordForm locale={locale} />

      <form
        action={`/api/admin/auth/logout?locale=${encodeURIComponent(locale)}`}
        method="post"
        className="mt-6"
      >
        <button
          type="submit"
          className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
        >
          Abbrechen und abmelden
        </button>
      </form>
    </section>
  );
}
