import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "accent" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-sans font-medium tracking-editorial uppercase text-xs transition-all duration-300 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          {
            "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200":
              variant === "primary",
            "bg-accent text-white hover:bg-accent-hover shadow-glow":
              variant === "accent",
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700":
              variant === "secondary",
            "border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 hover:border-zinc-900 dark:hover:border-zinc-100":
              variant === "outline",
            "bg-transparent text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white":
              variant === "ghost",
            "border border-gold bg-gold/10 text-gold hover:bg-gold hover:text-black":
              variant === "gold",
          },
          {
            "h-9 px-4 py-2 text-[11px]": size === "sm",
            "h-12 px-6 py-3 text-xs tracking-[0.15em]": size === "md",
            "h-14 px-8 py-4 text-sm tracking-[0.2em] font-medium": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
