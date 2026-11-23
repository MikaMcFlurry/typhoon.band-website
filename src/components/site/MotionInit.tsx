"use client";

import { useEffect } from "react";

// Progressive motion. Content is visible by default; only when JS runs,
// IntersectionObserver exists and the visitor has not asked for reduced
// motion do `.reveal` (rise) and `.lay` (tape laid from the left) elements
// start hidden and enter once.
//   - `.reveal` already on screen is shown immediately (no flash on load)
//   - `.lay` already on screen is laid on the next frame: the hero's tape
//     strips are the page's one authored entrance.
// This component lives in the persistent site layout, so it also has to
// pick up elements that arrive later: a client-side navigation (privacy
// page → back home) renders a fresh home page under the same layout. A
// MutationObserver registers every new `.reveal`/`.lay` as it is inserted,
// before the browser paints it.
export function MotionInit() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window) || !("MutationObserver" in window)) return;

    // A hidden `.lay` strip is fully clipped (clip-path inset 100%), and
    // Chromium's IntersectionObserver counts the target's own clip-path, so
    // it would never report it as visible. Observe the unclipped parent
    // instead and reveal the strip through it.
    const targetsOf = new Map<Element, HTMLElement[]>();
    const seen = new WeakSet<HTMLElement>();
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

    let raf = 0;
    const register = (els: Iterable<HTMLElement>) => {
      const vh = window.innerHeight;
      const layNow: HTMLElement[] = [];
      for (const el of els) {
        if (seen.has(el) || el.classList.contains("is-in")) continue;
        seen.add(el);
        if (el.getBoundingClientRect().top < vh * 0.9) {
          if (el.classList.contains("lay")) layNow.push(el);
          else el.classList.add("is-in");
          continue;
        }
        const watch = el.classList.contains("lay") ? el.parentElement ?? el : el;
        targetsOf.set(watch, [...(targetsOf.get(watch) ?? []), el]);
        io.observe(watch);
      }
      if (layNow.length) {
        raf = requestAnimationFrame(() =>
          requestAnimationFrame(() => layNow.forEach((el) => el.classList.add("is-in"))),
        );
      }
    };

    register(document.querySelectorAll<HTMLElement>(".reveal, .lay"));
    root.dataset.motion = "on";

    const mo = new MutationObserver((records) => {
      const found: HTMLElement[] = [];
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(".reveal, .lay")) found.push(node);
          node.querySelectorAll<HTMLElement>(".reveal, .lay").forEach((el) => found.push(el));
        });
      }
      if (found.length) register(found);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
      delete root.dataset.motion;
    };
  }, []);
  return null;
}
