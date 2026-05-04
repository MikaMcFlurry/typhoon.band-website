import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Typhoon — Funk · Soul · Jazz · Bluesrock",
    template: "%s · Typhoon",
  },
  description:
    "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable} lang="de">
      <body className="font-sans">{children}</body>
    </html>
  );
}
