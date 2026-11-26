"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { DEFAULT_SCENT_PROFILES } from "@muschio/types";
import { customerCopy } from "../lib/customer-copy";

export interface DiscoverScentSectionProps {
  locale: "en" | "ar";
  profiles?: any[];
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
}

export function DiscoverScentSection({
  locale,
  profiles,
  eyebrowEn = "OLFACTORY LANDSCAPES",
  eyebrowAr = "المجموعات العطرية",
  titleEn = "Discover Your Scent",
  titleAr = "اكتشف عالمك العطري",
  subtitleEn = "Embark on an olfactory voyage through 12 distinct fragrance families. From luminous citruses to majestic oud and rare woods, find the creation that resonates with your presence.",
  subtitleAr = "انطلق في رحلة عطرية عبر ١٢ عائلة عطرية مميزة. من عبير الحمضيات المنعشة إلى هيبة العود والأخشاب النادرة، اعثر على العطر الذي يجسد حضورك الفريد.",
}: DiscoverScentSectionProps) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => customerCopy(en, ar, isAr);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Merge live profiles with default definitions
  const displayProfiles = React.useMemo(() => {
    if (profiles && profiles.length > 0) {
      const liveMap = new Map<string, any>();
      profiles.forEach((p) => liveMap.set(p.slug, p));

      const merged = DEFAULT_SCENT_PROFILES.map((def) => {
        const live = liveMap.get(def.slug);
        return {
          ...def,
          ...(live || {}),
          productCount: live?._count?.products ?? live?.productCount ?? 0,
        };
      });

      profiles.forEach((p) => {
        if (!DEFAULT_SCENT_PROFILES.some((d) => d.slug === p.slug)) {
          merged.push({
            ...p,
            productCount: p._count?.products ?? p.productCount ?? 0,
          });
        }
      });

      return merged;
    }
    return DEFAULT_SCENT_PROFILES.map((def) => ({ ...def, productCount: 0 }));
  }, [profiles]);

  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    const currentScroll = Math.abs(scrollLeft);
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
  }, [updateScrollState, displayProfiles.length]);

  const scroll = (direction: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;
    const scrollAmount = Math.max(300, Math.floor(el.clientWidth * 0.75));
    const multiplier = direction === "next" ? 1 : -1;
    const rtlMultiplier = isAr ? -1 : 1;
    el.scrollBy({ left: scrollAmount * multiplier * rtlMultiplier, behavior: "smooth" });
  };

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
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 8) {
      setHasMoved(true);
      e.preventDefault();
      sliderRef.current.scrollLeft = initialScrollLeft - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
    setTimeout(() => setHasMoved(false), 120);
  };

  return (
    <section id="discover-scent" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      {/* Header matching Top CollectionSlider Design */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-luxury-border gap-4 mb-6">
        <div>
          <span className="eyebrow text-accent mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent" />
            <span>{c(eyebrowEn, eyebrowAr)}</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-luxury-text font-normal tracking-tight">
            {c(titleEn, titleAr)}
          </h2>
          <p className="text-xs text-luxury-muted mt-1 max-w-lg leading-relaxed font-sans">
            {c(subtitleEn, subtitleAr)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
          <Link
            href="/shop"
            className="editorial-text-link text-xs flex items-center gap-1 hover:text-accent transition-colors py-1"
          >
            <span>{c("Explore All Fragrances", "استكشف كافة العطور")}</span>
            <ArrowUpRight size={14} className="rtl:rotate-[-90deg]" />
          </Link>

          <div className="flex items-center gap-1.5 ps-2 border-s border-luxury-border">
            <button
              type="button"
              onClick={() => scroll("prev")}
              disabled={!canScrollPrev}
              aria-label={c("Previous slide", "الشريحة السابقة")}
              className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-luxury-border flex items-center justify-center transition-all duration-200 ${canScrollPrev
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
              className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-luxury-border flex items-center justify-center transition-all duration-200 ${canScrollNext
                ? "text-luxury-text hover:border-luxury-text hover:bg-luxury-surface2 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                : "text-luxury-muted/40 border-luxury-border/50 cursor-not-allowed opacity-40"
                }`}
            >
              <ChevronRight size={18} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Smooth Slider Track matching Top CollectionSlider */}
      <div className="relative group/slider mt-2">
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 ${isMouseDown ? "cursor-grabbing select-none" : "cursor-grab"
            }`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {displayProfiles.map((profile) => {
            const name = isAr ? profile.nameAr : profile.nameEn;
            const desc = isAr ? profile.descriptionAr : profile.descriptionEn;
            const color = profile.colorHex || "#1a1a1a";

            return (
              <Link
                key={profile.slug}
                href={`/scent-profile/${profile.slug}`}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                draggable={false}
                className="group relative flex flex-col justify-end w-[280px] sm:w-[310px] md:w-[330px] lg:w-[350px] shrink-0 snap-start h-[350px] sm:h-[380px] rounded-none overflow-hidden bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Image
                  src={profile.imageUrl || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80"}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 260px, 330px"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  draggable={false}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:from-black/95" />

                <div
                  className="absolute top-0 inset-x-0 h-[3px] transition-all duration-300 group-hover:h-[4px]"
                  style={{ backgroundColor: color }}
                />

                <div className="relative z-10 p-5 flex flex-col justify-end text-white text-start rtl:text-right">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-widest bg-black/60 backdrop-blur-xs border border-white/15"
                      style={{ borderLeftColor: color, borderLeftWidth: "2px" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{c("Scent Family", "العائلة العطرية")}</span>
                    </span>

                    {typeof profile.productCount === "number" && profile.productCount > 0 && (
                      <span className="text-[11px] font-mono text-white/70">
                        {profile.productCount} {c("Flacons", "عطر")}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-white group-hover:text-amber-200 transition-colors">
                    {name}
                  </h3>

                  {desc && (
                    <p className="mt-1 text-xs text-white/75 font-sans line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-medium tracking-wider uppercase text-white/90 group-hover:text-white">
                    <span>{c("Explore Profile", "استكشف المجموعة")}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 text-amber-200"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
