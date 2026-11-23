import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";

// Promoter questions, answered like notes on the rider: numbered rows
// under a 2px chalk rule, each a native <details> (keyboard and screen
// reader support for free, readable without JS). Every answer is built
// from the owner's booking facts; nothing here promises prices, set
// lengths or tech the band has not confirmed. The section ends on the
// booking tape, so the last scroll position still leads to the request.

export function faqItems(dict: Dict, memberCount: number) {
  return dict.faq.items.map((item) => ({
    q: item.q,
    a: fill(item.a, { count: memberCount }),
  }));
}

export function Faq({
  dict,
  memberCount,
  phone,
}: {
  dict: Dict;
  memberCount: number;
  phone: string;
}) {
  const items = faqItems(dict, memberCount);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-title" className="block-y border-t border-rule bg-deck-2" id="faq">
      {/* Phones: heading, the questions, then the booking tape. From lg the
          heading and the tape share the left column. */}
      <div className="shell grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-8">
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <h2 className="h-stage-sm reveal max-w-[14ch] !text-[clamp(2.25rem,1.5rem+3vw,4rem)]" id="faq-title">
            {dict.faq.title}
          </h2>
          <p className="copy reveal mt-5">{dict.faq.intro}</p>
        </div>

        <ol className="reveal border-t-2 border-chalk lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
          {items.map((item, i) => (
            <li className="border-b border-rule" key={item.q}>
              <details className="group" open={i === 0}>
                <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[2rem_minmax(0,1fr)_1.5rem] items-center gap-x-3 py-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] sm:gap-x-4 [&::-webkit-details-marker]:hidden">
                  <span aria-hidden className="mono text-chalk-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-stage text-[1.375rem] font-extrabold uppercase leading-[1.05] sm:text-[1.625rem] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                    {item.q}
                  </span>
                  <Icon
                    className="justify-self-end text-chalk-2 transition-transform group-open:rotate-180"
                    name="arrow-down"
                    size={18}
                  />
                </summary>
                <p className="copy pb-5 pl-[calc(2rem+0.75rem)] pr-2 sm:pl-[calc(2.5rem+1rem)]">{item.a}</p>
              </details>
            </li>
          ))}
        </ol>

        <div className="reveal flex flex-col items-start gap-3 lg:col-span-5 lg:col-start-1 lg:row-start-2">
          <a className="btn-tape" href="#booking">
            {dict.hero.ctaBook}
            <Icon name="arrow-right" size={20} />
          </a>
          <a
            className="mono inline-flex min-h-11 items-center gap-3 text-chalk-2 transition-colors hover:text-chalk"
            href={`tel:${phone.replace(/\s+/g, "")}`}
          >
            <Icon name="phone" size={18} />
            {phone}
          </a>
        </div>
      </div>
    </section>
  );
}
