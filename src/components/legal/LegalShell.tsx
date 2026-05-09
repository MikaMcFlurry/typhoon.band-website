"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useDict } from "@/components/i18n/DictProvider";

type Props = {
  kicker: string;
  title: string;
  children: ReactNode;
};

export function LegalShell({ kicker, title, children }: Props) {
  const { dict, locale } = useDict();
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <Link
        className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
        href={`/${locale}`}
      >
        ← {dict.legal.backToHome}
      </Link>
      <span className="kicker mt-3 block">{kicker}</span>
      <h1 className="mt-2 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--cream)] md:text-[48px]">
        {title}
      </h1>
      <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
        {dict.legal.draftNote}
      </p>
      <div className="mt-6 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-5 text-sm leading-relaxed text-[color:var(--cream)] md:p-7 md:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-6 font-display text-lg font-semibold tracking-[-0.01em] text-[color:var(--cream)] first:mt-0 md:text-xl">
      {children}
    </h2>
  );
}
