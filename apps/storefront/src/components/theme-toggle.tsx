"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  locale = "en",
  showLabel = false,
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

  const label = isDark
    ? isAr
      ? "الوضع النهاري"
      : "Light Luxury"
    : isAr
      ? "الوضع الليلي"
      : "Dark Obsidian";

  const ariaLabel = isDark
    ? isAr
      ? "التبديل إلى الوضع النهاري"
      : "Switch to Light Luxury theme"
    : isAr
      ? "التبديل إلى الوضع الليلي"
      : "Switch to Dark Obsidian theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-sm text-luxury-muted hover:text-luxury-text transition-colors duration-200 ${className}`}
    >
      <span className="relative w-5 h-5 flex items-center justify-center">
        {!mounted ? (
          <span className="w-4 h-4 rounded-full border border-luxury-border opacity-40" />
        ) : isDark ? (
          <Sun size={19} className="transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-300" />
        ) : (
          <Moon size={19} className="transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </span>
      {showLabel && (
        <span className="text-xs uppercase tracking-wider font-medium text-luxury-text">
          {mounted ? label : (isAr ? "الوضع" : "Theme")}
        </span>
      )}
    </button>
  );
}
