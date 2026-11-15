"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { muschioApi } from "../../../lib/api";
import { customerCopy } from "../../../lib/customer-copy";
import { ProductCard } from "../../../components/product-card";

type SearchResult = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  brandName: string;
  concentration: string;
  price: number;
  image: string;
  scentFamily?: string;
  topAccords: string[];
  prominentNotes: string[];
};

export function SearchPageClient({
  locale,
  initialQuery,
  initialFamilies,
}: {
  locale: "en" | "ar";
  initialQuery: string;
  initialFamilies: Array<{ slug: string; nameEn: string; nameAr: string }>;
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => customerCopy(en, ar, isAr);
  const [query, setQuery] = useState(initialQuery);
  const [family, setFamily] = useState("");
  const [sort, setSort] = useState("curated");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clean = query.trim();
    if (!clean) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      muschioApi.searchCatalog(clean, { limit: 48, family: family || undefined })
        .then((items) => {
          if (active) setResults(items as SearchResult[]);
        })
        .catch(() => {
          if (active) setResults([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [family, query]);

  const sortedResults = useMemo(() => {
    const next = [...results];
    if (sort === "price-low") return next.sort((a, b) => a.price - b.price);
    if (sort === "price-high") return next.sort((a, b) => b.price - a.price);
    if (sort === "name") return next.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    return next;
  }, [results, sort]);

  const clearSearch = () => {
    setQuery("");
    setFamily("");
  };

  return (
    <section className="editorial-section min-h-[70vh]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-10">
          <p className="eyebrow mb-4">{c("Find a fragrance", "ابحث عن عطر")}</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-luxury-text leading-tight mb-4">
            {c("Search our collection", "ابحث في مجموعتنا")}
          </h1>
          <p className="text-base sm:text-lg text-luxury-muted leading-relaxed">
            {c("Search by fragrance name, brand, note, or fragrance family.", "ابحث باسم العطر أو العلامة أو النوتة أو عائلة العطر.")}
          </p>
        </div>

        <form onSubmit={(event) => event.preventDefault()} className="relative max-w-4xl">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-luxury-muted" size={22} />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c("Search fragrances, brands, or notes", "ابحث عن العطور أو العلامات أو النوتات")}
            className="w-full min-h-14 ps-12 pe-12 border border-luxury-border bg-luxury-surface text-base text-luxury-text rounded-sm focus:outline-none focus:border-luxury-text"
          />
          {query && (
            <button type="button" onClick={clearSearch} aria-label={c("Clear search", "مسح البحث")} className="absolute end-4 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-luxury-text">
              <X size={20} />
            </button>
          )}
        </form>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-6 pb-6 border-b border-luxury-border">
          <div className="flex items-center gap-3 flex-wrap">
            <SlidersHorizontal size={18} className="text-luxury-muted" />
            <label className="text-sm text-luxury-muted" htmlFor="search-family">{c("Filter by family", "التصفية حسب العائلة")}</label>
            <select id="search-family" value={family} onChange={(event) => setFamily(event.target.value)} className="min-h-10 px-3 border border-luxury-border bg-luxury-surface text-sm text-luxury-text rounded-sm">
              <option value="">{c("All families", "كل العائلات")}</option>
              {initialFamilies.map((item) => <option key={item.slug} value={item.slug}>{isAr ? item.nameAr : item.nameEn}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 text-sm text-luxury-muted" htmlFor="search-sort">
            {c("Sort", "ترتيب")}
            <select id="search-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-10 px-3 border border-luxury-border bg-luxury-surface text-sm text-luxury-text rounded-sm">
              <option value="curated">{c("Recommended", "موصى به")}</option>
              <option value="name">{c("Name", "الاسم")}</option>
              <option value="price-low">{c("Price: low to high", "السعر: من الأقل للأعلى")}</option>
              <option value="price-high">{c("Price: high to low", "السعر: من الأعلى للأقل")}</option>
            </select>
          </label>
        </div>

        {!query.trim() ? (
          <div className="py-20 text-center text-luxury-muted">
            <Search size={34} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg text-luxury-text mb-2">{c("Start with a name, brand, or note", "ابدأ باسم أو علامة أو نوتة")}</p>
            <p className="text-sm">{c("Your results will appear here.", "ستظهر النتائج هنا.")}</p>
          </div>
        ) : loading ? (
          <div className="py-20 text-center text-base text-luxury-muted">{c("Searching…", "جارٍ البحث…")}</div>
        ) : sortedResults.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-luxury-text mb-2">{c(`No results for “${query}”`, `لا توجد نتائج لـ “${query}”`)}</p>
            <p className="text-base text-luxury-muted">{c("Try another spelling, brand, or note.", "جرّب اسماً أو علامة أو نوتة أخرى.")}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-6">
              <p className="text-base text-luxury-muted">{sortedResults.length} {c("results", "نتيجة")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-9">
              {sortedResults.map((item) => (
                <ProductCard key={item.id || item.slug} locale={locale} slug={item.slug} nameEn={item.nameEn} nameAr={item.nameAr} brand={item.brandName} concentration={item.concentration} price={item.price} image={item.image || "/product-placeholder.svg"} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
