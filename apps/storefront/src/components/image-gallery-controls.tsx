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

  return (
    <div
      role="group"
      aria-label={copy.gallery}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between"
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
      {/* Backgroundless Previous Arrow - Pure icon, zero background, zero border, zero shadow */}
      <button
        type="button"
        aria-label={copy.previousImage}
        className="pointer-events-auto absolute start-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-transparent border-0 outline-none text-neutral-800/80 hover:text-black dark:text-neutral-200/80 dark:hover:text-white transition-all duration-150 active:scale-90 cursor-pointer drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          select(index - 1);
        }}
      >
        <ChevronLeft
          size={22}
          strokeWidth={1.75}
          aria-hidden="true"
          className="rtl:rotate-180"
        />
      </button>

      {/* Backgroundless Next Arrow - Pure icon, zero background, zero border, zero shadow */}
      <button
        type="button"
        aria-label={copy.nextImage}
        className="pointer-events-auto absolute end-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-transparent border-0 outline-none text-neutral-800/80 hover:text-black dark:text-neutral-200/80 dark:hover:text-white transition-all duration-150 active:scale-90 cursor-pointer drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          select(index + 1);
        }}
      >
        <ChevronRight
          size={22}
          strokeWidth={1.75}
          aria-hidden="true"
          className="rtl:rotate-180"
        />
      </button>

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {copy.image} {index + 1} {copy.of} {count}
      </span>
    </div>
  );
}
