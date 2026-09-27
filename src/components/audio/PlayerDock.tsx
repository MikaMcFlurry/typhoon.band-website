"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  formatTime,
  useAudioPlayer,
  useAudioTime,
} from "@/components/audio/AudioPlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// Persistent player bar. Appears after the first play and stays while the
// visitor scrolls, so music keeps going with visible controls everywhere.
// Stage grammar: deck surface, pink progress tape, square controls.

const DOCK_HEIGHT = 76;

export function PlayerDock({ fallbackCover }: { fallbackCover: string }) {
  const { dict } = useDict();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    hasError,
    duration,
    volume,
    muted,
    toggle,
    next,
    previous,
    stop,
    setVolume,
    toggleMute,
    playlist,
  } = useAudioPlayer();
  const { position, progress } = useAudioTime();
  const visible = Boolean(currentTrack);
  const dockRef = useRef<HTMLElement | null>(null);

  // Reserve space at the bottom of the page while the dock is shown.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--dock-h", visible ? `calc(${DOCK_HEIGHT}px + env(safe-area-inset-bottom))` : "0px");
    return () => {
      root.style.setProperty("--dock-h", "0px");
    };
  }, [visible]);

  const title = currentTrack?.title ?? "";
  const cover = currentTrack?.cover || fallbackCover;
  const status = hasError
    ? dict.music.error
    : isLoading
      ? dict.music.loading
      : isPlaying
        ? dict.music.nowPlaying
        : dict.music.paused;
  const volumePct = Math.round((muted ? 0 : volume) * 100);
  const canSkip = playlist.length > 1;

  return (
    <section
      aria-hidden={!visible}
      aria-label={dict.player.dock}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-deck-2 transition-[transform,visibility] duration-300 ease-out ${
        visible ? "visible translate-y-0" : "pointer-events-none invisible translate-y-full"
      }`}
      inert={!visible}
      ref={dockRef}
      style={{ height: `calc(${DOCK_HEIGHT}px + env(safe-area-inset-bottom))`, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Progress: a strip of pink tape across the top edge. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-rule">
        <div
          className="h-full origin-left bg-pink transition-transform duration-300 ease-linear"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="shell flex h-full items-center gap-3 md:gap-5" style={{ height: DOCK_HEIGHT }}>
        <div className="flex min-w-0 flex-1 items-center gap-3 md:w-[280px] md:flex-none">
          <div className="live-mark relative size-11 flex-none overflow-hidden bg-deck-3" data-live="">
            {currentTrack ? (
              <Image alt="" className="object-cover" fill sizes="44px" src={cover} />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate font-stage text-[1.25rem] font-extrabold uppercase leading-none">
              {title}
            </p>
            <p
              aria-live="polite"
              className={`mono-cap mt-1 truncate ${hasError ? "text-alert" : "text-chalk-3"}`}
            >
              {dict.player.by} · {status}
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-0.5">
          <button
            aria-label={dict.player.prev}
            className="ctl hidden xs:inline-flex"
            disabled={!canSkip}
            onClick={previous}
            type="button"
          >
            <Icon name="prev" size={18} />
          </button>
          <button
            aria-label={
              isPlaying
                ? fill(dict.player.pauseTrack, { title })
                : fill(dict.player.playTrack, { title })
            }
            className="ctl ctl-play"
            onClick={() => currentTrack && toggle(currentTrack.id)}
            type="button"
          >
            {isLoading && isPlaying ? (
              <Icon name="spinner" size={20} />
            ) : (
              <Icon name={isPlaying ? "pause" : "play"} size={20} />
            )}
          </button>
          <button
            aria-label={dict.player.next}
            className="ctl"
            disabled={!canSkip}
            onClick={next}
            type="button"
          >
            <Icon name="next" size={18} />
          </button>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-4 md:flex">
          {currentTrack ? (
            <Waveform
              className="flex-1"
              heightClass="h-9"
              label={fill(dict.player.seek, { title })}
              seekable
              songId={currentTrack.id}
              title={title}
            />
          ) : null}
          <span className="mono flex-none text-chalk-2">
            {formatTime(position)} / {formatTime(duration)}
          </span>
        </div>

        <div className="hidden flex-none items-center gap-2 lg:flex">
          <button
            aria-label={muted ? dict.player.unmute : dict.player.mute}
            aria-pressed={muted}
            className="ctl"
            onClick={toggleMute}
            type="button"
          >
            <Icon name={muted || volume === 0 ? "mute" : "volume"} size={18} />
          </button>
          <input
            aria-label={dict.player.volume}
            aria-valuetext={`${volumePct} %`}
            className="st-range"
            max={1}
            min={0}
            onChange={(e) => setVolume(Number(e.target.value))}
            step={0.01}
            style={{ ["--fill" as string]: `${volumePct}%` }}
            type="range"
            value={muted ? 0 : volume}
          />
        </div>

        <button
          aria-label={dict.player.close}
          className="ctl flex-none"
          onClick={stop}
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </section>
  );
}
