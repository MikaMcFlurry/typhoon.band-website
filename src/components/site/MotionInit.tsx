"use client";

import { useEffect } from "react";

// Progressive scroll reveals. Content is visible by default; only when JS
// runs, IntersectionObserver exists and the visitor has not asked for
// reduced motion do `.reveal` elements start hidden and fade in once.
//
// The revealed state lives in `data-revealed`, an attribute React never
// manages, so a re-render that rewrites `className` (CollapsibleList) cannot
// hide an element again. A MutationObserver picks up `.reveal` nodes added
// later (client-side navigation back to the home page, expanded lists), and
// elements without a layout box (display:none) are observed instead of being
// marked as seen.
export function MotionInit() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    const reveal = (el: Element) => {
      (el as HTMLElement).dataset.revealed = "";
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const handle = (el: HTMLElement) => {
      if (el.hasAttribute("data-revealed")) return;
      const onScreen =
        el.getClientRects().length > 0 &&
        el.getBoundingClientRect().top < window.innerHeight * 0.9;
      // Anything already on screen is shown immediately (no flash).
      if (onScreen) reveal(el);
      else io.observe(el);
    };

    const scan = (node: ParentNode) => {
      if (node instanceof HTMLElement && node.classList.contains("reveal")) handle(node);
      node.querySelectorAll<HTMLElement>(".reveal").forEach(handle);
    };

    scan(document);
    root.dataset.motion = "on";

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) scan(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      delete root.dataset.motion;
    };
  }, []);
  return null;
}
