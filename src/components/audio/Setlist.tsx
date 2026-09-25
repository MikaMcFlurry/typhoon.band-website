"use client";

import { useRef } from "react";
import {
  formatTime,
  useAudioPlayer,
  useAudioTime,
} from "@/components/audio/AudioPlayerProvider";
import { useTrackDuration } from "@/components/audio/useTrackDuration";
import { Waveform } from "@/components/audio/Waveform";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// The band's setlist, taped to the stage floor: every demo in running
// order, one tap plays it. The playing song gets the pink tape and a live,
// seekable waveform. Streaming only: no download link, no native controls.

export type SetlistTrack = {
  id: string;
  title: string;
  src: string;
  cover: string;
};

function Row({
  track,
  index,
  featured,
}: {
  track: SetlistTrack;
  index: number;
  featured: boolean;
}) {
  const { dict } = useDict();
  const { currentId, isPlaying, isLoading, hasError, duration, toggle } = useAudioPlayer();
  const { position } = useAudioTime();
  const rowRef = useRef<HTMLLIElement | null>(null);
  const metaDuration = useTrackDuration(track.src, rowRef);
  const isCurrent = currentId === track.id;
  const playing = isCurrent && isPlaying;
  const shownDuration = isCurrent && duration ? duration : metaDuration;
  const status = isCurrent
    ? hasError
      ? dict.music.error
      : isLoading && isPlaying
        ? dict.music.loading
        : playing
          ? dict.music.nowPlaying
          : dict.music.paused
    : null;

  return (
    <li className="border-t border-[rgba(18,17,16,0.16)] first:border-t-0" ref={rowRef}>
      <button
        aria-label={
          playing
            ? fill(dict.player.pauseTrack, { title: track.title })
            : fill(dict.player.playTrack, { title: track.title })
        }
        aria-pressed={playing}
        className="group grid w-full grid-cols-[1.75rem_minmax(0,1fr)_auto_2.75rem] items-center gap-x-3 py-2.5 text-left sm:grid-cols-[2rem_minmax(0,1fr)_auto_2.75rem] sm:gap-x-4"
        onClick={() => toggle(track.id, track.src)}
        type="button"
      >
        <span aria-hidden className="mono text-[rgba(18,17,16,0.62)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <span
            className={`block break-words font-stage text-[1.625rem] font-extrabold uppercase leading-[1.02] sm:text-[1.875rem] ${
              isCurrent ? "" : "group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
            }`}
          >
            <span className={isCurrent ? "tape tape-pink !px-1" : ""} data-live={isCurrent ? "" : undefined}>
              {track.title}
            </span>
          </span>
          {featured || status ? (
            <span className="mono-cap mt-0.5 block truncate text-[rgba(18,17,16,0.7)]" aria-live={isCurrent ? "polite" : undefined}>
              {status ?? dict.music.featuredLabel}
            </span>
          ) : null}
        </span>
        <span className="mono text-right text-[rgba(18,17,16,0.72)]">
          {isCurrent && position > 0 ? `${formatTime(position)} / ` : ""}
          {shownDuration ? formatTime(shownDuration) : "–:––"}
        </span>
        <span
          aria-hidden
          className={`inline-flex size-11 items-center justify-center transition-colors ${
            playing ? "bg-pink text-[#121110]" : "bg-[#121110] text-chalk group-hover:bg-pink group-hover:text-[#121110]"
          }`}
        >
          {isCurrent && isLoading && isPlaying ? (
            <Icon name="spinner" size={18} />
          ) : (
            <Icon name={playing ? "pause" : "play"} size={18} />
          )}
        </span>
      </button>
      {isCurrent ? (
        <div className="on-light pb-3 pl-[calc(1.75rem+0.75rem)] pr-[calc(2.75rem+0.75rem)] sm:pl-[calc(2rem+1rem)] sm:pr-[calc(2.75rem+1rem)]">
          <Waveform
            heightClass="h-9"
            label={fill(dict.player.seek, { title: track.title })}
            seekable
            songId={track.id}
            title={track.title}
          />
        </div>
      ) : null}
    </li>
  );
}

export function Setlist({
  tracks,
  featuredId,
  footer,
}: {
  tracks: SetlistTrack[];
  featuredId: string | null;
  footer?: React.ReactNode;
}) {
  const { dict } = useDict();
  if (tracks.length === 0) return null;

  return (
    <div className="relative" id="music">
      {/* Two pieces of pink tape hold the sheet on the floor. */}
      <span aria-hidden className="tape-piece -top-2.5 left-6 -rotate-6" />
      <span aria-hidden className="tape-piece -top-2.5 right-6 rotate-3" />
      <section
        aria-labelledby="setlist-title"
        className="bg-chalk px-4 pb-4 pt-6 text-[#121110] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)] sm:px-6 sm:pt-7"
      >
        <header className="flex items-end justify-between gap-4 border-b-2 border-[#121110] pb-3">
          <h2 className="font-stage text-[2.5rem] font-black uppercase leading-[0.85] sm:text-[3rem]" id="setlist-title">
            {dict.stage.setlist}
          </h2>
          <p className="mono-cap pb-1 text-right text-[rgba(18,17,16,0.72)]">
            Typhoon · {fill(dict.music.trackCount, { count: tracks.length })}
          </p>
        </header>
        <ol className="mt-1">
          {tracks.map((t, i) => (
            <Row featured={t.id === featuredId} index={i} key={t.id} track={t} />
          ))}
        </ol>
        <p className="mono mt-2 border-t-2 border-[#121110] pt-3 text-[rgba(18,17,16,0.72)]">
          {dict.stage.setlistNote}
        </p>
      </section>
      {footer}
    </div>
  );
}
