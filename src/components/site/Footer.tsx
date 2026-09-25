import Image from "next/image";
import Link from "next/link";
import { ConsentSettingsButton } from "@/components/consent/ConsentSettingsButton";
import { PlatformLinks } from "@/components/site/PlatformLinks";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import type { PlatformLink } from "@/lib/content/types";

// Closing strip: a gaffer label with the contact line (like the label on a
// road case), the signature, contact, platforms and legal.

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
    "inline-flex min-h-11 items-center gap-3 text-chalk-2 transition-colors hover:text-chalk";

  return (
    <footer className="border-t border-rule bg-deck" id="contact">
      <div className="shell pt-14 md:pt-20">
        <p aria-hidden className="mono-cap inline-block max-w-full -rotate-[0.6deg] bg-gaffer px-3 py-2 text-[#121110] [overflow-wrap:anywhere]">
          Typhoon · {email} · {phone}
        </p>
      </div>
      <div className="shell grid gap-12 py-12 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <Image
            alt="Typhoon"
            className="h-auto w-[220px] md:w-[280px]"
            height={724}
            sizes="280px"
            src="/assets/branding/typhoon-signature-gold.png"
            width={2099}
          />
          <p className="copy mt-6 max-w-[40ch]">{dict.footer.blurb}</p>
        </div>

        <div className="md:col-span-4">
          <h2 className="mono-cap text-chalk-3">{dict.footer.contact}</h2>
          <ul className="mt-3 flex flex-col">
            <li>
              <a className={`${linkClass} mono`} href={`mailto:${email}`}>
                <Icon name="mail" size={18} />
                {email}
              </a>
            </li>
            <li>
              <a className={`${linkClass} mono`} href={`tel:${phone.replace(/\s+/g, "")}`}>
                <Icon name="phone" size={18} />
                {phone}
              </a>
            </li>
          </ul>
          {platformLinks.length > 0 ? (
            <>
              <h2 className="mono-cap mt-8 text-chalk-3">{dict.footer.listen}</h2>
              <PlatformLinks className="mt-3" links={platformLinks} variant="icons" />
            </>
          ) : null}
        </div>

        <div className="md:col-span-3">
          <h2 className="mono-cap text-chalk-3">{dict.footer.legal}</h2>
          <ul className="mt-3 flex flex-col">
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
              <ConsentSettingsButton className={`${linkClass} text-left`} label={dict.footer.consentSettings} />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="shell mono flex flex-col items-start justify-between gap-2 py-5 text-chalk-3 sm:flex-row sm:items-center">
          <p>{dict.footer.copyrightTemplate.replace("{year}", String(year))}</p>
          <a className="inline-flex min-h-11 items-center gap-2 hover:text-chalk" href="#top">
            {dict.footer.toTop}
            <Icon name="arrow-up" size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
