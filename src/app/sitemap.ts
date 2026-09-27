import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/locales";
import { absoluteUrl } from "@/lib/site-url";

const PATHS = ["", "/legal/imprint", "/legal/privacy", "/legal/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("yearly" as const),
      priority: path === "" ? 1 : 0.3,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}${path}`)])),
      },
    })),
  );
}
