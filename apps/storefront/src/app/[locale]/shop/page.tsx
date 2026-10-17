"use client";

import React, { useEffect, useState, useMemo } from "react";
import { muschioApi } from "../../../lib/api";
import { StorefrontProduct } from "@muschio/types";
import { ProductCard } from "../../../components/product-card";
import { SlidersHorizontal, ArrowUpDown, X, Check } from "lucide-react";

const CATALOG_PRODUCTS = [
  {
    slug: "amouage-interlude-53-man",
    nameEn: "Interlude 53 Man Extrait de Parfum",
    nameAr: "إنترلود 53 إكستري دي بارفان",
    brand: "Amouage",
    brandType: "NICHE",
    family: "oriental-amber",
    gender: "MEN",
    concentration: "Extrait de Parfum (53%)",
    price: 1850,
    compareAtPrice: 2100,
    image: "/amouage-placeholder.svg",
    badge: "Extrait (53%)",
    notes: ["Silver Frankincense", "Cambodian Oud", "Bergamot"],
  },
  {
    slug: "mfk-baccarat-rouge-540-extrait",
    nameEn: "Baccarat Rouge 540 Extrait de Parfum",
    nameAr: "باكارات روج 540 إكستري دي بارفان",
    brand: "Maison Francis Kurkdjian",
    brandType: "NICHE",
    family: "oriental-amber",
    gender: "UNISEX",
    concentration: "Extrait de Parfum",
    price: 1650,
    compareAtPrice: null,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
    secondaryImage:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    badge: "Haute Niche",
    notes: ["Kashmiri Saffron", "Ambergris", "Bitter Almond"],
  },
  {
    slug: "roja-parfums-elysium-pour-homme-parfum",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    brand: "Roja Parfums",
    brandType: "NICHE",
    family: "fresh-citrus-aquatic",
    gender: "MEN",
    concentration: "Pure Parfum",
    price: 1950,
    compareAtPrice: 2200,
    image:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
    badge: "Pure Parfum",
    notes: ["Calabrian Bergamot", "Tuscan Leather", "Pink Pepper"],
  },
  {
    slug: "xerjoff-alexandria-ii",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    brand: "Xerjoff",
    brandType: "NICHE",
    family: "woody-smoky",
    gender: "UNISEX",
    concentration: "Eau de Parfum",
    price: 2200,
    compareAtPrice: 2450,
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    badge: "Rare Batch",
    notes: ["Laos Oud", "Bulgarian Rose", "Cinnamon"],
  },
  {
    slug: "tom-ford-tobacco-vanille",
    nameEn: "Tobacco Vanille Eau de Parfum",
    nameAr: "توباكو فانيلا أو دي بارفان",
    brand: "Tom Ford",
    brandType: "DESIGNER",
    family: "gourmand-leather",
    gender: "UNISEX",
    concentration: "Eau de Parfum",
    price: 1720,
    compareAtPrice: 1950,
    image:
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=85",
    badge: "Private Blend",
    notes: ["Bourbon Vanilla", "Tobacco Accord", "Tonka Bean"],
  },
];

