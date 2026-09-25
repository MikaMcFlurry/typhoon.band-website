import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { LegalSection } from "@/content/legal";

// Layout + safe renderers for legal pages. No HTML is ever injected: text
// is split into paragraphs/lists and only e-mail addresses and http(s)
// URLs become links.

export function LegalShell({
  homeHref,
  backLabel,
  title,
  meta,
  children,
}: {
  homeHref: string;
  backLabel: string;
  title: string;
  meta?: string | null;
  children: ReactNode;
}) {
  return (
    <article className="container-x pb-24 pt-[calc(var(--header-h)+48px)] md:pb-32 md:pt-[calc(var(--header-h)+80px)]">
      <div className="mx-auto max-w-[72ch]">
        <Link
          className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] text-paper-2 hover:text-gold-hi"
          href={homeHref}
        >
          <Icon name="arrow-left" size={16} />
          {backLabel}
        </Link>
        <h1 className="h-section mt-6">{title}</h1>
        {meta ? <p className="mt-4 text-[0.9375rem] text-paper-3">{meta}</p> : null}
        <div className="mt-12 border-t border-line pt-4">{children}</div>
      </div>
    </article>
  );
}

const TOKEN_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|https?:\/\/[^\s)]+)/gi;

function Linkify({ text }: { text: string }) {
  const parts = text.split(TOKEN_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const isMail = part.includes("@") && !part.startsWith("http");
          return (
            <a
              className="text-gold-hi underline decoration-line-2 underline-offset-4 hover:text-paper"
              href={isMail ? `mailto:${part}` : part}
              key={i}
              rel={isMail ? undefined : "noopener noreferrer"}
              target={isMail ? undefined : "_blank"}
            >
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function Paragraph({ text }: { text: string }) {
  return (
    <p className="mt-4 whitespace-pre-line text-[1.0625rem] leading-relaxed text-paper-2">
      <Linkify text={text} />
    </p>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[1.0625rem] leading-relaxed text-paper-2 marker:text-gold-lo">
      {items.map((item, i) => (
        <li key={i}>
          <Linkify text={item} />
        </li>
      ))}
    </ul>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 font-display text-[1.5rem] leading-tight text-paper md:text-[1.75rem]">
      {children}
    </h2>
  );
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <section key={i}>
          {section.heading ? <H2>{section.heading}</H2> : null}
          {section.blocks.map((block, j) =>
            typeof block === "string" ? (
              <Paragraph key={j} text={block} />
            ) : (
              <List items={block.list} key={j} />
            ),
          )}
        </section>
      ))}
    </>
  );
}

// Markdown-ish text from Admin → Legal: blank-line paragraphs, "## " or
// "# " headings, "- " / "* " bullet lists.
export function LegalBody({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const heading = /^#{1,3}\s+(.+)$/.exec(block);
        if (heading && !block.includes("\n")) return <H2 key={i}>{heading[1]}</H2>;
        const lines = block.split("\n");
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          return <List items={lines.map((l) => l.replace(/^[-*]\s+/, ""))} key={i} />;
        }
        return <Paragraph key={i} text={block} />;
      })}
    </>
  );
}
