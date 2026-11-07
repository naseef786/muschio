"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCurrency, GCC_CURRENCIES } from "../context/currency-context";
import { ChevronDown, Check } from "lucide-react";

export function CurrencySwitcher({ locale = "en" }: { locale?: "en" | "ar" }) {
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAr = locale === "ar";

  const active = GCC_CURRENCIES[currency] || GCC_CURRENCIES.AED;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={isAr ? "اختيار العملة" : "Select Currency"}
        className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-sans font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
      >
        <span className="text-xs leading-none">{active.flag}</span>
        <span className="font-mono">{active.code}</span>
        <ChevronDown size={11} className={`text-neutral-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute end-0 mt-1.5 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 mb-1">
            {isAr ? "العملة الإقليمية" : "GCC & Global Currencies"}
          </div>

          {allCurrencies.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full text-start px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-medium"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{c.flag}</span>
                  <span className="font-mono text-[11px] font-semibold">{c.code}</span>
                  <span className="text-[11px] text-neutral-500 font-sans truncate max-w-[85px]">
                    {isAr ? c.nameAr : c.nameEn}
                  </span>
                </div>
                {isSelected && <Check size={12} className="text-neutral-900 dark:text-white shrink-0 ms-1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
