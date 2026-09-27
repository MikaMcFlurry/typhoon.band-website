import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import { listAdminLegalPages } from "@/lib/admin/legal";
import {
  LEGAL_SLUGS,
  type LegalSlug,
} from "@/lib/validation/legal-seo-platforms";

import { AdminShell } from "../_components/AdminShell";

import { LegalEditor, type LegalPageView } from "./LegalEditor";

export const metadata = { title: "Admin · Legal" };
export const dynamic = "force-dynamic";

function emptyPage(slug: LegalSlug): LegalPageView {
  return {
    slug,
    isPublished: false,
    translations: {},
  };
}

export default async function AdminLegalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/legal`,
  });

  const result = await listAdminLegalPages();

  const pages: LegalPageView[] = LEGAL_SLUGS.map((slug) => {
    if (!result.available) return emptyPage(slug);
    const row = result.rows.find((r) => r.slug === slug);
    if (!row) return emptyPage(slug);
    const translations: LegalPageView["translations"] = {};
    for (const tr of row.translations) {
      translations[tr.locale] = {
        locale: tr.locale,
        title: tr.title,
        bodyMd: tr.body_md,
      };
    }
    return { slug, isPublished: row.is_published, translations };
  });

  const flashMessage =
    flash.saved === "1" ? "Legal-Seite wurde gespeichert." : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="legal">
      <header>
        <p className="kicker">Legal · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Impressum, Datenschutz, Cookies
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Drei Seiten, je Sprache (DE/EN/TR) ein eigener Text. Solange eine
          Seite nicht veröffentlicht ist, zeigt die Website den Repo-Fallback
          mit Draft-Hinweis. Reine Textbearbeitung, kein Rich-Text.
        </p>
      </header>

      {flashMessage ? (
        <div className="panel mt-5 border-[color:var(--gold-soft)] p-3 text-xs text-[color:var(--cream)]">
          {flashMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="panel mt-5 border-[#ef4444] p-3 text-xs text-[#fca5a5]">
          Fehler: {errorMessage}
        </div>
      ) : null}

      {!result.available ? (
        <div className="panel mt-6 p-4 text-sm text-[color:var(--muted-cream)]">
          Legal-Daten konnten nicht aus Supabase geladen werden. Grund:{" "}
          <code>{result.reason}</code>. Du kannst dennoch unten Texte eingeben —
          die Seite wird angelegt, sobald Supabase erreichbar ist.
        </div>
      ) : null}

      <div className="panel mt-6 p-4 md:p-6">
        <LegalEditor locale={locale} pages={pages} />
      </div>
    </AdminShell>
  );
}
