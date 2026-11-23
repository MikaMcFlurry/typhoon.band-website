import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/locales";
import { getPublicPageContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

const PATHS = ["", "/legal/imprint", "/legal/privacy", "/legal/cookies"];

// Home entries carry the band images (hero collage, band photo, gallery)
// so they can be found in image search; legal pages are listed plainly.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const content = await getPublicPageContent("de");
  const images = [
    content.hero.imageUrl,
    content.bandInfo.imageUrl,
    ...content.gallery.map((g) => g.src),
  ]
    .filter((src, i, all) => src && all.indexOf(src) === i)
    .map((src) => absoluteUrl(src));

  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("yearly" as const),
      priority: path === "" ? 1 : 0.3,
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}${path}`)])),
          "x-default": absoluteUrl(`/de${path}`),
        },
      },
      ...(path === "" ? { images } : {}),
    })),
  );
}
