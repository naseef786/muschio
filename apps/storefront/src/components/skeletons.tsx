"use client";

import React from "react";

/**
 * Luxury Shimmer Primitive
 */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-neutral-200/70 dark:bg-neutral-800/70 rounded-sm ${className}`}
    />
  );
}

/**
 * 1:1 Product Card Skeleton matching Level Shoes luxury card hierarchy
 */
export function ProductCardSkeleton({
  aspectRatio = "3/4",
}: {
  aspectRatio?: "3/4" | "square" | "4/5";
}) {
  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "4/5"
      ? "aspect-[4/5]"
      : "aspect-[3/4]";

  return (
    <div className="flex flex-col w-full select-none" aria-hidden="true">
      {/* 1. Image Canvas Skeleton */}
      <div
        className={`relative ${aspectClass} w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden flex items-center justify-center rounded-none`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-shimmer" />
        {/* Placeholder subtle bottle icon silhouette */}
        <div className="w-16 h-24 rounded-sm bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse" />
      </div>

      {/* 2. Text / Information Skeleton */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between text-start font-sans space-y-2">
        {/* Brand Name */}
        <Skeleton className="h-3 w-24 max-w-[60%]" />

        {/* Product Title */}
        <Skeleton className="h-3.5 w-4/5" />

        {/* Price & Discount */}
        <div className="flex items-center gap-2 pt-0.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3 w-12 opacity-60" />
        </div>

        {/* Flacon Volumes */}
        <Skeleton className="h-2.5 w-20 opacity-50" />

        {/* Tags / Badges */}
        <div className="flex items-center gap-1.5 pt-1">
          <Skeleton className="h-4 w-12 rounded-none" />
          <Skeleton className="h-4 w-16 rounded-none" />
        </div>
      </div>
    </div>
  );
}

/**
 * Catalog Responsive Product Grid Skeleton (matches /shop grid exactly)
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      aria-label="Loading products"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-7 sm:gap-6 lg:gap-8"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product Detail Page (PDP) Skeleton matching Level Shoes 2-column layout
 */
export function ProductDetailSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 pb-32 bg-white dark:bg-neutral-950 animate-pulse">
      {/* 1. Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-6 md:mb-8">
        <Skeleton className="h-3 w-12" />
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <Skeleton className="h-3 w-16" />
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <Skeleton className="h-3 w-28" />
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <Skeleton className="h-3 w-36" />
      </div>

      {/* 2. Main Product Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-16 border-b border-neutral-100 dark:border-neutral-800/80">
        {/* Left Column: Gallery Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 rounded-sm relative flex items-center justify-center">
            <div className="w-24 h-40 rounded-sm bg-neutral-200/60 dark:bg-neutral-800/60" />
          </div>
          {/* Thumbnails */}
          <div className="flex gap-3">
            <Skeleton className="w-20 h-24 aspect-[4/5]" />
            <Skeleton className="w-20 h-24 aspect-[4/5]" />
            <Skeleton className="w-20 h-24 aspect-[4/5]" />
          </div>
        </div>

        {/* Right Column: Commerce & Information */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Brand & Title */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-3.5 w-32" />
            </div>

            {/* Tags Strip */}
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Price Box */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <Skeleton className="h-7 w-32" />
            </div>

            {/* Volume Pills */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Skeleton className="h-3.5 w-36" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>

            {/* Add to Bag CTA Skeleton */}
            <div className="pt-3 space-y-3">
              <Skeleton className="h-12 w-full rounded-sm" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-11 w-full rounded-sm" />
                <Skeleton className="h-11 w-full rounded-sm" />
              </div>
            </div>

            {/* Service Badges */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-neutral-100 dark:border-neutral-800">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Accordions */}
            <div className="space-y-3 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Collection Slider Skeleton
 */
export function CollectionSliderSkeleton() {
  return (
    <div className="py-12 space-y-6 animate-pulse" aria-hidden="true">
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-10">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 uppercase" />
          <Skeleton className="h-6 w-56" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}

