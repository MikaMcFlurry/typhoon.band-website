"use client";

import { useEffect, useState, type RefObject } from "react";

// Reads a track's duration from its MP3 header without disturbing playback.
//   - lazy: only once the element is (nearly) on screen, so opening the page
//     does not pull metadata of every demo (the old site fetched all six,
//     ~0.5 MB, on load)
//   - de-duplicated: one metadata request per file for the whole page
//   - `preload="metadata"` only fetches the header bytes
//   - deferred to browser idle time

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
    // Metadata requests wait for an idle moment so they never compete with
    // the first paint (the setlist sits in the first viewport).
    const start = () => {
      const run = () =>
        loadDuration(src).then((d) => {
          if (!cancelled) setDuration(d);
        });
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 2500 });
      else window.setTimeout(run, 1200);
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
