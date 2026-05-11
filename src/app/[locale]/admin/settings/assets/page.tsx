import Image from "next/image";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";
import {
  listAssetSettings,
  type SiteAssetKey,
} from "@/lib/admin/site-settings";

import { AdminShell } from "../../_components/AdminShell";

import { clearSiteAssetAction } from "./actions";
import {
  SiteAssetSlotForm,
  type AssetSlotKey,
} from "./SiteAssetSlotForm";

export const metadata = { title: "Admin · Site-Assets" };
export const dynamic = "force-dynamic";

type Slot = {
  key: SiteAssetKey & AssetSlotKey;
  label: string;
  description: string;
  fallbackUrl: string;
};

const SLOTS: Slot[] = [
  {
    key: "hero_image",
    label: "Hero-Bild",
    description:
      "Wird im Hero-Bereich angezeigt. Solange kein Wert gesetzt ist, greift /assets/hero/hero-collage.jpeg.",
    fallbackUrl: "/assets/hero/hero-collage.jpeg",
  },
  {
    key: "hero_signature",
    label: "Hero-Signature (Logo, optional)",
    description:
      "Optional. Solange leer, wird die Repo-Signature angezeigt.",
    fallbackUrl: "/assets/branding/typhoon-signature-gold.png",
  },
  {
    key: "bandinfo_image",
    label: "Bandinfo-Bild",
    description:
      "Editorial-Bild im About/Bandinfo-Modul. Solange kein Wert gesetzt ist, greift /assets/gallery/gallery-5.jpg.",
    fallbackUrl: "/assets/gallery/gallery-5.jpg",
  },
];

export default async function AdminAssetsPage({
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
    from: `/${locale}/admin/settings/assets`,
  });
  const result = await listAssetSettings();

  const flashMessage =
    flash.saved === "1"
      ? "Asset wurde gespeichert."
      : flash.cleared === "1"
        ? "Asset wurde entfernt — Repo-Fallback greift wieder."
        : null;
  const errorMessage = flash.error ? flash.error : null;

  return (
    <AdminShell locale={locale} current={current} active="settings">
      <header>
        <p className="kicker">Site-Assets · Verwaltung</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Hero &amp; Bandinfo Bilder
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Diese Seite ersetzt nur einzelne Site-Asset-URLs (Hero, Bandinfo,
          optional Signature). Solange kein Wert gespeichert ist, zeigt das
          öffentliche Frontend die statischen Repo-Bilder. Uploads laufen
          direkt vom Browser in Supabase Storage.
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
          Site-Settings konnten nicht geladen werden. Grund:{" "}
          <code>{result.reason}</code>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {SLOTS.map((slot) => {
            const setting = result.map[slot.key];
            const url = setting.url || slot.fallbackUrl;
            const fromSupabase = Boolean(setting.url);
            return (
              <li key={slot.key} className="panel p-4">
                <header className="flex items-baseline justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-semibold tracking-[-0.01em]">
                      {slot.label}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                      key: {slot.key}
                    </p>
                  </div>
                  <span className="rounded-full border border-[color:var(--line)] px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
                    {fromSupabase ? "Supabase" : "Fallback (Repo)"}
                  </span>
                </header>

                <p className="mt-2 text-[12px] text-[color:var(--muted-cream)]">
                  {slot.description}
                </p>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--line)] md:w-[160px]">
                    <Image
                      alt={slot.label}
                      className="h-full w-full object-cover"
                      height={240}
                      src={url}
                      unoptimized
                      width={320}
                    />
                  </div>
                  <SiteAssetSlotForm locale={locale} slotKey={slot.key} />
                </div>

                {fromSupabase ? (
                  <form
                    action={clearSiteAssetAction}
                    className="mt-3 border-t border-[color:var(--line)] pt-3"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="key" value={slot.key} />
                    <button
                      type="submit"
                      className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                    >
                      Wert entfernen (Fallback wieder anzeigen)
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
