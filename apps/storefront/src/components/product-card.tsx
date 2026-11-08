"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart } from "lucide-react";
import { formatCurrency } from "@muschio/ui";
import { useWishlist } from "../context/wishlist-context";

export interface ProductCardVariant {
  id?: string;
  sku?: string;
  volume?: string | number;
  volumeMl?: number | null;
  sizeLabelEn?: string;
  sizeLabelAr?: string;
  basePrice?: number | null;
  regularPrice?: number;
  originalPrice?: number;
  price: number;
  compareAtPrice?: number | null;
  salePrice?: number | null;
  discountPrice?: number | null;
  stock?: number;
  stockQuantity?: number;
  availableQuantity?: number;
  warehouse?: string;
  isDefault?: boolean;
  isSampleVial?: boolean;
}

export interface ProductCardProps {
  slug: string;
  nameEn: string;
  nameAr?: string;
  brand: string;
  brandType?: string;
  concentration?: string;
  price?: number;
  compareAtPrice?: number | null;
  variants?: ProductCardVariant[];
  hasMultipleVariants?: boolean;
  image: string;
  secondaryImage?: string;
  badge?: string | null;
  tags?: Array<{
    id: string;
    nameEn: string;
    nameAr?: string;
    slug: string;
    colorHex?: string | null;
    isFeatured?: boolean;
  }>;
  locale?: "en" | "ar";
  aspectRatio?: "3/4" | "square" | "4/5";
}

