import Image from "next/image";
import { StagePlot } from "@/components/sections/StagePlot";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import type { Member } from "@/lib/content/types";

// Who plays: the band statement set big, the story next to a live photo
// (Site assets → bandinfo_image), the facts as rider lines, then the line-up
// as a stage plot.

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
    <section aria-labelledby="band-title" className="block-y border-t border-rule bg-deck-2" id="band">
      <div className="shell">
        <h2 className="h-stage reveal max-w-[16ch]" id="band-title">
          {dict.about.headline}
        </h2>

        <div className="mt-12 grid gap-x-12 gap-y-10 md:mt-16 lg:grid-cols-12">
          <figure className="reveal relative lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden bg-deck-3 lg:aspect-[4/5]">
              <Image
                alt={dict.about.imageAlt}
                className="object-cover object-[55%_30%]"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                src={imageUrl}
              />
            </div>
          </figure>

          <div className="lg:col-span-7 lg:pt-2">
            <p className="copy-lg reveal">{dict.about.body}</p>

            <details className="group reveal mt-6">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-chalk hover:text-chalk-2 [&::-webkit-details-marker]:hidden">
                <span className="border-b-[3px] border-gaffer pb-0.5">{dict.about.more}</span>
                <Icon className="transition-transform group-open:rotate-180" name="arrow-down" size={16} />
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                {dict.about.lead.split("\n\n").map((para) => (
                  <p className="copy" key={para.slice(0, 24)}>
                    {para}
                  </p>
                ))}
              </div>
            </details>

            <dl className="reveal mt-10 border-t-2 border-chalk">
              {dict.about.facts.map((f) => (
                <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-rule py-3 sm:grid-cols-[12rem_minmax(0,1fr)]" key={f.label}>
                  <dt className="mono-cap pt-1 text-chalk-2">{f.label}</dt>
                  <dd className="font-stage text-[1.375rem] font-bold uppercase leading-tight">
                    {fill(f.value, { count })}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="reveal mt-8">
              <a className="btn-tape" href="#booking">
                {dict.about.ctaBook}
                <Icon name="arrow-right" size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-24 md:mt-32" id="lineup">
          <h3 className="h-stage-sm reveal">{dict.members.title}</h3>
          <div className="reveal mt-8 md:mt-10">
            <StagePlot
              members={members.map((m) => ({
                id: m.id,
                name: m.name,
                role: m.role,
                bio: m.bio,
                photoUrl: m.photoUrl,
              }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
