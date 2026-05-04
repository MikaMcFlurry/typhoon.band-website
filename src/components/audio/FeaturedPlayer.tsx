"use client";

import Image from "next/image";
import {
  formatTime,
  useAudioPlayer,
} from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import type { Song } from "@/data/songs";

type Props = {
  song: Song;
  cover: string;
  releaseTag?: string;
  artist?: string;
};

// Layout matches handoff/desktop.html `.audio-card` and handoff/mobile.html
// `.audio-card-m` exactly:
//   desktop: padding 18px 24px; cover 76x76; controls grid 46/36/36/1fr/auto/auto/auto
//   mobile : padding 12px 14px; cover 56x56; controls grid 30/30/1fr/auto/auto
// Behaviour comes from AudioPlayerProvider + Waveform (old Claude branch).
export function FeaturedPlayer({
  song,
  cover,
  releaseTag = "Aktueller Demo · Single",
  artist = "Typhoon",
}: Props) {
  const { currentId, isPlaying, position, duration, toggle, seek } =
    useAudioPlayer();
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;
  const positionLabel = formatTime(isCurrent ? position : 0);
  const durationLabel = isCurrent && duration ? formatTime(duration) : "—";

  return (
    <div className="relative z-20 mx-auto -mt-9 w-full max-w-container px-4 md:-mt-12 md:px-8">
      <div
        className="rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.92)] px-[14px] py-3 backdrop-blur-md md:rounded-[8px] md:bg-[rgba(11,8,5,0.86)] md:px-6 md:py-[18px]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.04), 0 22px 44px rgba(0,0,0,0.5)",
        }}
      >
        {/* Top row: cover + meta */}
        <div className="mb-2 grid grid-cols-[56px_1fr] items-center gap-3 md:mb-[14px] md:grid-cols-[76px_1fr] md:gap-[18px]">
          <div className="h-14 w-14 overflow-hidden rounded-[4px] border border-[color:var(--line)] md:h-[76px] md:w-[76px] md:rounded-[6px]">
            <Image
              alt=""
              className="h-full w-full object-cover sepia-img"
              height={152}
              src={cover}
              width={152}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[2px] md:gap-1">
            <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] md:text-[10px]">
              {releaseTag}
            </span>
            <h3 className="m-0 font-display text-base font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--cream)] md:text-[22px] md:leading-tight">
              {song.title}
            </h3>
            <span className="text-[11px] text-[color:var(--muted-cream)] md:text-[13px]">
              {artist}
            </span>
          </div>
        </div>

        {/* Mobile controls (5-col) */}
        <div className="grid grid-cols-[30px_30px_minmax(0,1fr)_auto_auto] items-center gap-2 border-t border-[color:var(--line)] pt-2 md:hidden">
          <button
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[rgba(232,201,130,0.55)] bg-[linear-gradient(180deg,#e8c982_0%,#b8873b_100%)] text-[#060403]"
            onClick={() => toggle(song.id, song.src)}
            type="button"
          >
            {playing ? (
              <PauseIcon size={11} />
            ) : (
              <PlayIcon className="ml-[1px]" size={11} />
            )}
          </button>
          <button
            aria-label="Nächster Track"
            className="flex h-[30px] w-[30px] items-center justify-center text-[color:var(--muted-cream)]"
            disabled
            type="button"
          >
            <NextIcon size={14} />
          </button>
          <Waveform
            bars={36}
            className="min-w-0"
            heightClass="h-[22px]"
            onSeek={(ratio) => seek(song.id, ratio)}
            songId={song.id}
          />
          <span className="whitespace-nowrap text-[10px] tabular-nums text-[color:var(--muted-cream)]">
            {positionLabel} / {durationLabel}
          </span>
          <span
            aria-hidden
            className="px-1 text-base leading-none text-[color:var(--muted-cream)]"
          >
            ⋯
          </span>
        </div>

        {/* Desktop controls (7-col) */}
        <div className="hidden grid-cols-[46px_36px_36px_minmax(0,1fr)_auto_auto_auto] items-center gap-4 border-t border-[color:var(--line)] pt-[14px] md:grid">
          <button
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-[rgba(232,201,130,0.6)] bg-[linear-gradient(180deg,#e8c982_0%,#b8873b_100%)] text-[#060403] transition hover:brightness-110"
            onClick={() => toggle(song.id, song.src)}
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.4)",
            }}
            type="button"
          >
            {playing ? <PauseIcon size={14} /> : <PlayIcon className="ml-[2px]" size={14} />}
          </button>
          <button
            aria-label="Vorheriger Track"
            className="flex h-9 w-9 items-center justify-center text-[color:var(--muted-cream)] transition hover:text-[color:var(--gold-soft)]"
            disabled
            type="button"
          >
            <PrevIcon size={18} />
          </button>
          <button
            aria-label="Nächster Track"
            className="flex h-9 w-9 items-center justify-center text-[color:var(--muted-cream)] transition hover:text-[color:var(--gold-soft)]"
            disabled
            type="button"
          >
            <NextIcon size={18} />
          </button>
          <Waveform
            bars={64}
            heightClass="h-9"
            onSeek={(ratio) => seek(song.id, ratio)}
            songId={song.id}
          />
          <span className="whitespace-nowrap px-2 text-xs tabular-nums text-[color:var(--muted-cream)]">
            {positionLabel} / {durationLabel}
          </span>
          <div className="flex items-center gap-2 border-l border-[color:var(--line)] pl-[14px] text-[color:var(--muted-cream)]">
            <VolumeIcon size={16} />
          </div>
          <span
            aria-hidden
            className="cursor-default px-1 text-[22px] leading-none text-[color:var(--muted-cream)]"
          >
            ⋯
          </span>
        </div>
      </div>
    </div>
  );
}

function PlayIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg aria-hidden fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function PrevIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
    </svg>
  );
}

function NextIcon({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
    </svg>
  );
}

function VolumeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      width={size}
    >
      <polygon fill="currentColor" points="11 5 6 9 2 9 2 15 6 15 11 19" />
      <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}
