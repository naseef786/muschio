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
  const glass = "border border-white/70 bg-white/80 text-neutral-900 shadow-sm backdrop-blur-md dark:border-white/20 dark:bg-neutral-950/80 dark:text-white";
  const arrow = "pointer-events-auto absolute top-1/2 z-20 hidden sm:flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent";

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
      <button type="button" aria-label={copy.previousImage} className={`${arrow} start-1.5`}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); select(index - 1); }}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/95 dark:hover:bg-neutral-900 ${glass}`}>
          <ChevronLeft size={15} strokeWidth={1.5} aria-hidden="true" className="rtl:rotate-180" />
        </span>
      </button>
      <button type="button" aria-label={copy.nextImage} className={`${arrow} end-1.5`}
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); select(index + 1); }}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/95 dark:hover:bg-neutral-900 ${glass}`}>
          <ChevronRight size={15} strokeWidth={1.5} aria-hidden="true" className="rtl:rotate-180" />
        </span>
      </button>
      <div className="pointer-events-auto absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-full bg-black/25 dark:bg-white/20 backdrop-blur-xs">
        {dots.map((dot) => (
          <button
            key={dot}
            type="button"
            aria-label={`${copy.image} ${dot + 1} ${copy.of} ${count}`}
            aria-current={dot === index ? "true" : undefined}
            className="p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              select(dot);
            }}
          >
            <span
              aria-hidden="true"
              className={`block h-1 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                dot === index
                  ? "w-3.5 bg-white shadow-xs"
                  : "w-1 bg-white/50 hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{copy.image} {index + 1} {copy.of} {count}</span>
    </div>
  );
}
