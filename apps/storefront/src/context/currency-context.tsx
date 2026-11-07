"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Currency } from "@muschio/types";

export interface CurrencyOption {
  code: Currency;
  nameEn: string;
  nameAr: string;
  symbolEn: string;
  symbolAr: string;
  flag: string;
  rateFromAed: number; // Multiply AED price by this rate
}

export const GCC_CURRENCIES: Record<Currency, CurrencyOption> = {
  AED: {
    code: "AED",
    nameEn: "UAE Dirham",
    nameAr: "درهم إماراتي",
    symbolEn: "AED",
    symbolAr: "د.إ",
    flag: "🇦🇪",
    rateFromAed: 1.0,
  },
  SAR: {
    code: "SAR",
    nameEn: "Saudi Riyal",
    nameAr: "ريال سعودي",
    symbolEn: "SAR",
    symbolAr: "ر.س",
    flag: "🇸🇦",
    rateFromAed: 1.021,
  },
  QAR: {
    code: "QAR",
    nameEn: "Qatari Riyal",
    nameAr: "ريال قطري",
    symbolEn: "QAR",
    symbolAr: "ر.ق",
    flag: "🇶🇦",
    rateFromAed: 0.992,
  },
  KWD: {
    code: "KWD",
    nameEn: "Kuwaiti Dinar",
    nameAr: "دينار كويتي",
    symbolEn: "KWD",
    symbolAr: "د.ك",
    flag: "🇰🇼",
    rateFromAed: 0.0832,
  },
  BHD: {
    code: "BHD",
    nameEn: "Bahraini Dinar",
    nameAr: "دينار بحريني",
    symbolEn: "BHD",
    symbolAr: "د.ب",
    flag: "🇧🇭",
    rateFromAed: 0.1027,
  },
  OMR: {
    code: "OMR",
    nameEn: "Omani Rial",
    nameAr: "ريال عماني",
    symbolEn: "OMR",
    symbolAr: "ر.ع",
    flag: "🇴🇲",
    rateFromAed: 0.1048,
  },
  USD: {
    code: "USD",
    nameEn: "US Dollar",
    nameAr: "دولار أمريكي",
    symbolEn: "USD",
    symbolAr: "$",
    flag: "🌐",
    rateFromAed: 0.2723,
  },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: Currency) => void;
  currencyInfo: CurrencyOption;
  convertPrice: (aedAmount: number) => number;
  formatPrice: (aedAmount: number, locale?: "en" | "ar") => string;
  allCurrencies: CurrencyOption[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("AED");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("muschio_preferred_currency") as Currency;
      if (saved && GCC_CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    } catch {
      // LocalStorage access
    }
  }, []);

  const setCurrency = (code: Currency) => {
    if (GCC_CURRENCIES[code]) {
      setCurrencyState(code);
      try {
        localStorage.setItem("muschio_preferred_currency", code);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("muschio_currency_change", { detail: { currency: code } }));
        }
      } catch {}
    }
  };

  const currencyInfo = GCC_CURRENCIES[currency] || GCC_CURRENCIES.AED;

  const convertPrice = (aedAmount: number): number => {
    const converted = Number(aedAmount) * currencyInfo.rateFromAed;
    // For dinars (KWD, BHD, OMR) 3 decimals or rounded; for standard GCC currencies 2 decimals
    if (currency === "KWD" || currency === "BHD" || currency === "OMR") {
      return Math.round(converted * 10) / 10;
    }
    return Math.round(converted);
  };

  const formatPrice = (aedAmount: number, locale: "en" | "ar" = "en"): string => {
    const val = convertPrice(aedAmount);
    const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);

    const symbol = locale === "ar" ? currencyInfo.symbolAr : currencyInfo.symbolEn;
    return locale === "ar" ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyInfo,
        convertPrice,
        formatPrice,
        allCurrencies: Object.values(GCC_CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback safe context if called outside provider
    return {
      currency: "AED" as Currency,
      setCurrency: () => {},
      currencyInfo: GCC_CURRENCIES.AED,
      convertPrice: (amt: number) => amt,
      formatPrice: (amt: number, loc: "en" | "ar" = "en") => (loc === "ar" ? `${amt} د.إ` : `AED ${amt}`),
      allCurrencies: Object.values(GCC_CURRENCIES),
    };
  }
  return context;
}
