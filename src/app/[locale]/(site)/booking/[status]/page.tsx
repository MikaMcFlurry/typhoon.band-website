import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getDict, type Dict } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { getSiteSettings } from "@/lib/content";
import { BOOKING_STATUS_SLUGS, type BookingStatusSlug } from "@/lib/booking-status";
import { openGraphBase } from "@/lib/seo";

// Result page for a booking request sent without JavaScript (the enhanced
// form shows the same messages inline). Static per locale and status.

export const dynamicParams = false;
// Header/footer and the contact address come from Supabase; refresh like
// the legal pages.
export const revalidate = 300;

export function generateStaticParams() {
  return BOOKING_STATUS_SLUGS.map((status) => ({ status }));
}

function isStatus(v: string): v is BookingStatusSlug {
  return (BOOKING_STATUS_SLUGS as readonly string[]).includes(v);
}

function copy(dict: Dict, status: BookingStatusSlug) {
  const t = dict.booking;
  switch (status) {
    case "sent":
      return { title: t.submitOkTitle, body: t.submitOk, ok: true };
    case "fallback":
      return { title: t.result.fallbackTitle, body: t.submitFallback, ok: false };
    case "invalid":
      return { title: t.result.invalidTitle, body: t.result.invalidBody, ok: false };
    case "rate-limited":
      return { title: t.result.rateTitle, body: t.errors.rate, ok: false };
    default:
      return { title: t.result.errorTitle, body: t.submitError, ok: false };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; status: string }>;
}): Promise<Metadata> {
  const { locale: raw, status } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  if (!isStatus(status)) return {};
  const path = `/${locale}/booking/${status}`;
  return {
    title: copy(getDict(locale), status).title,
    robots: { index: false, follow: false },
    // Replace the inherited home canonical/hreflang and og:url.
    alternates: { canonical: path },
    openGraph: { ...openGraphBase(locale, `/booking/${status}`) },
  };
}

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ locale: string; status: string }>;
}) {
  const { locale: raw, status } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  if (!isStatus(status)) notFound();
  const dict = getDict(locale);
  const settings = await getSiteSettings();
  const c = copy(dict, status);
  const email = settings.contactBookingEmail;

  return (
    <section className="container-x flex min-h-[70svh] flex-col items-start justify-center pb-24 pt-[calc(var(--header-h)+48px)]">
      <span
        className={`inline-flex size-12 items-center justify-center rounded-full ${
          c.ok ? "bg-gold text-on-gold" : "border border-line-2 text-gold-hi"
        }`}
      >
        <Icon name={c.ok ? "check" : "mail"} size={24} />
      </span>
      <h1 className="h-section mt-6 max-w-[20ch]">{c.title}</h1>
      <p className="lede mt-6">{c.body}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        {status === "sent" ? (
          <Link className="btn btn-primary" href={`/${locale}`}>
            <Icon name="arrow-left" size={18} />
            {dict.notFound.cta}
          </Link>
        ) : status === "fallback" ? (
          <>
            <a className="btn btn-primary" href={`mailto:${email}`}>
              <Icon name="mail" size={18} />
              {email}
            </a>
            <Link className="btn btn-secondary" href={`/${locale}#booking`}>
              <Icon name="arrow-left" size={18} />
              {dict.booking.result.back}
            </Link>
          </>
        ) : (
          <>
            <Link className="btn btn-primary" href={`/${locale}#booking`}>
              <Icon name="arrow-left" size={18} />
              {dict.booking.result.back}
            </Link>
            <a className="btn btn-secondary" href={`mailto:${email}`}>
              <Icon name="mail" size={18} />
              {email}
            </a>
          </>
        )}
      </div>
    </section>
  );
}