export default function ShopCatalogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: "en" | "ar" };
  searchParams: { search?: string; brandType?: string; family?: string; brand?: string };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [selectedBrandType, setSelectedBrandType] = useState<string | null>(
    searchParams.brandType ?? null,
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    searchParams.brand ?? null,
  );
  const [selectedFamily, setSelectedFamily] = useState<string>(
    searchParams.family ?? "",
  );
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [sort, setSort] = useState("curated");
  const [live, setLive] = useState<StorefrontProduct[] | null>(null);

  // Mobile Filter & Sort Drawer states
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  useEffect(() => {
    let active = true;
    muschioApi.getProducts({ limit: 100 }).then((products) => {
      if (active && products && products.length > 0) {
        setLive(products);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const catalog = useMemo(() => {
    if (live && live.length > 0) {
      return live.map((product) => {
        const variant =
          product.variants.find((v) => !v.isSampleVial) || product.variants[0];
        const isAmouage = product.slug === "amouage-interlude-53-man";
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
          image: isAmouage ? "/amouage-placeholder.svg" : (product.images[0] || "/product-placeholder.svg"),
          secondaryImage: product.images[1],
          badge: product.brand.type === "NICHE" ? "Haute Niche" : "Private Blend",
          notes: product.notes.map((note) => (isAr ? note.nameAr : note.nameEn)),
        };
      });
    }
    return CATALOG_PRODUCTS;
  }, [live, isAr]);

  const filtered = useMemo(() => {
    return catalog
      .filter((p) => {
        if (selectedBrandType && p.brandType !== selectedBrandType) return false;
        if (selectedBrand && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        if (selectedFamily && p.family !== selectedFamily) return false;
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
  }, [catalog, selectedBrandType, selectedBrand, selectedFamily, search, sort]);

  const clearAllFilters = () => {
    setSelectedBrandType(null);
    setSelectedBrand(null);
    setSelectedFamily("");
    setSearch("");
  };

  const hasActiveFilters = Boolean(
    selectedBrandType || selectedBrand || selectedFamily || search.trim(),
  );

  const activeFilterCount = [
    selectedBrandType ? 1 : 0,
    selectedBrand ? 1 : 0,
    selectedFamily ? 1 : 0,
    search.trim() ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
      {/* 1. Level Shoes Compact Header & Product Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E4DE]">
        <div>
          <span className="eyebrow mb-1">
            {c("HAUTE PARFUMERIE COLLECTION", "مجموعة العطور الفاخرة")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#171917] font-normal">
            {c("All Fragrances", "جميع العطور")}
          </h1>
          <p className="text-xs sm:text-sm text-[#77776F] mt-1 max-w-xl">
            {c(
              "Curated artisanal extraits and pure parfums from the world's most prestigious perfume houses.",
              "مجموعة مختارة من خلاصات العطور النقية من أرقى دور العطور العالمية المعتمدة.",
            )}
          </p>
        </div>
        <div className="text-xs text-[#77776F] font-sans">
          <span className="font-medium text-[#171917]">{filtered.length}</span>{" "}
          {c(filtered.length === 1 ? "Product" : "Products", "منتج")}
        </div>
      </div>

      {/* 2. Desktop Filter & Sort Toolbar */}
      <div className="hidden md:flex items-center justify-between py-4 border-b border-[#E6E4DE] text-xs">
        {/* Left: Filter Selectors */}
        <div className="flex items-center gap-3">
          {/* Maison Category Tabs */}
          <div className="flex border border-[#E6E4DE] rounded-sm overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setSelectedBrandType(null)}
              className={`px-3 py-1.5 transition-colors ${
                selectedBrandType === null
                  ? "bg-[#171917] text-white font-medium"
                  : "text-[#77776F] hover:text-[#171917]"
              }`}
            >
              {c("All Maisons", "كل الدور")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedBrandType("NICHE")}
              className={`px-3 py-1.5 border-s border-[#E6E4DE] transition-colors ${
                selectedBrandType === "NICHE"
                  ? "bg-[#171917] text-white font-medium"
                  : "text-[#77776F] hover:text-[#171917]"
              }`}
            >
              {c("Haute Niche", "نيش")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedBrandType("DESIGNER")}
              className={`px-3 py-1.5 border-s border-[#E6E4DE] transition-colors ${
                selectedBrandType === "DESIGNER"
                  ? "bg-[#171917] text-white font-medium"
                  : "text-[#77776F] hover:text-[#171917]"
              }`}
            >
              {c("Designer Privé", "ديزاينر")}
            </button>
          </div>

          {/* Scent Family Dropdown */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            className="px-3 py-1.5 border border-[#E6E4DE] bg-white text-[#171917] text-xs focus:outline-none focus:border-[#171917]"
          >
            <option value="">{c("All Scent Families", "جميع العائلات العطرية")}</option>
            <option value="oriental-amber">{c("Amber & Oriental", "عنبر وشرقي")}</option>
            <option value="woody-smoky">{c("Woods & Smoke", "خشبي ودخاني")}</option>
            <option value="fresh-citrus-aquatic">{c("Fresh & Citrus", "منعش وحمضي")}</option>
            <option value="gourmand-leather">{c("Gourmand & Leather", "حلو وجلدي")}</option>
          </select>
        </div>

        {/* Right: Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-[#77776F]">{c("Sort by:", "ترتيب حسب:")}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 border border-[#E6E4DE] bg-white text-[#171917] text-xs focus:outline-none focus:border-[#171917]"
          >
            <option value="curated">{c("Muschio Curated", "ترشيحات موسكيو")}</option>
            <option value="price-asc">{c("Price: Low to High", "السعر: الأقل أولاً")}</option>
            <option value="price-desc">{c("Price: High to Low", "السعر: الأعلى أولاً")}</option>
            <option value="name">{c("Alphabetical: A–Z", "الاسم: أ–ي")}</option>
          </select>
        </div>
      </div>

      {/* 3. Mobile Filter and Sort Toolbar (Level Shoes Fixed Strip Pattern) */}
      <div className="flex md:hidden items-center justify-between gap-2 py-3 border-b border-[#E6E4DE]">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E6E4DE] bg-white text-xs font-medium text-[#171917]"
        >
          <SlidersHorizontal size={14} />
          <span>{c("Filter", "تصفية")}</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#171917] text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileSortOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-[#E6E4DE] bg-white text-xs font-medium text-[#171917]"
        >
          <ArrowUpDown size={14} />
          <span>{c("Sort", "ترتيب")}</span>
        </button>
      </div>

      {/* 4. Active Filter Chips & Clear All */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap py-3 border-b border-[#E6E4DE] text-xs">
          <span className="text-[#77776F] me-1">{c("Active Filters:", "الفلاتر النشطة:")}</span>
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
            className="text-xs text-[#171917] underline hover:text-[#46513B] ms-2 font-medium"
          >
            {c("Clear All", "مسح الكل")}
          </button>
        </div>
      )}

      {/* 5. Product Grid (2 Columns Mobile, 3 Tablet, 4 Desktop) */}
      <div className="pt-6">
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="font-serif text-2xl text-[#171917]">
              {c("No fragrances found", "لم يتم العثور على عطور")}
            </p>
            <p className="text-xs text-[#77776F] max-w-sm mx-auto">
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
          <div className="product-grid">
            {filtered.map((product) => (
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
                image={product.image}
                secondaryImage={product.secondaryImage}
                badge={product.badge}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end md:hidden"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-[#F8F7F3] p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E4DE]">
                <h3 className="font-serif text-xl font-medium text-[#171917]">
                  {c("Filter Fragrances", "تصفية العطور")}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Maison Category */}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-[#171917] block mb-3">
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
                          ? "border-[#171917] bg-white font-medium text-[#171917]"
                          : "border-[#E6E4DE] text-[#77776F]"
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
                <span className="text-xs font-medium uppercase tracking-wider text-[#171917] block mb-3">
                  {c("Scent Family", "العائلة العطرية")}
                </span>
                <div className="space-y-2">
                  {[
                    { label: c("All Scent Families", "جميع العائلات العطرية"), value: "" },
                    { label: c("Amber & Oriental", "عنبر وشرقي"), value: "oriental-amber" },
                    { label: c("Woods & Smoke", "خشبي ودخاني"), value: "woody-smoky" },
                    { label: c("Fresh & Citrus", "منعش وحمضي"), value: "fresh-citrus-aquatic" },
                    { label: c("Gourmand & Leather", "حلو وجلدي"), value: "gourmand-leather" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedFamily(option.value)}
                      className={`w-full flex items-center justify-between p-3 border text-xs text-start transition-colors ${
                        selectedFamily === option.value
                          ? "border-[#171917] bg-white font-medium text-[#171917]"
                          : "border-[#E6E4DE] text-[#77776F]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {selectedFamily === option.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E4DE] flex gap-3">
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
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:hidden"
          onClick={() => setMobileSortOpen(false)}
        >
          <div
            className="w-full bg-[#F8F7F3] p-6 rounded-t-lg shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DE]">
              <h3 className="font-serif text-lg font-medium text-[#171917]">
                {c("Sort Fragrances", "ترتيب العطور")}
              </h3>
              <button
                type="button"
                onClick={() => setMobileSortOpen(false)}
                className="p-1"
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
                      ? "font-medium text-[#171917] bg-white border border-[#E6E4DE]"
                      : "text-[#77776F]"
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
