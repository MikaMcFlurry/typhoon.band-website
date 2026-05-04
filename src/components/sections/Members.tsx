import Image from "next/image";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { members } from "@/data/members";

export function Members() {
  return (
    <section className="mx-auto mt-10 max-w-container px-4 md:mt-12 md:px-8" id="band">
      <SectionHeader kicker="Band Mitglieder" />
      <div className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-3">
        {members.map((m) => (
          <article className="flex flex-col gap-2" key={m.id}>
            <div className="aspect-square overflow-hidden rounded border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)]">
              <Image
                alt={`${m.name} – ${m.role}`}
                className="h-full w-full object-cover sepia-img transition duration-500 hover:scale-105"
                height={240}
                src={m.photo}
                width={240}
              />
            </div>
            <div className="text-center">
              <div className="text-[11px] font-semibold leading-tight text-[color:var(--cream)] md:text-xs">
                {m.name}
              </div>
              <div className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-[color:var(--muted-cream)] md:text-[9px]">
                {m.role}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
