"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "../navigation";
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";
import { ProductCard, ProductCardProps } from "./product-card";

export interface CollectionSliderProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  viewAllHref?: string;
  viewAllText?: string;
  products: ProductCardProps[];
  collections?: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    slug?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    products: ProductCardProps[];
  }>;
  locale: "en" | "ar";
  enableTabs?: boolean;
  className?: string;
}

export function CollectionSlider({
  title,
  subtitle,
  eyebrow,
  viewAllHref = "/shop",
  viewAllText,
  products,
  collections,
  locale,
  enableTabs = true,
  className = "",
}: CollectionSliderProps) {
  const isAr = locale === "ar";
  const c = (en: string, arText: string) => (isAr ? arText : en);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("all");

  const validCollections = React.useMemo(() => {
    return (collections || []).filter((col) => col.products && col.products.length > 0);
  }, [collections]);

  // Dynamic tabs: only show collections/categories that actually exist in the live catalog
  const tabs = React.useMemo(() => {
    if (validCollections.length > 0) {
      return [
        { id: "all", labelEn: "All Curations", labelAr: "جميع المختارات" },
        ...validCollections.map((col) => ({
          id: col.id,
          labelEn: col.nameEn,
          labelAr: col.nameAr,
        })),
      ];
    }

    const availableTabs = [
      { id: "all", labelEn: "All Curations", labelAr: "جميع المختارات" },
    ];

    const hasExtraits = products.some((p) => {
      const conc = (p.concentration || "").toLowerCase();
      const name = `${p.nameEn} ${p.nameAr || ""}`.toLowerCase();
      return conc.includes("extrait") || name.includes("extrait");
    });
    if (hasExtraits) {
      availableTabs.push({ id: "extraits", labelEn: "Extraits de Parfum", labelAr: "خلاصات العطور" });
    }

    const hasOuds = products.some((p) => {
      const conc = (p.concentration || "").toLowerCase();
      const name = `${p.nameEn} ${p.nameAr || ""}`.toLowerCase();
      return (
        conc.includes("attar") ||
        name.includes("oud") ||
        name.includes("attar") ||
        name.includes("عود") ||
        name.includes("دهن")
      );
    });
    if (hasOuds) {
      availableTabs.push({ id: "rare-attars", labelEn: "Aged Attars & Ouds", labelAr: "الأدهان والعود المعتق" });
    }

    const hasPrivate = products.some((p) => {
      const badge = (p.badge || "").toLowerCase();
      const conc = (p.concentration || "").toLowerCase();
      return (
        badge.includes("private") ||
        badge.includes("haute") ||
        conc.includes("parfum") ||
        conc.includes("pure")
      );
    });
    if (hasPrivate) {
      availableTabs.push({ id: "private-blend", labelEn: "Private Blends", labelAr: "المجموعات الخاصة" });
    }

    return availableTabs;
  }, [validCollections, products]);

  const displayProducts = React.useMemo(() => {
    if (!enableTabs || activeTab === "all") return products;

    if (validCollections.length > 0) {
      const matchedCollection = validCollections.find((col) => col.id === activeTab);
      if (matchedCollection && matchedCollection.products && matchedCollection.products.length > 0) {
        return matchedCollection.products;
      }
    }

    // Default filters
    const filtered = products.filter((p) => {
      const conc = (p.concentration || "").toLowerCase();
      const badge = (p.badge || "").toLowerCase();
      const name = `${p.nameEn} ${p.nameAr || ""}`.toLowerCase();

      if (activeTab === "extraits") {
        return conc.includes("extrait") || name.includes("extrait");
      }
      if (activeTab === "rare-attars") {
        return (
          conc.includes("attar") ||
          name.includes("oud") ||
          name.includes("attar") ||
          name.includes("عود") ||
          name.includes("دهن")
        );
      }
      if (activeTab === "private-blend") {
        return (
          badge.includes("private") ||
          badge.includes("haute") ||
          conc.includes("parfum") ||
          conc.includes("pure")
        );
      }
      return true;
    });

    return filtered;
  }, [products, validCollections, activeTab, enableTabs]);

  // Reset scroll when switching tabs
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // Scroll position & progress updates
  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      setScrollProgress(100);
      return;
    }

    const currentScroll = Math.abs(scrollLeft);
    const progress = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100));
    setScrollProgress(progress);

    // Tolerance of 5px for sub-pixel rendering
    setCanScrollPrev(currentScroll > 8);
    setCanScrollNext(currentScroll < maxScroll - 8);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, displayProducts.length]);

  // Reset scroll to start when changing tabs
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeTab]);

  // Smooth slide navigation
  const scroll = (direction: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;

    // Scroll by roughly 2 cards width
    const scrollAmount = Math.max(300, Math.floor(el.clientWidth * 0.75));
    const multiplier = direction === "next" ? 1 : -1;
    // In RTL, standard scrollBy left direction is inverted in modern browsers
    const rtlMultiplier = isAr ? -1 : 1;
    const delta = scrollAmount * multiplier * rtlMultiplier;

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Mouse drag-to-scroll support for desktop
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setInitialScrollLeft(sliderRef.current.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !sliderRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    if (Math.abs(walk) > 8) {
      setHasMoved(true);
      e.preventDefault();
      sliderRef.current.scrollLeft = initialScrollLeft - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    // Allow any click event triggered in this gesture to be cancelled,
    // then immediately restore clickability for subsequent taps/clicks
    setTimeout(() => {
      setHasMoved(false);
    }, 120);
  };

  return (
    <section className={`w-full ${className}`}>
      {/* 1. Header with Eyebrow, Title & Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-luxury-border gap-4 mb-6">
        <div>
          {eyebrow && (
            <span className="eyebrow text-accent mb-1.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent" />
              <span>{eyebrow}</span>
            </span>
          )}
          {title && (
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text font-normal tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-luxury-muted mt-1 max-w-lg leading-relaxed font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Bar: View All link + Slider Next/Prev Arrows */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="editorial-text-link text-xs flex items-center gap-1 hover:text-accent transition-colors"
            >
              <span>{viewAllText || c("Explore All", "عرض كل التشكيلة")}</span>
              <ArrowUpRight size={14} className="rtl:rotate-[-90deg]" />
            </Link>
          )}

          {/* Slider Prev / Next Controls */}
          <div className="flex items-center gap-1.5 ps-2 border-s border-luxury-border">
            <button
              type="button"
              onClick={() => scroll("prev")}
              disabled={!canScrollPrev}
              aria-label={c("Previous slide", "الشريحة السابقة")}
              className={`w-9 h-9 rounded-full border border-luxury-border flex items-center justify-center transition-all duration-200 ${
                canScrollPrev
                  ? "text-luxury-text hover:border-luxury-text hover:bg-luxury-surface2 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                  : "text-luxury-muted/40 border-luxury-border/50 cursor-not-allowed opacity-40"
              }`}
            >
              <ChevronLeft size={18} className="rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scroll("next")}
              disabled={!canScrollNext}
              aria-label={c("Next slide", "الشريحة التالية")}
              className={`w-9 h-9 rounded-full border border-luxury-border flex items-center justify-center transition-all duration-200 ${
                canScrollNext
                  ? "text-luxury-text hover:border-luxury-text hover:bg-luxury-surface2 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                  : "text-luxury-muted/40 border-luxury-border/50 cursor-not-allowed opacity-40"
              }`}
            >
              <ChevronRight size={18} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Optional Collection Filter Tabs */}
      {enableTabs && tabs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 pt-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-sans tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-luxury-text text-luxury-canvas font-medium shadow-sm"
                    : "bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text hover:border-luxury-muted"
                }`}
              >
                {c(tab.labelEn, tab.labelAr)}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Horizontal Smooth Slider Track */}
      <div className="relative group/slider mt-2">
        {displayProducts.length === 0 ? (
          <div className="py-16 text-center border border-luxury-border bg-luxury-surface text-xs text-luxury-muted">
            {c(
              "No creations currently featured in this curation.",
              "لا توجد إصدارات حالياً في هذه المجموعة العطرية.",
            )}
          </div>
        ) : (
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 ${
              isMouseDown ? "cursor-grabbing select-none" : "cursor-grab"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
          {displayProducts.map((product) => (
            <div
              key={product.slug}
              className="w-[220px] sm:w-[250px] md:w-[270px] lg:w-[290px] shrink-0 snap-start flex flex-col"
              onClickCapture={(e) => {
                if (hasMoved) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <ProductCard
                slug={product.slug}
                nameEn={product.nameEn}
                nameAr={product.nameAr}
                brand={product.brand}
                concentration={product.concentration}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                variants={product.variants}
                image={product.image}
                secondaryImage={product.secondaryImage}
                images={product.images}
                badge={product.badge}
                locale={locale}
                aspectRatio="3/4"
              />
            </div>
          ))}
        </div>
        )}

        {/* 4. Luxury Scroll Progress Indicator */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="h-0.5 bg-luxury-border flex-1 max-w-[200px] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-200 ease-out rounded-full"
              style={{
                width: `${Math.max(15, scrollProgress)}%`,
                marginInlineStart: isAr ? "auto" : undefined,
              }}
            />
          </div>
          <span className="text-[10px] font-sans text-luxury-muted uppercase tracking-[0.18em]">
            {displayProducts.length} {c("Flacons Curated", "عطر مميز")}
          </span>
        </div>
      </div>
    </section>
  );
}
