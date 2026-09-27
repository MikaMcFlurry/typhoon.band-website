"use client";

import { CONSENT_OPEN_EVENT } from "@/components/consent/consent";

export function ConsentSettingsButton({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}
      type="button"
    >
      {label}
    </button>
  );
}
