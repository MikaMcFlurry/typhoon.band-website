"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import type { Song } from "@/data/songs";

type Props = {
  index: number;
  song: Song;
};

// Compact demo-row, derived from typhoon-app.js renderDemos:
// number, play, title, mini waveform.
//
// Mobile is tight (~390px) so we keep bar counts low and clip overflow on
// every layer (`min-w-0` on grid children, `overflow-hidden` on the row
// + waveform). Waveform stays visible but its bars compress to fit.
export function DemoRow({ index, song }: Props) {
  const { currentId, isPlaying, toggle, seek } = useAudioPlayer();
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;

  return (
    <div className="grid w-full max-w-full grid-cols-[24px_32px_minmax(0,1.4fr)_minmax(0,1.6fr)] items-center gap-2 overflow-hidden rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] px-2.5 py-2 transition hover:border-[color:var(--line-strong)] md:grid-cols-[36px_44px_minmax(0,1fr)_minmax(0,2fr)] md:gap-4 md:px-4 md:py-3">
      <span className="font-mono text-[10px] text-[color:var(--muted)] md:text-xs">
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(232,201,130,0.5)] bg-[linear-gradient(180deg,#e8c982_0%,#b8873b_100%)] text-[#060403] transition hover:brightness-110 md:h-10 md:w-10"
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
      <span className="min-w-0 truncate font-display text-[13px] font-semibold tracking-[-0.01em] text-[color:var(--cream)] md:text-base">
        {song.title}
      </span>
      <Waveform
        bars={28}
        className="min-w-0"
        heightClass="h-5 md:h-6"
        onSeek={(ratio) => seek(song.id, ratio)}
        songId={song.id}
      />
    </div>
  );
}
