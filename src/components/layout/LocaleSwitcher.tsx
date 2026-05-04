"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
] as const;

// Small DE / EN / TR switcher per docs/typhoon-design-fix-v5.md §8.
// Builds a target path by replacing the first segment of the current
// pathname so deep links keep their route while the locale changes.
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "/de";
  const segments = pathname.split("/").filter(Boolean);
  const current = LOCALES.find((l) => l.code === segments[0])?.code ?? "de";

  function pathFor(code: string) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${code}/${rest}` : `/${code}`;
  }

  return (
    <ul
      aria-label="Sprache wählen"
      className={`flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[rgba(11,8,5,0.55)] p-0.5 backdrop-blur-sm ${className}`}
    >
      {LOCALES.map((l) => {
        const active = l.code === current;
        return (
          <li key={l.code}>
            <Link
              aria-current={active ? "true" : undefined}
              className={`block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] transition ${
                active
                  ? "bg-[color:var(--gold)] text-[#060403]"
                  : "text-[color:var(--muted-cream)] hover:text-[color:var(--cream)]"
              }`}
              href={pathFor(l.code)}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
