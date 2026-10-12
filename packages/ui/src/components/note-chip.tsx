import * as React from "react";
import { NotePosition } from "@muschio/types";
import { cn } from "../utils/cn";

export interface NoteChipProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  slug?: string;
  position?: NotePosition;
  href?: string;
  locale?: "en" | "ar";
  selected?: boolean;
}

export function NoteChip({
  name,
  slug,
  position,
  href,
  locale = "en",
  selected = false,
  className,
  ...props
}: NoteChipProps) {
  const positionLabel = {
    TOP: locale === "ar" ? "قمة" : "Top",
    HEART: locale === "ar" ? "قلب" : "Heart",
    BASE: locale === "ar" ? "قاعدة" : "Base",
  };

  const positionGlow = {
    TOP: "text-amber-500/90 dark:text-amber-400",
    HEART: "text-rose-500/90 dark:text-rose-400",
    BASE: "text-amber-700/90 dark:text-gold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-sans tracking-wide transition-all duration-300 rounded-full select-none backdrop-blur-md cursor-pointer",
        {
          "border border-gold/70 bg-gold/15 text-zinc-950 dark:text-white font-medium shadow-[0_0_15px_rgba(212,175,55,0.25)] ring-1 ring-gold/40":
            selected,
          "border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-zinc-800 dark:text-zinc-200 hover:border-gold/50 dark:hover:border-gold/40 hover:bg-white/95 dark:hover:bg-white/[0.08] hover:shadow-[0_4px_16px_rgba(212,175,55,0.12)] hover:-translate-y-0.5":
            !selected,
        },
        className
      )}
      {...props}
    >
      <span className={cn("font-serif text-base leading-none", position ? positionGlow[position] : "text-gold")}>
        ✦
      </span>
      <span className="font-medium text-[11px] sm:text-xs">{name}</span>
      {position && (
        <span
          className={cn(
            "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold",
            selected
              ? "bg-gold/25 text-zinc-950 dark:text-white"
              : "bg-zinc-100/90 dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
          )}
        >
          {positionLabel[position]}
        </span>
      )}
    </span>
  );
}
