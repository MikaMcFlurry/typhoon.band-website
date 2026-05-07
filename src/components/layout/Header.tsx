"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const HASHES = [
  "home",
  "band",
  "music",
  "shows",
  "media",
  "booking",
  "contact",
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { dict, locale } = useDict();
  const pathname = usePathname() ?? `/${locale}`;
  const segments = pathname.split("/").filter(Boolean);
  const onHome = segments.length === 1 && segments[0] === locale;

  // Close drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Block body scroll while drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // On legal/admin pages we route back to /{locale}#section instead of
  // appending the hash to the current path. On home, plain anchor links
  // smooth-scroll without forcing a route change.
  const linkFor = (h: string) =>
    onHome ? `#${h}` : `/${locale}${h === "home" ? "" : `#${h}`}`;

  const items = HASHES.map((h) => ({
    href: linkFor(h),
    label: dict.nav[h as keyof typeof dict.nav],
  }));

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[1000] h-[60px] md:h-[72px]">
        <div className="pointer-events-auto mx-auto flex h-full max-w-container items-center justify-between gap-4 px-4 md:gap-8 md:px-8">
          <Link
            aria-label="Typhoon"
            className="flex items-center"
            href={`/${locale}`}
            onClick={() => setOpen(false)}
          >
            <Image
              alt="Typhoon"
              className="ml-1 block h-[38px] w-auto md:h-12"
              height={48}
              priority
              src="/assets/branding/typhoon-signature-gold-bold.png"
              style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.8))" }}
              width={210}
            />
          </Link>

          {/* Desktop nav + locale switch */}
          <div className="hidden items-center gap-6 md:flex">
            <nav aria-label="Hauptnavigation">
              <ul className="flex items-center gap-6 lg:gap-7">
                {items.map((item) => (
                  <li key={item.href}>
                    {item.href.startsWith("/") ? (
                      <Link
                        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)] transition hover:text-[color:var(--cream)]"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)] transition hover:text-[color:var(--cream)]"
                        href={item.href}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <LocaleSwitcher />
          </div>

          {/* Mobile burger */}
          <div className="flex items-center gap-2 md:hidden">
            <LocaleSwitcher />
            <button
              aria-controls="mobile-drawer"
              aria-expanded={open}
              aria-label={open ? dict.media.close : "Menu"}
              className="grid h-10 w-10 place-items-center text-[color:var(--cream)]"
              onClick={() => setOpen((v) => !v)}
              type="button"
            >
              {open ? (
                <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Opaque mobile drawer — covers the whole viewport, including hero
          signature and any underlying page content. */}
      <nav
        aria-hidden={!open}
        aria-label="Mobile Navigation"
        className={`fixed inset-0 z-[1100] flex flex-col transition md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        id="mobile-drawer"
        style={{ background: "#030201" }}
      >
        <div className="flex h-[60px] items-center justify-between border-b border-[color:var(--line)] px-4">
          <Link
            aria-label="Typhoon"
            className="flex items-center"
            href={`/${locale}`}
            onClick={() => setOpen(false)}
          >
            <Image
              alt="Typhoon"
              className="ml-1 block h-[38px] w-auto"
              height={48}
              src="/assets/branding/typhoon-signature-gold-bold.png"
              width={210}
            />
          </Link>
          <button
            aria-label={dict.media.close}
            className="grid h-10 w-10 place-items-center text-[color:var(--cream)]"
            onClick={() => setOpen(false)}
            type="button"
          >
            <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6">
          {items.map((item) => (
            <li key={item.href}>
              {item.href.startsWith("/") ? (
                <Link
                  className="block border-b border-[color:var(--line)] py-3 font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--cream)]"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  className="block border-b border-[color:var(--line)] py-3 font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--cream)]"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="border-t border-[color:var(--line)] px-5 py-4 text-[11px] text-[color:var(--muted-cream)]">
          booking@typhoon.band · +49 176 64472296
        </div>
      </nav>
    </>
  );
}
