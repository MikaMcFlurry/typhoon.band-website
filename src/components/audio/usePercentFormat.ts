"use client";

import { useMemo } from "react";
import { INTL_LOCALE, type Locale } from "@/i18n/locales";

/** Locale-aware percent for aria-valuetext: "80 %" (de), "80%" (en), "%80" (tr). */
export function usePercentFormat(locale: Locale) {
  return useMemo(
    () => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "percent", maximumFractionDigits: 0 }),
    [locale],
  );
}
