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
    <ul aria-label={dict.a11y.langNav} className={`flex items-center ${className}`}>
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <li key={code}>
            <Link
              aria-current={active ? "true" : undefined}
              className={`mono-cap inline-flex h-11 min-w-10 items-center justify-center px-2 transition-colors ${
                active ? "text-chalk" : "text-chalk-3 hover:text-chalk"
              }`}
              href={pathFor(code)}
              hrefLang={code}
              lang={code}
              onClick={onNavigate}
              scroll={false}
              title={LOCALE_LABEL[code]}
            >
              <span className={active ? "tape py-0.5" : ""}>{code}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
