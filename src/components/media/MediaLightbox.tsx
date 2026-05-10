"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";

type GalleryItem = { id: string; src: string; alt: string };

type Props = {
  items: GalleryItem[];
  /** Currently open index, or null for closed. */
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

export function MediaLightbox({ items, index, onClose, onIndexChange }: Props) {
  const { dict } = useDict();
  const total = items.length;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % total);
  }, [index, total, onIndexChange]);

  // Keyboard: ←/→ navigate, Esc closes.
  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goPrev, goNext, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (index === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [index]);

  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      aria-label={dict.media.kicker}
      aria-modal="true"
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-[rgba(3,2,1,0.94)] p-4 backdrop-blur-md md:p-8"
      role="dialog"
    >
      <button
        aria-label={dict.media.close}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[color:var(--line)] bg-[rgba(3,2,1,0.6)] text-[color:var(--cream)] transition hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)]"
        onClick={onClose}
        type="button"
      >
        <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <button
        aria-label={dict.media.prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-[color:var(--line)] bg-[rgba(3,2,1,0.6)] text-[color:var(--cream)] transition hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)] md:left-6"
        onClick={goPrev}
        type="button"
      >
        <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M14 6l-6 6 6 6" />
        </svg>
      </button>

      <div className="relative flex h-full max-h-[85vh] w-full max-w-[1200px] items-center justify-center">
        <Image
          alt={item.alt}
          className="h-auto max-h-[85vh] w-auto max-w-full object-contain"
          height={1500}
          priority
          src={item.src}
          width={1500}
        />
      </div>

      <button
        aria-label={dict.media.next}
        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-[color:var(--line)] bg-[rgba(3,2,1,0.6)] text-[color:var(--cream)] transition hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)] md:right-6"
        onClick={goNext}
        type="button"
      >
        <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path d="M10 6l6 6-6 6" />
        </svg>
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-[color:var(--line)] bg-[rgba(3,2,1,0.6)] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)] md:bottom-5">
        {index + 1} / {total}
      </div>
    </div>
  );
}

export function useLightbox(items: GalleryItem[]) {
  const [index, setIndex] = useState<number | null>(null);
  return {
    open: (i: number) => setIndex(i),
    close: () => setIndex(null),
    setIndex,
    index,
    items,
  };
}
