"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
  type ConsentState,
} from "./consent";

type Mode = "banner" | "preferences";

// Phase 06 consent UI:
//   - Banner appears on first visit (no stored choice).
//   - "Necessary only" / "Accept all" save without opening the dialog.
//   - "Preferences" opens a small dialog with per-category toggles.
//   - Footer "Cookie preferences" link dispatches CONSENT_OPEN_EVENT to
//     reopen the dialog after the banner has been dismissed.
//   - No analytics cookies are ever set — only the choice itself lives
//     in localStorage.
export function CookieConsent() {
  const { dict, locale } = useDict();
  const [state, setState] = useState<ConsentState | null>(null);
  const [mode, setMode] = useState<Mode>("banner");
  const [externalMedia, setExternalMedia] = useState<boolean>(false);

  // Initial read happens after hydration so the banner doesn't flash
  // for visitors who already chose.
  useEffect(() => {
    const initial = readConsent();
    setState(initial);
    if (initial.decided) {
      setExternalMedia(initial.choice.external_media);
    }
  }, []);

  useEffect(() => {
    function openHandler() {
      setState((current) => current ?? { decided: false });
      setMode("preferences");
      // Pre-fill toggle with the currently stored choice.
      const latest = readConsent();
      setExternalMedia(latest.decided ? latest.choice.external_media : false);
      // Force banner to be visible by treating preferences as "not yet
      // decided" for the open lifecycle — we reset back via persist().
      setState({ decided: false });
    }
    window.addEventListener(CONSENT_OPEN_EVENT, openHandler);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openHandler);
  }, []);

  const persist = useCallback((external: boolean) => {
    const choice = writeConsent(external);
    setState({ decided: true, choice });
    setMode("banner");
  }, []);

  if (state === null) return null;
  if (state.decided) return null;

  return (
    <div
      aria-label={dict.cookies.title}
      aria-modal={mode === "preferences" ? true : undefined}
      className="fixed inset-x-0 bottom-0 z-[1200] mx-auto flex max-w-[840px] items-stretch p-3 md:p-4"
      role="dialog"
    >
      <div className="grid w-full gap-3 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[#080604] p-4 shadow-[0_22px_44px_rgba(0,0,0,0.55)] md:p-5">
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

        {mode === "preferences" ? (
          <fieldset className="grid gap-2 border-t border-[color:var(--line)] pt-3">
            <label className="flex items-start gap-2 text-[12px] text-[color:var(--muted-cream)]">
              <input
                type="checkbox"
                checked
                disabled
                aria-readonly
                className="mt-0.5"
              />
              <span>
                <strong className="block text-[color:var(--cream)]">
                  {dict.cookies.categoryNecessary}
                </strong>
                <span className="block text-[11px]">
                  {dict.cookies.categoryNecessaryDesc}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-[12px] text-[color:var(--muted-cream)]">
              <input
                type="checkbox"
                checked={externalMedia}
                onChange={(e) => setExternalMedia(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <strong className="block text-[color:var(--cream)]">
                  {dict.cookies.categoryExternalMedia}
                </strong>
                <span className="block text-[11px]">
                  {dict.cookies.categoryExternalMediaDesc}
                </span>
              </span>
            </label>
          </fieldset>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          {mode === "preferences" ? (
            <button
              className="btn btn-primary"
              onClick={() => persist(externalMedia)}
              type="button"
            >
              {dict.cookies.save}
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setMode("preferences")}
                type="button"
              >
                {dict.cookies.preferences}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => persist(false)}
                type="button"
              >
                {dict.cookies.decline}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => persist(true)}
                type="button"
              >
                {dict.cookies.acceptAll}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
