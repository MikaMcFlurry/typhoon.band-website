"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  readConsent,
  writeConsent,
} from "@/components/consent/consent";
import { useDict } from "@/components/i18n/DictProvider";

// Privacy notice + preferences.
//   - First visit: a small, non-blocking notice (content stays usable).
//   - "Privacy settings" in the footer reopens it as a modal dialog with a
//     focus trap, Esc and Cancel.
// Nothing is tracked. The only stored item is this choice (localStorage).

type Mode = "hidden" | "notice" | "dialog";

export function ConsentBanner() {
  const { dict, locale } = useDict();
  const [mode, setMode] = useState<Mode>("hidden");
  const [external, setExternal] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const state = readConsent();
    if (!state.decided) setMode("notice");
    else setExternal(state.choice.external_media);

    const onOpen = () => {
      const current = readConsent();
      setExternal(current.decided ? current.choice.external_media : false);
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setMode("dialog");
    };
    // Keep in sync when an embed gate grants consent elsewhere.
    const onChange = () => {
      const current = readConsent();
      if (current.decided) {
        setExternal(current.choice.external_media);
        setMode((m) => (m === "notice" ? "hidden" : m));
      }
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
    };
  }, []);

  const close = useCallback(() => {
    setMode("hidden");
    returnFocusRef.current?.focus?.();
  }, []);

  const decide = useCallback(
    (allowExternal: boolean) => {
      writeConsent(allowExternal);
      setExternal(allowExternal);
      close();
    },
    [close],
  );

  // Dialog mode: focus trap + Esc.
  useEffect(() => {
    if (mode !== "dialog") return;
    const node = dialogRef.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, close]);

  if (mode === "hidden") return null;

  const links = (
    <p className="mono text-[rgba(18,17,16,0.72)]">
      <Link className="underline underline-offset-4 hover:text-[#121110]" href={`/${locale}/legal/privacy`}>
        {dict.cookies.privacyLink}
      </Link>
      <span aria-hidden> · </span>
      <Link className="underline underline-offset-4 hover:text-[#121110]" href={`/${locale}/legal/cookies`}>
        {dict.cookies.cookiesLink}
      </Link>
    </p>
  );

  if (mode === "notice") {
    return (
      <section
        aria-label={dict.cookies.title}
        className="fixed inset-x-2 z-[60] bg-chalk p-4 text-[#121110] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] [--focus:#121110] sm:inset-x-6 md:flex md:items-center md:gap-8 md:px-6 md:py-4"
        style={{ bottom: "calc(var(--dock-h) + 8px)" }}
      >
        <div className="min-w-0 md:flex-1">
          <h2 className="font-stage text-[1.375rem] font-extrabold uppercase leading-none">
            {dict.cookies.title}
          </h2>
          <p className="mt-1.5 text-[0.875rem] leading-snug md:text-[0.9375rem]">
            {dict.cookies.body}
          </p>
          <div className="mt-1.5">{links}</div>
        </div>
        <div className="mt-3 grid flex-none grid-cols-2 gap-2 md:mt-0 md:w-[380px]">
          <button className="btn-line btn-sm whitespace-normal border-[#121110] px-2 text-center text-[0.9375rem] text-[#121110] hover:bg-[#121110] hover:text-chalk sm:text-[1.0625rem]" onClick={() => decide(false)} type="button">
            {dict.cookies.decline}
          </button>
          <button className="btn-line btn-sm whitespace-normal border-[#121110] bg-[#121110] px-2 text-center text-[0.9375rem] text-chalk hover:bg-transparent hover:text-[#121110] sm:text-[1.0625rem]" onClick={() => decide(true)} type="button">
            {dict.cookies.acceptShort}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-deck/80 p-3 sm:items-center">
      <div
        aria-labelledby="consent-title"
        aria-modal="true"
        className="w-full max-w-[480px] bg-chalk p-6 text-[#121110] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] [--focus:#121110]"
        ref={dialogRef}
        role="dialog"
      >
        <h2 className="font-stage text-[2rem] font-black uppercase leading-none" id="consent-title">
          {dict.cookies.title}
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed">{dict.cookies.body}</p>

        <ul className="mt-5 divide-y divide-[rgba(18,17,16,0.2)] border-y border-[rgba(18,17,16,0.2)]">
          <li className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-semibold">{dict.cookies.necessary}</p>
              <p className="mt-1 text-[0.875rem] text-[rgba(18,17,16,0.72)]">{dict.cookies.necessaryBody}</p>
            </div>
            <Switch checked disabled label={dict.cookies.necessary} />
          </li>
          <li className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-semibold">{dict.cookies.external}</p>
              <p className="mt-1 text-[0.875rem] text-[rgba(18,17,16,0.72)]">{dict.cookies.externalBody}</p>
            </div>
            <Switch
              checked={external}
              label={dict.cookies.external}
              onChange={setExternal}
            />
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="btn-line btn-sm border-transparent text-[#121110] hover:border-[#121110]" onClick={close} type="button">
            {dict.cookies.cancel}
          </button>
          <button className="btn-line btn-sm border-[#121110] bg-[#121110] text-chalk hover:bg-transparent hover:text-[#121110]" onClick={() => decide(external)} type="button">
            {dict.cookies.save}
          </button>
        </div>
        <div className="mt-4">{links}</div>
      </div>
    </div>
  );
}

function Switch({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`relative mt-1 inline-flex h-7 w-12 flex-none items-center border-2 border-[#121110] transition-colors ${
        checked ? "bg-green" : "bg-transparent"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      role="switch"
      type="button"
    >
      <span
        aria-hidden
        className={`inline-block size-4 bg-[#121110] transition-transform ${
          checked ? "translate-x-[24px]" : "translate-x-[4px]"
        }`}
      />
    </button>
  );
}
