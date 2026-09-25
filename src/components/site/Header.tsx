"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { Icon } from "@/components/ui/Icon";

// Order matches the scroll order of the home page.
const SECTIONS = ["music", "shows", "band", "media"] as const;
type SectionId = (typeof SECTIONS)[number] | "booking";

export function Header({
  bookingEmail,
  phone,
}: {
  bookingEmail: string;
  phone: string;
}) {
  const { dict, locale } = useDict();
  const pathname = usePathname() ?? "";
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const labels: Record<SectionId, string> = {
    music: dict.nav.music,
    shows: dict.nav.shows,
    band: dict.nav.band,
    media: dict.nav.media,
    booking: dict.nav.booking,
  };

  const hrefFor = useCallback(
    (id: SectionId) => (isHome ? `#${id}` : `/${locale}#${id}`),
    [isHome, locale],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the section currently in the middle of the viewport.
  useEffect(() => {
    if (!isHome) {
      setActive(null);
      return;
    }
    const ids: SectionId[] = [...SECTIONS, "booking"];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [isHome]);

  // Mobile sheet: lock scroll, Esc to close, keep focus inside, restore focus.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet = sheetRef.current;
    const focusables = () =>
      Array.from(
        sheet?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const button = menuButtonRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = scrolled || open || !isHome;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          solid
            ? "border-b border-line bg-ink/90 backdrop-blur-md supports-[backdrop-filter]:bg-ink/80"
            : "border-b border-transparent bg-transparent"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="container-x flex h-full items-center justify-between gap-6">
          <Link
            aria-label={dict.a11y.home}
            className="relative -ml-1 flex-none p-1"
            href={isHome ? "#top" : `/${locale}`}
          >
            <Image
              alt="Typhoon"
              className="h-9 w-auto md:h-11"
              height={724}
              priority
              sizes="160px"
              src="/assets/branding/typhoon-signature-gold-bold.png"
              width={2099}
            />
          </Link>

          <nav aria-label={dict.a11y.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a
                    aria-current={active === id ? "location" : undefined}
                    className={`relative inline-flex h-11 items-center px-3 text-[0.9375rem] font-medium transition-colors ${
                      active === id ? "text-gold-hi" : "text-paper-2 hover:text-paper"
                    }`}
                    href={hrefFor(id)}
                  >
                    {labels[id]}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 bottom-2 h-px origin-left bg-gold transition-transform duration-300 ${
                        active === id ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <LocaleSwitcher className="hidden sm:flex" />
            <a className="btn btn-primary btn-sm hidden sm:inline-flex" href={hrefFor("booking")}>
              {dict.nav.booking}
            </a>
            <button
              aria-controls="site-menu"
              aria-expanded={open}
              aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
              className="icon-btn text-paper lg:hidden"
              onClick={() => setOpen((v) => !v)}
              ref={menuButtonRef}
              type="button"
            >
              <Icon name={open ? "close" : "menu"} size={24} />
            </button>
          </div>
        </div>
      </header>

      <div
        aria-label={dict.a11y.mainNav}
        aria-modal="true"
        className={`fixed inset-0 z-[45] flex flex-col bg-ink transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        id="site-menu"
        inert={!open}
        ref={sheetRef}
        role="dialog"
        style={{ paddingTop: "var(--header-h)" }}
      >
        <nav className="container-x flex flex-1 flex-col justify-between overflow-y-auto pb-[calc(24px+var(--dock-h))] pt-6">
          <ul className="flex flex-col">
            {[...SECTIONS, "booking" as const].map((id, i) => (
              <li className="border-b border-line" key={id}>
                <a
                  className={`flex items-center justify-between py-4 font-display text-[2rem] leading-tight transition-colors ${
                    active === id ? "text-gold-hi" : "text-paper"
                  }`}
                  href={hrefFor(id)}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${i * 30}ms` : "0ms" }}
                >
                  {labels[id]}
                  <Icon className="text-paper-3" name="arrow-right" size={22} />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-6">
            <LocaleSwitcher onNavigate={() => setOpen(false)} />
            <div className="flex flex-col gap-2 text-paper-2">
              <a className="inline-flex items-center gap-3 py-1 hover:text-gold-hi" href={`mailto:${bookingEmail}`}>
                <Icon name="mail" size={18} />
                {bookingEmail}
              </a>
              <a className="inline-flex items-center gap-3 py-1 hover:text-gold-hi" href={`tel:${phone.replace(/\s+/g, "")}`}>
                <Icon name="phone" size={18} />
                {phone}
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
