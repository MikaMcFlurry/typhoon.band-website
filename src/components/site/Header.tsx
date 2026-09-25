"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import { Icon } from "@/components/ui/Icon";

// Top strip. On the home page the big signature lives in the hero, so the
// small one fades in only after the hero has scrolled away. Booking is the
// one orange tape; every other link is plain mono.

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
  const [pastHero, setPastHero] = useState(false);
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
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      setPastHero(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the section crossing the middle of the viewport.
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

  // Mobile sheet: lock scroll, Esc closes, focus stays inside, focus returns.
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
      const list = [menuButtonRef.current, ...focusables()].filter(
        (n): n is HTMLElement => Boolean(n),
      );
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

  const showLogo = !isHome || pastHero || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-deck transition-[border-color] duration-300 ${
          scrolled || open || !isHome ? "border-b border-rule" : "border-b border-transparent"
        }`}
        style={{ height: "var(--header-h)" }}
      >
        <div className="shell flex h-full items-center justify-between gap-4">
          <Link
            aria-label={dict.a11y.home}
            className={`relative -ml-1 flex-none p-1 transition-opacity duration-300 ${
              showLogo ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            href={isHome ? "#top" : `/${locale}`}
            tabIndex={showLogo ? undefined : -1}
          >
            <Image
              alt="Typhoon"
              className="h-8 w-auto md:h-10"
              height={724}
              priority={!isHome}
              sizes="140px"
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
                    className={`mono-cap relative inline-flex h-11 items-center px-3 transition-colors ${
                      active === id ? "text-chalk" : "text-chalk-2 hover:text-chalk"
                    }`}
                    href={hrefFor(id)}
                  >
                    {labels[id]}
                    <span
                      aria-hidden
                      className={`absolute inset-x-3 bottom-2 h-[3px] origin-left bg-gaffer transition-transform duration-300 ${
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
            <a className="btn-tape btn-sm hidden sm:inline-flex" href={hrefFor("booking")}>
              {dict.nav.booking}
            </a>
            <button
              aria-controls="site-menu"
              aria-expanded={open}
              aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
              className="ctl -mr-2 text-chalk lg:hidden"
              onClick={() => setOpen((v) => !v)}
              ref={menuButtonRef}
              type="button"
            >
              <Icon name={open ? "close" : "menu"} size={26} />
            </button>
          </div>
        </div>
      </header>

      <div
        aria-label={dict.a11y.mainNav}
        aria-modal="true"
        className={`fixed inset-0 z-[45] flex flex-col bg-deck transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        id="site-menu"
        inert={!open}
        ref={sheetRef}
        role="dialog"
        style={{ paddingTop: "var(--header-h)" }}
      >
        <nav className="shell flex flex-1 flex-col justify-between overflow-y-auto pb-[calc(24px+var(--dock-h))] pt-4">
          <ul className="flex flex-col">
            {[...SECTIONS, "booking" as const].map((id) => (
              <li className="border-b border-rule" key={id}>
                <a
                  className="flex items-center justify-between py-3 font-stage text-[2.5rem] font-extrabold uppercase leading-none"
                  href={hrefFor(id)}
                  onClick={() => setOpen(false)}
                >
                  <span className={id === "booking" ? "tape tape-orange" : active === id ? "tape" : ""}>
                    {labels[id]}
                  </span>
                  <Icon className="text-chalk-3" name="arrow-right" size={24} />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-6">
            <LocaleSwitcher onNavigate={() => setOpen(false)} />
            <div className="flex flex-col gap-1 text-chalk-2">
              <a className="mono inline-flex min-h-11 items-center gap-3 hover:text-chalk" href={`mailto:${bookingEmail}`}>
                <Icon name="mail" size={18} />
                {bookingEmail}
              </a>
              <a className="mono inline-flex min-h-11 items-center gap-3 hover:text-chalk" href={`tel:${phone.replace(/\s+/g, "")}`}>
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
