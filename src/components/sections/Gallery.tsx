"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// Photo wall with an in-site viewer (never a new tab): keyboard (Esc, ←, →),
// swipe, counter, captions, focus trap and focus return. Photos are shown
// in their own colour; no sepia filter, no hover zoom.

export type GalleryImage = { id: string; src: string; alt: string };

// Balanced contact sheet for any number of images (Admin decides how many).
// Mobile (2 cols): first image full width, then pairs; an odd last image
// spans both columns. Desktop (12 cols): one large tile + four small ones,
// then rows of three; a remainder is spread over rows of two so no image
// is ever left alone in a row.
function tileClass(i: number, count: number) {
  const mobileLastAlone = i > 0 && (count - 1) % 2 === 1 && i === count - 1;
  const mobile = i === 0 || mobileLastAlone ? "col-span-2" : "";
  let desktop: string;
  if (count < 5) {
    desktop = count === 1 ? "md:col-span-12" : count === 3 ? "md:col-span-4" : "md:col-span-6";
  } else if (i === 0) {
    desktop = "md:col-span-6 md:row-span-2 md:aspect-auto";
  } else if (i <= 4) {
    desktop = "md:col-span-3";
  } else {
    const rest = count - 5;
    const idx = i - 5;
    const remainder = rest % 3;
    // Items that must go into rows of two: 2 when remainder is 2, 4 when 1.
    const pairItems = remainder === 2 ? 2 : remainder === 1 ? (rest >= 4 ? 4 : 1) : 0;
    const inPairs = idx >= rest - pairItems;
    desktop = inPairs ? (pairItems === 1 ? "md:col-span-12" : "md:col-span-6") : "md:col-span-4";
  }
  // A full-width single tile would be huge at 4:3; use a cinematic crop.
  const wide =
    desktop === "md:col-span-12"
      ? "md:aspect-[21/9]"
      : desktop === "md:col-span-6"
        ? "md:aspect-[16/10]"
        : "";
  return `${mobile} aspect-[4/3] ${desktop} ${wide}`;
}

export function Gallery({ items }: { items: GalleryImage[] }) {
  const { dict } = useDict();
  const [index, setIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);
  const count = items.length;

  const close = useCallback(() => {
    setIndex((current) => {
      if (current !== null) {
        // Return focus to the thumbnail that opened the viewer.
        requestAnimationFrame(() => triggerRefs.current[current]?.focus());
      }
      return null;
    });
  }, []);
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count)),
    [count],
  );

  useEffect(() => {
    if (index === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = dialogRef.current;
    node?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && node) {
        const f = Array.from(node.querySelectorAll<HTMLElement>("button")).filter(
          (b) => b.offsetParent !== null,
        );
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  if (count === 0) return null;
  const current = index !== null ? items[index] : null;

  return (
    <section aria-labelledby="media-title" className="block-y border-t border-rule" id="media">
      <div className="shell">
        <h2 className="h-stage reveal" id="media-title">
          {dict.media.title}
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-12 md:gap-4">
          {items.map((item, i) => (
            <li className={`reveal relative ${tileClass(i, count)}`} key={item.id} style={{ ["--reveal-delay" as string]: `${(i % 4) * 50}ms` }}>
              {/* Contact sheet: each print is taped to the wall and numbered. */}
              <span
                aria-hidden
                className={`tape-piece pointer-events-none -top-2 left-1/2 z-10 !h-4 !w-14 -translate-x-1/2 !bg-gaffer ${i % 2 ? "rotate-3" : "-rotate-2"}`}
              />
              <span aria-hidden className="mono-cap pointer-events-none absolute bottom-2 left-2 z-10 bg-deck px-1.5 py-0.5 text-chalk">
                {String(i + 1).padStart(2, "0")}
              </span>
              <button
                aria-label={`${dict.media.open}: ${item.alt}`}
                className="group relative block size-full overflow-hidden bg-deck-3 outline-offset-4 hover:outline hover:outline-2 hover:outline-chalk"
                onClick={() => setIndex(i)}
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                type="button"
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  src={item.src}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {current && index !== null ? (
        <div
          aria-label={dict.media.title}
          aria-modal="true"
          className="fixed inset-0 z-[80] flex flex-col bg-deck/[0.97]"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          ref={dialogRef}
          role="dialog"
        >
          <div className="shell flex h-16 flex-none items-center justify-between">
            <p aria-live="polite" className="mono-cap text-chalk-2">
              {fill(dict.media.counter, { index: index + 1, total: count })}
            </p>
            <button
              aria-label={dict.media.close}
              className="ctl text-chalk"
              data-autofocus
              onClick={close}
              type="button"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          <div
            className="relative mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 items-center px-4 sm:px-16"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <figure className="relative size-full">
              <Image
                alt={current.alt}
                className="object-contain"
                fill
                key={current.id}
                sizes="100vw"
                src={current.src}
              />
            </figure>
            <button
              aria-label={dict.media.prev}
              className="ctl absolute left-2 top-1/2 hidden -translate-y-1/2 bg-deck text-chalk sm:inline-flex"
              onClick={() => step(-1)}
              type="button"
            >
              <Icon name="arrow-left" size={22} />
            </button>
            <button
              aria-label={dict.media.next}
              className="ctl absolute right-2 top-1/2 hidden -translate-y-1/2 bg-deck text-chalk sm:inline-flex"
              onClick={() => step(1)}
              type="button"
            >
              <Icon name="arrow-right" size={22} />
            </button>
          </div>

          <div className="shell flex flex-none items-center justify-between gap-4 py-4">
            <button aria-label={dict.media.prev} className="ctl text-chalk sm:hidden" onClick={() => step(-1)} type="button">
              <Icon name="arrow-left" size={22} />
            </button>
            <p className="mono mx-auto max-w-[60ch] text-center text-chalk-2">{current.alt}</p>
            <button aria-label={dict.media.next} className="ctl text-chalk sm:hidden" onClick={() => step(1)} type="button">
              <Icon name="arrow-right" size={22} />
            </button>
          </div>

        </div>
      ) : null}
    </section>
  );
}
