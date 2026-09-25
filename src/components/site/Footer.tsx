import Image from "next/image";
import Link from "next/link";
import { ConsentSettingsButton } from "@/components/consent/ConsentSettingsButton";
import { PlatformLinks } from "@/components/site/PlatformLinks";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import type { PlatformLink } from "@/lib/content/types";

export function Footer({
  dict,
  locale,
  email,
  phone,
  platformLinks,
}: {
  dict: Dict;
  locale: Locale;
  email: string;
  phone: string;
  platformLinks: PlatformLink[];
}) {
  const year = new Date().getFullYear();
  const linkClass =
    "inline-flex min-h-11 items-center gap-3 text-paper-2 transition-colors hover:text-gold-hi";

  return (
    <footer className="border-t border-line bg-ink-2" id="contact">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Image
            alt="Typhoon"
            className="h-auto w-[220px] md:w-[260px]"
            height={724}
            sizes="260px"
            src="/assets/branding/typhoon-signature-gold.png"
            width={2099}
          />
          <p className="mt-6 max-w-[42ch] font-display text-[1.1875rem] leading-relaxed text-paper-2">
            {dict.footer.blurb}
          </p>
        </div>

        <div className="md:col-span-3">
          <h2 className="label">{dict.footer.contact}</h2>
          <ul className="mt-4 flex flex-col">
            <li>
              <a className={linkClass} href={`mailto:${email}`}>
                <Icon className="text-gold" name="mail" size={18} />
                {email}
              </a>
            </li>
            <li>
              <a className={linkClass} href={`tel:${phone.replace(/\s+/g, "")}`}>
                <Icon className="text-gold" name="phone" size={18} />
                {phone}
              </a>
            </li>
          </ul>
          {platformLinks.length > 0 ? (
            <>
              <h2 className="label mt-8">{dict.footer.listen}</h2>
              <PlatformLinks className="mt-4" links={platformLinks} variant="icons" />
            </>
          ) : null}
        </div>

        <div className="md:col-span-4 md:pl-8">
          <h2 className="label">{dict.footer.legal}</h2>
          <ul className="mt-4 flex flex-col">
            <li>
              <Link className={linkClass} href={`/${locale}/legal/imprint`}>
                {dict.footer.imprint}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href={`/${locale}/legal/privacy`}>
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <Link className={linkClass} href={`/${locale}/legal/cookies`}>
                {dict.footer.cookies}
              </Link>
            </li>
            <li>
              <ConsentSettingsButton className={linkClass} label={dict.footer.consentSettings} />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-start justify-between gap-4 py-6 text-[0.875rem] text-paper-3 sm:flex-row sm:items-center">
          <p>{dict.footer.copyrightTemplate.replace("{year}", String(year))}</p>
          <a className="inline-flex min-h-11 items-center gap-2 hover:text-gold-hi" href="#top">
            {dict.footer.toTop}
            <Icon name="arrow-up" size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
