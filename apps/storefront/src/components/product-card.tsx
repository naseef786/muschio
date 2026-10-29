"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { formatCurrency } from "@muschio/ui";
import { useWishlist } from "../context/wishlist-context";
import { useCart } from "../context/cart-context";
import { PREVIEW_CATALOG } from "../lib/preview-catalog";

export interface ProductCardVariant {
  id?: string;
  sku?: string;
  volume?: string;
  volumeMl?: number | null;
  sizeLabelEn?: string;
  sizeLabelAr?: string;
  price: number;
  compareAtPrice?: number | null;
  regularPrice?: number;
  originalPrice?: number;
  salePrice?: number | null;
  discountPrice?: number | null;
  stockQuantity?: number;
  availableQuantity?: number;
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
  hasMultipleVariants,
  image,
  secondaryImage,
  badge,
  locale = "en",
  aspectRatio = "3/4",
}: ProductCardProps) {
  const isAr = locale === "ar";
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem, setCartDrawerOpen } = useCart();
  const isWishlisted = isInWishlist(slug);

  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const title = isAr && nameAr ? nameAr : nameEn;
  const displayImage = isHovered && secondaryImage ? secondaryImage : image;

  // Resolve variants from props or PREVIEW_CATALOG fallback
  const activeVariants: ProductCardVariant[] = useMemo(() => {
    const rawList =
      (variants && variants.length > 0)
        ? variants
        : (PREVIEW_CATALOG[slug]?.variants && PREVIEW_CATALOG[slug].variants.length > 0)
        ? PREVIEW_CATALOG[slug].variants
        : [];

    const fullBottles = rawList.filter(
      (v: ProductCardVariant) => !v.isSampleVial && (v.volumeMl ? v.volumeMl > 5 : true),
    );
    return fullBottles.length > 0 ? fullBottles : rawList;
  }, [variants, slug]);

  // Determine pricing hierarchy: lowest selling price, strikethrough MRP, and "From" prefix
  const { displayPrice, displayCompareAtPrice, isFromPrice, isDiscounted } = useMemo(() => {
    if (activeVariants.length > 1) {
      // Calculate normalized pricing for each variant
      const parsed = activeVariants.map((v) => {
        const regular = Number(
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
        const sellingPrice = hasDisc ? rawDisc! : (v.price || regular);
        const comparePrice = hasDisc ? regular : null;

        return { sellingPrice, comparePrice, hasDisc };
      });

      // Sort by lowest selling price
      parsed.sort((a, b) => a.sellingPrice - b.sellingPrice);
      const lowest = parsed[0] || { sellingPrice: price || 0, comparePrice: null, hasDisc: false };

      return {
        displayPrice: lowest.sellingPrice,
        displayCompareAtPrice: lowest.comparePrice,
        isFromPrice: true,
        isDiscounted: lowest.hasDisc,
      };
    }

    const firstVar = activeVariants[0];
    if (activeVariants.length === 1 && firstVar) {
      const regular = Number(
        firstVar.regularPrice ??
        firstVar.originalPrice ??
        (firstVar.compareAtPrice && firstVar.compareAtPrice > firstVar.price ? firstVar.compareAtPrice : firstVar.price),
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
      const sellingPrice = hasDisc ? rawDisc! : (firstVar.price || regular);
      const comparePrice = hasDisc ? regular : null;

      return {
        displayPrice: sellingPrice,
        displayCompareAtPrice: comparePrice,
        isFromPrice: Boolean(hasMultipleVariants),
        isDiscounted: hasDisc,
      };
    }

    // Direct fallback from props
    const basePrice = price || 0;
    const baseCompare = compareAtPrice || null;
    const hasDisc = Boolean(baseCompare && baseCompare > basePrice);

    return {
      displayPrice: basePrice,
      displayCompareAtPrice: hasDisc ? baseCompare : null,
      isFromPrice: Boolean(hasMultipleVariants),
      isDiscounted: hasDisc,
    };
  }, [activeVariants, price, compareAtPrice, hasMultipleVariants]);

  // Wishlist Action Toggle
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

  // Quick Add Action
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;

    setIsAdding(true);
    try {
      const targetVariant =
        activeVariants.find(
          (v) => v.isDefault && (v.availableQuantity ?? v.stockQuantity ?? 1) > 0,
        ) ||
        activeVariants.find(
          (v) => (v.availableQuantity ?? v.stockQuantity ?? 1) > 0,
        ) ||
        activeVariants[0];

      const variantVol = targetVariant?.volume || targetVariant?.sizeLabelEn || "100ml";
      const variantId = targetVariant?.id || `var-${slug}-quick`;
      const currentStock = targetVariant?.availableQuantity ?? targetVariant?.stockQuantity ?? 25;

      await addItem({
        variantId,
        slug,
        title: nameEn,
        titleAr: nameAr || nameEn,
        brand,
        price: displayPrice,
        compareAtPrice: displayCompareAtPrice,
        quantity: 1,
        image: displayImage || image || "/product-placeholder.svg",
        sizeLabel: isAr
          ? (targetVariant?.sizeLabelAr || `${variantVol} مل`)
          : (targetVariant?.sizeLabelEn || `${variantVol} Flacon`),
        volume: variantVol,
        stockQuantity: currentStock,
      });

      setJustAdded(true);
      setCartDrawerOpen(true);
      setTimeout(() => setJustAdded(false), 1800);
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
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
      className="group relative flex flex-col h-full select-none cursor-pointer transition-transform duration-300 hover:-translate-y-1 block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container (Soft Off-White Minimal Canvas) */}
      <div
        className={`relative ${aspectClass} w-full bg-[#F7F7F7] dark:bg-neutral-900/60 overflow-hidden flex items-center justify-center rounded-sm transition-colors duration-300`}
      >
        {/* Subtle Luxury Badge (top-start) */}
        {badge && (
          <span className="absolute top-3 start-3 z-10 text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2.5 py-1 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 pointer-events-none select-none rounded-sm">
            {badge}
          </span>
        )}

        {/* Floating Action Icons (top-end stacked vertically) */}
        <div className="absolute top-3 end-3 z-20 flex flex-col gap-2">
          {/* Wishlist Button */}
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
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${
              isWishlisted
                ? "bg-white text-accent border-accent/40 shadow-md scale-105"
                : "bg-white/95 hover:bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200/60 dark:bg-neutral-800/95 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:border-neutral-700/60 hover:scale-105"
            } active:scale-95`}
          >
            <Heart
              size={14}
              className={`transition-colors duration-200 ${
                isWishlisted ? "fill-accent text-accent" : ""
              }`}
            />
          </button>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding}
            aria-label={isAr ? "إضافة سريعة للحقيبة" : "Quick Add to Bag"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${
              justAdded
                ? "bg-accent text-white border-accent shadow-md scale-105"
                : "bg-white/95 hover:bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200/60 dark:bg-neutral-800/95 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:hover:text-white dark:border-neutral-700/60 hover:scale-105"
            } active:scale-95`}
          >
            {justAdded ? (
              <Check size={13} className="stroke-[2.5]" />
            ) : (
              <ShoppingBag size={13} />
            )}
          </button>
        </div>

        {/* Product Bottle Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={displayImage || "/product-placeholder.svg"}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.06]"
          />
        </div>
      </div>

      {/* 2. Typography & Content Layout (Minimal Luxury Alignment) */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between text-start rtl:text-right">
        <div className="space-y-1">
          {/* Brand Name / Collection */}
          <p className="text-xs sm:text-[13px] font-sans text-neutral-500 dark:text-neutral-400 font-normal tracking-wide uppercase truncate">
            {brand}
          </p>

          {/* Product Title */}
          <h3 className="text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-1 group-hover:text-accent transition-colors">
            {title}
          </h3>

          {/* Subtitle / Concentration */}
          {concentration && (
            <p className="text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500 line-clamp-1 font-sans font-light tracking-wide">
              {concentration}
            </p>
          )}
        </div>

        {/* 3. Price Display */}
        <div className="mt-2.5 flex items-baseline gap-2 flex-wrap font-sans">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {isFromPrice && (
              <span className="font-normal text-xs text-neutral-500 dark:text-neutral-400 me-1">
                {isAr ? "من " : "From "}
              </span>
            )}
            {formatCurrency(displayPrice, "AED", locale)}
          </span>

          {isDiscounted && displayCompareAtPrice && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
              {formatCurrency(displayCompareAtPrice, "AED", locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
