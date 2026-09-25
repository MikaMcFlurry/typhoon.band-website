"use client";

import { useEffect } from "react";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";

// One shared clock: while a song plays, the low-frequency energy of the
// shared AnalyserNode is written as `--lvl` (0..1) onto every element
// marked `data-live` (stage-plot marks, the now-playing tape, the dock).
// CSS decides what the level does (see `.live-mark` in globals.css).
// Only the marked elements are touched, never the document root, and the
// loop stops when playback pauses or the visitor prefers reduced motion.

export function LiveLevel() {
  const { isPlaying, getAnalyser } = useAudioPlayer();

  useEffect(() => {
    if (!isPlaying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const analyser = getAnalyser();
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    // Kick + bass live in the first ~8 bins at fftSize 256 / 44.1 kHz.
    const bins = Math.max(4, Math.floor(data.length * 0.06));
    let nodes: HTMLElement[] = [];
    let frame = 0;
    let level = 0;
    let raf = 0;

    const collect = () => {
      nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-live]"));
    };

    const tick = () => {
      if (frame % 60 === 0) collect();
      frame++;
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < bins; i++) sum += data[i];
      const target = Math.min(1, Math.pow(sum / bins / 255, 1.6) * 1.25);
      // Fast attack, slower release: reads as a pulse, not a flicker.
      level = target > level ? target : level * 0.86 + target * 0.14;
      const value = level.toFixed(3);
      for (const n of nodes) n.style.setProperty("--lvl", value);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      for (const n of nodes) n.style.setProperty("--lvl", "0");
    };
  }, [isPlaying, getAnalyser]);

  return null;
}
