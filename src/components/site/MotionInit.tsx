"use client";

import { useEffect } from "react";

// Progressive motion. Content is visible by default; only when JS runs,
// IntersectionObserver exists and the visitor has not asked for reduced
// motion do `.reveal` (rise) and `.lay` (tape laid from the left) elements
// start hidden and enter once.
//   - `.reveal` already on screen is shown immediately (no flash on load)
//   - `.lay` already on screen is laid on the next frame: the hero's tape
//     strips are the page's one authored entrance.
export function MotionInit() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    const pending = Array.from(document.querySelectorAll<HTMLElement>(".reveal, .lay"));
    const vh = window.innerHeight;
    const layNow: HTMLElement[] = [];
    for (const el of pending) {
      if (el.getBoundingClientRect().top < vh * 0.9) {
        if (el.classList.contains("lay")) layNow.push(el);
        else el.classList.add("is-in");
      }
    }
    root.dataset.motion = "on";
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => layNow.forEach((el) => el.classList.add("is-in"))),
    );

    // A hidden `.lay` strip is fully clipped (clip-path inset 100%), and
    // Chromium's IntersectionObserver counts the target's own clip-path, so
    // it would never report it as visible and the strip (e.g. the Booking
    // heading) stayed invisible. Observe the unclipped parent instead and
    // reveal the strip through it.
    const targetsOf = new Map<Element, HTMLElement[]>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            for (const el of targetsOf.get(entry.target) ?? []) el.classList.add("is-in");
            targetsOf.delete(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    pending
      .filter((el) => !el.classList.contains("is-in") && !layNow.includes(el))
      .forEach((el) => {
        const watch = el.classList.contains("lay") ? el.parentElement ?? el : el;
        targetsOf.set(watch, [...(targetsOf.get(watch) ?? []), el]);
        io.observe(watch);
      });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      delete root.dataset.motion;
    };
  }, []);
  return null;
}
