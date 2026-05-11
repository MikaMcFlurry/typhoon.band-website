import Link from "next/link";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { requireAdminWithPasswordOk } from "@/lib/admin/auth";

import { AdminShell } from "./_components/AdminShell";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

type CardStatus = "live" | "soon";

type DashboardCard = {
  key: string;
  label: string;
  description: string;
  status: CardStatus;
  href?: string;
};

const CARDS: DashboardCard[] = [
  {
    key: "booking",
    label: "Booking",
    description:
      "Booking-Anfragen ansehen, beantworten, archivieren oder in eine Show umwandeln.",
    status: "live",
  },
  {
    key: "shows",
    label: "Shows",
    description: "Termine veröffentlichen, TBA markieren, sortieren.",
    status: "live",
  },
  {
    key: "media",
    label: "Media",
    description: "Galerie-Bilder hochladen, sortieren, ausblenden.",
    status: "live",
  },
  {
    key: "music",
    label: "Music",
    description: "Demos pflegen, MP3 und Cover hochladen, Sichtbarkeit/Featured.",
    status: "live",
  },
  {
    key: "members",
    label: "Members",
    description: "Bandmitglieder-Fotos hochladen und Sichtbarkeit pflegen.",
    status: "live",
  },
  {
    key: "settings",
    label: "Assets",
    description: "Hero- und Bandinfo-Bild austauschen, Site-Assets verwalten.",
    status: "live",
  },
  {
    key: "legal",
    label: "Legal",
    description: "Impressum, Datenschutz und Cookies bearbeiten.",
    status: "soon",
  },
  {
    key: "seo",
    label: "SEO",
    description: "Title, Description und OG-Bilder pro Seite.",
    status: "soon",
  },
  {
    key: "platform",
    label: "Platform Links",
    description: "Spotify, YouTube, Instagram & Co. verwalten.",
    status: "soon",
  },
];

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const current = await requireAdminWithPasswordOk(locale, {
    from: `/${locale}/admin`,
  });

  return (
    <AdminShell locale={locale} current={current} active="dashboard">
      <header>
        <p className="kicker">Übersicht</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] md:text-2xl">
          Admin Dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-cream)]">
          Diese Phase liefert nur die Auth-Hülle und einen schreibgeschützten
          Booking-Überblick. Alle weiteren Module folgen schrittweise.
        </p>
      </header>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const target =
            card.key === "booking"
              ? `/${locale}/admin/booking`
              : card.key === "shows"
                ? `/${locale}/admin/shows`
                : card.key === "media"
                  ? `/${locale}/admin/media`
                  : card.key === "music"
                    ? `/${locale}/admin/music`
                    : card.key === "members"
                      ? `/${locale}/admin/members`
                      : card.key === "settings"
                        ? `/${locale}/admin/settings/assets`
                        : null;
          const inner = (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-base font-semibold tracking-[-0.01em] md:text-lg">
                  {card.label}
                </span>
                <span
                  className={
                    "rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] " +
                    (card.status === "live"
                      ? "border-[color:var(--gold-soft)] text-[color:var(--gold-soft)]"
                      : "border-[color:var(--line)] text-[color:var(--muted-cream)]")
                  }
                >
                  {card.status === "live" ? "Aktiv" : "Coming next"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted-cream)]">
                {card.description}
              </p>
            </>
          );
          return (
            <li key={card.key}>
              {target ? (
                <Link
                  href={target}
                  className="panel block h-full p-4 transition hover:border-[color:var(--line-strong)]"
                >
                  {inner}
                </Link>
              ) : (
                <div className="panel block h-full p-4 opacity-90">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
