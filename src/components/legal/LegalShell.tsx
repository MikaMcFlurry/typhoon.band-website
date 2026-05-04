import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  draftNote?: string;
  children: ReactNode;
};

// Shared chrome for /legal/* pages — same kicker + display title + panel
// rhythm as the rest of the onepager so the legal routes don't read as
// unstyled placeholders.
export function LegalShell({ kicker, title, draftNote, children }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <span className="kicker">{kicker}</span>
      <h1 className="mt-2 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--cream)] md:text-[48px]">
        {title}
      </h1>
      {draftNote ? (
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {draftNote}
        </p>
      ) : null}
      <div className="mt-6 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-5 text-sm leading-relaxed text-[color:var(--cream)] md:p-7 md:text-[15px]">
        {children}
      </div>
    </section>
  );
}

// Common subheading style for legal blocks.
export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-6 font-display text-lg font-semibold tracking-[-0.01em] text-[color:var(--cream)] first:mt-0 md:text-xl">
      {children}
    </h2>
  );
}
