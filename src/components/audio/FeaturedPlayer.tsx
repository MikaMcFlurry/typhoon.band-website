"use client";

import Image from "next/image";
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

// Featured single: the two-row audio module the owner approved (cover +
// title on top, round gold play + skip + full-width live waveform + time +
// volume below), overlapping the hero like the handoff.

export function FeaturedPlayer({
  song,
}: {
  song: { id: string; title: string; src: string; cover: string };
}) {
  const { dict } = useDict();
  const {
    currentId,
    isPlaying,
    isLoading,
    hasError,
    duration,
    volume,
    muted,
    toggle,
    next,
    previous,
    toggleMute,
    setVolume,
    playlist,
  } = useAudioPlayer();
  const { position } = useAudioTime();
  const metaDuration = useTrackDuration(song.src);
  const isCurrent = currentId === song.id;
  const playing = isCurrent && isPlaying;
  const shownDuration = isCurrent && duration ? duration : metaDuration;
  const volumePct = Math.round((muted ? 0 : volume) * 100);
  const canSkip = playlist.length > 1;

  return (
    <section
      aria-labelledby="featured-title"
      className="container-x relative z-20 -mt-8 lg:-mt-16"
    >
      <div className="rounded-md border border-line-2 bg-ink-3 p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:p-5 md:p-6">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="relative size-16 flex-none overflow-hidden rounded-sm border border-line md:size-[88px]">
            <Image
              alt=""
              className="object-cover sepia-img"
              fill
              sizes="88px"
              src={song.cover}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="label text-gold-hi">{dict.music.featuredLabel}</p>
            <h2
              className="mt-1 truncate font-display text-[1.625rem] leading-tight text-paper md:text-[2.25rem]"
              id="featured-title"
            >
              {song.title}
            </h2>
            <p className="mt-0.5 text-[0.9375rem] text-paper-2">
              {dict.player.by}
              {shownDuration ? <span className="tabular"> · {formatTime(shownDuration)}</span> : null}
            </p>
          </div>
          <a
            className="btn btn-ghost hidden md:inline-flex"
            href="#music"
          >
            {dict.music.tracklist}
            <Icon name="arrow-down" size={16} />
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 sm:gap-3 md:mt-5 md:pt-5">
          <button
            aria-label={
              playing
                ? fill(dict.player.pauseTrack, { title: song.title })
                : fill(dict.player.playTrack, { title: song.title })
            }
            className="play-btn"
            onClick={() => toggle(song.id, song.src)}
            type="button"
          >
            {isCurrent && isLoading && isPlaying ? (
              <Icon name="spinner" size={22} />
            ) : (
              <Icon name={playing ? "pause" : "play"} size={22} />
            )}
          </button>
          <button
            aria-label={dict.player.prev}
            className="icon-btn hidden sm:inline-flex"
            disabled={!canSkip}
            onClick={previous}
            type="button"
          >
            <Icon name="prev" size={18} />
          </button>
          <button
            aria-label={dict.player.next}
            className="icon-btn"
            disabled={!canSkip}
            onClick={next}
            type="button"
          >
            <Icon name="next" size={18} />
          </button>

          <Waveform
            className="mx-1 flex-1 md:mx-2"
            heightClass="h-10 md:h-12"
            label={fill(dict.player.seek, { title: song.title })}
            seekable
            songId={song.id}
            title={song.title}
          />

          <span className="tabular hidden flex-none text-[0.875rem] text-paper-2 xs:inline">
            {formatTime(isCurrent ? position : 0)}
            <span className="text-paper-3"> / {formatTime(shownDuration ?? 0)}</span>
          </span>

          <div className="hidden flex-none items-center gap-1 border-l border-line pl-3 lg:flex">
            <button
              aria-label={muted ? dict.player.unmute : dict.player.mute}
              aria-pressed={muted}
              className="icon-btn"
              onClick={toggleMute}
              type="button"
            >
              <Icon name={muted || volume === 0 ? "mute" : "volume"} size={18} />
            </button>
            <input
              aria-label={dict.player.volume}
              aria-valuetext={`${volumePct} %`}
              className="range"
              max={1}
              min={0}
              onChange={(e) => setVolume(Number(e.target.value))}
              step={0.01}
              style={{ ["--fill" as string]: `${volumePct}%` }}
              type="range"
              value={muted ? 0 : volume}
            />
          </div>
        </div>
        {isCurrent && hasError ? (
          <p className="mt-3 text-[0.875rem] text-[color:var(--danger)]" role="alert">
            {dict.music.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
