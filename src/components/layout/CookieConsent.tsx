"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";

const STORAGE_KEY = "typhoon.cookie-consent";

type Choice = "accepted" | "declined";

// Compact bottom banner. We don't run any tracking either way — the
// banner exists so visitors know there is no tracking and to satisfy
// the "explicit acknowledgement" requirement, with the choice persisted
// in localStorage so it doesn't reappear on reload.
export function CookieConsent() {
  const { dict, locale } = useDict();
  const [choice, setChoice] = useState<Choice | null | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted" || stored === "declined") {
        setChoice(stored);
      } else {
        setChoice(null);
      }
    } catch {
      setChoice(null);
    }
  }, []);

  function record(value: Choice) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* localStorage may be blocked — banner will still hide for the session */
    }
    setChoice(value);
  }

  if (choice !== null) return null;

  return (
    <div
      aria-label={dict.cookies.title}
      className="fixed inset-x-0 bottom-0 z-[1200] mx-auto flex max-w-[840px] items-stretch p-3 md:p-4"
      role="dialog"
    >
      <div className="grid w-full gap-3 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[#080604] p-4 shadow-[0_22px_44px_rgba(0,0,0,0.55)] md:grid-cols-[1fr_auto] md:items-center md:p-5">
        <div className="min-w-0 text-[12px] leading-[1.6] text-[color:var(--muted-cream)] md:text-[13px]">
          <strong className="block text-[12px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)] md:text-[11px]">
            {dict.cookies.title}
          </strong>
          <p className="mt-1.5 m-0">
            {dict.cookies.body}{" "}
            <Link
              className="underline hover:text-[color:var(--gold-soft)]"
              href={`/${locale}/legal/privacy`}
            >
              {dict.cookies.privacyLink}
            </Link>{" "}
            ·{" "}
            <Link
              className="underline hover:text-[color:var(--gold-soft)]"
              href={`/${locale}/legal/cookies`}
            >
              {dict.cookies.cookiesLink}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => record("declined")}
            type="button"
          >
            {dict.cookies.decline}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => record("accepted")}
            type="button"
          >
            {dict.cookies.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
