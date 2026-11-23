"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  locale = "en",
  showLabel: _showLabel = false,
  className = "",
}: {
  locale?: "en" | "ar";
  showLabel?: boolean;
  className?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = locale === "ar";
  const currentTheme = mounted ? (resolvedTheme || theme) : "light";
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const ariaLabel = isDark
    ? isAr
      ? "التبديل إلى الوضع الفاتح"
      : "Switch to Light Mode"
    : isAr
      ? "التبديل إلى الوضع الداكن"
      : "Switch to Dark Mode";

  const iconSize = 18;
  const containerSize = "w-5 h-5";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex items-center justify-center p-2 rounded-sm text-luxury-muted hover:text-luxury-text transition-colors duration-200 ${className}`}
    >
      <span className={`relative ${containerSize} flex items-center justify-center flex-shrink-0 self-center`}>
        {!mounted ? (
          <span className="w-3.5 h-3.5 rounded-full border border-luxury-border opacity-40" />
        ) : isDark ? (
          <Sun size={iconSize} className="transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-300" />
        ) : (
          <Moon size={iconSize} className="transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </span>
    </button>
  );
}
