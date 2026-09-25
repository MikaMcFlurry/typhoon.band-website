import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Martian_Mono, Schibsted_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { DictProvider } from "@/components/i18n/DictProvider";
import { getDict } from "@/i18n/dictionaries";
import { isLocale, LOCALES, OG_LOCALE } from "@/i18n/locales";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";

// Root layout lives in the locale segment so <html lang> always matches the
// rendered language (the old root layout hard-coded lang="de").

// Version B type: stage signage (Big Shoulders), a sturdy grotesk
// for reading (Schibsted Grotesk) and a mono for times, durations and rider
// data (Martian Mono). All self-hosted via next/font (no Google requests
// from the browser). Latin-ext covers Turkish (ğ ı ş İ).
const stage = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-stage",
  display: "swap",
});

const body = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const mono = Martian_Mono({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-mono",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#121110",
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
      languages: {
        de: "/de",
        en: "/en",
        tr: "/tr",
        "x-default": "/de",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Typhoon",
      title: dict.meta.title,
      description: dict.meta.description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
      url: `/${locale}`,
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
      className={`${stage.variable} ${body.variable} ${mono.variable}`}
      lang={locale}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <DictProvider dict={dict} locale={locale}>
          {children}
        </DictProvider>
      </body>
    </html>
  );
}
