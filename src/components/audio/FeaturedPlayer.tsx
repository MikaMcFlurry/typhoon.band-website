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

// Visual layout matches handoff/desktop.html .audio-card and mobile.html .audio-card-m
// behavior comes from the AudioPlayerProvider / Waveform components.
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

  const totalSeconds = duration || 0;
  const positionLabel = formatTime(isCurrent ? position : 0);
  const durationLabel =
    isCurrent && totalSeconds ? formatTime(totalSeconds) : "—";

  return (
    <div className="relative z-20 mx-auto -mt-12 w-full max-w-container px-4 md:px-8">
      <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.86)] p-4 backdrop-blur-md md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_22px_44px_rgba(0,0,0,0.5)]">
        <div className="mb-3 grid grid-cols-[56px_1fr] items-center gap-3 md:grid-cols-[76px_1fr] md:gap-4 md:mb-4">
          <div className="aspect-square w-full overflow-hidden rounded border border-[color:var(--line)]">
            <Image
              alt=""
              className="h-full w-full object-cover sepia-img"
              height={76}
              src={cover}
              width={76}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="kicker">{releaseTag}</span>
            <h3 className="m-0 font-display text-lg leading-tight tracking-[-0.02em] text-[color:var(--cream)] md:text-2xl">
              {song.title}
            </h3>
            <span className="text-xs text-[color:var(--muted-cream)] md:text-sm">
              {artist}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[46px_1fr_auto] items-center gap-3 border-t border-[color:var(--line)] pt-3 md:grid-cols-[46px_36px_36px_1fr_auto] md:gap-4 md:pt-4">
          <button
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[rgba(232,201,130,0.6)] bg-[linear-gradient(180deg,#e8c982_0%,#b8873b_100%)] text-[#060403] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.4)] transition hover:brightness-110 md:h-[46px] md:w-[46px]"
            onClick={() => toggle(song.id, song.src)}
            type="button"
          >
            {playing ? (
              <svg
                aria-hidden
                className="h-3 w-3 md:h-3.5 md:w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg
                aria-hidden
                className="ml-[2px] h-3 w-3 md:h-3.5 md:w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            aria-label="Vorheriger Track"
            className="hidden h-9 w-9 items-center justify-center text-[color:var(--muted-cream)] transition hover:text-[color:var(--gold-soft)] md:flex"
            disabled
            type="button"
          >
            <svg aria-hidden className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zM9.5 12l8.5 6V6z" />
            </svg>
          </button>
          <button
            aria-label="Nächster Track"
            className="hidden h-9 w-9 items-center justify-center text-[color:var(--muted-cream)] transition hover:text-[color:var(--gold-soft)] md:flex"
            disabled
            type="button"
          >
            <svg aria-hidden className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
            </svg>
          </button>
          <Waveform
            bars={64}
            heightClass="h-7 md:h-9"
            onSeek={(ratio) => seek(song.id, ratio)}
            songId={song.id}
          />
          <span className="whitespace-nowrap px-2 font-mono text-[11px] tabular-nums text-[color:var(--muted-cream)] md:text-xs">
            {positionLabel} / {durationLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
