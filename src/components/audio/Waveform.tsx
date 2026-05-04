"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";

type WaveformProps = {
  songId: string;
  bars?: number;
  className?: string;
  /** Tailwind height utility for the waveform container. */
  heightClass?: string;
  /** When true, paused bars render at very low amplitude (compact look). */
  flatWhenPaused?: boolean;
  /** Click-to-seek callback. */
  onSeek?: (ratio: number) => void;
};

/** Hash a string into a stable seed (xfnv1a). */
function seedFromId(id: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Tiny seeded PRNG (mulberry32). */
function mulberry32(a: number) {
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Live waveform visualiser. Visual styling matches the Claude Design handoff
 * (`.waveform .wave-bar` in handoff/assets/typhoon-shared.css):
 *   - 3px-wide bars, 2px gap
 *   - unplayed = bronze (#6f4a1f), played = champagne gold (#e8c982)
 * Behaviour matches the old Claude branch AudioPlayerProvider/Waveform:
 *   - deterministic idle shape per song id
 *   - live FFT-driven amplitude when this song is the active player
 *   - smooth scale-Y transition back to idle when paused
 */
export function Waveform({
  songId,
  bars = 64,
  className = "",
  heightClass = "h-9",
  flatWhenPaused = false,
  onSeek,
}: WaveformProps) {
  const { currentId, isPlaying, progress, getAnalyser } = useAudioPlayer();
  const isCurrent = currentId === songId;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<HTMLSpanElement[]>([]);
  const peaksRef = useRef<number[]>([]);

  const idleHeights = useMemo(() => {
    const rng = mulberry32(seedFromId(songId));
    return Array.from({ length: bars }, (_, i) => {
      const t = i / Math.max(1, bars - 1);
      const envelope =
        0.5 + 0.4 * Math.sin(Math.PI * t) + 0.18 * Math.sin(Math.PI * t * 3);
      const jitter = 0.55 + 0.85 * rng();
      const v = envelope * jitter;
      return Math.min(1, Math.max(0.16, v));
    });
  }, [songId, bars]);

  useEffect(() => {
    if (!isCurrent || !isPlaying) return;
    const analyser = getAnalyser();
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const usableBins = Math.floor(data.length * 0.72);
    peaksRef.current = new Array(bars).fill(0);

    let raf = 0;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const refs = barRefs.current;
      const peaks = peaksRef.current;
      for (let i = 0; i < bars; i++) {
        const start = Math.floor((i / bars) * usableBins);
        const end = Math.max(start + 1, Math.floor(((i + 1) / bars) * usableBins));
        let sum = 0;
        for (let j = start; j < end; j++) sum += data[j];
        const avg = sum / Math.max(1, end - start) / 255;
        const target = Math.pow(avg, 0.7);
        peaks[i] = Math.max(target, peaks[i] * 0.85);
        const h = Math.max(0.08, Math.min(1, peaks[i]));
        const node = refs[i];
        if (node) node.style.transform = `scaleY(${h.toFixed(3)})`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [isCurrent, isPlaying, getAnalyser, bars]);

  useEffect(() => {
    if (isCurrent && isPlaying) return;
    const refs = barRefs.current;
    for (let i = 0; i < bars; i++) {
      const target = flatWhenPaused
        ? 0.32 + 0.18 * Math.sin(i * 0.45)
        : idleHeights[i];
      const node = refs[i];
      if (node) node.style.transform = `scaleY(${target.toFixed(3)})`;
    }
  }, [isCurrent, isPlaying, idleHeights, bars, flatWhenPaused]);

  const playedTo = Math.floor((isCurrent ? progress : 0) * bars);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek) return;
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    onSeek(ratio);
  }

  return (
    <div
      aria-hidden
      className={`relative flex min-w-0 items-center gap-[2px] ${heightClass} ${
        onSeek ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onSeek ? handleClick : undefined}
      ref={containerRef}
    >
      {idleHeights.map((_, i) => (
        <span
          className={`origin-center w-[2px] min-w-[2px] flex-1 max-w-[3px] rounded-[1px] ${
            i < playedTo
              ? "bg-[color:var(--gold-soft)]"
              : "bg-[color:var(--bronze)]"
          }`}
          key={i}
          ref={(el) => {
            if (el) barRefs.current[i] = el;
          }}
          style={{
            height: "100%",
            transform: `scaleY(${idleHeights[i].toFixed(3)})`,
            transition:
              isCurrent && isPlaying
                ? "background-color 200ms ease"
                : "transform 360ms cubic-bezier(0.22,1,0.36,1), background-color 200ms ease",
          }}
        />
      ))}
    </div>
  );
}
