import Image from "next/image";
import type { Member } from "@/lib/content/types";

// The line-up as a row of backstage passes: photo (one monochrome
// treatment so colour snapshots and sepia crops read as one set), name on gaffer tape,
// instrument on green tape, short bio. No stage positions — the band has
// no fixed placement on stage. Names, roles, bios and photos come from the
// live data per slot; nothing here hard-codes a name.

export function Lineup({ members }: { members: Member[] }) {
  if (members.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {members.map((m, i) => (
        <li
          className="reveal"
          key={m.id}
          style={{ ["--reveal-delay" as string]: `${(i % 4) * 60}ms` }}
        >
          <article>
            <div className="relative aspect-[4/5] overflow-hidden bg-deck-3">
              <Image
                alt={`${m.name}, ${m.role}`}
                className="object-cover object-top grayscale contrast-[1.08]"
                fill
                sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 50vw"
                src={m.photoUrl}
              />
            </div>
            <h4 className="-mt-5 ml-2 font-stage text-[1.625rem] font-black uppercase leading-none sm:text-[2rem]">
              <span className={`tape relative ${i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"} inline-block max-w-full [overflow-wrap:break-word]`}>
                {m.name}
              </span>
            </h4>
            <p className="mt-3">
              <span className="tape tape-green mono-cap !px-1.5 !py-1">{m.role}</span>
            </p>
            {m.bio ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-chalk-2">{m.bio}</p> : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
