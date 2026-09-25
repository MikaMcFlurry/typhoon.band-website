"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// Contact-sheet gallery with an in-site viewer (never a new tab): keyboard
// (Esc, ←, →), swipe, counter, captions, focus trap and focus return.

export type GalleryImage = { id: string; src: string; alt: string };

function tileClass(i: number, count: number) {
  if (i === 0) return "col-span-2 aspect-[4/3] md:col-span-6 md:row-span-2 md:aspect-auto";
  const lastAlone = (count - 1) % 2 === 1 && i === count - 1;
  const mobile = lastAlone ? "col-span-2" : "";
  const desktop = i <= 4 ? "md:col-span-3" : "md:col-span-4";
  return `${mobile} aspect-[4/3] ${desktop}`;
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
    <section aria-labelledby="media-title" className="section border-t border-line bg-ink-2" id="media">
      <div className="container-x">
        <h2 className="h-section reveal" id="media-title">
          {dict.media.title}
        </h2>

        <ul className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-12 md:gap-4">
          {items.map((item, i) => (
            <li className={`reveal ${tileClass(i, count)}`} key={item.id} style={{ ["--reveal-delay" as string]: `${(i % 4) * 50}ms` }}>
              <button
                aria-label={`${dict.media.open}: ${item.alt}`}
                className="group relative block size-full overflow-hidden rounded-md border border-line bg-ink-3"
                onClick={() => setIndex(i)}
                ref={(el) => {
                  triggerRefs.current[i] = el;
                }}
                type="button"
              >
                <Image
                  alt=""
                  className="object-cover sepia-img transition-[filter] duration-500 group-hover:[filter:none]"
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
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95"
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
          <div className="container-x flex h-16 flex-none items-center justify-between">
            <p aria-live="polite" className="tabular text-[0.9375rem] text-paper-2">
              {fill(dict.media.counter, { index: index + 1, total: count })}
            </p>
            <button
              aria-label={dict.media.close}
              className="icon-btn text-paper"
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
              className="icon-btn absolute left-2 top-1/2 hidden -translate-y-1/2 bg-ink/70 text-paper sm:inline-flex"
              onClick={() => step(-1)}
              type="button"
            >
              <Icon name="arrow-left" size={22} />
            </button>
            <button
              aria-label={dict.media.next}
              className="icon-btn absolute right-2 top-1/2 hidden -translate-y-1/2 bg-ink/70 text-paper sm:inline-flex"
              onClick={() => step(1)}
              type="button"
            >
              <Icon name="arrow-right" size={22} />
            </button>
          </div>

          <div className="container-x flex flex-none items-center justify-between gap-4 py-4">
            <button aria-label={dict.media.prev} className="icon-btn text-paper sm:hidden" onClick={() => step(-1)} type="button">
              <Icon name="arrow-left" size={22} />
            </button>
            <p className="mx-auto max-w-[60ch] text-center text-[0.9375rem] text-paper-2">{current.alt}</p>
            <button aria-label={dict.media.next} className="icon-btn text-paper sm:hidden" onClick={() => step(1)} type="button">
              <Icon name="arrow-right" size={22} />
            </button>
          </div>

        </div>
      ) : null}
    </section>
  );
}
