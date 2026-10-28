"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart, ArrowLeftRight } from "lucide-react";
import { PriceDisplay } from "@muschio/ui";
import { useWishlist } from "../context/wishlist-context";
import { useCompare } from "../context/compare-context";
import { PREVIEW_CATALOG } from "../lib/preview-catalog";

export interface ProductCardProps {
  slug: string;
  nameEn: string;
  nameAr?: string;
  brand: string;
  brandType?: string;
  concentration?: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  secondaryImage?: string;
  badge?: string | null;
  locale?: "en" | "ar";
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
  image,
  secondaryImage,
  badge,
  locale = "en",
}: ProductCardProps) {
  const isAr = locale === "ar";
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const isWishlisted = isInWishlist(slug);
  const isCompared = isInCompare(slug);
  const [isHovered, setIsHovered] = useState(false);

  const title = isAr && nameAr ? nameAr : nameEn;
  const displayImage = isHovered && secondaryImage ? secondaryImage : image;

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
      price,
      compareAtPrice,
      image,
      variantId: "",
    });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const catalogItem = PREVIEW_CATALOG[slug];
    const topNotes =
      catalogItem?.notes?.filter((n: any) => n.position === "TOP").map((n: any) => n.name) || [];
    const heartNotes =
      catalogItem?.notes?.filter((n: any) => n.position === "HEART").map((n: any) => n.name) || [];
    const baseNotes =
      catalogItem?.notes?.filter((n: any) => n.position === "BASE").map((n: any) => n.name) || [];

    toggleCompare({
      slug,
      nameEn,
      nameAr,
      brand,
      brandType: (brandType as "NICHE" | "DESIGNER") || "NICHE",
      concentration: concentration || catalogItem?.concentration || "Extrait de Parfum",
      price,
      compareAtPrice,
      image,
      perfumer: catalogItem?.perfumer,
      perfumerBio: catalogItem?.perfumerBio,
      origin: catalogItem?.origin,
      scentFamily: catalogItem?.scentFamily || "Woody Amber",
      longevity: catalogItem?.longevity || "20+ Hours",
      sillage: catalogItem?.sillage || "Royal Sillage",
      volumeMl: catalogItem?.variants?.[0]?.volumeMl || 100,
      variantId: catalogItem?.variants?.[0]?.id,
      topNotes,
      heartNotes,
      baseNotes,
    });
  };

  return (
    <div
      className="group relative flex flex-col h-full border border-luxury-border bg-luxury-surface hover:border-luxury-muted p-2.5 sm:p-3.5 transition-all duration-300 rounded-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 4:5 Aspect Ratio Image Canvas with Discreet Utilities & Badge */}
      <div className="relative aspect-[4/5] w-full bg-luxury-surface2 border border-luxury-border/60 overflow-hidden flex items-center justify-center rounded-sm">
        {/* Subtle Badge (pinned to top start/left) */}
        {badge && (
          <span className="absolute top-2.5 start-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10 max-w-[calc(100%-3.5rem)] truncate text-[9px] md:text-[10px] font-sans font-semibold uppercase tracking-[0.14em] px-2.5 py-1 bg-luxury-surface/90 backdrop-blur-sm border border-luxury-border text-luxury-text pointer-events-none select-none">
            {badge}
          </span>
        )}

        {/* Floating Utility Actions (pinned to top end/right) */}
        <div className="absolute top-2.5 end-2.5 right-2.5 rtl:right-auto rtl:left-2.5 z-20 flex flex-col gap-1.5">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            title={
              isWishlisted
                ? isAr
                  ? "إزالة من المفضلة"
                  : "Remove from Private Vault"
                : isAr
                ? "إضافة للمفضلة"
                : "Save to Private Vault"
            }
            aria-label={
              isWishlisted
                ? isAr
                  ? "إزالة من المفضلة"
                  : "Remove from Private Vault"
                : isAr
                ? "إضافة للمفضلة"
                : "Save to Private Vault"
            }
            className={`group/wishlist w-8 h-8 sm:w-9 sm:h-9 rounded-sm flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isWishlisted
                ? "bg-accent/15 text-accent border border-accent/40 shadow-sm"
                : "bg-luxury-surface/90 hover:bg-luxury-surface text-luxury-muted hover:text-luxury-text border border-luxury-border shadow-sm"
            }`}
          >
            <Heart
              size={15}
              className={`transition-all duration-200 ${
                isWishlisted
                  ? "fill-accent text-accent scale-105"
                  : "text-luxury-muted group-hover/wishlist:text-luxury-text"
              }`}
            />
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={handleToggleCompare}
            title={
              isCompared
                ? isAr
                  ? "إزالة من المقارنة"
                  : "Remove from Comparison"
                : isAr
                ? "مقارنة هذا العطر"
                : "Compare Fragrance"
            }
            aria-label={
              isCompared
                ? isAr
                  ? "إزالة من المقارنة"
                  : "Remove from Comparison"
                : isAr
                ? "مقارنة هذا العطر"
                : "Compare Fragrance"
            }
            className={`group/compare w-8 h-8 sm:w-9 sm:h-9 rounded-sm flex items-center justify-center transition-all duration-200 active:scale-90 ${
              isCompared
                ? "bg-accent text-white border border-accent shadow-sm"
                : "bg-luxury-surface/90 hover:bg-luxury-surface text-luxury-muted hover:text-luxury-text border border-luxury-border shadow-sm"
            }`}
          >
            <ArrowLeftRight
              size={14}
              className={`transition-all duration-200 ${
                isCompared
                  ? "text-white scale-105"
                  : "text-luxury-muted group-hover/compare:text-luxury-text"
              }`}
            />
          </button>
        </div>

        {/* Product Image (Centered, object-contain, never cropped) */}
        <Link
          href={`/product/${slug}`}
          className="relative w-full h-full flex items-center justify-center p-3 sm:p-5"
        >
          <Image
            src={displayImage || "/product-placeholder.svg"}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 sm:p-5 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
          />
        </Link>
      </div>

      {/* Retail Information Hierarchy (iOS Standard Clean Alignment) */}
      <div className="pt-3.5 pb-1 px-1 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          {/* Brand */}
          <Link
            href={`/brands/${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="block text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-luxury-muted hover:text-luxury-text transition-colors"
          >
            {brand}
          </Link>

          {/* Product Name */}
          <Link
            href={`/product/${slug}`}
            className="block text-[13.5px] sm:text-[14.5px] font-medium text-luxury-text hover:text-accent transition-colors leading-snug line-clamp-2"
          >
            {title}
          </Link>

          {/* Concentration or Subtitle */}
          {concentration && (
            <p className="text-[12px] text-luxury-muted/80 line-clamp-1 font-sans">
              {concentration}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-2.5 pt-2 border-t border-luxury-border flex items-center justify-between">
          <PriceDisplay
            price={price}
            compareAtPrice={compareAtPrice}
            locale={locale}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
