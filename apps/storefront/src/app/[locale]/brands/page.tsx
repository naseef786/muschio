"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "../../../navigation";
import { Search, ArrowUpRight, Globe, Loader2 } from "lucide-react";
import { muschioApi } from "../../../lib/api";

interface LiveBrand {
  id: string;
  name: string;
  slug: string;
  type: string;
  countryOfOrigin?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  _count?: {
    products?: number;
  };
}

export default function BrandsDirectoryPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [brands, setBrands] = useState<LiveBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    muschioApi.getBrands().then((data) => {
      if (!active) return;
      if (Array.isArray(data)) {
        setBrands(data);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    brands.forEach((b) => {
      const first = b.name.charAt(0).toUpperCase();
      if (first >= "A" && first <= "Z") letters.add(first);
    });
    return ["ALL", ...Array.from(letters).sort()];
  }, [brands]);

  const filtered = useMemo(() => {
    return brands.filter((brand) => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (selectedLetter !== "ALL" && firstLetter !== selectedLetter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = brand.name.toLowerCase().includes(q);
        const matchCountry = (brand.countryOfOrigin || "").toLowerCase().includes(q);
        const matchDesc = (brand.descriptionEn || "").toLowerCase().includes(q) || (brand.descriptionAr || "").includes(q);
        if (!matchName && !matchCountry && !matchDesc) return false;
      }
      return true;
    });
  }, [brands, selectedLetter, search]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
      {/* 1. Header (Level Shoes Architectural Compact Pattern) */}
      <div className="pb-6 border-b border-luxury-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-1">
            {c("HAUTE MAISON DIRECTORY", "دليل دور العطور العالمية")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal">
            {c("The Fragrance Houses", "دور العطور")}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted mt-1 max-w-xl">
            {c(
              "Explore master perfume houses sourced directly from official ateliers in Oman, Paris, London, and Turin.",
              "استكشف أعرق دور العطور العالمية المستوردة مباشرة من أتيلييهاتها الرسمية في عُمان، باريس، لندن، وتورينو.",
            )}
          </p>
        </div>
        <div className="text-xs text-luxury-muted">
          <span className="font-medium text-luxury-text">{filtered.length}</span>{" "}
          {c("Houses", "دور عطور")}
        </div>
      </div>

      {/* 2. Alphabet Bar & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 border-y border-luxury-border">
          {/* Alphabet Index */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className={`min-w-[32px] h-8 px-2 text-xs font-sans transition-colors ${
                  selectedLetter === letter
                    ? "bg-luxury-text text-luxury-canvas font-medium"
                    : "text-luxury-muted hover:text-luxury-text hover:bg-luxury-surface2"
                }`}
              >
                {letter === "ALL" ? c("All", "الكل") : letter}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c("Search houses…", "ابحث عن دار…")}
              className="w-full h-9 ps-8 pe-3 text-xs bg-luxury-surface border border-luxury-border text-luxury-text focus:outline-none focus:border-luxury-borderBold"
            />
            <Search size={14} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-luxury-muted" />
          </div>
        </div>
      </div>

      {/* 3. Brands Grid (Clean Luxury Presentation) */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-xs text-luxury-muted space-y-3">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span>{c("Loading fragrance houses from atelier directory…", "جاري تحميل دور العطور من السجل المعتمد…")}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-luxury-muted">
          {c("No fragrance houses found matching your search.", "لم يتم العثور على دور عطور مطابقة للبحث.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((brand) => {
            const perfumesCount = brand._count?.products ?? 0;
            return (
              <Link
                key={brand.slug}
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group border border-luxury-border bg-luxury-surface p-4 sm:p-6 flex flex-col justify-between hover:border-luxury-borderBold transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.14em] text-luxury-muted pb-3 border-b border-luxury-border">
                    <span className="flex items-center gap-1.5">
                      <Globe size={11} className="text-accent" />
                      <span>{brand.countryOfOrigin || c("International", "عالمي")}</span>
                    </span>
                    <span>{brand.type === "NICHE" ? c("Haute Niche", "نيش فاخر") : c("Designer Privé", "ديزاينر")}</span>
                  </div>

                  <div className="py-6 flex items-center justify-between">
                    <h3 className="font-serif text-2xl text-luxury-text font-normal group-hover:underline">
                      {brand.name}
                    </h3>
                    <ArrowUpRight size={18} className="text-luxury-muted group-hover:text-luxury-text transition-colors" />
                  </div>

                  <p className="text-xs text-luxury-muted leading-relaxed line-clamp-3">
                    {isAr ? (brand.descriptionAr || brand.descriptionEn) : (brand.descriptionEn || brand.descriptionAr)}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-luxury-border flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase text-luxury-muted">
                    {c("Official Haute Partner", "شريك رسمي معتمد")}
                  </span>
                  <span className="text-[11px] text-accent font-medium">
                    {perfumesCount > 0 ? `${perfumesCount} ${c("Creations", "إصدارات")}` : c("View Collection", "عرض المجموعة")} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
