"use client";

import Image from "next/image";
import {
  formatTime,
  useAudioPlayer,
} from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import { useTrackDuration } from "@/components/audio/useTrackDuration";
import type { Song } from "@/data/songs";

type Props = {
  index: number;
  song: Song;
  cover?: string;
};

const DEFAULT_COVER = "/assets/hero/hero-collage.jpeg";

// Premium demo row, matching the featured/player-example aesthetic:
//   cover · number · round gold play · title · waveform · duration · volume
//
// Mobile: 2-row layout so nothing is squeezed. Top row carries the
// thumbnail, play button, title and duration; the waveform spans the
// full card width below. Desktop keeps the single-row layout.
//
// AudioPlayerProvider stays the single source of truth — `toggle()` keeps
// "one song at a time" guarantee. No download button, no native controls.
export function DemoRow({ index, song, cover = DEFAULT_COVER }: Props) {
  const { currentId, isPlaying, position, duration, toggle, seek } =
    useAudioPlayer();
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;
  const metadataDuration = useTrackDuration(song.src);

  const totalSeconds = isCurrent && duration ? duration : metadataDuration ?? 0;
  const positionLabel = formatTime(isCurrent ? position : 0);
  const durationLabel = totalSeconds ? formatTime(totalSeconds) : "—:—";

  return (
    <article className="w-full max-w-full overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.55)] px-3 py-3 transition hover:border-[color:var(--line-strong)] hover:bg-[rgba(11,8,5,0.7)] md:px-5 md:py-3.5">
      {/* ── Mobile: top meta row ────────────────────────────────────── */}
      <div className="flex items-center gap-3 md:hidden">
        <Cover cover={cover} title={song.title} />
        <span className="font-mono text-[10px] text-[color:var(--muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
          className="btn-icon btn-icon-xs flex-shrink-0"
          onClick={() => toggle(song.id, song.src)}
          type="button"
        >
          <PlayPauseGlyph playing={playing} />
        </button>
        <span className="min-w-0 flex-1 truncate font-display text-[14px] font-semibold tracking-[-0.01em] text-[color:var(--cream)]">
          {song.title}
        </span>
        <span className="whitespace-nowrap font-mono text-[10px] tabular-nums text-[color:var(--muted-cream)]">
          {isCurrent ? `${positionLabel} / ${durationLabel}` : durationLabel}
        </span>
      </div>
      {/* ── Mobile: waveform row ────────────────────────────────────── */}
      <div className="mt-2 md:hidden">
        <Waveform
          bars={36}
          className="min-w-0"
          heightClass="h-5"
          onSeek={(ratio) => seek(song.id, ratio)}
          songId={song.id}
        />
      </div>

      {/* ── Desktop: single row ─────────────────────────────────────── */}
      <div className="hidden grid-cols-[44px_28px_44px_minmax(0,1fr)_minmax(0,2fr)_auto_auto] items-center gap-4 md:grid">
        <Cover cover={cover} title={song.title} />
        <span className="font-mono text-xs text-[color:var(--muted)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
          className="btn-icon btn-icon-sm"
          onClick={() => toggle(song.id, song.src)}
          type="button"
        >
          <PlayPauseGlyph playing={playing} />
        </button>
        <span className="min-w-0 truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--cream)]">
          {song.title}
        </span>
        <Waveform
          bars={48}
          className="min-w-0"
          heightClass="h-7"
          onSeek={(ratio) => seek(song.id, ratio)}
          songId={song.id}
        />
        <span className="whitespace-nowrap font-mono text-xs tabular-nums text-[color:var(--muted-cream)]">
          {isCurrent ? `${positionLabel} / ${durationLabel}` : durationLabel}
        </span>
        <button
          aria-hidden
          aria-label="Lautstärke"
          className="btn-ghost-icon"
          tabIndex={-1}
          type="button"
        >
          <VolumeIcon size={16} />
        </button>
      </div>
    </article>
  );
}

function Cover({ cover, title }: { cover: string; title: string }) {
  return (
    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md border border-[color:var(--line)] md:h-11 md:w-11">
      <Image
        alt={`Cover für ${title}`}
        className="h-full w-full object-cover sepia-img"
        height={88}
        src={cover}
        width={88}
      />
    </div>
  );
}

function PlayPauseGlyph({ playing }: { playing: boolean }) {
  return playing ? (
    <svg aria-hidden className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  ) : (
    <svg
      aria-hidden
      className="ml-[1px] h-3 w-3"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
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
