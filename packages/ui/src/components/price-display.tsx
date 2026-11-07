"use client";

import * as React from "react";
import { Currency } from "@muschio/types";
import { cn } from "../utils/cn";

export interface PriceDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number;
  compareAtPrice?: number | null;
  currency?: Currency;
  size?: "sm" | "md" | "lg" | "xl";
  locale?: "en" | "ar";
}

const GCC_RATES: Record<Currency, number> = {
  AED: 1.0,
  SAR: 1.021,
  QAR: 0.992,
  KWD: 0.0832,
  BHD: 0.1027,
  OMR: 0.1048,
  USD: 0.2723,
};

const CURRENCY_LABELS: Record<Currency, { en: string; ar: string }> = {
  AED: { en: "AED", ar: "د.إ" },
  SAR: { en: "SAR", ar: "ر.س" },
  USD: { en: "USD", ar: "$" },
  QAR: { en: "QAR", ar: "ر.ق" },
  KWD: { en: "KWD", ar: "د.ك" },
  OMR: { en: "OMR", ar: "ر.ع" },
  BHD: { en: "BHD", ar: "د.ب" },
};

export function formatCurrency(amount: number, currency: Currency = "AED", locale: "en" | "ar" = "en"): string {
  const formattedNumber = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  const label = CURRENCY_LABELS[currency]?.[locale] || currency;
  return locale === "ar" ? `${formattedNumber} ${label}` : `${label} ${formattedNumber}`;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  currency,
  size = "md",
  locale = "en",
  className,
  ...props
}: PriceDisplayProps) {
  const [selectedCurrency, setSelectedCurrency] = React.useState<Currency>(currency || "AED");

  React.useEffect(() => {
    if (currency) {
      setSelectedCurrency(currency);
      return;
    }

    try {
      const saved = localStorage.getItem("muschio_preferred_currency") as Currency;
      if (saved && GCC_RATES[saved]) {
        setSelectedCurrency(saved);
      }
    } catch {}

    const onCurrencyChange = (e: any) => {
      if (e?.detail?.currency && GCC_RATES[e.detail.currency as Currency]) {
        setSelectedCurrency(e.detail.currency as Currency);
      }
    };

    window.addEventListener("muschio_currency_change", onCurrencyChange);
    return () => window.removeEventListener("muschio_currency_change", onCurrencyChange);
  }, [currency]);

  const activeCurr = currency || selectedCurrency;
  const rate = GCC_RATES[activeCurr] || 1;

  // Convert from baseline AED price to active currency
  const convertedPrice =
    activeCurr === "KWD" || activeCurr === "BHD" || activeCurr === "OMR"
      ? Math.round(price * rate * 10) / 10
      : Math.round(price * rate);

  const convertedCompare = compareAtPrice
    ? activeCurr === "KWD" || activeCurr === "BHD" || activeCurr === "OMR"
      ? Math.round(compareAtPrice * rate * 10) / 10
      : Math.round(compareAtPrice * rate)
    : null;

  const isDiscounted = convertedCompare && convertedCompare > convertedPrice;
  const discountPercent = isDiscounted ? Math.round(((convertedCompare - convertedPrice) / convertedCompare) * 100) : 0;

  return (
    <div className={cn("inline-flex items-baseline gap-2 flex-wrap", className)} {...props}>
      <span
        className={cn("font-sans font-semibold tracking-tight text-zinc-950 dark:text-zinc-50", {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-xl": size === "lg",
          "text-2xl md:text-3xl": size === "xl",
        })}
      >
        {formatCurrency(convertedPrice, activeCurr, locale)}
      </span>

      {isDiscounted && (
        <>
          <span
            className={cn("line-through text-zinc-400 dark:text-zinc-500 font-sans", {
              "text-xs": size === "sm" || size === "md",
              "text-sm": size === "lg",
              "text-lg": size === "xl",
            })}
          >
            {formatCurrency(convertedCompare, activeCurr, locale)}
          </span>
          <span className="text-xs uppercase font-sans font-medium text-accent tracking-wider">
            {locale === "ar" ? `وفر ${discountPercent}%` : `Save ${discountPercent}%`}
          </span>
        </>
      )}
    </div>
  );
}
