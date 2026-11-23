import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/locales";
import { getBandInfo, getGalleryItems, getHeroContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

const PATHS = ["", "/legal/imprint", "/legal/privacy", "/legal/cookies"];

// Regenerated at most hourly, so new Admin images show up without a deploy.
export const revalidate = 3600;

// Home entries carry the band images (hero collage, band photo, gallery)
// so they can be found in image search; legal pages are listed plainly.
// No lastmod: there is no reliable per-page change date, and a timestamp
// that changes on every regeneration teaches crawlers to ignore it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hero, band, gallery] = await Promise.all([
    getHeroContent("de"),
    getBandInfo("de"),
    getGalleryItems("de"),
  ]);
  const images = [hero.imageUrl, band.imageUrl, ...gallery.map((g) => g.src)]
    .filter((src, i, all) => src && all.indexOf(src) === i)
    .map((src) => absoluteUrl(src));

  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(`/${locale}${path}`),
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
