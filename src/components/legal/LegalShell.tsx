"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useDict } from "@/components/i18n/DictProvider";

type Props = {
  kicker: string;
  title: string;
  // Phase 06: hide the draft-note when a published Supabase page is in
  // use so visitors don't see "Initialer Stand" once the Admin published
  // real text. The fallback bodies keep showing it.
  showDraftNote?: boolean;
  children: ReactNode;
};

export function LegalShell({
  kicker,
  title,
  showDraftNote = true,
  children,
}: Props) {
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
      {showDraftNote ? (
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {dict.legal.draftNote}
        </p>
      ) : null}
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

// Minimal renderer for plain Markdown-ish text bodies coming from
// Supabase. Phase 06 does NOT ship a full Markdown engine — that would
// pull a parser into the bundle. Instead we:
//   - split on blank lines into paragraphs
//   - treat lines that start with "## " as H2 (other heading levels
//     fall back to paragraphs to keep the design lean)
//   - leave the rest as preformatted text with whitespace-pre-line so
//     intentional line breaks survive.
// This is enough for short legal copy and keeps the experience
// consistent with the textarea-based Admin editor.
export function LegalBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <LegalH2 key={i}>{block.slice(3).trim()}</LegalH2>;
        }
        return (
          <p
            key={i}
            className="mt-3 whitespace-pre-line text-[color:var(--muted-cream)] first:mt-0"
          >
            {block}
          </p>
        );
      })}
    </>
  );
}
