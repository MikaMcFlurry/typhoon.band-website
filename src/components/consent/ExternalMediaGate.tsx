"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  hasCategoryConsent,
  writeConsent,
} from "@/components/consent/consent";
import { useDict } from "@/components/i18n/DictProvider";
import { fill } from "@/i18n/dictionaries";

// Wrap any third-party embed (YouTube, Spotify, SoundCloud, Bandcamp …) so
// no request to the provider happens before the visitor opts in to
// `external_media`. Children render only after consent; "Load once" shows
// the embed for this page view without storing a choice.

type Props = {
  provider: string;
  /** Aspect ratio of the placeholder, e.g. "16 / 9". */
  ratio?: string;
  children: ReactNode;
};

export function ExternalMediaGate({ provider, ratio = "16 / 9", children }: Props) {
  const { dict } = useDict();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [once, setOnce] = useState(false);

  useEffect(() => {
    const refresh = () => setAllowed(hasCategoryConsent("external_media"));
    refresh();
    window.addEventListener(CONSENT_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, refresh);
  }, []);

  const always = useCallback(() => {
    writeConsent(true);
    setAllowed(true);
  }, []);

  if (allowed || once) return <>{children}</>;

  return (
    <div
      className="flex flex-col items-start justify-center gap-4 rounded-md border border-line bg-ink-2 p-6"
      style={{ aspectRatio: ratio }}
    >
      <p className="label">{dict.gate.title}</p>
      <p className="max-w-prose text-paper-2">{fill(dict.gate.body, { provider })}</p>
      {allowed === null ? null : (
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => setOnce(true)} type="button">
            {dict.gate.load}
          </button>
          <button className="btn btn-primary btn-sm" onClick={always} type="button">
            {dict.gate.always}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}
            type="button"
          >
            {dict.footer.consentSettings}
          </button>
        </div>
      )}
    </div>
  );
}
