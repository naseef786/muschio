"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart } from "lucide-react";
import { PriceDisplay } from "@muschio/ui";

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
  concentration,
  price,
  compareAtPrice,
  image,
  secondaryImage,
  badge,
  locale = "en",
}: ProductCardProps) {
  const isAr = locale === "ar";
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = isAr && nameAr ? nameAr : nameEn;
  const displayImage = isHovered && secondaryImage ? secondaryImage : image;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <div
      className="group flex flex-col h-full bg-luxury-canvas transition-transform duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 4:5 Aspect Ratio Image Canvas with Discreet Wishlist & Badge */}
      <div className="relative aspect-[4/5] w-full bg-luxury-surface2 border border-luxury-border overflow-hidden flex items-center justify-center">
        {/* Subtle Badge */}
        {badge && (
          <span className="absolute top-2.5 inset-inline-start-2.5 z-10 text-[9px] md:text-[10px] font-sans font-medium uppercase tracking-[0.14em] px-2 py-0.5 bg-luxury-surface/95 text-luxury-text border border-luxury-border">
            {badge}
          </span>
        )}

        {/* Discreet Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 inset-inline-end-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-150 ${
            isWishlisted
              ? "bg-luxury-surface text-[#d2042d] border-luxury-border"
              : "bg-luxury-surface/80 text-luxury-muted border-luxury-border hover:text-luxury-text hover:bg-luxury-surface"
          }`}
        >
          <Heart
            size={15}
            className={isWishlisted ? "fill-current text-[#d2042d]" : ""}
          />
        </button>

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
            className="object-contain p-3 sm:p-5 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      </div>

      {/* Retail Information Hierarchy (Level Shoes Compact Alignment) */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          {/* Brand */}
          <Link
            href={`/brands/${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            className="block text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-luxury-muted hover:text-luxury-text transition-colors"
          >
            {brand}
          </Link>

          {/* Product Name */}
          <Link
            href={`/product/${slug}`}
            className="block text-[13px] sm:text-[14px] font-normal text-luxury-text hover:underline leading-snug line-clamp-2"
          >
            {title}
          </Link>

          {/* Concentration or Subtitle */}
          {concentration && (
            <p className="text-[12px] text-luxury-muted line-clamp-1">
              {concentration}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-2 pt-1 border-t border-transparent">
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
