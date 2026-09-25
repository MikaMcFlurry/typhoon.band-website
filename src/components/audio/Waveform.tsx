"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatTime,
  useAudioPlayer,
  useAudioTime,
} from "@/components/audio/AudioPlayerProvider";

// Live waveform. Behaviour ported 1:1 from the old Claude branch:
//   - deterministic idle shape per song id (xfnv1a seed → mulberry32)
//   - live FFT amplitude from the shared AnalyserNode while this song plays
//   - peak hold (×0.85 decay), smooth return to the idle shape on pause
// Redesign additions: keyboard-operable seek slider (←/→ 5 s, Home/End),
// reduced-motion support (static bars, no rAF loop) and played/unplayed
// colouring through data attributes instead of class churn.
// Touch: vertical swipes scroll the page (touch-action: pan-y); only a tap
// or a horizontal drag seeks, so scrolling past a waveform never starts or
// moves playback.

type WaveformProps = {
  songId: string;
  title: string;
  /** Number of bars, or "auto" to fill the available width (≈1 bar / 6px). */
  bars?: number | "auto";
  className?: string;
  /** Tailwind height utility for the container. */
  heightClass?: string;
  /** Enables click/drag/keyboard seeking. */
  seekable?: boolean;
  /** Accessible label for the seek slider. */
  label?: string;
};

function seedFromId(id: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function mulberry32(a: number) {
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function Waveform({
  songId,
  title,
  bars: barsProp = "auto",
  className = "",
  heightClass = "h-10",
  seekable = false,
  label,
}: WaveformProps) {
  const { currentId, isPlaying, getAnalyser, seek, duration, toggle } =
    useAudioPlayer();
  const { progress, position } = useAudioTime();
  const isCurrent = currentId === songId;
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoBars, setAutoBars] = useState(64);
  const bars = barsProp === "auto" ? autoBars : barsProp;
  const barRefs = useRef<HTMLSpanElement[]>([]);

  // "auto": derive the bar count from the rendered width so the waveform
  // always fills the free space (owner feedback on the old player).
  useEffect(() => {
    if (barsProp !== "auto") return;
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const update = () => {
      const w = node.getBoundingClientRect().width;
      if (w > 0) setAutoBars(Math.max(24, Math.min(180, Math.floor(w / 6))));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, [barsProp]);
  const peaksRef = useRef<number[]>([]);
  const draggingRef = useRef(false);
  const touchRef = useRef<{ id: number; x: number; y: number; drag: boolean; moved: boolean } | null>(null);

  const idleHeights = useMemo(() => {
    const rng = mulberry32(seedFromId(songId));
    return Array.from({ length: bars }, (_, i) => {
      const t = i / Math.max(1, bars - 1);
      const envelope =
        0.5 + 0.4 * Math.sin(Math.PI * t) + 0.18 * Math.sin(Math.PI * t * 3);
      const jitter = 0.55 + 0.85 * rng();
      return Math.min(1, Math.max(0.16, envelope * jitter));
    });
  }, [songId, bars]);

  // Live analyser loop (only for the active, playing song).
  useEffect(() => {
    if (!isCurrent || !isPlaying || reducedMotion) return;
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
  }, [isCurrent, isPlaying, getAnalyser, bars, reducedMotion]);

  // Return to the idle shape whenever not animating.
  useEffect(() => {
    if (isCurrent && isPlaying && !reducedMotion) return;
    const refs = barRefs.current;
    for (let i = 0; i < bars; i++) {
      const node = refs[i];
      if (node) node.style.transform = `scaleY(${idleHeights[i].toFixed(3)})`;
    }
  }, [isCurrent, isPlaying, idleHeights, bars, reducedMotion]);

  const playedTo = Math.floor((isCurrent ? progress : 0) * bars);

  function ratioFromEvent(clientX: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  }

  function seekTo(ratio: number) {
    if (!isCurrent) {
      // Clicking a waveform of an inactive song starts it (the old player
      // ignored the click, which felt broken).
      toggle(songId);
      return;
    }
    seek(songId, ratio);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!seekable) return;
    if (e.pointerType === "touch") {
      // Decide on move/up whether this is a tap, a seek drag or a scroll.
      touchRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, drag: false, moved: false };
      return;
    }
    if (e.button !== 0) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(ratioFromEvent(e.clientX, e.currentTarget));
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!seekable) return;
    const t = touchRef.current;
    if (t && t.id === e.pointerId) {
      const dx = e.clientX - t.x;
      const dy = e.clientY - t.y;
      if (!t.drag) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) t.moved = true;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) > 8 && isCurrent) {
          t.drag = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }
      if (t.drag && isCurrent) seek(songId, ratioFromEvent(e.clientX, e.currentTarget));
      return;
    }
    if (!draggingRef.current || !isCurrent) return;
    seek(songId, ratioFromEvent(e.clientX, e.currentTarget));
  }
  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const t = touchRef.current;
    if (t && t.id === e.pointerId) {
      touchRef.current = null;
      // A tap (no real movement) seeks or starts the song; pointercancel
      // means the browser took the gesture for scrolling.
      if (e.type === "pointerup" && !t.moved && !t.drag) {
        seekTo(ratioFromEvent(e.clientX, e.currentTarget));
      }
    }
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!seekable || !isCurrent || !duration) return;
    const step = 5 / duration;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = progress + step;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = progress - step;
    if (e.key === "PageUp") next = progress + step * 6;
    if (e.key === "PageDown") next = progress - step * 6;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = 0.999;
    if (next === null) return;
    e.preventDefault();
    seek(songId, Math.max(0, Math.min(1, next)));
  }

  const sliderProps = seekable
    ? {
        role: "slider" as const,
        tabIndex: isCurrent ? 0 : -1,
        "aria-label": label ?? title,
        "aria-valuemin": 0,
        "aria-valuemax": Math.round(isCurrent ? duration : 0),
        "aria-valuenow": Math.round(isCurrent ? position : 0),
        "aria-valuetext": `${formatTime(isCurrent ? position : 0)} / ${formatTime(isCurrent ? duration : 0)}`,
        "aria-disabled": !isCurrent,
        onKeyDown,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
      }
    : { "aria-hidden": true as const };

  return (
    <div
      className={`relative flex min-w-0 touch-pan-y select-none items-center gap-[2px] ${heightClass} ${
        seekable ? "cursor-pointer" : ""
      } ${className}`}
      ref={containerRef}
      {...sliderProps}
    >
      {idleHeights.map((h, i) => (
        <span
          className="wave-bar"
          data-played={i < playedTo ? "true" : "false"}
          key={i}
          ref={(el) => {
            if (el) barRefs.current[i] = el;
          }}
          style={{
            transform: `scaleY(${h.toFixed(3)})`,
            transition:
              isCurrent && isPlaying && !reducedMotion
                ? "background-color 200ms ease"
                : "transform 360ms cubic-bezier(0.22,1,0.36,1), background-color 200ms ease",
          }}
        />
      ))}
    </div>
  );
}
