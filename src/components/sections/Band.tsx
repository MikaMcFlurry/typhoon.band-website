import Image from "next/image";
import { CollapsibleList } from "@/components/ui/Collapsible";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import type { Member } from "@/lib/content/types";

// Band story as an editorial split (image left, text right; the longer
// text sits behind a disclosure) followed by the line-up with bios.

export function Band({
  dict,
  imageUrl,
  members,
}: {
  dict: Dict;
  imageUrl: string;
  members: Member[];
}) {
  const count = members.length;

  return (
    <section aria-labelledby="band-title" className="section border-t border-line bg-ink-2" id="band">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <figure className="reveal relative lg:col-span-5">
            <div className="grain relative aspect-[4/5] overflow-hidden rounded-md border border-line">
              <Image
                alt={dict.about.imageAlt}
                className="object-cover object-[60%_30%]"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                src={imageUrl}
                style={{ filter: "sepia(0.18) saturate(0.95) contrast(1.05)" }}
              />
            </div>
          </figure>

          <div className="lg:col-span-7 lg:pt-6">
            <h2 className="h-section reveal max-w-[18ch] lg:text-[clamp(2.75rem,1.4rem+2.6vw,4.25rem)]" id="band-title">
              {dict.about.headline}
            </h2>
            <p className="prose-body reveal mt-8 text-[1.1875rem] text-paper">
              {dict.about.body}
            </p>

            <details className="group reveal mt-6">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-gold-hi hover:text-paper [&::-webkit-details-marker]:hidden">
                {dict.about.more}
                <Icon className="transition-transform group-open:rotate-180" name="arrow-down" size={16} />
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                {dict.about.lead.split("\n\n").map((para) => (
                  <p className="prose-body" key={para.slice(0, 24)}>
                    {para}
                  </p>
                ))}
              </div>
            </details>

            <dl className="reveal mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {dict.about.facts.map((f) => (
                <div key={f.label}>
                  <dt className="label">{f.label}</dt>
                  <dd className="mt-2 font-display text-[1.25rem] leading-snug text-paper">
                    {fill(f.value, { count })}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="reveal mt-10 flex flex-wrap gap-3">
              <a className="btn btn-secondary" href="#lineup">
                {dict.about.cta}
                <Icon name="arrow-down" size={16} />
              </a>
              <a className="btn btn-primary" href="#booking">
                {dict.about.ctaBook}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-24 scroll-mt-[calc(var(--header-h)+16px)] md:mt-32" id="lineup">
          <h3 className="h-sub reveal">{dict.members.title}</h3>
          <CollapsibleList
            className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4"
            initial={4}
            lessLabel={dict.members.showLess}
            moreLabel={dict.members.showAll}
          >
            {members.map((m, i) => (
              <li className="reveal" key={m.id} style={{ ["--reveal-delay" as string]: `${(i % 4) * 60}ms` }}>
                <article>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-ink-3">
                    <Image
                      alt={`${m.name}, ${m.role}`}
                      className="object-cover object-top sepia-img"
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 50vw"
                      src={m.photoUrl}
                    />
                  </div>
                  <h4 className="mt-4 font-display text-[1.375rem] leading-tight text-paper md:text-[1.5rem]">
                    {m.name}
                  </h4>
                  <p className="mt-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-gold-hi">
                    {m.role}
                  </p>
                  {m.bio ? (
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-paper-2">{m.bio}</p>
                  ) : null}
                </article>
              </li>
            ))}
          </CollapsibleList>
        </div>
      </div>
    </section>
  );
}
