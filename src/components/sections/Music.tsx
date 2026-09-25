"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  formatTime,
  useAudioPlayer,
  useAudioTime,
} from "@/components/audio/AudioPlayerProvider";
import { useTrackDuration } from "@/components/audio/useTrackDuration";
import { Waveform } from "@/components/audio/Waveform";
import { useDict } from "@/components/i18n/DictProvider";
import { CollapsibleList } from "@/components/ui/Collapsible";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// Demo tracklist, laid out like the back of a record sleeve: real track
// numbers, cover, title, duration and a wide live waveform on the active
// row. Streaming only: no download link, no native controls.

export type MusicTrack = {
  id: string;
  title: string;
  src: string;
  cover: string;
  /** Seconds, read on the server; null if unknown. */
  duration: number | null;
};

function TrackRow({
  track,
  index,
  ...rest
}: {
  track: MusicTrack;
  index: number;
  /** Set by CollapsibleList on rows that stay collapsed until expanded. */
  "data-extra"?: string;
}) {
  const { dict } = useDict();
  const { currentId, isPlaying, isLoading, hasError, duration, toggle } =
    useAudioPlayer();
  const { position } = useAudioTime();
  const rowRef = useRef<HTMLLIElement | null>(null);
  // Durations come from the server; probe only if it could not read one.
  const metaDuration = useTrackDuration(track.duration == null ? track.src : "", rowRef);
  const isCurrent = currentId === track.id;
  const playing = isCurrent && isPlaying;
  const shownDuration = isCurrent && duration ? duration : (track.duration ?? metaDuration);
  const number = String(index + 1).padStart(2, "0");

  return (
    <li
      {...rest}
      ref={rowRef}
      className={`group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 border-b border-line px-2 py-4 transition-colors md:px-3 md:grid-cols-[2.5rem_auto_minmax(0,14rem)_1fr_4.5rem_auto] md:gap-x-6 md:py-5 ${
        isCurrent ? "bg-ink-3/60" : "hover:bg-ink-3/40"
      }`}
    >
      <span
        aria-hidden
        className={`tabular hidden text-right text-[0.9375rem] font-semibold md:block ${
          isCurrent ? "text-gold" : "text-paper-3"
        }`}
      >
        {number}
      </span>

      <div className="relative size-12 flex-none overflow-hidden rounded-sm border border-line md:size-14">
        <Image alt="" className="object-cover sepia-img" fill sizes="56px" src={track.cover} />
      </div>

      <div className="min-w-0">
        <h3 className={`line-clamp-2 font-display md:truncate text-[1.25rem] leading-tight md:text-[1.375rem] ${isCurrent ? "text-gold-hi" : "text-paper"}`}>
          <span className="sr-only">{number}. </span>
          {track.title}
        </h3>
        {/* Visual status only; the player dock owns the single live region. */}
        <p className="mt-0.5 text-[0.875rem] text-paper-3">
          {isCurrent && hasError
            ? dict.music.error
            : isCurrent
              ? isLoading && isPlaying
                ? dict.music.loading
                : playing
                  ? dict.music.nowPlaying
                  : dict.music.paused
              : dict.player.by}
          {shownDuration ? (
            <span className="tabular md:hidden">
              {" · "}
              {isCurrent ? `${formatTime(position)} / ` : ""}
              {formatTime(shownDuration)}
            </span>
          ) : null}
        </p>
      </div>

      <div className="col-span-3 min-w-0 md:col-span-1">
        <Waveform
          heightClass={isCurrent ? "h-10 md:h-9" : "h-6 md:h-9"}
          label={fill(dict.player.seek, { title: track.title })}
          seekable
          songId={track.id}
          title={track.title}
        />
      </div>

      <span className="tabular hidden text-right text-[0.875rem] text-paper-2 md:block">
        {isCurrent ? `${formatTime(position)}` : formatTime(shownDuration ?? 0)}
      </span>

      <button
        aria-label={
          playing
            ? fill(dict.player.pauseTrack, { title: track.title })
            : fill(dict.player.playTrack, { title: track.title })
        }
        data-track-play={track.id}
        className={`col-start-3 row-start-1 inline-flex size-11 flex-none items-center justify-center rounded-full border transition-colors md:col-start-auto md:row-start-auto ${
          playing
            ? "border-gold bg-gold text-on-gold"
            : "border-line-2 text-paper hover:border-gold hover:text-gold-hi"
        }`}
        onClick={() => toggle(track.id, track.src)}
        type="button"
      >
        <Icon name={playing ? "pause" : "play"} size={18} />
      </button>
    </li>
  );
}

export function Music({ tracks, children }: { tracks: MusicTrack[]; children?: React.ReactNode }) {
  const { dict } = useDict();

  return (
    <section aria-labelledby="music-title" className="section" id="music">
      <div className="container-x">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="h-section reveal md:col-span-6" id="music-title">
            {dict.music.title}
          </h2>
          <p className="lede reveal md:col-span-6 md:justify-self-end">{dict.music.intro}</p>
        </div>

        <div className="reveal mt-10 md:mt-14">
          <div className="flex items-center justify-between border-b border-line-2 pb-3 text-[0.875rem] text-paper-3">
            <span className="label">{dict.music.tracklist}</span>
            <span>
              {fill(dict.music.trackCount, { count: tracks.length })} · {dict.music.noDownload}
            </span>
          </div>
          <CollapsibleList
            as="ol"
            initial={4}
            lessLabel={dict.music.showLess}
            moreLabel={dict.music.showAll}
          >
            {tracks.map((t, i) => (
              <TrackRow index={i} key={t.id} track={t} />
            ))}
          </CollapsibleList>
        </div>
        {children}
      </div>
    </section>
  );
}
