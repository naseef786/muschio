"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { productCardCopy } from "../lib/customer-copy";

export function ImageGalleryControls({ count, index, onSelect, locale = "en" }: {
  count: number;
  index: number;
  onSelect: (index: number) => void;
  locale?: "en" | "ar";
}) {
  if (count < 2) return null;
  const copy = productCardCopy[locale];
  const dots = Array.from({ length: count }, (_, dot) => dot);
  const select = (next: number) => onSelect((next + count) % count);
  const glass = "border border-white/70 bg-white/45 text-neutral-900 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-neutral-950/40 dark:text-white";
  const arrow = "pointer-events-auto absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <div
      role="group"
      aria-label={copy.gallery}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="pointer-events-none absolute inset-0 z-20"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        event.stopPropagation();
        select(index + ((event.key === "ArrowRight") !== (locale === "ar") ? 1 : -1));
      }}
    >
      <button type="button" aria-label={copy.previousImage} className={`${arrow} start-1`}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); select(index - 1); }}>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/80 dark:hover:bg-neutral-900/80 ${glass}`}>
          <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" className="rtl:rotate-180" />
        </span>
      </button>
      <button type="button" aria-label={copy.nextImage} className={`${arrow} end-1`}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); select(index + 1); }}>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/80 dark:hover:bg-neutral-900/80 ${glass}`}>
          <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" className="rtl:rotate-180" />
        </span>
      </button>
      <div className={`pointer-events-auto absolute bottom-3 left-1/2 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center rounded-full px-2 py-1 ${glass}`}>
        {dots.map((dot) => (
          <button key={dot} type="button" aria-label={`${copy.image} ${dot + 1} ${copy.of} ${count}`}
            aria-current={dot === index ? "true" : undefined}
            className="flex h-8 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); select(dot); }}>
            <span aria-hidden="true" className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${dot === index ? "w-4 bg-accent shadow-[0_0_8px_rgba(166,137,101,0.25)]" : "w-1.5 bg-neutral-900/30 dark:bg-white/40"}`} />
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{copy.image} {index + 1} {copy.of} {count}</span>
    </div>
  );
}
