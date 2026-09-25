import Image from "next/image";
import { BookingForm } from "@/components/sections/BookingForm";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";

// Booking is the most important production function (docs/phases/01).
// Heading + promoter facts, then the band poster (uncropped, next to the
// form as the owner asked) with direct contact, and the request form with
// its submit button inside.

export function Booking({
  dict,
  email,
  phone,
  memberCount,
  posterUrl,
}: {
  dict: Dict;
  email: string;
  phone: string;
  memberCount: number;
  posterUrl: string;
}) {
  const t = dict.booking;
  const contactLink =
    "inline-flex min-h-11 items-center gap-3 font-display text-[1.25rem] text-paper hover:text-gold-hi md:text-[1.375rem]";

  return (
    <section aria-labelledby="booking-title" className="section" id="booking">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="h-section reveal lg:col-span-7" id="booking-title">
            {t.title}
          </h2>
          <p className="lede reveal lg:col-span-5">{t.intro}</p>
        </div>

        <div className="reveal mt-10 md:mt-14">
          <h3 className="sr-only">{t.factsTitle}</h3>
          <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
            {t.facts.map((f) => (
              <div className="bg-ink px-5 py-4 md:p-5" key={f.label}>
                <dt className="label">{f.label}</dt>
                <dd className="mt-2 text-paper">{fill(f.value, { count: memberCount })}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="reveal lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <BookingForm email={email} />
          </div>

          <aside className="reveal lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <figure>
              <Image
                alt={dict.meta.ogAlt}
                className="h-auto w-full rounded-md border border-line"
                height={2048}
                sizes="(min-width: 1024px) 38vw, 100vw"
                src={posterUrl}
                width={2048}
              />
            </figure>
            <div className="mt-8">
              <p className="label">{t.direct}</p>
              <ul className="mt-2 flex flex-col">
                <li>
                  <a className={contactLink} href={`mailto:${email}`}>
                    <Icon className="text-gold" name="mail" size={20} />
                    {email}
                  </a>
                </li>
                <li>
                  <a className={contactLink} href={`tel:${phone.replace(/\s+/g, "")}`}>
                    <Icon className="text-gold" name="phone" size={20} />
                    {phone}
                  </a>
                </li>
              </ul>
              <p className="mt-2 text-[0.9375rem] text-paper-3">{t.reply}</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
