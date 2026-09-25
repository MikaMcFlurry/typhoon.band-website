"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";

// The line-up as a stage plot seen from above: every musician is a green
// spike-tape mark at their place on stage (singer front centre, horns
// stage left, rhythm section and guitars stage right). Marks are tabs;
// the panel shows photo, name, role and bio. Names, roles and bios come
// from the live data per slot — nothing here hard-codes a name. Slots the
// plot does not know are listed below it.

export type PlotMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
};

// Schematic positions (percent of the stage area; y grows towards the
// audience), the way the band stands: drums on the riser back centre, bass
// beside it, the horn line stage left, guitars stage right, vocal front
// centre. Keyed by the fixed Admin slot, not by a name.
const POSITIONS: Record<string, { x: number; y: number }> = {
  tom: { x: 50, y: 15 },
  stefan: { x: 80, y: 18 },
  hardy: { x: 15, y: 18 },
  schack: { x: 23, y: 41 },
  mika: { x: 31, y: 64 },
  bugra: { x: 82, y: 44 },
  jurgen: { x: 70, y: 66 },
  typhoon: { x: 50, y: 74 },
};

const MONITORS = [26, 40, 54, 68];

export function StagePlot({ members }: { members: PlotMember[] }) {
  const { dict } = useDict();
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (members.length === 0) return null;
  const onPlot = members.filter((m) => POSITIONS[m.id]);
  const offPlot = members.filter((m) => !POSITIONS[m.id]);
  const current = members[Math.min(selected, members.length - 1)];

  function focusTab(index: number) {
    const next = (index + members.length) % members.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(members.length - 1);
    }
  }

  const tab = (m: PlotMember, floating: boolean) => {
    const index = members.indexOf(m);
    const isSel = index === selected;
    const pos = POSITIONS[m.id];
    return (
      <button
        aria-controls={`${baseId}-panel-${index}`}
        aria-selected={isSel}
        className={`group flex flex-col items-center gap-1.5 ${
          floating ? "absolute w-[28%] -translate-x-1/2 -translate-y-1/2" : "w-auto"
        }`}
        id={`${baseId}-tab-${index}`}
        key={m.id}
        onClick={() => setSelected(index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        ref={(el) => {
          tabRefs.current[index] = el;
        }}
        role="tab"
        style={floating && pos ? { left: `${pos.x}%`, top: `${pos.y}%` } : undefined}
        tabIndex={isSel ? 0 : -1}
        type="button"
      >
        {/* Spike mark: two crossed strips of green tape. */}
        <span aria-hidden className="live-mark relative block size-6 lg:size-8" data-live="">
          <span className={`absolute left-0 top-1/2 h-[5px] w-full -translate-y-1/2 ${isSel ? "bg-green" : "bg-green/70"}`} />
          <span className={`absolute left-1/2 top-0 h-full w-[5px] -translate-x-1/2 ${isSel ? "bg-green" : "bg-green/70"}`} />
        </span>
        <span
          className={`max-w-full truncate px-1.5 py-0.5 font-stage text-[0.9375rem] font-extrabold uppercase leading-tight sm:text-[1.1875rem] lg:text-[1.375rem] ${
            isSel ? "bg-green text-[#121110]" : "bg-gaffer text-[#121110] group-hover:bg-chalk"
          }`}
        >
          {m.name}
        </span>
        <span className={`mono-cap hidden max-w-full truncate sm:block ${isSel ? "text-green" : "text-chalk-2"}`}>
          {m.role}
        </span>
      </button>
    );
  };

  return (
    <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div aria-label={dict.stage.plotLabel} role="tablist">
          <div className="relative aspect-[1/1.05] border-2 border-rule-2 sm:aspect-[16/11]">
            {/* Drum riser */}
            <span aria-hidden className="absolute left-1/2 top-[3%] h-[27%] w-[32%] -translate-x-1/2 border border-dashed border-rule-2">
              <span className="mono-cap absolute bottom-1 left-1.5 text-chalk-3">{dict.stage.riser}</span>
            </span>
            {/* Monitor wedges along the front edge */}
            {MONITORS.map((x, i) => (
              <span
                aria-hidden
                className="mono-cap absolute bottom-[2.5%] flex h-[6%] w-[11%] items-center justify-center border border-rule-2 text-chalk-3"
                key={x}
                style={{ left: `${x}%` }}
              >
                <span className="hidden sm:inline">{dict.stage.monitor}&nbsp;</span>
                {i + 1}
              </span>
            ))}
            {onPlot.map((m) => tab(m, true))}
          </div>
          <p aria-hidden className="mono-cap mt-2 border-t-[3px] border-chalk pt-2 text-center text-chalk-2">
            {dict.stage.audience}
          </p>
          {offPlot.length > 0 ? (
            <div className="mt-6">
              <p className="mono-cap text-chalk-3">{dict.stage.more}</p>
              <div className="mt-3 flex flex-wrap gap-4">{offPlot.map((m) => tab(m, false))}</div>
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-[0.9375rem] text-chalk-2">{dict.stage.plotHint}</p>
      </div>

      <div className="lg:col-span-5">
        {members.map((m, index) => (
          <div
            aria-labelledby={`${baseId}-tab-${index}`}
            hidden={m !== current}
            id={`${baseId}-panel-${index}`}
            key={m.id}
            role="tabpanel"
            tabIndex={0}
          >
            <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-5 gap-y-5 sm:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-1">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-deck-3 lg:max-w-[380px]">
                <Image
                  alt={`${m.name}, ${m.role}`}
                  className="object-cover object-top"
                  fill
                  sizes="(min-width: 1024px) 380px, 180px"
                  src={m.photoUrl}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-stage text-[2.25rem] font-black uppercase leading-[0.9] sm:text-[2.75rem]">
                  {m.name}
                </h4>
                <p className="mt-3">
                  <span className="tape tape-green mono-cap !px-1.5 !py-1">{m.role}</span>
                </p>
                {m.bio ? <p className="copy mt-4">{m.bio}</p> : null}
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
