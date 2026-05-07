"use client";

import Image from "next/image";
import {
  formatTime,
  useAudioPlayer,
} from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import { useDict } from "@/components/i18n/DictProvider";
import type { Song } from "@/data/songs";

type Props = {
  song: Song;
  cover: string;
  artist?: string;
};

// Layout matches handoff `.audio-card`/`.audio-card-m`. Buttons now wired
// to real provider actions: toggle / next / previous / setVolume /
// toggleMute. The waveform column uses `flex-1` semantics through grid
// `minmax(0,1fr)` so it fills all space between play controls and the
// time/volume cluster.
export function FeaturedPlayer({ song, cover, artist = "Typhoon" }: Props) {
  const player = useAudioPlayer();
  const {
    currentId,
    isPlaying,
    position,
    duration,
    volume,
    muted,
    toggle,
    seek,
    next,
    previous,
    toggleMute,
  } = player;
  const { dict } = useDict();
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;
  const positionLabel = formatTime(isCurrent ? position : 0);
  const durationLabel = isCurrent && duration ? formatTime(duration) : "—";
  const volumePct = Math.round((muted ? 0 : volume) * 100);

  return (
    <div className="relative z-20 mx-auto -mt-9 w-full max-w-container px-4 md:-mt-12 md:px-8">
      <div
        className="overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.92)] px-4 py-4 backdrop-blur-md md:bg-[rgba(11,8,5,0.86)] md:px-6 md:py-5"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.04), 0 22px 44px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Top row: cover + meta ───────────────────────────────────── */}
        <div className="mb-3 grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 md:mb-4 md:grid-cols-[76px_minmax(0,1fr)] md:gap-[18px]">
          <div className="h-14 w-14 overflow-hidden rounded-md border border-[color:var(--line)] md:h-[76px] md:w-[76px]">
            <Image
              alt=""
              className="h-full w-full object-cover sepia-img"
              height={152}
              src={cover}
              width={152}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-[2px] md:gap-1">
            <span className="eyebrow text-[8px] md:text-[10px]">
              {dict.demos.featuredTag}
            </span>
            <h3 className="m-0 truncate font-display text-[17px] font-bold leading-tight tracking-[-0.02em] text-[color:var(--cream)] md:text-[24px]">
              {song.title}
            </h3>
            <span className="text-[11px] text-[color:var(--muted-cream)] md:text-[13px]">
              {artist}
            </span>
          </div>
        </div>

        {/* ── Mobile controls ────────────────────────────────────────── */}
        <div className="grid grid-cols-[36px_30px_minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[color:var(--line)] pt-3 md:hidden">
          <button
            aria-label={playing ? dict.player.pause : dict.player.play}
            className="btn-icon btn-icon-sm"
            onClick={() => toggle(song.id, song.src)}
            type="button"
          >
            {playing ? <PauseIcon size={12} /> : <PlayIcon className="ml-[1px]" size={12} />}
          </button>
          <button aria-label={dict.player.next} className="btn-ghost-icon" onClick={next} type="button">
            <NextIcon size={14} />
          </button>
          <Waveform
            bars={32}
            className="min-w-0 flex-1"
            heightClass="h-[24px]"
            onSeek={(ratio) => seek(song.id, ratio)}
            songId={song.id}
          />
          <span className="whitespace-nowrap text-[10px] tabular-nums text-[color:var(--muted-cream)]">
            {positionLabel} / {durationLabel}
          </span>
          <button
            aria-label={muted ? dict.player.unmute : dict.player.mute}
            className="btn-ghost-icon"
            onClick={toggleMute}
            title={`${dict.player.mute} (${volumePct}%)`}
            type="button"
          >
            {muted || volume === 0 ? <VolumeMutedIcon size={14} /> : <VolumeIcon size={14} />}
          </button>
        </div>

        {/* ── Desktop controls (waveform fills all free width) ────────── */}
        <div className="hidden grid-cols-[44px_36px_36px_minmax(0,1fr)_auto_auto_auto_auto] items-center gap-4 border-t border-[color:var(--line)] pt-4 md:grid">
          <button
            aria-label={playing ? dict.player.pause : dict.player.play}
            className="btn-icon"
            onClick={() => toggle(song.id, song.src)}
            type="button"
          >
            {playing ? <PauseIcon size={14} /> : <PlayIcon className="ml-[2px]" size={14} />}
          </button>
          <button
            aria-label={dict.player.prev}
            className="btn-ghost-icon"
            onClick={previous}
            type="button"
          >
            <PrevIcon size={16} />
          </button>
          <button
            aria-label={dict.player.next}
            className="btn-ghost-icon"
            onClick={next}
            type="button"
          >
            <NextIcon size={16} />
          </button>
          <Waveform
            bars={96}
            className="min-w-0"
            heightClass="h-9"
            onSeek={(ratio) => seek(song.id, ratio)}
            songId={song.id}
          />
          <span className="whitespace-nowrap px-2 text-xs tabular-nums text-[color:var(--muted-cream)]">
            {positionLabel} / {durationLabel}
          </span>
          <div className="flex items-center gap-2 border-l border-[color:var(--line)] pl-4 text-[color:var(--muted-cream)]">
            <button
              aria-label={muted ? dict.player.unmute : dict.player.mute}
              className="btn-ghost-icon"
              onClick={toggleMute}
              type="button"
            >
              {muted || volume === 0 ? <VolumeMutedIcon size={16} /> : <VolumeIcon size={16} />}
            </button>
            <input
              aria-label={dict.player.volumeUp}
              className="volume-slider"
              max={1}
              min={0}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              step={0.01}
              type="range"
              value={muted ? 0 : volume}
            />
          </div>
          <MoreMenu />
        </div>
      </div>
    </div>
  );
}

function MoreMenu() {
  const { dict } = useDict();
  return (
    <details className="relative">
      <summary
        aria-label={dict.player.more}
        className="btn-ghost-icon cursor-pointer list-none [&::-webkit-details-marker]:hidden"
        title={dict.player.more}
      >
        <MoreIcon size={16} />
      </summary>
      <div
        className="absolute right-0 top-full z-30 mt-2 w-44 rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.96)] p-2 text-xs text-[color:var(--muted-cream)] shadow-[0_18px_36px_rgba(0,0,0,0.6)] backdrop-blur-md"
      >
        <a className="block rounded px-2 py-1.5 hover:bg-[rgba(232,201,130,0.06)]" href="#booking">
          {dict.about.ctaBook}
        </a>
        <a className="block rounded px-2 py-1.5 hover:bg-[rgba(232,201,130,0.06)]" href="#music">
          {dict.demos.kicker}
        </a>
        <a className="block rounded px-2 py-1.5 hover:bg-[rgba(232,201,130,0.06)]" href="#contact">
          {dict.nav.contact}
        </a>
      </div>
    </details>
  );
}

function PlayIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden className={className} fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
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
function PrevIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
    </svg>
  );
}
function NextIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
    </svg>
  );
}
function VolumeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden fill="none" height={size} stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" width={size}>
      <polygon fill="currentColor" points="11 5 6 9 2 9 2 15 6 15 11 19" />
      <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}
function VolumeMutedIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden fill="none" height={size} stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" width={size}>
      <polygon fill="currentColor" points="11 5 6 9 2 9 2 15 6 15 11 19" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </svg>
  );
}
function MoreIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
      <circle cx={5} cy={12} r={1.6} />
      <circle cx={12} cy={12} r={1.6} />
      <circle cx={19} cy={12} r={1.6} />
    </svg>
  );
}
