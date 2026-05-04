import type { ReactNode } from "react";

type Props = {
  kicker: string;
  link?: { href: string; label: string };
  trailing?: ReactNode;
};

export function SectionHeader({ kicker, link, trailing }: Props) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <span className="kicker">{kicker}</span>
      {link ? (
        <a
          className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--muted-cream)] transition hover:text-[color:var(--gold-soft)]"
          href={link.href}
        >
          {link.label}
        </a>
      ) : null}
      {trailing}
    </div>
  );
}
