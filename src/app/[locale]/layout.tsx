import { notFound } from "next/navigation";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const locales = ["de", "en", "tr"] as const;
type Locale = (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <AudioPlayerProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </AudioPlayerProvider>
  );
}
