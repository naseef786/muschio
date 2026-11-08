"use client";

import React, { useEffect, useState, useMemo } from "react";
import { muschioApi } from "../../../lib/api";
import { StorefrontProduct } from "@muschio/types";
import { ProductCard } from "../../../components/product-card";
import { SlidersHorizontal, ArrowUpDown, X, Check, Loader2, Sparkles } from "lucide-react";

export default function ShopCatalogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: "en" | "ar" };
  searchParams: {
    search?: string;
    brandType?: string;
    family?: string;
    brand?: string;
    tag?: string;
    tagSlug?: string;
    page?: string;
    deal?: string;
  };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = Number(searchParams.page);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const [selectedBrandType, setSelectedBrandType] = useState<string | null>(
    searchParams.brandType ?? null,
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    searchParams.brand ?? null,
  );
  const [selectedFamily, setSelectedFamily] = useState<string>(
    searchParams.family ?? "",
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(
    searchParams.tag ?? searchParams.tagSlug ?? null,
  );
  const [dealOnly, setDealOnly] = useState<boolean>(
    searchParams.deal === "true" || searchParams.deal === "1",
  );
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [sort, setSort] = useState("curated");
  const [live, setLive] = useState<StorefrontProduct[] | null>(null);
  const [families, setFamilies] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile Filter & Sort Drawer states
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      muschioApi.getProducts({ limit: 100 }),
      muschioApi.getScentFamilies(),
      muschioApi.getTags(),
    ]).then(([products, fams, tagsRes]) => {
      if (!active) return;
      if (products) {
        setLive(products);
      }
      if (fams) {
        setFamilies(fams);
      }
      if (tagsRes) {
        setTags(tagsRes);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const catalog = useMemo(() => {
    if (!live || live.length === 0) return [];
    return live.map((product) => {
      const variant =
        product.variants.find((v) => !v.isSampleVial) || product.variants[0];
      return {
        slug: product.slug,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        brand: product.brand.name,
        brandType: product.brand.type,
        family: product.scentFamily?.slug || "",
        gender: product.gender,
        concentration: product.concentration.replaceAll("_", " "),
        price: variant?.price || 0,
        compareAtPrice: variant?.compareAtPrice,
        image: product.images[0] || "/product-placeholder.svg",
        secondaryImage: product.images[1],
        badge: product.brand.type === "NICHE" ? "Haute Niche" : "Private Blend",
        notes: product.notes.map((note) => (isAr ? note.nameAr : note.nameEn)),
        tags: product.tags || [],
        variants: product.variants,
      };
    });
  }, [live, isAr]);

  const filtered = useMemo(() => {
    return catalog
      .filter((p) => {
        if (dealOnly && (!p.compareAtPrice || p.compareAtPrice <= p.price)) return false;
        if (selectedBrandType && p.brandType !== selectedBrandType) return false;
        if (selectedBrand && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedFamily && p.family !== selectedFamily) return false;
        if (selectedTag) {
          const hasTag = (p.tags || []).some(
            (t: any) =>
              t.slug?.toLowerCase() === selectedTag.toLowerCase() ||
              t.id === selectedTag ||
              t.nameEn?.toLowerCase() === selectedTag.toLowerCase() ||
              t.nameAr === selectedTag
          );
          if (!hasTag) return false;
        }
        const query = search.trim().toLowerCase();
        if (
          query &&
          ![p.nameEn, p.nameAr, p.brand, ...p.notes]
            .join(" ")
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "name") return a.nameEn.localeCompare(b.nameEn);
        return 0; // curated order
      });
  }, [catalog, selectedBrandType, selectedBrand, selectedFamily, selectedTag, search, sort, dealOnly]);

  // Reset page to 1 whenever any filter or sort option changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrandType, selectedBrand, selectedFamily, selectedTag, search, sort, dealOnly]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  const paginated = useMemo(() => {
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage, totalPages]);

  const clearAllFilters = () => {
    setSelectedBrandType(null);
    setSelectedBrand(null);
    setSelectedFamily("");
    setSelectedTag(null);
    setSearch("");
    setDealOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedBrandType || selectedBrand || selectedFamily || selectedTag || search.trim() || dealOnly,
  );

  const activeFilterCount = [
    selectedBrandType ? 1 : 0,
    selectedBrand ? 1 : 0,
    selectedFamily ? 1 : 0,
    selectedTag ? 1 : 0,
    search.trim() ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 bg-white dark:bg-neutral-950 font-sans">
      {/* 1. Level Shoes Compact Header & Product Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="eyebrow mb-1">
            {c("HAUTE PARFUMERIE COLLECTION", "مجموعة العطور الفاخرة")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-neutral-50 font-normal">
            {c("All Fragrances", "جميع العطور")}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
            {c(
              "Curated artisanal extraits and pure parfums from the world's most prestigious perfume houses.",
              "مجموعة مختارة من خلاصات العطور النقية من أرقى دور العطور العالمية المعتمدة.",
            )}
          </p>
        </div>
        <div className="text-xs text-neutral-400 font-sans">
          {filtered.length > 0 ? (
            <>
              {c("Showing", "عرض")}{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              {c("of", "من")}{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{filtered.length}</span>{" "}
              {c(filtered.length === 1 ? "Product" : "Products", "منتج")}
            </>
          ) : (
            <>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">0</span>{" "}
              {c("Products", "منتج")}
            </>
          )}
        </div>
      </div>

      {/* 2. Desktop Filter & Sort Toolbar */}
      <div className="hidden md:flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 text-xs">
        {/* Left: Filter Selectors */}
        <div className="flex items-center gap-3">
          {/* Maison Category Tabs */}
          <div className="flex border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden bg-white dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setSelectedBrandType(null)}
              className={`px-3 py-1.5 transition-colors ${
                selectedBrandType === null
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-medium"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {c("All Maisons", "كل الدور")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedBrandType("NICHE")}
              className={`px-3 py-1.5 border-s border-neutral-200 dark:border-neutral-800 transition-colors ${
                selectedBrandType === "NICHE"
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-medium"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {c("Haute Niche", "نيش")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedBrandType("DESIGNER")}
              className={`px-3 py-1.5 border-s border-neutral-200 dark:border-neutral-800 transition-colors ${
                selectedBrandType === "DESIGNER"
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-medium"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {c("Designer Privé", "ديزاينر")}
            </button>
          </div>

          {/* Scent Family Dropdown */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs rounded-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white"
          >
            <option value="">{c("All Scent Families", "جميع العائلات العطرية")}</option>
            {families.map((fam) => (
              <option key={fam.slug} value={fam.slug}>
                {isAr ? fam.nameAr : fam.nameEn}
              </option>
            ))}
          </select>

          {/* Tag Filter Dropdown */}
          <select
            value={selectedTag || ""}
            onChange={(e) => setSelectedTag(e.target.value || null)}
            className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs rounded-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white"
          >
            <option value="">{c("All Tags & Curations", "جميع التصنيفات والمختارات")}</option>
            {tags.map((tg) => (
              <option key={tg.id || tg.slug} value={tg.slug}>
                {isAr ? tg.nameAr : tg.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">{c("Sort by:", "ترتيب حسب:")}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs rounded-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white"
          >
            <option value="curated">{c("Muschio Curated", "ترشيحات موسكيو")}</option>
            <option value="price-asc">{c("Price: Low to High", "السعر: الأقل أولاً")}</option>
            <option value="price-desc">{c("Price: High to Low", "السعر: الأعلى أولاً")}</option>
            <option value="name">{c("Alphabetical: A–Z", "الاسم: أ–ي")}</option>
          </select>
        </div>
      </div>

      {/* 2b. Featured Tags Trending Strip */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-b border-neutral-100 dark:border-neutral-800 text-xs no-scrollbar">
          <span className="text-[11px] text-neutral-400 shrink-0 font-medium">{c("Trending Curations:", "المختارات الأكثر طلباً:")}</span>
          {tags.filter((t) => t.isFeatured).slice(0, 8).map((tagItem) => {
            const isSelected = selectedTag === tagItem.slug || selectedTag === tagItem.id;
            return (
              <button
                key={tagItem.id || tagItem.slug}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : tagItem.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm"
                    : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
                }`}
              >
                {tagItem.colorHex && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tagItem.colorHex }}
                  />
                )}
                <span>{isAr ? tagItem.nameAr : tagItem.nameEn}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Mobile Filter and Sort Toolbar (Level Shoes Fixed Strip Pattern) */}
      <div className="flex md:hidden items-center justify-between gap-2 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-900 dark:text-neutral-100 rounded-sm"
        >
          <SlidersHorizontal size={14} />
          <span>{c("Filter", "تصفية")}</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileSortOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-900 dark:text-neutral-100 rounded-sm"
        >
          <ArrowUpDown size={14} />
          <span>{c("Sort", "ترتيب")}</span>
        </button>
      </div>

      {/* 4. Active Filter Chips & Clear All */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap py-3 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-luxury-muted me-1">{c("Active Filters:", "الفلاتر النشطة:")}</span>
          {selectedBrandType && (
            <span className="filter-chip">
              {selectedBrandType === "NICHE" ? "Haute Niche" : "Designer Privé"}
              <button
                type="button"
                onClick={() => setSelectedBrandType(null)}
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {selectedFamily && (
            <span className="filter-chip">
              {selectedFamily}
              <button
                type="button"
                onClick={() => setSelectedFamily("")}
                aria-label="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="filter-chip">
              <span>
                {tags.find((t) => t.slug === selectedTag || t.id === selectedTag)?.[isAr ? "nameAr" : "nameEn"] || selectedTag}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                aria-label="Remove tag filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {dealOnly && (
            <span className="filter-chip bg-accent/10 border-accent/30 text-accent font-medium">
              {c("Privé Deals & Offers", "عروض وصفقات حصرية")}
              <button
                type="button"
                onClick={() => setDealOnly(false)}
                aria-label="Remove deal filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {search.trim() && (
            <span className="filter-chip">
              &ldquo;{search}&rdquo;
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Remove search filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-luxury-text underline hover:text-accent me-2 font-medium"
          >
            {c("Clear All", "مسح الكل")}
          </button>
        </div>
      )}

      {/* 5. Product Grid (2 Columns Mobile, 3 Tablet, 4 Desktop) */}
      <div className="pt-6">
        {dealOnly && (
          <div className="mb-6 p-4 border border-accent/40 bg-luxury-surface rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-accent/10 text-accent rounded">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="font-serif text-sm font-medium text-luxury-text">
                  {c("Private Client Reserve · Curated Deals & Reductions", "مختارات كبار الشخصيات · صفقات وتخفيضات حصرية")}
                </h3>
                <p className="text-[11px] text-luxury-muted">
                  {c(
                    "Exclusive reductions on select extraits de parfum and pure flacons. Includes white-glove GCC dispatch.",
                    "تخفيضات حصرية على خلاصات العطور الفاخرة المختارة مع توصيل مبرد مجاني لكافة دول الخليج."
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDealOnly(false)}
              className="text-xs text-luxury-muted hover:text-luxury-text underline font-sans shrink-0"
            >
              {c("View All", "عرض الكل")}
            </button>
          </div>
        )}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center text-xs text-luxury-muted space-y-3">
            <Loader2 size={24} className="animate-spin text-accent" />
            <span>{c("Loading haute parfumerie collection…", "جاري تحميل مجموعة العطور الفاخرة…")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-2xl text-luxury-text">
              {c("No fragrances found", "لم يتم العثور على عطور")}
            </p>
            <p className="text-xs text-luxury-muted max-w-sm mx-auto">
              {c(
                "Try adjusting your filters or search keywords to explore other creations in our olfactory vault.",
                "جرّب تعديل الفلاتر أو كلمات البحث لاستكشاف إبداعات أخرى في خزانتنا العطرية.",
              )}
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="editorial-button text-xs mt-2"
            >
              {c("View All Fragrances", "عرض كل العطور")}
            </button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {paginated.map((product) => (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  nameEn={product.nameEn}
                  nameAr={product.nameAr}
                  brand={product.brand}
                  brandType={product.brandType}
                  concentration={product.concentration}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  variants={product.variants}
                  image={product.image}
                  secondaryImage={product.secondaryImage}
                  badge={product.badge}
                  tags={product.tags}
                  locale={locale}
                />
              ))}
            </div>

            {/* Level Shoes Luxury Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100 dark:border-neutral-800 pt-8 mt-12">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900 dark:hover:border-white transition-colors"
                >
                  {c("← Previous", "← السابق")}
                </button>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 flex items-center justify-center text-xs transition-colors rounded-sm ${
                        currentPage === pageNum
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900 dark:hover:border-white transition-colors"
                >
                  {c("Next →", "التالي →")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 6. Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end md:hidden"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-luxury-canvas p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-luxury-border">
                <h3 className="font-serif text-xl font-medium text-luxury-text">
                  {c("Filter Fragrances", "تصفية العطور")}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-luxury-text"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Maison Category */}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-luxury-text block mb-3">
                  {c("House Category", "تصنيف الدار")}
                </span>
                <div className="space-y-2">
                  {[
                    { label: c("All Maisons", "كل الدور"), value: null },
                    { label: "Haute Niche", value: "NICHE" },
                    { label: "Designer Privé", value: "DESIGNER" },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setSelectedBrandType(option.value)}
                      className={`w-full flex items-center justify-between p-3 border text-xs text-start transition-colors ${
                        selectedBrandType === option.value
                          ? "border-luxury-borderBold bg-luxury-surface font-medium text-luxury-text"
                          : "border-luxury-border bg-luxury-surface/50 text-luxury-muted"
                      }`}
                    >
                      <span>{option.label}</span>
                      {selectedBrandType === option.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scent Family */}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-luxury-text block mb-3">
                  {c("Scent Family", "العائلة العطرية")}
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFamily("")}
                    className={`w-full flex items-center justify-between p-3 border text-xs text-start transition-colors ${
                      selectedFamily === ""
                        ? "border-luxury-borderBold bg-luxury-surface font-medium text-luxury-text"
                        : "border-luxury-border bg-luxury-surface/50 text-luxury-muted"
                    }`}
                  >
                    <span>{c("All Scent Families", "جميع العائلات العطرية")}</span>
                    {selectedFamily === "" && <Check size={14} />}
                  </button>
                  {families.map((fam) => (
                    <button
                      key={fam.slug}
                      type="button"
                      onClick={() => setSelectedFamily(fam.slug)}
                      className={`w-full flex items-center justify-between p-3 border text-xs text-start transition-colors ${
                        selectedFamily === fam.slug
                          ? "border-luxury-borderBold bg-luxury-surface font-medium text-luxury-text"
                          : "border-luxury-border bg-luxury-surface/50 text-luxury-muted"
                      }`}
                    >
                      <span>{isAr ? fam.nameAr : fam.nameEn}</span>
                      {selectedFamily === fam.slug && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fragrance Tags & Curations */}
              {tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-luxury-text block mb-3">
                    {c("Tags & Curations", "التصنيفات والمختارات")}
                  </span>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedTag(null)}
                      className={`w-full flex items-center justify-between p-3 border text-xs text-start transition-colors ${
                        selectedTag === null
                          ? "border-luxury-borderBold bg-luxury-surface font-medium text-luxury-text"
                          : "border-luxury-border bg-luxury-surface/50 text-luxury-muted"
                      }`}
                    >
                      <span>{c("All Tags & Curations", "جميع التصنيفات والمختارات")}</span>
                      {selectedTag === null && <Check size={14} />}
                    </button>
                    {tags.map((tg) => {
                      const isSelected = selectedTag === tg.slug || selectedTag === tg.id;
                      return (
                        <button
                          key={tg.id || tg.slug}
                          type="button"
                          onClick={() => setSelectedTag(isSelected ? null : tg.slug)}
                          className={`w-full flex items-center justify-between p-3 border text-xs text-start transition-colors ${
                            isSelected
                              ? "border-luxury-borderBold bg-luxury-surface font-medium text-luxury-text"
                              : "border-luxury-border bg-luxury-surface/50 text-luxury-muted"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {tg.colorHex && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: tg.colorHex }}
                              />
                            )}
                            <span>{isAr ? tg.nameAr : tg.nameEn}</span>
                          </span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-luxury-border flex gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="editorial-button-secondary flex-1 py-3 text-xs"
              >
                {c("Reset", "إعادة ضبط")}
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="editorial-button flex-1 py-3 text-xs"
              >
                {c("Show Results", "عرض النتائج")} ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Mobile Sort Drawer */}
      {mobileSortOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:hidden"
          onClick={() => setMobileSortOpen(false)}
        >
          <div
            className="w-full bg-luxury-canvas p-6 rounded-t-sm border-t border-luxury-border shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
              <h3 className="font-serif text-lg font-medium text-luxury-text">
                {c("Sort Fragrances", "ترتيب العطور")}
              </h3>
              <button
                type="button"
                onClick={() => setMobileSortOpen(false)}
                className="p-1 text-luxury-text"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {[
                { label: c("Muschio Curated", "ترشيحات موسكيو"), value: "curated" },
                { label: c("Price: Low to High", "السعر: الأقل أولاً"), value: "price-asc" },
                { label: c("Price: High to Low", "السعر: الأعلى أولاً"), value: "price-desc" },
                { label: c("Alphabetical: A–Z", "الاسم: أ–ي"), value: "name" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSort(opt.value);
                    setMobileSortOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 text-xs text-start ${
                    sort === opt.value
                      ? "font-medium text-luxury-text bg-luxury-surface border border-luxury-borderBold"
                      : "text-luxury-muted hover:text-luxury-text"
                  }`}
                >
                  <span>{opt.label}</span>
                  {sort === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
