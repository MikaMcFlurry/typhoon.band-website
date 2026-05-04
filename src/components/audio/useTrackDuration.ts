"use client";

import { useEffect, useState } from "react";

/**
 * Read a track's duration via a throwaway HTMLAudioElement. Stays separate
 * from the shared AudioPlayerProvider so it doesn't disturb playback —
 * `preload="metadata"` only fetches the header bytes.
 */
export function useTrackDuration(src: string): number | null {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!src || typeof window === "undefined") return;
    let cancelled = false;
    const el = new Audio();
    el.preload = "metadata";
    const onLoaded = () => {
      if (cancelled) return;
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) setDuration(d);
    };
    el.addEventListener("loadedmetadata", onLoaded);
    el.src = src;
    return () => {
      cancelled = true;
      el.removeEventListener("loadedmetadata", onLoaded);
      // Help the browser drop the metadata fetch.
      el.removeAttribute("src");
      el.load();
    };
  }, [src]);

  return duration;
}
