import { LegalPageView, legalMetadata } from "@/components/legal/LegalPage";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return legalMetadata("imprint", locale);
}

export default async function ImprintPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPageView rawLocale={locale} type="imprint" />;
}
