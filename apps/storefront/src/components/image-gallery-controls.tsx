"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { productCardCopy } from "../lib/customer-copy";

export function ImageGalleryControls({
  count,
  index,
  onSelect,
  locale = "en",
}: {
  count: number;
  index: number;
  onSelect: (index: number) => void;
  locale?: "en" | "ar";
}) {
  if (count < 2) return null;
  const copy = productCardCopy[locale];
  const select = (next: number) => onSelect((next + count) % count);
  const arrowBtn =
    "pointer-events-auto absolute top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-transparent border-0 text-neutral-800 hover:text-black dark:text-neutral-200 dark:hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-white active:scale-90 opacity-80 hover:opacity-100";

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
      {/* Backgroundless Previous Arrow */}
      <button
        type="button"
        aria-label={copy.previousImage}
        className={`${arrowBtn} start-1`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          select(index - 1);
        }}
      >
        <ChevronLeft
          size={22}
          strokeWidth={1.5}
          aria-hidden="true"
          className="rtl:rotate-180 drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
        />
      </button>

      {/* Backgroundless Next Arrow */}
      <button
        type="button"
        aria-label={copy.nextImage}
        className={`${arrowBtn} end-1`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          select(index + 1);
        }}
      >
        <ChevronRight
          size={22}
          strokeWidth={1.5}
          aria-hidden="true"
          className="rtl:rotate-180 drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
        />
      </button>

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {copy.image} {index + 1} {copy.of} {count}
      </span>
    </div>
  );
}
