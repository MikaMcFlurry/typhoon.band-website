// Client-side consent state for the public website.
//
// Phase 06 storage shape (versioned, stored in localStorage):
//   {
//     v: 1,
//     necessary: true,                 // always true, kept for symmetry
//     external_media: boolean,
//     decided_at: ISOString,
//   }
//
// The banner reads/writes via the helpers in this module; embed gates
// subscribe to the `typhoon:consent-changed` event and the Footer
// "Cookie preferences" link emits `typhoon:open-consent` to reopen the
// dialog. Keeping the helpers free of React lets server components and
// utility code share the same storage contract.

export const CONSENT_STORAGE_KEY = "typhoon.consent.v1";
export const CONSENT_CHANGE_EVENT = "typhoon:consent-changed";
export const CONSENT_OPEN_EVENT = "typhoon:open-consent";

export type ConsentCategory = "necessary" | "external_media";

export type ConsentChoice = {
  v: 1;
  necessary: true;
  external_media: boolean;
  decided_at: string;
};

export type ConsentState =
  | { decided: false }
  | { decided: true; choice: ConsentChoice };

function isChoice(value: unknown): value is ConsentChoice {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    r.v === 1 &&
    r.necessary === true &&
    typeof r.external_media === "boolean" &&
    typeof r.decided_at === "string"
  );
}

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return { decided: false };
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return { decided: false };
    const parsed = JSON.parse(raw) as unknown;
    if (!isChoice(parsed)) return { decided: false };
    return { decided: true, choice: parsed };
  } catch {
    return { decided: false };
  }
}

export function writeConsent(externalMedia: boolean): ConsentChoice {
  const choice: ConsentChoice = {
    v: 1,
    necessary: true,
    external_media: externalMedia,
    decided_at: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    /* localStorage may be blocked — banner will still hide for the session */
  }
  try {
    window.dispatchEvent(
      new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }),
    );
  } catch {
    /* CustomEvent unsupported in ancient browsers — safe to ignore */
  }
  return choice;
}

export function clearConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function hasCategoryConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const state = readConsent();
  if (!state.decided) return false;
  return state.choice[category] === true;
}
