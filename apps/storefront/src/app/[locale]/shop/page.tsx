"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
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
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
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
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85",
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
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
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
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
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
    image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=85",
    notes: ["Bourbon Vanilla", "Tobacco Accord"],
  },
];

export default function ShopCatalogPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLocaleLowerCase();
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedBrandType, setSelectedBrandType] = useState<string | null>(null);

  const filtered = CATALOG_PRODUCTS.filter((p) => {
    if (search && ![p.nameEn, p.nameAr, p.brand, p.family, p.concentration, ...p.notes].join(" ").toLocaleLowerCase().includes(search)) return false;
    if (selectedBrandType && p.brandType !== selectedBrandType) return false;
    return true;
  }).sort((a, b) => sortOrder === "price-asc" ? a.price - b.price : sortOrder === "price-desc" ? b.price - a.price : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
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

      {/* Filter Chips & Controls */}
      <div className="border-y border-zinc-200 dark:border-zinc-800 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedBrandType(null)}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              selectedBrandType === null ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium" : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {isAr ? "الكل" : "All Houses"}
          </button>
          <button
            onClick={() => setSelectedBrandType("NICHE")}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              selectedBrandType === "NICHE" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium" : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Haute Niche
          </button>
          <button
            onClick={() => setSelectedBrandType("DESIGNER")}
            className={`px-3 py-1.5 text-xs font-sans border transition-all ${
              selectedBrandType === "DESIGNER" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium" : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Designer Privé
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          <Link href="/notes" className="text-accent hover:underline font-medium">
            {isAr ? "تصفح حسب النوتة العطرية →" : "Shop by Scent Notes →"}
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-300">{filtered.length} {isAr ? "عطور" : "fragrances"}{search ? ` · "${search}"` : ""}</p>
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">{isAr ? "الترتيب" : "Sort by"}
          <select aria-label={isAr ? "ترتيب المنتجات" : "Sort fragrances"} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border border-zinc-300 dark:border-zinc-700 bg-luxury-surface px-3 py-2">
            <option value="featured">{isAr ? "المميزة" : "Featured"}</option>
            <option value="price-asc">{isAr ? "الأقل سعراً" : "Price: Low to High"}</option>
            <option value="price-desc">{isAr ? "الأعلى سعراً" : "Price: High to Low"}</option>
          </select>
        </label>
      </div>
      {filtered.length === 0 && <div className="py-16 text-center space-y-4"><p>{isAr ? "لم يتم العثور على عطور مطابقة." : "No fragrances match your search or filters."}</p><Link href="/shop" className="text-accent underline">{isAr ? "مسح البحث والفلاتر" : "Clear search and filters"}</Link></div>}
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((product) => (
          <div
            key={product.slug}
            className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-96 w-full overflow-hidden bg-zinc-950">
              <Image
                src={product.image}
                alt={product.nameEn}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 start-3">
                <Badge variant={product.brandType === "NICHE" ? "niche" : "designer"}>
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
                    <span key={nIdx} className="text-[10px] text-zinc-500 font-sans">
                      • {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} locale={locale} />
                <Button asChild size="sm" variant="outline">
                  <Link href={`/product/${product.slug}`}>{isAr ? "اكتشف" : "Discover"}</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
