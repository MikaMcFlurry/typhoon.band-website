import { BookingForm } from "@/components/sections/BookingForm";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";

// Booking, the rider: the heading is the page's orange tape, then the
// direct line (mail, phone) and the request form with a live preview of
// the request and the reply time right at the submit button. The rider facts
// for promoters follow the form on phones and sit under the direct line
// from lg, so the booking link always lands close to the first field.

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

  const intro = (
    <>
      <h2 className="h-stage" id="booking-title">
        <span className="lay tape tape-orange -rotate-[1deg]">{t.title}</span>
      </h2>
      <p className="copy-lg mt-6">{t.intro}</p>

      <ul className="mt-6 flex flex-col" aria-label={t.direct}>
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
    </>
  );

  const facts = (
    <>
      <h3 className="mono-cap text-chalk-2">{t.factsTitle}</h3>
      <dl className="mt-3 border-t-2 border-chalk">
        {t.facts.map((f) => (
          <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-4 border-b border-rule py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)]" key={f.label}>
            <dt className="mono-cap pt-0.5 text-chalk-2">{f.label}</dt>
            <dd className="text-[1rem] leading-snug">{fill(f.value, { count: memberCount })}</dd>
          </div>
        ))}
      </dl>
    </>
  );

  return (
    <section aria-labelledby="booking-title" className="block-y border-t border-rule" id="booking">
      <div className="shell">
        <BookingForm email={email} facts={facts} intro={intro} />
      </div>
    </section>
  );
}
