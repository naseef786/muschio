"use client";

import React from "react";
import Image from "next/image";
import { Link, useRouter } from "../navigation";
import { useCompare } from "../context/compare-context";
import { ArrowLeftRight, X, ChevronDown, ChevronUp, Trash2, Scale } from "lucide-react";

interface CompareBarProps {
  locale: "en" | "ar";
}

export function CompareBar({ locale }: CompareBarProps) {
  const isAr = locale === "ar";
  const router = useRouter();
  const { items, itemCount, removeItem, clearCompare, isDockOpen, setIsDockOpen } =
    useCompare();

  if (itemCount === 0) return null;

  const handleLaunchCompare = () => {
    // Navigate to full compare page or open compare modal
    const slugs = items.map((i) => i.slug).join(",");
    router.push(`/compare?items=${encodeURIComponent(slugs)}`);
  };

  return (
    <aside
      aria-label={isAr ? "شريط مقارنة العطور" : "Fragrance Comparison Bar"}
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-auto transition-transform duration-300"
    >
      {/* Floating Pill Toggle (visible when dock is minimized) */}
      {!isDockOpen && (
        <div className="max-w-7xl mx-auto px-4 pb-3 flex justify-end">
          <button
            onClick={() => setIsDockOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-luxury-surface/95 backdrop-blur-md border border-accent/60 shadow-xl text-luxury-text hover:border-accent text-xs font-sans tracking-wider uppercase transition-all duration-200 group"
          >
            <ArrowLeftRight size={15} className="text-accent group-hover:scale-110 transition-transform" />
            <span className="font-medium">
              {isAr ? `مقارنة العطور (${itemCount})` : `Compare Scents (${itemCount})`}
            </span>
            <ChevronUp size={15} className="text-luxury-muted" />
          </button>
        </div>
      )}

      {/* Main Comparison Dock */}
      {isDockOpen && (
        <div className="bg-[#0D1117]/95 dark:bg-[#0D1117]/95 backdrop-blur-xl border-t border-luxury-border/80 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4">
            {/* Top Bar inside dock */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-sans">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                  <ArrowLeftRight size={12} />
                </div>
                <span className="font-medium tracking-widest uppercase text-[11px] text-accent">
                  {isAr ? "منصة مقارنة العطور الملكية" : "Haute Parfumerie Comparison"}
                </span>
                <span className="text-white/40 text-[10px] font-mono">
                  ({itemCount}/4 {isAr ? "عطور مختارة" : "selected"})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-white/50 hover:text-rose-400 text-[11px] flex items-center gap-1 transition-colors"
                  title={isAr ? "مسح جميع العطور" : "Clear all items"}
                >
                  <Trash2 size={12} />
                  <span className="hidden sm:inline">{isAr ? "مسح الكل" : "Clear"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDockOpen(false)}
                  className="text-white/50 hover:text-white p-1 rounded transition-colors"
                  title={isAr ? "تصغير الشريط" : "Minimize"}
                  aria-label="Minimize comparison bar"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Row: Flacon Cards + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Product Flacon Slots */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="relative flex items-center gap-2.5 p-1.5 sm:p-2 rounded bg-white/5 border border-white/10 hover:border-accent/50 transition-all shrink-0 max-w-[190px] sm:max-w-[210px] group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-10 h-12 bg-white/10 rounded overflow-hidden shrink-0 border border-white/10">
                      <Image
                        src={item.image || "/product-placeholder.svg"}
                        alt={item.nameEn}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="text-[10px] text-accent truncate block uppercase tracking-wider font-medium">
                        {item.brand}
                      </span>
                      <h4 className="text-[11px] text-white font-medium truncate leading-tight">
                        {isAr && item.nameAr ? item.nameAr : item.nameEn}
                      </h4>
                      <span className="text-[10px] text-white/60 font-mono block">
                        {item.price} AED
                      </span>
                    </div>

                    {/* Remove Icon */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/30 text-white/70 hover:text-white hover:bg-rose-600 flex items-center justify-center transition-all shadow-md"
                      title={isAr ? "إزالة من المقارنة" : "Remove from compare"}
                      aria-label={`Remove ${item.nameEn}`}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}

                {/* Empty Add Slot */}
                {itemCount < 4 && (
                  <Link
                    href="/shop"
                    className="flex items-center gap-2 px-3 py-2.5 rounded border border-dashed border-white/20 hover:border-accent/60 text-white/50 hover:text-accent transition-all shrink-0 text-xs font-sans"
                  >
                    <span className="w-6 h-6 rounded-full border border-dashed border-white/30 flex items-center justify-center text-xs">
                      +
                    </span>
                    <span className="text-[11px]">
                      {isAr ? "إضافة عطر آخر" : "Add another flacon"}
                    </span>
                  </Link>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:shrink-0 justify-end pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={handleLaunchCompare}
                  className="w-full sm:w-auto px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-luxury-canvas font-sans font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95"
                >
                  <Scale size={14} />
                  <span>
                    {isAr
                      ? `قارن العطور الآن (${itemCount})`
                      : `Compare Fragrances (${itemCount})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
