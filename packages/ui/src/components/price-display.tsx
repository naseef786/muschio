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

export function formatCurrency(amount: number, currency: Currency = "AED", locale: "en" | "ar" = "en"): string {
  const currencyLabels: Record<Currency, { en: string; ar: string }> = {
    AED: { en: "AED", ar: "د.إ" },
    SAR: { en: "SAR", ar: "ر.س" },
    USD: { en: "USD", ar: "$" },
    QAR: { en: "QAR", ar: "ر.ق" },
    KWD: { en: "KWD", ar: "د.ك" },
    OMR: { en: "OMR", ar: "ر.ع" },
    BHD: { en: "BHD", ar: "د.ب" },
  };

  const formattedNumber = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  const label = currencyLabels[currency][locale];
  return locale === "ar" ? `${formattedNumber} ${label}` : `${label} ${formattedNumber}`;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  currency = "AED",
  size = "md",
  locale = "en",
  className,
  ...props
}: PriceDisplayProps) {
  const isDiscounted = compareAtPrice && compareAtPrice > price;
  const discountPercent = isDiscounted ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

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
        {formatCurrency(price, currency, locale)}
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
            {formatCurrency(compareAtPrice, currency, locale)}
          </span>
          <span className="text-xs uppercase font-sans font-medium text-accent tracking-wider">
            {locale === "ar" ? `وفر ${discountPercent}%` : `Save ${discountPercent}%`}
          </span>
        </>
      )}
    </div>
  );
}
