"use client";

import Image from "next/image";
import { useDict } from "@/components/i18n/DictProvider";
import { SectionHeader } from "@/components/sections/SectionHeader";

// Member list shape passed in from the server. The content provider
// (`getMembers()`) merges Supabase rows with the static fallback so the
// Admin can replace photos without touching the design here.
export type MemberCard = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  isPlaceholder: boolean;
};

export function Members({ members }: { members: MemberCard[] }) {
  const { dict } = useDict();
  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="band">
      <SectionHeader kicker={dict.members.kicker} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-4 md:gap-3">
        {members.map((m) => (
          <article
            className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.55)] transition hover:border-[color:var(--line-strong)]"
            key={m.id}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[rgba(11,8,5,0.85)]">
              <Image
                alt={`${m.name} – ${dict.members.instrument[m.id] ?? m.role}`}
                className="h-full w-full object-cover sepia-img"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                src={m.photoUrl}
              />
              {m.isPlaceholder ? (
                <span
                  className="absolute right-2 top-2 rounded-full border border-[color:var(--line)] bg-[rgba(3,2,1,0.7)] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-cream)] backdrop-blur-sm md:text-[9px]"
                  title="Placeholder"
                >
                  Platzhalter
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5 p-3 md:p-4">
              <h3 className="m-0 font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-[color:var(--cream)] md:text-[17px]">
                {m.name}
              </h3>
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[color:var(--gold-soft)] md:text-[10px]">
                {dict.members.instrument[m.id] ?? m.role}
              </span>
              <p className="m-0 text-[11px] leading-[1.55] text-[color:var(--muted-cream)] md:text-[12px]">
                {dict.members.bio[m.id] ?? m.bio}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
