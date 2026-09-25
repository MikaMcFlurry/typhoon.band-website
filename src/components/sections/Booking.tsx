import { BookingForm } from "@/components/sections/BookingForm";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";

// Booking, the rider: the heading is the page's orange tape, facts for
// promoters and the direct line on the left, the request form on the
// right with a live preview of the request (as it will arrive) right above
// the submit button.

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
    "inline-flex min-h-11 items-center gap-3 font-stage text-[1.5rem] font-extrabold uppercase leading-none [overflow-wrap:anywhere] hover:underline hover:decoration-2 hover:underline-offset-4";

  const aside = (
    <>
      <h2 className="h-stage" id="booking-title">
        <span className="lay tape tape-orange -rotate-[1deg]">{t.title}</span>
      </h2>
      <p className="copy-lg mt-6">{t.intro}</p>

      <h3 className="sr-only">{t.factsTitle}</h3>
      <dl className="mt-8 border-t-2 border-chalk">
        {t.facts.map((f) => (
          <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-4 border-b border-rule py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]" key={f.label}>
            <dt className="mono-cap pt-0.5 text-chalk-2">{f.label}</dt>
            <dd className="text-[1rem] leading-snug">{fill(f.value, { count: memberCount })}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-8 flex flex-col" aria-label={t.direct}>
        <li>
          <a className={contactLink} href={`mailto:${email}`}>
            <Icon className="flex-none text-chalk-2" name="mail" size={22} />
            {email}
          </a>
        </li>
        <li>
          <a className={contactLink} href={`tel:${phone.replace(/\s+/g, "")}`}>
            <Icon className="flex-none text-chalk-2" name="phone" size={22} />
            {phone}
          </a>
        </li>
      </ul>
      <p className="mt-2 text-[0.9375rem] text-chalk-2">{t.reply}</p>
    </>
  );

  return (
    <section aria-labelledby="booking-title" className="block-y border-t border-rule" id="booking">
      <div className="shell">
        <BookingForm aside={aside} email={email} />
      </div>
    </section>
  );
}
