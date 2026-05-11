import { members as fallbackMembers } from "@/data/members";
import { getDict } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  listAdminMembers,
  type AdminMemberWithTranslations,
} from "@/lib/admin/members";

import { AdminShell } from "../_components/AdminShell";

import { MemberForm } from "./MemberForm";

export const metadata = { title: "Admin · Members" };
export const dynamic = "force-dynamic";

type RowView = {
  slug: string;
  fallback: {
    name: string;
    role: string;
    bio: string;
    photoUrl: string;
    sortOrder: number;
  };
  fallbackByLocale: Record<string, { name: string; role: string; bio: string }>;
  db: AdminMemberWithTranslations | null;
};

function buildFallbackByLocale(
  slug: string,
  baseName: string,
  baseRole: string,
  baseBio: string,
): Record<string, { name: string; role: string; bio: string }> {
  const map: Record<string, { name: string; role: string; bio: string }> = {};
  for (const l of LOCALES) {
    const dict = getDict(l as Locale);
    map[l] = {
      name: baseName,
      role: dict.members.instrument[slug] ?? baseRole,
      bio: dict.members.bio[slug] ?? baseBio,
    };
  }
  return map;
}

function buildRows(rows: AdminMemberWithTranslations[]): RowView[] {
  const bySlug = new Map<string, AdminMemberWithTranslations>();
  for (const r of rows) bySlug.set(r.slug, r);

  // The static fallback file is the canonical source for "the band has
  // these 8 musicians" — Admin can later add extras via Supabase, but the
  // fallback list must always be editable so a fresh DB shows all 8.
  return fallbackMembers.map((m) => ({
    slug: m.id,
    fallback: {
      name: m.name,
      role: m.role,
      bio: m.bio,
      photoUrl: m.photo,
      sortOrder: m.sortOrder,
    },
    fallbackByLocale: buildFallbackByLocale(m.id, m.name, m.role, m.bio),
    db: bySlug.get(m.id) ?? null,
  }));
}

export default async function AdminMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    saved?: string;
    cleared?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const flash = await searchParams;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin/members`,
  });
  const result = await listAdminMembers();
  const rows = buildRows(result.available ? result.rows : []);

  const flashMessage =
    flash.saved === "1"
      ? "Mitglied wurde gespeichert."
      : flash.cleared === "1"
        ? "Foto wurde entfernt — Fallback aus dem Repo greift wieder."
        : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="members">
      <header>
        <p className="kicker">Members · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Bandmitglieder
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Pro Mitglied können Foto, Sichtbarkeit, Sortierung sowie Name,
          Instrument und Kurz-Bio (DE Pflicht, EN/TR optional) gepflegt werden.
          Solange ein Sprachfeld leer bleibt, greift der Dictionary-Fallback.
          Uploads laufen direkt aus dem Browser in Supabase Storage.
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
          Mitglieder konnten nicht aus Supabase geladen werden. Grund:{" "}
          <code>{result.reason}</code>. Du kannst dennoch unten Daten pflegen —
          sobald Supabase erreichbar ist, werden die Records angelegt.
        </div>
      ) : null}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((view) => (
          <li key={view.slug} className="panel p-4">
            <MemberForm
              locale={locale}
              slug={view.slug}
              fallback={view.fallback}
              fallbackByLocale={view.fallbackByLocale}
              db={view.db}
            />
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