export function ProductCard({
  slug,
  nameEn,
  nameAr,
  brand,
  brandType,
  concentration,
  price,
  compareAtPrice,
  variants,
  image,
  secondaryImage,
  badge,
  tags,
  locale = "en",
  aspectRatio = "3/4",
}: ProductCardProps) {
  const isAr = locale === "ar";
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(slug);

  const [isHovered, setIsHovered] = useState(false);

  const title = isAr && nameAr ? nameAr : nameEn;
  const displayImage = isHovered && secondaryImage ? secondaryImage : image;

  // Resolve variants from props
  const activeVariants: ProductCardVariant[] = useMemo(() => {
    const rawList = variants && variants.length > 0 ? variants : [];

    const fullBottles = rawList.filter(
      (v: ProductCardVariant) => !v.isSampleVial && (v.volumeMl ? v.volumeMl > 5 : true),
    );
    const toSort = fullBottles.length > 0 ? fullBottles : rawList;
    return [...toSort].sort((a, b) => {
      const volA = a.volumeMl ?? (typeof a.volume === "number" ? a.volume : parseInt(String(a.volume || "").replace(/[^0-9]/g, "")) || 0);
      const volB = b.volumeMl ?? (typeof b.volume === "number" ? b.volume : parseInt(String(b.volume || "").replace(/[^0-9]/g, "")) || 0);
      return volA - volB;
    });
  }, [variants]);

  const isOutOfStock = useMemo(() => {
    if (activeVariants.length === 0) return false;
    return activeVariants.every((v) => {
      const stock = v.stock ?? v.stockQuantity ?? v.availableQuantity ?? 0;
      return stock <= 0;
    });
  }, [activeVariants]);

  // Determine pricing
  const { displayPrice, displayCompareAtPrice, isDiscounted } = useMemo(() => {
    if (activeVariants.length > 1) {
      const parsed = activeVariants.map((v) => {
        const regular = Number(
          v.basePrice ??
            v.regularPrice ??
            v.originalPrice ??
            (v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : v.price),
        );
        const rawDisc =
          v.salePrice !== null && v.salePrice !== undefined
            ? Number(v.salePrice)
            : v.discountPrice !== null && v.discountPrice !== undefined
            ? Number(v.discountPrice)
            : v.compareAtPrice && v.compareAtPrice > v.price
            ? Number(v.price)
            : null;

        const hasDisc = rawDisc !== null && rawDisc > 0 && rawDisc < regular;
        const sellingPrice = hasDisc ? rawDisc! : v.price || regular;
        const comparePrice = hasDisc ? regular : null;

        return { sellingPrice, comparePrice, hasDisc };
      });

      parsed.sort((a, b) => a.sellingPrice - b.sellingPrice);
      const lowest = parsed[0] || { sellingPrice: price || 0, comparePrice: null, hasDisc: false };

      return {
        displayPrice: lowest.sellingPrice,
        displayCompareAtPrice: lowest.comparePrice,
        isDiscounted: lowest.hasDisc,
      };
    }

    const firstVar = activeVariants[0];
    if (activeVariants.length === 1 && firstVar) {
      const regular = Number(
        firstVar.regularPrice ??
          firstVar.originalPrice ??
          (firstVar.compareAtPrice && firstVar.compareAtPrice > firstVar.price
            ? firstVar.compareAtPrice
            : firstVar.price),
      );
      const rawDisc =
        firstVar.salePrice !== null && firstVar.salePrice !== undefined
          ? Number(firstVar.salePrice)
          : firstVar.discountPrice !== null && firstVar.discountPrice !== undefined
          ? Number(firstVar.discountPrice)
          : firstVar.compareAtPrice && firstVar.compareAtPrice > firstVar.price
          ? Number(firstVar.price)
          : null;

      const hasDisc = rawDisc !== null && rawDisc > 0 && rawDisc < regular;
      const sellingPrice = hasDisc ? rawDisc! : firstVar.price || regular;
      const comparePrice = hasDisc ? regular : null;

      return {
        displayPrice: sellingPrice,
        displayCompareAtPrice: comparePrice,
        isDiscounted: hasDisc,
      };
    }

    const basePrice = price || 0;
    const baseCompare = compareAtPrice || null;
    const hasDisc = Boolean(baseCompare && baseCompare > basePrice);

    return {
      displayPrice: basePrice,
      displayCompareAtPrice: hasDisc ? baseCompare : null,
      isDiscounted: hasDisc,
    };
  }, [activeVariants, price, compareAtPrice]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      slug,
      nameEn,
      nameAr,
      brand,
      brandType: (brandType as "NICHE" | "DESIGNER") || "NICHE",
      concentration: concentration || "Extrait de Parfum",
      price: displayPrice,
      compareAtPrice: displayCompareAtPrice,
      image: image || "/product-placeholder.svg",
      variantId: activeVariants[0]?.id || "",
    });
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "4/5"
      ? "aspect-[4/5]"
      : "aspect-[3/4]";

  return (
    <Link
      href={`/product/${slug}`}
      className="group relative flex flex-col h-full select-none cursor-pointer block font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container (Clean Luxury Canvas with Zero Padding) */}
      <div
        className={`relative ${aspectClass} w-full bg-[#F8F8F8] dark:bg-neutral-900 overflow-hidden rounded-none`}
      >
        {/* Out of Stock Indicator */}
        {isOutOfStock && (
          <div className="absolute top-3 start-3 z-20">
            <span className="px-2 py-0.5 text-[10px] uppercase font-sans tracking-wider bg-white/95 dark:bg-black/90 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
              {isAr ? "غير متوفر" : "Out of Stock"}
            </span>
          </div>
        )}

        {/* Minimalist Floating Heart (Level Shoes pattern) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={
            isWishlisted
              ? isAr
                ? "إزالة من المفضلة"
                : "Remove from Wishlist"
              : isAr
              ? "إضافة إلى المفضلة"
              : "Add to Wishlist"
          }
          className="absolute top-3 end-3 z-20 p-1 text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-transform active:scale-90"
        >
          <Heart
            size={20}
            strokeWidth={1.2}
            className={`transition-colors duration-200 ${
              isWishlisted
                ? "fill-black text-black dark:fill-white dark:text-white"
                : "text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white"
            }`}
          />
        </button>

        {/* Product Full-Bleed Image (Zero Padding) */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={displayImage || "/product-placeholder.svg"}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* Subtle Pagination Indicator Dots (Level Shoes Pattern: 5 dots) */}
        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              !isHovered || !secondaryImage
                ? "bg-black dark:bg-white"
                : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          />
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              isHovered && secondaryImage
                ? "bg-black dark:bg-white"
                : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        </div>
      </div>

      {/* 2. Text / Information (Exact Level Shoes Hierarchy) */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between text-start rtl:text-right font-sans">
        <div>
          {/* Line 1: Brand Name (DOLCE&GABBANA style) */}
          <p className="text-xs sm:text-[13px] font-semibold tracking-wider uppercase text-black dark:text-white truncate">
            {brand}
          </p>

          {/* Line 2: Product Title (DG logo flat sandals style) */}
          <h3 className="text-sm font-normal text-neutral-800 dark:text-neutral-200 leading-snug line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors mt-0.5">
            {title}
          </h3>

          {/* Line 3: Price (Level Shoes style, e.g. 2,900 AED or From 570 AED) */}
          <div className="mt-1.5 flex items-baseline gap-2 font-sans flex-wrap">
            <span className="text-sm font-semibold text-black dark:text-white">
              {activeVariants.length > 1
                ? `${isAr ? "من " : "From "}${formatCurrency(displayPrice, "AED", locale)}`
                : formatCurrency(displayPrice, "AED", locale)}
            </span>

            {isDiscounted && displayCompareAtPrice && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through font-normal">
                {formatCurrency(displayCompareAtPrice, "AED", locale)}
              </span>
            )}
          </div>

          {/* Line 3.5: Available Sizes indicator if multiple sizes */}
          {activeVariants.length > 1 && (
            <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-sans tracking-wide">
              {activeVariants
                .map((v) => {
                  const num =
                    v.volumeMl ??
                    (typeof v.volume === "number"
                      ? v.volume
                      : parseInt(String(v.volume || "").replace(/[^0-9]/g, "")) || "");
                  return num ? `${num}ml` : "";
                })
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          {/* Line 4: Badge tag if any (NEW style) */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {badge && (
              <span className="inline-block text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60 rounded-none">
                {badge}
              </span>
            )}
            {tags && tags.length > 0 && tags.slice(0, 2).map((t) => (
              <span
                key={t.slug || t.id}
                className="inline-flex items-center gap-1 text-[9px] font-medium tracking-wide uppercase px-1.5 py-0.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-800"
              >
                {t.colorHex && (
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: t.colorHex }}
                  />
                )}
                <span>{isAr && t.nameAr ? t.nameAr : t.nameEn}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
