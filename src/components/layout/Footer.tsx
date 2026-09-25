"use client";

import Image from "next/image";
import Link from "next/link";
import { useDict } from "@/components/i18n/DictProvider";
import { site } from "@/data/site";
import type { PlatformLink } from "@/lib/content";
import {
  PLATFORM_LABELS,
  type PlatformKey,
} from "@/lib/validation/legal-seo-platforms";

type IconProps = { className?: string };

// Phase 06: platform icons are bound by key (spotify/youtube/…). The
// Admin maintains the live list — if a Supabase row exists for a
// platform we show its URL, otherwise the platform is hidden. No more
// dead "#" links and no Footer redesign.
const PLATFORM_ICONS: Record<PlatformKey, (p: IconProps) => React.ReactNode> = {
  instagram: (p) => (
    <svg
      aria-hidden
      className={p.className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <rect height={18} rx={5} width={18} x={3} y={3} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.5} cy={6.5} fill="currentColor" r={0.8} />
    </svg>
  ),
  facebook: (p) => (
    <svg
      aria-hidden
      className={p.className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M14 8h2.5V5.5H14c-1.7 0-3 1.3-3 3V11H9v2.5h2V21h2.5v-7.5H16L16.5 11H13.5V9c0-.6.4-1 1-1z" />
    </svg>
  ),
  youtube: (p) => (
    <svg
      aria-hidden
      className={p.className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <rect height={13} rx={3} width={19} x={2.5} y={5.5} />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" />
    </svg>
  ),
  spotify: (p) => (
    <svg
      aria-hidden
      className={p.className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <circle cx={12} cy={12} r={9} />
      <path d="M7 10c3-1 7-1 10 1M7.5 13c2.5-.8 6-.6 8.5.8M8 16c2-.6 4.5-.5 6.5.6" />
    </svg>
  ),
  soundcloud: (p) => (
    <svg
      aria-hidden
      className={p.className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
    >
      <path d="M3 14v3M6 12v5M9 11v6M12 10v7M15 9v8M18 11v6c2.2 0 4-1.6 4-3.5S20.2 11 18 11z" />
    </svg>
  ),
  bandcamp: (p) => (
    <svg
      aria-hidden
      className={p.className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M3 7h11l-4 10H3l4-10zm12 0h7v10h-7l-4-10h4z" />
    </svg>
  ),
};

function isPlatformKey(value: string): value is PlatformKey {
  return value in PLATFORM_ICONS;
}

type Props = {
  platformLinks?: PlatformLink[];
};

export function Footer({ platformLinks = [] }: Props) {
  const { dict, locale } = useDict();

  // Only render icons for platforms we have an icon for. Unknown platform
  // strings simply get ignored on the public site (the CHECK constraint
  // in the migration already keeps the DB clean, this is a belt-and-
  // suspenders guard in case the schema is loosened later).
  const visibleLinks = platformLinks.filter((p) => isPlatformKey(p.platform));

  return (
    <footer className="mt-12 border-t border-[color:var(--line)] py-10 md:mt-16 md:py-14" id="contact">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_0.8fr] md:gap-10">
          <div>
            <Image
              alt="Typhoon"
              className="mb-4 h-12 w-auto md:h-14"
              height={56}
              src="/assets/branding/typhoon-signature-gold.png"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
              width={250}
            />
            <p className="max-w-[320px] text-xs leading-relaxed text-[color:var(--muted-cream)]">
              {dict.footer.blurb}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--cream)]">
              {dict.footer.contact}
            </h4>
            <ul className="space-y-2 text-xs text-[color:var(--muted-cream)]">
              <li>
                <a className="hover:text-[color:var(--gold-soft)]" href={`mailto:${site.contact.booking}`}>
                  {site.contact.booking}
                </a>
              </li>
              <li>{site.contact.phone}</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--cream)]">
              {dict.footer.follow}
            </h4>
            {visibleLinks.length === 0 ? (
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                —
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {visibleLinks.map((link) => {
                  const key = link.platform as PlatformKey;
                  const label = PLATFORM_LABELS[key];
                  const icon = PLATFORM_ICONS[key]({
                    className: "block h-3.5 w-3.5",
                  });
                  return (
                    <li key={link.id}>
                      <a
                        aria-label={label}
                        className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--line)] text-[color:var(--muted-cream)] transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold-soft)]"
                        href={link.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {icon}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--cream)]">
              {dict.footer.legal}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  href={`/${locale}/legal/imprint`}
                >
                  {dict.footer.imprint}
                </Link>
              </li>
              <li>
                <Link
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  href={`/${locale}/legal/privacy`}
                >
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  href={`/${locale}/legal/cookies`}
                >
                  {dict.footer.cookies}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="block w-full cursor-pointer text-left text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  onClick={() => {
                    if (typeof window === "undefined") return;
                    window.dispatchEvent(
                      new CustomEvent("typhoon:open-consent"),
                    );
                  }}
                >
                  {dict.cookies.preferences}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--line)] pt-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {dict.footer.copyrightTemplate.replace("{year}", String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
