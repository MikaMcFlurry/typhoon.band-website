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
    pending
      .filter((el) => !el.classList.contains("is-in") && !layNow.includes(el))
      .forEach((el) => io.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      delete root.dataset.motion;
    };
  }, []);
  return null;
}
