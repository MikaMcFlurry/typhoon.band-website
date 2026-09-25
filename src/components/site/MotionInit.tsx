"use client";

import { useEffect } from "react";

// Progressive scroll reveals. Content is visible by default; only when JS
// runs, IntersectionObserver exists and the visitor has not asked for
// reduced motion do `.reveal` elements start hidden and fade in once.
export function MotionInit() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    const pending = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    // Anything already on screen is shown immediately (no flash on load).
    const vh = window.innerHeight;
    for (const el of pending) {
      if (el.getBoundingClientRect().top < vh * 0.9) el.classList.add("is-in");
    }
    root.dataset.motion = "on";

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    pending.filter((el) => !el.classList.contains("is-in")).forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      delete root.dataset.motion;
    };
  }, []);
  return null;
}
