"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart } from "lucide-react";
import { PriceDisplay } from "@muschio/ui";
import { useWishlist } from "../context/wishlist-context";

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
  const isWishlisted = isInWishlist(slug);
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

  return (
    <div
      className="group relative flex flex-col h-full rounded-[24px] p-3 sm:p-3.5 ios-glass-card transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 4:5 Aspect Ratio Image Canvas with Discreet Wishlist & Badge */}
      <div className="relative aspect-[4/5] w-full rounded-[18px] ios-glass-canvas overflow-hidden flex items-center justify-center">
        {/* Subtle Badge (pinned to top start/left) */}
        {badge && (
          <span className="absolute top-3 start-3 left-3 rtl:left-auto rtl:right-3 z-10 max-w-[calc(100%-4.25rem)] truncate text-[9px] md:text-[10px] font-sans font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-full ios-glass-pill text-luxury-text pointer-events-none select-none">
            {badge}
          </span>
        )}

        {/* Pro Luxury Wishlist Button (pinned to top end/right) */}
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
          className={`group/wishlist absolute top-3 end-3 right-3 rtl:right-auto rtl:left-3 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            isWishlisted
              ? "bg-accent/15 text-accent border border-accent/40 ring-2 ring-accent/20 backdrop-blur-xl shadow-sm"
              : "ios-glass-pill text-luxury-muted hover:text-luxury-text hover:scale-105"
          }`}
        >
          <Heart
            size={16}
            className={`transition-all duration-200 ${
              isWishlisted
                ? "fill-accent text-accent scale-105 drop-shadow-[0_1px_3px_rgba(197,168,128,0.45)]"
                : "text-luxury-muted group-hover/wishlist:text-luxury-text group-hover/wishlist:scale-110"
            }`}
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
        <div className="mt-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
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
