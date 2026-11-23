"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, usePathname } from "../navigation";
import { useCart } from "../context/cart-context";
import { customerCopy } from "../lib/customer-copy";
import { PriceDisplay } from "@muschio/ui";
import {
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Truck,
  Check,
} from "lucide-react";

interface FloatingCartBarProps {
  locale?: "en" | "ar";
}

const FREE_SHIPPING_THRESHOLD = 500;

export function FloatingCartBar({ locale = "en" }: FloatingCartBarProps) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => customerCopy(en, ar, isAr);

  const pathname = usePathname();
  const { items, itemCount, subtotal, setCartDrawerOpen } = useCart();
  const [isMinimized, setIsMinimized] = useState(false);

  // STRICT RULE: Do NOT show on Product Detail Pages (PDP), as PDP has its own sticky purchase bar.
  // Also do NOT show on Checkout, Cart, or Order Confirmation pages.
  const isPdp = typeof pathname === "string" && pathname.startsWith("/product");
  const isExcludedPage =
    typeof pathname === "string" &&
    (pathname.startsWith("/checkout") ||
      pathname.startsWith("/cart") ||
      pathname.startsWith("/order-confirmation"));

  if (itemCount === 0 || isPdp || isExcludedPage) {
    return null;
  }

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <aside
      aria-label={c("Active shopping bag summary", "ملخص حقيبة التسوق الحالية")}
      className="fixed bottom-3 sm:bottom-5 inset-x-0 z-30 pointer-events-none select-none px-3 sm:px-6"
    >
      <div className="max-w-xl mx-auto pointer-events-auto">
        {/* Minimized Floating Luxury Pill */}
        {isMinimized ? (
          <div className="flex justify-center sm:justify-start">
            <button
              onClick={() => setIsMinimized(false)}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-full bg-luxury-surface/95 dark:bg-luxury-surface2/95 backdrop-blur-md text-luxury-text border border-luxury-border shadow-luxury dark:shadow-luxury-dark hover:border-accent transition-all duration-200"
              aria-label={c("Expand bag summary", "عرض ملخص الحقيبة")}
            >
              <div className="relative">
                <ShoppingBag size={18} className="text-accent group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1.5 -end-2 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-sans">
                <span className="text-luxury-muted font-light">
                  {c("Bag:", "الحقيبة:")}
                </span>
                <span className="font-semibold text-luxury-text">
                  <PriceDisplay price={subtotal} locale={locale} size="sm" />
                </span>
              </div>
              <ChevronUp size={14} className="text-luxury-muted group-hover:text-luxury-text transition-colors" />
            </button>
          </div>
        ) : (
          /* Full Expanded Floating Luxury Bar — Follows App Theme Perfectly */
          <div className="bg-luxury-surface/95 dark:bg-luxury-surface2/95 backdrop-blur-md text-luxury-text border border-luxury-border shadow-[0_12px_36px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] rounded-2xl p-3 sm:px-4 sm:py-3 transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Thumbnail Preview Stack & Total */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(true)}
                  className="flex -space-x-2 rtl:space-x-reverse overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                  title={c("Click to view bag items", "انقر لعرض المنتجات في الحقيبة")}
                >
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-luxury-surface bg-luxury-surface2 overflow-hidden shrink-0 shadow-xs"
                    >
                      <Image
                        src={item.image}
                        alt={isAr ? item.titleAr || item.title : item.title}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-luxury-surface bg-luxury-surface2 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 shadow-xs">
                      +{items.length - 3}
                    </div>
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-medium text-luxury-text whitespace-nowrap">
                      {isAr
                        ? `${itemCount} ${itemCount === 1 ? "عطر" : "عطور"}`
                        : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                    </span>
                    <span className="text-luxury-muted text-xs">•</span>
                    <span className="text-xs sm:text-sm font-serif text-accent font-semibold shrink-0">
                      <PriceDisplay price={subtotal} locale={locale} size="sm" />
                    </span>
                  </div>

                  {/* Free Delivery Status Indicator */}
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans mt-0.5 truncate">
                    {isFreeShipping ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <Check size={11} className="stroke-[3]" />
                        <span>{c("Complimentary UAE Delivery", "توصيل مجاني داخل الإمارات")}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-luxury-muted">
                        <Truck size={11} className="text-accent" />
                        <span>
                          {c("Add", "أضف")}{" "}
                          <strong className="text-luxury-text">
                            {remainingForFreeShipping.toFixed(0)} {c("AED", "د.إ")}
                          </strong>{" "}
                          {c("for free delivery", "للتوصيل المجاني")}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions Cluster */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Review Bag Button */}
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-luxury-border hover:border-luxury-borderBold text-xs text-luxury-muted hover:text-luxury-text transition-colors"
                >
                  <ShoppingBag size={13} className="text-accent" />
                  <span>{c("Bag", "الحقيبة")}</span>
                </button>

                {/* Direct Checkout CTA */}
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent hover:bg-accent/90 text-white text-xs font-medium tracking-wide shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{c("Checkout", "الدفع")}</span>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>

                {/* Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-full text-luxury-muted hover:text-luxury-text transition-colors ms-0.5"
                  title={c("Minimize bar", "تصغير الشريط")}
                  aria-label={c("Minimize bag bar", "تصغير شريط الحقيبة")}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
