"use client";

import { useState } from "react";

import {
  DirectUploadField,
  type UploadFieldPhase,
} from "../../_uploads/DirectUploadField";

import { saveSiteAssetAction } from "./actions";

// One client form per asset slot so we can disable the submit button
// while the direct upload is still in flight. Each slot lives in the
// `public-media` bucket; the server reconstructs the URL from the
// allow-listed prefix before writing the `site_settings` row.
export type AssetSlotKey =
  | "hero_image"
  | "hero_signature"
  | "bandinfo_image";

const TARGET_BY_KEY: Record<AssetSlotKey, string> = {
  hero_image: "site-hero-image",
  hero_signature: "site-hero-signature",
  bandinfo_image: "site-bandinfo-image",
};

export function SiteAssetSlotForm({
  locale,
  slotKey,
}: {
  locale: string;
  slotKey: AssetSlotKey;
}) {
  const [phase, setPhase] = useState<UploadFieldPhase>("idle");
  return (
    <form action={saveSiteAssetAction} className="grid gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="key" value={slotKey} />
      <DirectUploadField
        name="file"
        target={TARGET_BY_KEY[slotKey]}
        kind="image"
        locale={locale}
        label="Neues Bild"
        required
        onPhaseChange={setPhase}
      />
      <div>
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={phase !== "done"}
        >
          Speichern
        </button>
      </div>
    </form>
  );
}
