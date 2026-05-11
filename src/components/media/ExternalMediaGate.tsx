"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { useDict } from "@/components/i18n/DictProvider";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  hasCategoryConsent,
  writeConsent,
} from "@/components/layout/consent";

type Props = {
  title?: string;
  /** Children = the iframe/embed that should ONLY render after consent. */
  children: ReactNode;
};

// Phase 06 ExternalMediaGate.
//
// Wrap any external embed (YouTube iframe, Spotify player, SoundCloud,
// Bandcamp, …) with this gate so the third-party request is only fired
// once the visitor accepts `external_media`. The component:
//   - returns the gate UI when consent is missing
//   - returns `children` once consent is granted
//   - re-renders when the consent-changed event fires
//   - exposes a one-click accept for users who reach an embed before
//     dismissing the banner.
export function ExternalMediaGate({ title, children }: Props) {
  const { dict } = useDict();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    setAllowed(hasCategoryConsent("external_media"));
    function refresh() {
      setAllowed(hasCategoryConsent("external_media"));
    }
    window.addEventListener(CONSENT_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, refresh);
  }, []);

  const acceptOnce = useCallback(() => {
    writeConsent(true);
    setAllowed(true);
  }, []);

  const openPreferences = useCallback(() => {
    window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
  }, []);

  // Render nothing on the server / first paint so SSR markup matches the
  // initial client state and we never accidentally inject an iframe
  // before reading the stored consent.
  if (allowed === null) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.5)] p-4 text-xs text-[color:var(--muted-cream)]">
        …
      </div>
    );
  }

  if (allowed) return <>{children}</>;

  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-4 text-xs leading-relaxed text-[color:var(--muted-cream)] md:p-5">
      {title ? (
        <strong className="block text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold-soft)]">
          {title}
        </strong>
      ) : null}
      <p className="mt-1">{dict.cookies.embedGateNotice}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary text-[10px]"
          onClick={acceptOnce}
        >
          {dict.cookies.embedGateAccept}
        </button>
        <button
          type="button"
          className="btn btn-secondary text-[10px]"
          onClick={openPreferences}
        >
          {dict.cookies.preferences}
        </button>
      </div>
    </div>
  );
}
