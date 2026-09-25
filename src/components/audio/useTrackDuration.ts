"use client";

import { useEffect, useState, type RefObject } from "react";

// Reads a track's duration from its MP3 header without disturbing playback.
//   - lazy: only once the element is (nearly) on screen, so opening the page
//     does not pull metadata of every demo (the old site fetched all six,
//     ~0.5 MB, on load)
//   - de-duplicated: one metadata request per file for the whole page
//   - `preload="metadata"` only fetches the header bytes

const cache = new Map<string, Promise<number | null>>();

function loadDuration(src: string): Promise<number | null> {
  const hit = cache.get(src);
  if (hit) return hit;
  const p = new Promise<number | null>((resolve) => {
    const el = new Audio();
    el.preload = "metadata";
    const done = (value: number | null) => {
      el.removeAttribute("src");
      el.load();
      resolve(value);
    };
    el.addEventListener("loadedmetadata", () => {
      const d = el.duration;
      done(Number.isFinite(d) && d > 0 ? d : null);
    });
    el.addEventListener("error", () => done(null));
    el.src = src;
  });
  cache.set(src, p);
  return p;
}

export function useTrackDuration(
  src: string,
  targetRef?: RefObject<Element | null>,
): number | null {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!src || typeof window === "undefined") return;
    let cancelled = false;
    const start = () => {
      loadDuration(src).then((d) => {
        if (!cancelled) setDuration(d);
      });
    };
    const node = targetRef?.current;
    if (!node || !("IntersectionObserver" in window)) {
      start();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(node);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [src, targetRef]);

  return duration;
}
