"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import type { Song } from "@/data/songs";

type Props = {
  index: number;
  song: Song;
};

// Compact demo-row, derived from the handoff `.demo-row` pattern in
// typhoon-app.js (renderDemos): number, play, title, mini waveform, time.
export function DemoRow({ index, song }: Props) {
  const { currentId, isPlaying, toggle, seek } = useAudioPlayer();
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;

  return (
    <div className="grid grid-cols-[28px_36px_minmax(0,1fr)_minmax(80px,140px)] items-center gap-3 rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] px-3 py-2.5 transition hover:border-[color:var(--line-strong)] md:grid-cols-[36px_44px_minmax(0,1.2fr)_minmax(120px,2fr)] md:gap-4 md:px-4 md:py-3">
      <span className="font-mono text-[11px] text-[color:var(--muted)] md:text-xs">
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(232,201,130,0.5)] bg-[linear-gradient(180deg,#e8c982_0%,#b8873b_100%)] text-[#060403] transition hover:brightness-110 md:h-10 md:w-10"
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
        bars={40}
        heightClass="h-5 md:h-6"
        onSeek={(ratio) => seek(song.id, ratio)}
        songId={song.id}
      />
    </div>
  );
}
