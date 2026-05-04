"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import type { Song } from "@/data/songs";

type Props = {
  index: number;
  song: Song;
};

export function DemoRow({ index, song }: Props) {
  const { currentId, isPlaying, toggle, seek } = useAudioPlayer();
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;

  return (
    <div className="grid grid-cols-[28px_36px_minmax(0,1fr)] items-center gap-3 rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-3 transition hover:border-[color:var(--line-strong)] md:grid-cols-[36px_44px_minmax(140px,200px)_1fr] md:gap-4 md:p-4">
      <span className="font-mono text-xs text-[color:var(--muted)] md:text-sm">
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(232,201,130,0.45)] bg-[linear-gradient(180deg,#e8c982_0%,#b8873b_100%)] text-[#060403] transition hover:brightness-110 md:h-10 md:w-10"
        onClick={() => toggle(song.id, song.src)}
        type="button"
      >
        {playing ? (
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
        )}
      </button>
      <span className="truncate font-display text-sm font-semibold tracking-[-0.01em] text-[color:var(--cream)] md:text-base">
        {song.title}
      </span>
      <Waveform
        bars={48}
        className="hidden md:flex"
        heightClass="h-6"
        onSeek={(ratio) => seek(song.id, ratio)}
        songId={song.id}
      />
    </div>
  );
}
