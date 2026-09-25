import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { DictProvider } from "@/components/i18n/DictProvider";
import { getDict } from "@/i18n/dictionaries";
import { isLocale, LOCALES } from "@/i18n/locales";
import { languageAlternates, openGraphBase } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { archivo, newsreader } from "../fonts";
import "../globals.css";

// Root layout lives in the locale segment so <html lang> always matches the
// rendered language (the old root layout hard-coded lang="de").

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0e0a07",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  const base = siteUrl();
  return {
    metadataBase: base,
    title: {
      default: dict.meta.title,
      template: "%s · Typhoon",
    },
    description: dict.meta.description,
    applicationName: "Typhoon",
    alternates: {
      canonical: `/${locale}`,
      languages: languageAlternates(),
    },
    openGraph: {
      ...openGraphBase(locale),
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: dict.meta.ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og-image.jpg"],
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <html
      className={`${archivo.variable} ${newsreader.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="font-sans">
        {/* Marks JS support before first paint: only then do collapsed
            lists hide their extra items (no-JS visitors see everything). */}
        <Script id="js-flag" strategy="beforeInteractive">
          {"document.documentElement.setAttribute('data-js','')"}
        </Script>
        <DictProvider dict={dict} locale={locale}>
          {children}
        </DictProvider>
      </body>
    </html>
  );
}
