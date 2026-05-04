"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const navItems: { href: string; label: string }[] = [
  { href: "#home", label: "Home" },
  { href: "#band", label: "Band" },
  { href: "#music", label: "Music" },
  { href: "#shows", label: "Termine" },
  { href: "#media", label: "Media" },
  { href: "#booking", label: "Booking" },
  { href: "#contact", label: "Kontakt" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[1000] h-[60px] md:h-[72px]">
        <div className="pointer-events-auto mx-auto flex h-full max-w-container items-center justify-between gap-4 px-4 md:gap-8 md:px-8">
          <Link
            aria-label="Typhoon"
            className="flex items-center"
            href="#home"
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
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)] transition hover:text-[color:var(--cream)]"
                      href={item.href}
                    >
                      {item.label}
                    </a>
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
              aria-label="Menu"
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

      <nav
        aria-label="Mobile Navigation"
        className={`fixed inset-x-0 bottom-0 top-[60px] z-[49] backdrop-blur-md transition md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
        id="mobile-drawer"
        style={{ background: "rgba(3,2,1,0.97)" }}
      >
        <ul className="flex flex-col gap-1 px-5 py-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                className="block border-b border-[color:var(--line)] py-3 font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--cream)]"
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
