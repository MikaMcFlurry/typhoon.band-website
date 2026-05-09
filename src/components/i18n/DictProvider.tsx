"use client";

import { createContext, useContext } from "react";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

type Value = { dict: Dict; locale: Locale };
const Ctx = createContext<Value | null>(null);

export function DictProvider({
  children,
  dict,
  locale,
}: {
  children: React.ReactNode;
  dict: Dict;
  locale: Locale;
}) {
  return <Ctx.Provider value={{ dict, locale }}>{children}</Ctx.Provider>;
}

export function useDict(): Value {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDict must be used within DictProvider");
  return ctx;
}
