"use client";

import React, { useEffect, useState } from "react";
import { muschioApi } from "../../../lib/api";
import { StorefrontProduct } from "@muschio/types";
import Image from "next/image";
import { Link } from "../../../navigation";
import { Button, Badge, PriceDisplay } from "@muschio/ui";

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
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
    notes: ["Silver Frankincense", "Cambodian Oud"],
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
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85",
    notes: ["Kashmiri Saffron", "Ambergris"],
  },
  {
    slug: "roja-parfums-elysium-pour-homme-parfum",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    brand: "Roja Parfums",
    brandType: "NICHE",
    family: "fresh-citrus-aquatic",
    gender: "MEN",
    concentration: "Extrait de Parfum",
    price: 1950,
    image:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
    notes: ["Calabrian Bergamot", "Tuscan Leather"],
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
    notes: ["Laos Oud", "Bulgarian Rose"],
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
    image:
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=85",
    notes: ["Bourbon Vanilla", "Tobacco Accord"],
  },
];

export default function ShopCatalogPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: "en" | "ar" };
  searchParams: { search?: string; brandType?: string };
}) {
  const isAr = locale === "ar";
  const [selectedBrandType, setSelectedBrandType] = useState<string | null>(
    searchParams.brandType ?? null,
  );
  const [search, setSearch] = useState(searchParams.search ?? "");
  const [sort, setSort] = useState("curated");
  const [family, setFamily] = useState("");
  const [live, setLive] = useState<StorefrontProduct[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  useEffect(() => {
    let active = true;
    muschioApi.getProducts({ limit: 100 }).then((products) => {
      if (active) {
        setLive(products);
        setCatalogLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    setSearch(searchParams.search ?? "");
    setSelectedBrandType(searchParams.brandType ?? null);
  }, [searchParams.search, searchParams.brandType]);
  const catalog = live
    ? live.map((product) => {
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
          image: product.images[0] || "",
          notes: product.notes.map((note) =>
            isAr ? note.nameAr : note.nameEn,
          ),
        };
      })
    : CATALOG_PRODUCTS;

  const filtered = catalog
    .filter((p) => {
      if (selectedBrandType && p.brandType !== selectedBrandType) return false;
      if (family && p.family !== family) return false;
      const query = search.trim().toLocaleLowerCase();
      if (
        query &&
        ![p.nameEn, p.nameAr, p.brand, ...p.notes]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query)
      )
        return false;
      return true;
    })
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : sort === "name"
            ? a.nameEn.localeCompare(b.nameEn)
            : 0,
    );

  return (
    <div className="editorial-section space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent font-medium">
          {isAr ? "الخزانة الملكية" : "The Olfactory Vault"}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light">
          {isAr ? "جميع العطور النيش والمصممين" : "The Fragrance Collection"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans max-w-2xl leading-relaxed">
          {isAr
            ? "تصفح مجموعتنا الحصرية من العطور النيش النادرة، مصنفة حسب الدار، التركيز، والعائلة العطرية."
            : "Explore our authoritative collection of authentic niche and designer extraits, filtered by house, scent family, concentration, and volume."}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <p className="sm:col-span-3 delivery-status" role="status">
          {catalogLoading
            ? isAr
              ? "جارٍ التحقق من المجموعة…"
              : "Checking the live collection…"
            : live === null
              ? isAr
                ? "معاينة المجموعة. الأسعار والصور مرجعية، والشراء متاح فقط للمنتجات ذات المخزون المباشر."
                : "Collection preview. Prices and imagery are illustrative; purchasing requires live catalog availability."
              : isAr
                ? "مجموعة مباشرة من كتالوج موسكيو."
                : "Live collection from the Muschio catalog."}
        </p>
        <div>
          <label htmlFor="catalog-search" className="block text-sm mb-2">
            {isAr ? "ابحث في المجموعة" : "Search the collection"}
          </label>
          <input
            id="catalog-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full p-3"
          />
        </div>
        <div>
          <label htmlFor="scent-family" className="block text-sm mb-2">
            {isAr ? "العائلة العطرية" : "Scent family"}
          </label>
          <select
            id="scent-family"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="glass-input w-full p-3"
          >
            <option value="">
              {isAr ? "جميع العائلات" : "All scent families"}
            </option>
            <option value="oriental-amber">
              {isAr ? "عنبر وشرقي" : "Amber & oriental"}
            </option>
            <option value="woody-smoky">
              {isAr ? "خشبي ودخاني" : "Woods & smoke"}
            </option>
            <option value="fresh-citrus-aquatic">
              {isAr ? "منعش وحمضي" : "Fresh & citrus"}
            </option>
            <option value="gourmand-leather">
              {isAr ? "حلو وجلدي" : "Gourmand & leather"}
            </option>
          </select>
        </div>
        <div>
          <label htmlFor="catalog-sort" className="block text-sm mb-2">
            {isAr ? "ترتيب حسب" : "Sort by"}
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="glass-input w-full p-3"
          >
            <option value="curated">
              {isAr ? "اختيارات موسكيو" : "Muschio edit"}
            </option>
            <option value="price-asc">
              {isAr ? "السعر: الأقل أولاً" : "Price: low to high"}
            </option>
            <option value="price-desc">
              {isAr ? "السعر: الأعلى أولاً" : "Price: high to low"}
            </option>
            <option value="name">{isAr ? "الاسم" : "Name: A–Z"}</option>
          </select>
        </div>
      </div>
      {/* Filter Chips & Controls */}
      <div className="border-y border-zinc-200 dark:border-zinc-800 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedBrandType(null)}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              selectedBrandType === null
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {isAr ? "الكل" : "All Houses"}
          </button>
          <button
            onClick={() => setSelectedBrandType("NICHE")}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              selectedBrandType === "NICHE"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Haute Niche
          </button>
          <button
            onClick={() => setSelectedBrandType("DESIGNER")}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              selectedBrandType === "DESIGNER"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Designer Privé
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          <Link
            href="/notes"
            className="text-accent hover:underline font-medium"
          >
            {isAr ? "تصفح حسب النوتة العطرية →" : "Shop by Scent Notes →"}
          </Link>
        </div>
      </div>

      <p role="status" className="text-sm">
        {filtered.length} {isAr ? "عطور" : "fragrances"}
      </p>
      {!filtered.length && (
        <div className="delivery-panel space-y-5">
          <h2>{isAr ? "لم نجد نتائج" : "No fragrances found"}</h2>
          <p>
            {isAr
              ? "جرّب اسماً أو نوتة أخرى، أو امسح الفلاتر."
              : "Try another name or note, or clear your filters."}
          </p>
          <button
            className="editorial-button"
            onClick={() => {
              setSearch("");
              setFamily("");
              setSelectedBrandType(null);
            }}
          >
            {isAr ? "مسح الفلاتر" : "Clear filters"}
          </button>
        </div>
      )}
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((product, idx) => (
          <div
            key={idx}
            className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-96 w-full overflow-hidden bg-zinc-950">
              {/^https:\/\/(images\.unsplash\.com|media\.muschio\.luxury)\//.test(
                product.image,
              ) ? (
                <Image
                  src={product.image}
                  alt={product.nameEn}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white text-sm">
                  {isAr ? "صورة المنتج غير متاحة" : "Product image unavailable"}
                </div>
              )}
              <div className="absolute top-3 start-3">
                <Badge
                  variant={product.brandType === "NICHE" ? "niche" : "designer"}
                >
                  {product.brand}
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-sans uppercase tracking-widest text-zinc-400">
                  {product.concentration}
                </span>
                <Link href={`/product/${product.slug}`} className="block">
                  <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-accent transition-colors">
                    {isAr ? product.nameAr : product.nameEn}
                  </h3>
                </Link>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.notes.map((n: string, nIdx: number) => (
                    <span
                      key={nIdx}
                      className="text-[10px] text-zinc-500 font-sans"
                    >
                      • {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <PriceDisplay
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  locale={locale}
                />
                <Button asChild size="sm" variant="outline">
                  <Link href={`/product/${product.slug}`}>
                    {isAr ? "اكتشف" : "Discover"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
