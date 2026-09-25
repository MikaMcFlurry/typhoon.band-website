import { BookingForm } from "@/components/sections/BookingForm";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";

// Booking is the one orange field on the page: the rider. Facts for
// promoters and the direct line on the left, the request form (dark, on
// the orange) on the right, with a live preview of the request as it will
// arrive.

export function Booking({
  dict,
  email,
  phone,
  memberCount,
}: {
  dict: Dict;
  email: string;
  phone: string;
  memberCount: number;
}) {
  const t = dict.booking;
  const contactLink =
    "inline-flex min-h-11 items-center gap-3 font-stage text-[1.5rem] font-extrabold uppercase leading-none break-all hover:underline hover:decoration-2 hover:underline-offset-4";

  const aside = (
    <>
      <h2 className="h-stage" id="booking-title">
        {t.title}
      </h2>
      <p className="mt-5 max-w-[46ch] text-[1.125rem] leading-relaxed">{t.intro}</p>

      <h3 className="sr-only">{t.factsTitle}</h3>
      <dl className="mt-8 border-t-2 border-[#121110]">
        {t.facts.map((f) => (
          <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-4 border-b border-[rgba(18,17,16,0.3)] py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]" key={f.label}>
            <dt className="mono-cap pt-0.5">{f.label}</dt>
            <dd className="text-[1rem] font-medium leading-snug">{fill(f.value, { count: memberCount })}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <p className="mono-cap">{t.direct}</p>
        <ul className="mt-2 flex flex-col">
          <li>
            <a className={contactLink} href={`mailto:${email}`}>
              <Icon name="mail" size={22} />
              {email}
            </a>
          </li>
          <li>
            <a className={contactLink} href={`tel:${phone.replace(/\s+/g, "")}`}>
              <Icon name="phone" size={22} />
              {phone}
            </a>
          </li>
        </ul>
        <p className="mono mt-2">{t.reply}</p>
      </div>
    </>
  );

  return (
    <section
      aria-labelledby="booking-title"
      className="block-y bg-orange text-[#121110] [--focus:#121110]"
      id="booking"
    >
      <div className="shell">
        <BookingForm aside={aside} email={email} />
      </div>
    </section>
  );
}
