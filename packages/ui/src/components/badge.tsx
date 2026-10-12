import * as React from "react";
import { cn } from "../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "niche" | "designer" | "accent" | "outline" | "gold" | "stock";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center text-[10px] uppercase font-sans tracking-widest px-2.5 py-0.5 transition-colors border",
        {
          "border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200":
            variant === "default",
          "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-medium":
            variant === "niche",
          "border-zinc-300 bg-transparent text-zinc-600 dark:border-zinc-700 dark:text-zinc-400":
            variant === "designer",
          "border-accent/30 bg-accent/10 text-accent font-medium":
            variant === "accent",
          "border-gold/30 bg-gold/5 text-gold-dark dark:text-gold":
            variant === "gold",
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400":
            variant === "stock",
          "border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
