"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { LOCALE_LABEL, LOCALES, type Locale } from "@/i18n/locales";

// Switches language while keeping the current path and section hash.
export function LocaleSwitcher({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { dict, locale } = useDict();
  const pathname = usePathname() ?? `/${locale}`;
  const [hash, setHash] = useState("");

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  function pathFor(code: Locale) {
    const parts = pathname.split("/");
    parts[1] = code;
    return `${parts.join("/") || `/${code}`}${hash}`;
  }

  return (
    <ul aria-label={dict.a11y.langNav} className={`flex items-center gap-1 ${className}`}>
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <li key={code}>
            <Link
              aria-current={active ? "true" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] transition-colors ${
                active
                  ? "bg-paper text-ink"
                  : "text-paper-2 hover:text-gold-hi"
              }`}
              href={pathFor(code)}
              hrefLang={code}
              lang={code}
              onClick={onNavigate}
              scroll={false}
              title={LOCALE_LABEL[code]}
            >
              {code}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
