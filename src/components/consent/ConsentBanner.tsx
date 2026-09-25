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
//   - First visit: a small, non-blocking notice (content stays usable). It
//     comes early in the DOM (right after the skip link) so keyboard users
//     reach it first; Esc minimises it to a small pill; its height is
//     published as --notice-h so focus scrolling keeps elements above it.
//   - "Privacy settings" in the footer reopens it as a modal dialog with a
//     focus trap, Esc and Cancel.
// Nothing is tracked. The only stored item is this choice (localStorage).

type Mode = "hidden" | "notice" | "minimised" | "dialog";

export function ConsentBanner() {
  const { dict, locale } = useDict();
  const [mode, setMode] = useState<Mode>("hidden");
  const [external, setExternal] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const noticeRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLButtonElement | null>(null);
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
        setMode((m) => (m === "notice" || m === "minimised" ? "hidden" : m));
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

  // Notice: reserve its height for focus scrolling (scroll-padding-bottom
  // in globals.css) and let Esc minimise it.
  useEffect(() => {
    const root = document.documentElement;
    const node = mode === "notice" ? noticeRef.current : mode === "minimised" ? pillRef.current : null;
    if (!node) {
      root.style.removeProperty("--notice-h");
      return;
    }
    const update = () => root.style.setProperty("--notice-h", `${Math.ceil(node.getBoundingClientRect().height) + 8}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--notice-h");
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "notice") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // A modal (menu, lightbox) handles its own Esc.
      if (document.querySelector('[aria-modal="true"]:not([inert])')) return;
      const inside = noticeRef.current?.contains(document.activeElement);
      setMode("minimised");
      if (inside) requestAnimationFrame(() => pillRef.current?.focus());
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode]);

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
    <p className="text-[0.875rem] text-paper-3">
      <Link className="underline decoration-line-2 underline-offset-4 hover:text-gold-hi" href={`/${locale}/legal/privacy`}>
        {dict.cookies.privacyLink}
      </Link>
      <span aria-hidden> · </span>
      <Link className="underline decoration-line-2 underline-offset-4 hover:text-gold-hi" href={`/${locale}/legal/cookies`}>
        {dict.cookies.cookiesLink}
      </Link>
    </p>
  );

  if (mode === "minimised") {
    return (
      <button
        aria-label={dict.cookies.title}
        className="btn btn-secondary btn-sm fixed left-2 z-[60] bg-ink-3 shadow-[0_12px_30px_rgba(0,0,0,0.5)] sm:left-6"
        onClick={() => setMode("notice")}
        ref={pillRef}
        style={{ bottom: "calc(var(--dock-h) + 8px)" }}
        type="button"
      >
        {dict.cookies.title}
      </button>
    );
  }

  if (mode === "notice") {
    return (
      <section
        aria-label={dict.cookies.title}
        className="fixed inset-x-2 z-[60] max-h-[45svh] overflow-y-auto overscroll-contain rounded-md border border-line-2 bg-ink-3 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:inset-x-auto sm:right-6 sm:w-[400px] sm:p-5"
        ref={noticeRef}
        style={{ bottom: "calc(var(--dock-h) + 8px)" }}
      >
        <h2 className="font-display text-[1.125rem] leading-tight text-paper sm:text-[1.25rem]">
          {dict.cookies.title}
        </h2>
        <p className="mt-1.5 text-[0.875rem] leading-snug text-paper-2 sm:text-[0.9375rem] sm:leading-relaxed">
          {dict.cookies.body}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn btn-secondary btn-sm px-3" onClick={() => decide(false)} type="button">
            {dict.cookies.decline}
          </button>
          <button className="btn btn-primary btn-sm px-3" onClick={() => decide(true)} type="button">
            {dict.cookies.acceptShort}
          </button>
        </div>
        <div className="mt-2">{links}</div>
      </section>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 p-3 sm:items-center">
      <div
        aria-labelledby="consent-title"
        aria-modal="true"
        className="w-full max-w-[480px] rounded-md border border-line-2 bg-ink-3 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        ref={dialogRef}
        role="dialog"
      >
        <h2 className="font-display text-[1.625rem] leading-tight text-paper" id="consent-title">
          {dict.cookies.title}
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-paper-2">{dict.cookies.body}</p>

        <ul className="mt-5 divide-y divide-line border-y border-line">
          <li className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-semibold text-paper">{dict.cookies.necessary}</p>
              <p className="mt-1 text-[0.875rem] text-paper-3">{dict.cookies.necessaryBody}</p>
            </div>
            <Switch checked disabled label={dict.cookies.necessary} />
          </li>
          <li className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-semibold text-paper">{dict.cookies.external}</p>
              <p className="mt-1 text-[0.875rem] text-paper-3">{dict.cookies.externalBody}</p>
            </div>
            <Switch
              checked={external}
              label={dict.cookies.external}
              onChange={setExternal}
            />
          </li>
        </ul>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={close} type="button">
            {dict.cookies.cancel}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => decide(external)} type="button">
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
      className={`relative mt-1 inline-flex h-7 w-12 flex-none items-center rounded-full border transition-colors ${
        checked ? "border-gold bg-gold" : "border-line-2 bg-ink"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      role="switch"
      type="button"
    >
      <span
        aria-hidden
        className={`switch-knob inline-block size-5 rounded-full transition-transform ${
          checked ? "translate-x-[22px] bg-on-gold" : "translate-x-[3px] bg-paper-2"
        }`}
      />
    </button>
  );
}
