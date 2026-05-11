"use client";

import { useState } from "react";

import { LOCALES, type Locale } from "@/i18n/locales";
import {
  LEGAL_SLUGS,
  type LegalSlug,
} from "@/lib/validation/legal-seo-platforms";

import { saveLegalAction } from "./actions";

export type LegalTranslationView = {
  locale: string;
  title: string;
  bodyMd: string;
};

export type LegalPageView = {
  slug: LegalSlug;
  isPublished: boolean;
  translations: Record<string, LegalTranslationView>;
};

type Props = {
  locale: Locale;
  pages: LegalPageView[];
  initialSlug?: LegalSlug;
  initialLocale?: Locale;
};

const SLUG_LABELS: Record<LegalSlug, string> = {
  imprint: "Impressum",
  privacy: "Datenschutz",
  cookies: "Cookies",
};

export function LegalEditor({
  locale,
  pages,
  initialSlug,
  initialLocale,
}: Props) {
  const [slug, setSlug] = useState<LegalSlug>(initialSlug ?? "imprint");
  const [entryLocale, setEntryLocale] = useState<Locale>(
    initialLocale ?? "de",
  );

  const page = pages.find((p) => p.slug === slug);
  const translation = page?.translations[entryLocale] ?? {
    locale: entryLocale,
    title: "",
    bodyMd: "",
  };
  const isPublished = page?.isPublished ?? false;

  // Re-keying the form when slug/locale changes ensures the textarea
  // and inputs reflect the freshly selected translation without each
  // field needing to be a controlled component.
  const formKey = `${slug}-${entryLocale}`;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {LEGAL_SLUGS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlug(s)}
            className={
              "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] transition " +
              (s === slug
                ? "border-[color:var(--gold-soft)] bg-[color:var(--gold)] text-[#060403]"
                : "border-[color:var(--line)] text-[color:var(--muted-cream)] hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)]")
            }
            aria-pressed={s === slug}
          >
            {SLUG_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setEntryLocale(l as Locale)}
            className={
              "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] transition " +
              (l === entryLocale
                ? "border-[color:var(--gold-soft)] text-[color:var(--gold-soft)]"
                : "border-[color:var(--line)] text-[color:var(--muted-cream)] hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)]")
            }
            aria-pressed={l === entryLocale}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <form key={formKey} action={saveLegalAction} className="grid gap-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="entry_locale" value={entryLocale} />

        <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
          Titel
          <input
            type="text"
            name="title"
            defaultValue={translation.title}
            className="rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 text-sm text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            maxLength={160}
            required
          />
        </label>

        <label className="grid gap-1 text-xs uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
          Body (Markdown / Plaintext)
          <textarea
            name="body_md"
            defaultValue={translation.bodyMd}
            rows={16}
            className="resize-y rounded-md border border-[color:var(--line)] bg-[#080604] px-3 py-2 font-mono text-[12px] leading-relaxed text-[color:var(--cream)] outline-none focus:border-[color:var(--gold-soft)]"
            maxLength={16000}
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-[color:var(--muted-cream)]">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={isPublished}
          />
          Veröffentlicht (überschreibt den Repo-Fallback auf der öffentlichen
          Seite)
        </label>

        <p className="text-[11px] text-[color:var(--muted)]">
          Hinweis: Reine Textbearbeitung. Keine Rechtsberatung. Inhalte gelten
          erst nach Veröffentlichung.
        </p>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
}
