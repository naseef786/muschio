"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart, Share2, ChevronDown, Check, ShieldCheck, Truck, RotateCcw, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { PriceDisplay, formatCurrency } from "@muschio/ui";
import { CollectionSlider } from "./collection-slider";
import { ProductReviews } from "./product-reviews";
import { useWishlist } from "../context/wishlist-context";
import { useCart } from "../context/cart-context";
import { useCompare } from "../context/compare-context";

export interface ProductDetailProps {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    concentration: string;
    brand: { name: string; slug: string; type: string };
    origin?: string;
    perfumer?: string;
    perfumerBio?: string;
    longevity?: string;
    sillage?: string;
    images: string[];
    variants: Array<{
      id: string;
      sku: string;
      volume?: string | number;
      volumeMl?: number | null;
      sizeLabelEn: string;
      sizeLabelAr: string;
      basePrice?: number | null;
      regularPrice?: number;
      originalPrice?: number;
      price: number;
      discountPrice?: number | null;
      salePrice?: number | null;
      compareAtPrice?: number | null;
      isSampleVial?: boolean;
      stock?: number;
      stockQuantity?: number;
      availableQuantity?: number;
      warehouse?: string;
      isDefault?: boolean;
    }>;
    notes?: Array<{
      id: string;
      name: string;
      slug: string;
      position: "TOP" | "HEART" | "BASE";
    }>;
    tags?: Array<{
      id: string;
      nameEn: string;
      nameAr?: string;
      slug: string;
      colorHex?: string | null;
      isFeatured?: boolean;
    }>;
  };
  relatedProducts?: Array<any>;
  houseProducts?: Array<any>;
  locale: "en" | "ar";
}

export function getVariantPricing(v?: ProductDetailProps["product"]["variants"][0]) {
  if (!v) {
    return {
      regularPrice: 0,
      sellingPrice: 0,
      compareAtPrice: null as number | null,
      hasDiscount: false,
      discountPercent: 0,
      savingsAmount: 0,
    };
  }

  // 1. Regular Price / Base MRP
  const regularPrice = Number(
    v.basePrice ??
    v.regularPrice ??
    v.originalPrice ??
    (v.compareAtPrice && v.compareAtPrice > v.price ? v.compareAtPrice : v.price)
  );

  // 2. Discounted / Sale Price
  const rawDiscount =
    v.salePrice !== null && v.salePrice !== undefined
      ? Number(v.salePrice)
      : v.discountPrice !== null && v.discountPrice !== undefined
      ? Number(v.discountPrice)
      : v.compareAtPrice && v.compareAtPrice > v.price
      ? Number(v.price)
      : null;

  const hasDiscount = rawDiscount !== null && rawDiscount > 0 && rawDiscount < regularPrice;
  const sellingPrice = hasDiscount ? rawDiscount! : (v.price || regularPrice);
  const compareAtPrice = hasDiscount ? regularPrice : null;
  const savingsAmount = hasDiscount ? Math.max(0, regularPrice - sellingPrice) : 0;
  const discountPercent = hasDiscount && regularPrice > 0 ? Math.round((savingsAmount / regularPrice) * 100) : 0;

  return {
    regularPrice,
    sellingPrice,
    compareAtPrice,
    hasDiscount,
    discountPercent,
    savingsAmount,
  };
}

export function getProductCardPricing(p: any) {
  if (p.price) {
    return {
      price: p.price,
      compareAtPrice: p.compareAtPrice || null,
    };
  }
  const v0 = p.variants?.[0];
  if (!v0) return { price: 0, compareAtPrice: null };
  const pricing = getVariantPricing(v0);
  return {
    price: pricing.sellingPrice,
    compareAtPrice: pricing.compareAtPrice,
  };
}

export function ProductExperience({
  product,
  relatedProducts = [],
  houseProducts = [],
  locale,
}: ProductDetailProps) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  // Commercial flacon variants (filter out 2ml discovery vials)
  const commercialVariants = useMemo(() => {
    const list = product.variants.filter(
      (v) => !v.isSampleVial && (v.volumeMl ? v.volumeMl > 5 : true),
    );
    const toSort = list.length > 0 ? list : product.variants;
    return [...toSort].sort((a, b) => {
      const volA = a.volumeMl ?? (typeof a.volume === "number" ? a.volume : parseInt(String(a.volume || "").replace(/[^0-9]/g, "")) || 0);
      const volB = b.volumeMl ?? (typeof b.volume === "number" ? b.volume : parseInt(String(b.volume || "").replace(/[^0-9]/g, "")) || 0);
      return volA - volB;
    });
  }, [product.variants]);

  const initialVariant = useMemo(() => {
    return (
      commercialVariants.find((v) => v.isDefault && (v.availableQuantity ?? v.stockQuantity ?? v.stock ?? 1) > 0) ||
      commercialVariants.find((v) => v.isDefault) ||
      commercialVariants.find((v) => (v.availableQuantity ?? v.stockQuantity ?? v.stock ?? 1) > 0) ||
      commercialVariants[0] ||
      product.variants[0]
    );
  }, [commercialVariants, product.variants]);

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.slug);
  const [copiedLink, setCopiedLink] = useState(false);
  const { addItem, setCartDrawerOpen, itemCount } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Accordion open states (Level Shoes luxury standard: Description open by default)
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || commercialVariants[0] || product.variants[0];
  const selectedPricing = getVariantPricing(selectedVariant);

  const images = product.images.length > 0 ? product.images : ["/product-placeholder.svg"];
  const currentImage: string = images[selectedImageIndex] || images[0] || "/product-placeholder.svg";

  const handleToggleWishlist = () => {
    toggleWishlist({
      slug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      brand: product.brand.name,
      brandType: product.brand.type as "NICHE" | "DESIGNER",
      concentration: product.concentration.replaceAll("_", " "),
      price: selectedPricing.sellingPrice,
      compareAtPrice: selectedPricing.compareAtPrice,
      image: currentImage,
      variantId: selectedVariant?.id || "",
    });
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  // Group notes into Top, Heart, Base
  const topNotes = product.notes?.filter((n) => n.position === "TOP") || [];
  const heartNotes = product.notes?.filter((n) => n.position === "HEART") || [];
  const baseNotes = product.notes?.filter((n) => n.position === "BASE") || [];

  const { isInCompare, toggleCompare } = useCompare();
  const isCompared = isInCompare(product.slug);

  const handleToggleCompare = () => {
    toggleCompare({
      slug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      brand: product.brand.name,
      brandType: product.brand.type as "NICHE" | "DESIGNER",
      concentration: product.concentration.replaceAll("_", " "),
      price: selectedPricing.sellingPrice,
      compareAtPrice: selectedPricing.compareAtPrice,
      image: currentImage,
      topNotes: topNotes.map((n) => n.name),
      heartNotes: heartNotes.map((n) => n.name),
      baseNotes: baseNotes.map((n) => n.name),
      perfumer: product.perfumer,
      perfumerBio: product.perfumerBio,
      origin: product.origin,
      longevity: product.longevity,
      sillage: product.sillage,
      variantId: selectedVariant?.id,
      volumeMl: selectedVariant?.sizeLabelEn?.match(/\d+/)?.[0]
        ? parseInt(selectedVariant.sizeLabelEn.match(/\d+/)![0], 10)
        : 100,
    });
  };

  const brandSlug = product.brand.slug || product.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;
    const currentStock = selectedVariant.stock ?? selectedVariant.availableQuantity ?? selectedVariant.stockQuantity ?? 0;
    if (currentStock <= 0) return;

    setIsAdding(true);
    try {
      const selectedVol = typeof selectedVariant.volume === "number"
        ? `${selectedVariant.volume}ml`
        : (selectedVariant.volume || selectedVariant.sizeLabelEn?.match(/\d+ml/i)?.[0] || `${selectedVariant.volumeMl || 100}ml`);

      await addItem({
        variantId: selectedVariant.id,
        slug: product.slug,
        title: product.nameEn,
        titleAr: product.nameAr,
        brand: product.brand.name,
        price: selectedPricing.sellingPrice,
        compareAtPrice: selectedPricing.compareAtPrice,
        quantity: 1,
        image: currentImage,
        sizeLabel: c(selectedVariant.sizeLabelEn, selectedVariant.sizeLabelAr),
        volume: selectedVol,
        stockQuantity: currentStock,
      });
      setAddedSuccess(true);
      setCartDrawerOpen(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 md:py-10 pb-36 md:pb-16 bg-white dark:bg-neutral-950 overflow-x-hidden">
      {/* 1. Breadcrumbs (Level Shoes Compact Pattern) */}
      <nav aria-label="Breadcrumb" className="w-full text-xs text-neutral-400 mb-6 md:mb-8 font-sans overflow-hidden">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              {c("Home", "الرئيسية")}
            </Link>
          </li>
          <li className="text-neutral-300 dark:text-neutral-700">/</li>
          <li>
            <Link href="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              {c("Fragrance", "العطور")}
            </Link>
          </li>
          <li className="text-neutral-300 dark:text-neutral-700">/</li>
          <li>
            <Link href={`/brands/${brandSlug}`} className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              {product.brand.name}
            </Link>
          </li>
          <li className="text-neutral-300 dark:text-neutral-700">/</li>
          <li className="text-neutral-900 dark:text-neutral-100 font-medium truncate max-w-[200px] sm:max-w-none">
            {c(product.nameEn, product.nameAr)}
          </li>
        </ol>
      </nav>

      {/* 2. Main Product Section (2-Column Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-16 border-b border-neutral-100 dark:border-neutral-800/80">
        {/* Left Column: Gallery (7 Cols Desktop) */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Primary Main Image Canvas (4:5 Ratio, Full Bleed Luxury Canvas, Zero Padding) */}
            <div className="relative aspect-[4/5] w-full bg-[#F8F8F8] dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 overflow-hidden flex items-center justify-center rounded-sm">
              <Image
                src={currentImage}
                alt={c(product.nameEn, product.nameAr)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-transform duration-500 ease-out hover:scale-105"
              />

              {/* Floating Luxury Action Dock (Circular Wishlist, Compare & Share) */}
              <div className="absolute top-4 end-4 z-20 flex flex-col items-center gap-1.5 p-1.5 rounded-full bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border border-neutral-100 dark:border-neutral-700/60 shadow-sm">
                {/* Wishlist Action */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  title={
                    isWishlisted
                      ? c("Remove from Private Vault", "إزالة من المفضلة")
                      : c("Save to Private Vault", "إضافة إلى المفضلة")
                  }
                  aria-label={
                    isWishlisted
                      ? c("Remove from Private Vault", "إزالة من المفضلة")
                      : c("Save to Private Vault", "إضافة إلى المفضلة")
                  }
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    isWishlisted
                      ? "text-accent bg-accent/10"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Heart
                    size={17}
                    className={`transition-all duration-300 ${
                      isWishlisted
                        ? "fill-accent text-accent scale-110"
                        : "hover:scale-110"
                    }`}
                  />
                </button>

                {/* Micro Divider */}
                <div className="w-4 h-[1px] bg-neutral-200/60 dark:bg-neutral-700/60 my-0.5" />

                {/* Compare Action */}
                <button
                  type="button"
                  onClick={handleToggleCompare}
                  title={
                    isCompared
                      ? c("Remove from Comparison", "إزالة من المقارنة")
                      : c("Compare Fragrance", "مقارنة هذا العطر")
                  }
                  aria-label={
                    isCompared
                      ? c("Remove from Comparison", "إزالة من المقارنة")
                      : c("Compare Fragrance", "مقارنة هذا العطر")
                  }
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    isCompared
                      ? "text-accent bg-accent/15"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <ArrowLeftRight
                    size={16}
                    className={`transition-all duration-300 ${
                      isCompared ? "text-accent scale-110" : "hover:scale-110"
                    }`}
                  />
                </button>

                {/* Micro Divider */}
                <div className="w-4 h-[1px] bg-neutral-200/60 dark:bg-neutral-700/60 my-0.5" />

                {/* Share Action */}
                <button
                  type="button"
                  onClick={handleShare}
                  title={copiedLink ? c("Link Copied!", "تم نسخ الرابط!") : c("Share Fragrance", "مشاركة العطر")}
                  aria-label={copiedLink ? c("Link Copied!", "تم نسخ الرابط!") : c("Share Fragrance", "مشاركة العطر")}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white active:scale-90 transition-all duration-200"
                >
                  {copiedLink ? (
                    <Check size={16} className="text-emerald-500 animate-in fade-in" />
                  ) : (
                    <Share2 size={16} className="transition-transform hover:scale-110" />
                  )}
                </button>
              </div>
            </div>

            {/* Thumbnail Row (Desktop & Tablet) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative w-20 h-24 aspect-[4/5] bg-[#F8F8F8] dark:bg-neutral-900/60 border rounded-sm transition-all flex-shrink-0 overflow-hidden ${
                      selectedImageIndex === idx
                        ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white"
                        : "border-neutral-100 dark:border-neutral-800 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`View ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Commerce (5 Cols Desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Brand & Title Header */}
            <div>
              <Link
                href={`/brands/${brandSlug}`}
                className="inline-block text-xs font-sans font-medium uppercase tracking-[0.16em] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {product.brand.name}
              </Link>
              <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-neutral-50 font-normal leading-tight mt-1.5">
                {c(product.nameEn, product.nameAr)}
              </h1>
              <p className="text-xs uppercase tracking-wider text-neutral-400 mt-1 font-sans">
                {product.concentration.replaceAll("_", " ")}
              </p>

              {/* Product Tags & Olfactory Curations */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {product.tags.map((t) => (
                    <Link
                      key={t.slug || t.id}
                      href={`/shop?tag=${t.slug}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition-colors"
                    >
                      {t.colorHex && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.colorHex }}
                        />
                      )}
                      <span>{c(t.nameEn, t.nameAr || t.nameEn)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Price Display & Dynamic Stock Badge */}
            {selectedVariant && (
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <PriceDisplay
                    price={selectedPricing.sellingPrice}
                    compareAtPrice={selectedPricing.compareAtPrice}
                    locale={locale}
                    size="xl"
                  />
                  {selectedPricing.hasDiscount && (
                    <span className="px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 rounded-none">
                      {selectedPricing.discountPercent}% {c("OFF", "خصم")}
                      <span className="ms-1.5 opacity-80 font-normal">
                        ({c(`Save AED ${selectedPricing.savingsAmount}`, `وفر ${selectedPricing.savingsAmount} د.إ`)})
                      </span>
                    </span>
                  )}
                </div>

                {/* Out of Stock Notice (Level Shoes Luxury: in-stock is implicit; only display out of stock) */}
                {(() => {
                  const stock = selectedVariant.stock ?? selectedVariant.availableQuantity ?? selectedVariant.stockQuantity ?? 0;
                  if (stock <= 0) {
                    return (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-sans tracking-wide uppercase text-neutral-600 dark:text-neutral-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>{c("Currently Out of Stock", "غير متوفر حالياً")}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Volume / Size Variant Selection (Level Shoes Style Selector Pills) */}
            {commercialVariants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-sans">
                    {c("Select Flacon Volume", "اختر حجم الزجاجة")}
                  </span>
                  <span className="text-neutral-500 font-mono text-xs">
                    {typeof selectedVariant?.volume === "number"
                      ? `${selectedVariant.volume}ml`
                      : (selectedVariant?.volume || c(selectedVariant?.sizeLabelEn || "", selectedVariant?.sizeLabelAr || ""))}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {commercialVariants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    const stock = v.stock ?? v.availableQuantity ?? v.stockQuantity ?? 0;
                    const isOutOfStock = stock <= 0;
                    const volNum =
                      v.volumeMl ??
                      (typeof v.volume === "number"
                        ? v.volume
                        : parseInt(String(v.volume || "").replace(/[^0-9]/g, "")) || 100);
                    const volLabel = `${volNum}ml`;
                    const vPricing = getVariantPricing(v);

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={isOutOfStock}
                        className={`group relative flex flex-col items-start p-3 text-start transition-all rounded-none border ${
                          isSelected
                            ? "border-black dark:border-white bg-neutral-900/[0.04] dark:bg-white/[0.08] shadow-sm"
                            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent"
                        } ${isOutOfStock ? "opacity-40 cursor-not-allowed border-dashed" : "cursor-pointer"}`}
                      >
                        {/* Top row: Volume and Selected Dot */}
                        <div className="w-full flex items-center justify-between gap-1 mb-1">
                          <span className={`text-xs font-semibold tracking-wide font-sans ${isSelected ? "text-black dark:text-white" : "text-neutral-800 dark:text-neutral-200"}`}>
                            {volLabel}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                          )}
                        </div>

                        {/* Price row */}
                        <div className="flex items-baseline gap-1.5 font-sans">
                          <span className={`text-xs font-semibold ${isSelected ? "text-black dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>
                            {formatCurrency(vPricing.sellingPrice, "AED", locale)}
                          </span>
                          {vPricing.hasDiscount && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              {formatCurrency(vPricing.regularPrice, "AED", locale)}
                            </span>
                          )}
                        </div>

                        {/* Discount badge */}
                        {vPricing.hasDiscount && !isOutOfStock && (
                          <span className="mt-1 inline-block text-[9px] font-medium text-accent uppercase tracking-wider">
                            {c(`Save ${vPricing.discountPercent}%`, `خصم ${vPricing.discountPercent}%`)}
                          </span>
                        )}

                        {isOutOfStock && (
                          <span className="mt-1 text-[9px] uppercase tracking-wider text-rose-500 font-medium">
                            {c("Sold Out", "نفد الحجم")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Primary Action Buttons (Level Shoes Add to Bag Standard) */}
            <div className="space-y-3 pt-2">
              {(() => {
                const currentStock = selectedVariant?.stock ?? selectedVariant?.availableQuantity ?? selectedVariant?.stockQuantity ?? 0;
                const isOutOfStock = currentStock <= 0;
                return (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock}
                    className={`w-full py-4 px-6 font-sans text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-sm shadow-sm ${
                      isOutOfStock
                        ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border border-neutral-200 dark:border-neutral-800 cursor-not-allowed"
                        : "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 active:scale-[0.99]"
                    }`}
                  >
                    {isAdding ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : addedSuccess ? (
                      <>
                        <Check size={16} />
                        <span>{c("Added to Bag ✓", "تمت الإضافة بنجاح ✓")}</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>{c("Out of Stock", "الكمية نفدت")}</span>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>{c("Add to Bag", "أضف إلى حقيبة التسوق")}</span>
                      </>
                    )}
                  </button>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pro Luxury Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`py-3.5 px-4 flex items-center justify-center gap-2.5 text-xs font-sans uppercase tracking-[0.14em] font-medium border transition-all duration-200 group active:scale-[0.99] rounded-sm ${
                    isWishlisted
                      ? "bg-accent/10 border-accent/60 text-accent shadow-sm"
                      : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  <Heart
                    size={16}
                    className={`transition-all duration-300 ${
                      isWishlisted
                        ? "fill-accent text-accent scale-110"
                        : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-110"
                    }`}
                  />
                  <span>
                    {isWishlisted
                      ? c("Saved in Vault", "محفوظ في المفضلة")
                      : c("Add to Wishlist", "إضافة إلى المفضلة")}
                  </span>
                </button>

                {/* Compare Fragrance Button */}
                <button
                  type="button"
                  onClick={handleToggleCompare}
                  className={`py-3.5 px-4 flex items-center justify-center gap-2.5 text-xs font-sans uppercase tracking-[0.14em] font-medium border transition-all duration-200 group active:scale-[0.99] rounded-sm ${
                    isCompared
                      ? "bg-accent/15 border-accent text-accent shadow-sm"
                      : "bg-transparent border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  <ArrowLeftRight
                    size={15}
                    className={`transition-all duration-300 ${
                      isCompared
                        ? "text-accent scale-110"
                        : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-110"
                    }`}
                  />
                  <span>
                    {isCompared
                      ? c("In Comparison", "في المقارنة")
                      : c("Compare Fragrance", "مقارنة العطر")}
                  </span>
                </button>
              </div>

              <Link
                href="/delivery"
                className="py-3 px-4 flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-[0.12em] font-medium border border-neutral-100 dark:border-neutral-800 bg-[#F9F9FB] dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all rounded-sm text-center"
              >
                {c("White-Glove Delivery Details", "تفاصيل التوصيل الفاخر")}
              </Link>
            </div>

            {/* Service Badges (Authentic, GCC Delivery, Free 7-Day Returns) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center font-sans">
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-1 sm:p-2">
                <ShieldCheck size={18} className="text-neutral-900 dark:text-neutral-100" />
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                  {c("100% Authentic", "أصلي ١٠٠٪")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 leading-tight">
                  {c("Direct from Houses", "مباشرة من الدور")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-1 sm:p-2 border-x border-neutral-100 dark:border-neutral-800">
                <Truck size={18} className="text-neutral-900 dark:text-neutral-100" />
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                  {c("GCC Express", "توصيل سريع")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 leading-tight">
                  {c("Complimentary >500 AED", "مجاني فوق ٥٠٠ د.إ")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-1 sm:p-2">
                <RotateCcw size={18} className="text-neutral-900 dark:text-neutral-100" />
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight">
                  {c("Free 7-Day Return", "إرجاع ٧ أيام")}
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 leading-tight">
                  {c("Doorstep Pickup", "استلام من الباب")}
                </span>
              </div>
            </div>

            {/* Level Shoes Style Clean Accordions (Description, Notes, Maison, Rituals, Shipping) */}
            <div className="border-b border-neutral-100 dark:border-neutral-800 pt-2">
              {/* Accordion 1: Description (Moved strictly inside dropdown) */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("description")}
                  className="pdp-accordion-header"
                  aria-expanded={openAccordion === "description"}
                >
                  <span>{c("Description", "وصف العطر")}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "description" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "description" && (
                  <div className="pdp-accordion-content text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-sans">
                    <p>{c(product.descriptionEn, product.descriptionAr)}</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Olfactory Notes & Architecture */}
              {topNotes.length + heartNotes.length + baseNotes.length > 0 && (
                <div className="pdp-accordion-item">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("olfactory")}
                    className="pdp-accordion-header"
                    aria-expanded={openAccordion === "olfactory"}
                  >
                    <span>{c("Olfactory Notes & Architecture", "الهندسة العطرية والنغمات")}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        openAccordion === "olfactory" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "olfactory" && (
                    <div className="pdp-accordion-content space-y-3 font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Top Notes */}
                        {topNotes.length > 0 && (
                          <div className="bg-[#F9F9FB] dark:bg-neutral-900/40 p-4 border border-neutral-100 dark:border-neutral-800/80 rounded-sm flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                                  {c("Top Notes", "الافتتاحية")}
                                </span>
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                                  {c("0–30 min", "٠–٣٠ د")}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-1">
                                {c("Initial sparkle & impressions", "نغمات البداية والافتتاحية")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                              {topNotes.map((n) => (
                                <Link
                                  key={n.id}
                                  href={`/notes/${n.slug}`}
                                  className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white transition-colors rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                  {n.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Heart Notes */}
                        {heartNotes.length > 0 && (
                          <div className="bg-[#F9F9FB] dark:bg-neutral-900/40 p-4 border border-neutral-100 dark:border-neutral-800/80 rounded-sm flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                                  {c("Heart Notes", "قلب العطر")}
                                </span>
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                                  {c("2–4 hrs", "٢–٤ س")}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-1">
                                {c("Core character & radiance", "جوهر العطر ونفحاته المركزية")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                              {heartNotes.map((n) => (
                                <Link
                                  key={n.id}
                                  href={`/notes/${n.slug}`}
                                  className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white transition-colors rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                  {n.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Base Notes */}
                        {baseNotes.length > 0 && (
                          <div className="bg-[#F9F9FB] dark:bg-neutral-900/40 p-4 border border-neutral-100 dark:border-neutral-800/80 rounded-sm flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                                  {c("Base Notes", "القاعدة العطرية")}
                                </span>
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                                  {c("6+ hrs", "٦+ س")}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-1">
                                {c("Enduring foundation & trail", "عمق العطر والنفحات المستمرة")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                              {baseNotes.map((n) => (
                                <Link
                                  key={n.id}
                                  href={`/notes/${n.slug}`}
                                  className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white transition-colors rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                >
                                  {n.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 2: Maison Heritage & Perfumer */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("maison")}
                  className="pdp-accordion-header"
                  aria-expanded={openAccordion === "maison"}
                >
                  <span>{c("Maison & Perfumer Details", "دار العطور والأنف العطري")}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "maison" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "maison" && (
                  <div className="pdp-accordion-content space-y-3 font-sans">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-400 block">{c("Fragrance House", "دار العطور")}</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{product.brand.name}</span>
                      </div>
                      {product.origin && (
                        <div>
                          <span className="text-neutral-400 block">{c("Country of Origin", "بلد المنشأ")}</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">{product.origin}</span>
                        </div>
                      )}
                      {product.perfumer && (
                        <div>
                          <span className="text-neutral-400 block">{c("Master Perfumer", "الأنف العطري")}</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">{product.perfumer}</span>
                        </div>
                      )}
                      {product.longevity && (
                        <div>
                          <span className="text-neutral-400 block">{c("Longevity", "الثبات")}</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">{product.longevity}</span>
                        </div>
                      )}
                      {product.sillage && (
                        <div>
                          <span className="text-neutral-400 block">{c("Sillage", "الفوحان")}</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">{product.sillage}</span>
                        </div>
                      )}
                    </div>
                    {product.perfumerBio && (
                      <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        {product.perfumerBio}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Scent Care & Gulf Climate Rituals */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("ritual")}
                  className="pdp-accordion-header"
                  aria-expanded={openAccordion === "ritual"}
                >
                  <span>{c("Rituals & Gulf Climate Wear", "طقوس الاستخدام وطقس الخليج")}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "ritual" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "ritual" && (
                  <div className="pdp-accordion-content text-xs space-y-2 font-sans">
                    <p>
                      {c(
                        "Extrait de Parfum concentrations are uniquely resilient in high-heat and air-conditioned GCC environments. Apply directly to pulse points (wrist, collarbones, nape of neck).",
                        "تتميز تراكيز إكستري دي بارفان بثبات استثنائي في أجواء الخليج الصيفية والبيئات المكيفة. يُنصح برشها مباشرة على نقاط النبض.",
                      )}
                    </p>
                    <p>
                      {c(
                        "For traditional layering rituals, mist over an authentic Cambodian or Hindi oud base to create an opulent royal sillage.",
                        "لمزج العطور التقليدي، يمكن رش العطر فوق دهن العود الكمبودي أو الهندي لإضفاء بصمة عطرية مهيبة وفريدة.",
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Complimentary Delivery & Returns */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="pdp-accordion-header"
                  aria-expanded={openAccordion === "shipping"}
                >
                  <span>{c("Complimentary Delivery & Returns", "التوصيل والإرجاع المجاني")}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordion === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "shipping" && (
                  <div className="pdp-accordion-content text-xs space-y-2 font-sans">
                    <p>
                      {c(
                        "• Express courier dispatch across the United Arab Emirates (1–2 business days) and Kingdom of Saudi Arabia (2–4 business days). Complimentary on all orders above AED 500.",
                        "• شحن سريع داخل الإمارات (١-٢ يوم عمل) والمملكة العربية السعودية (٢-٤ أيام عمل). مجاني لجميع الطلبات فوق ٥٠٠ د.إ.",
                      )}
                    </p>
                    <p>
                      {c(
                        "• Free returns within 7 days on unopened, factory-sealed flacons. Complimentary door-to-door courier collection arranged upon request.",
                        "• إرجاع مجاني خلال ٧ أيام للزجاجات المغلفة وغير المفتوحة. نوفر خدمة استلام مجانية من باب منزلك عند الطلب.",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. More From This House Section */}
      {houseProducts.length > 0 && (
        <div className="py-14 border-b border-neutral-100 dark:border-neutral-800">
          <CollectionSlider
            eyebrow={c("FROM THE SAME MAISON", "من الدار نفسها")}
            title={c(`More from ${product.brand.name}`, `عطور أخرى من ${product.brand.name}`)}
            viewAllHref={`/brands/${brandSlug}`}
            viewAllText={c("View Maison", "عرض الدار")}
            products={houseProducts.map((p) => {
              const cardPricing = getProductCardPricing(p);
              return {
                slug: p.slug,
                nameEn: p.nameEn,
                nameAr: p.nameAr,
                brand: p.brand?.name || p.brand || product.brand.name,
                concentration: p.concentration,
                price: cardPricing.price,
                compareAtPrice: cardPricing.compareAtPrice,
                variants: p.variants,
                image: p.images?.[0] || p.image || "/product-placeholder.svg",
                secondaryImage: p.images?.[1],
                images: p.images,
                locale: locale,
              };
            })}
            locale={locale as "en" | "ar"}
            enableTabs={false}
          />
        </div>
      )}

      {/* 4b. Authentic Olfactory Impressions & Customer Reviews */}
      <ProductReviews
        productId={product.id}
        productName={c(product.nameEn, product.nameAr)}
        locale={locale as "en" | "ar"}
      />

      {/* 5. You May Also Like Section (Level Shoes Recommendation Style) */}
      {relatedProducts.length > 0 && (
        <div className="py-14">
          <CollectionSlider
            eyebrow={c("CURATED RECOMMENDATIONS", "ترشيحات مختارة")}
            title={c("You May Also Appreciate", "قد ينال إعجابك أيضاً")}
            viewAllHref="/shop"
            viewAllText={c("Shop All Fragrances", "تسوق كل العطور")}
            products={relatedProducts.map((p) => {
              const cardPricing = getProductCardPricing(p);
              return {
                slug: p.slug,
                nameEn: p.nameEn,
                nameAr: p.nameAr,
                brand: p.brand?.name || p.brand,
                concentration: p.concentration,
                price: cardPricing.price,
                compareAtPrice: cardPricing.compareAtPrice,
                variants: p.variants,
                image: p.images?.[0] || p.image || "/product-placeholder.svg",
                secondaryImage: p.images?.[1],
                images: p.images,
                locale: locale,
              };
            })}
            locale={locale as "en" | "ar"}
            enableTabs={false}
          />
        </div>
      )}

      {/* 6. Sticky Mobile Buy & Cart Bar (Level Shoes Standard) */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800 px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 select-none"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              {formatCurrency(selectedPricing.sellingPrice, "AED", locale)}
            </span>
            {selectedPricing.hasDiscount && selectedPricing.compareAtPrice && (
              <span className="text-xs text-neutral-400 line-through font-normal">
                {formatCurrency(selectedPricing.compareAtPrice, "AED", locale)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-sans text-neutral-500 uppercase tracking-wider block truncate">
            {typeof selectedVariant?.volume === "number"
              ? `${selectedVariant.volume}ml`
              : (selectedVariant?.volume || c(selectedVariant?.sizeLabelEn || "", selectedVariant?.sizeLabelAr || ""))}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile Quick Wishlist */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={
              isWishlisted
                ? c("Remove from Wishlist", "إزالة من المفضلة")
                : c("Add to Wishlist", "إضافة إلى المفضلة")
            }
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
              isWishlisted
                ? "bg-accent/10 border-accent/40 text-accent"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:border-neutral-900 dark:hover:border-white"
            }`}
          >
            <Heart size={14} className={isWishlisted ? "fill-accent" : ""} />
          </button>

          {/* Mobile Go to Cart / Mini-Cart Trigger */}
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={c(`Go to Cart, ${itemCount} items`, `الذهاب إلى حقيبة التسوق، ${itemCount} منتجات`)}
            title={c("Go to Cart", "الذهاب إلى حقيبة التسوق")}
            className="relative w-9 h-9 rounded-full flex items-center justify-center border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:border-neutral-900 dark:hover:border-white transition-all active:scale-95"
          >
            <ShoppingBag size={14} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[17px] h-[17px] px-1 bg-accent text-white font-sans text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Quick Add to Bag */}
          {(() => {
            const currentStock = selectedVariant?.stock ?? selectedVariant?.availableQuantity ?? selectedVariant?.stockQuantity ?? 0;
            const isOutOfStock = currentStock <= 0;
            return (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={`py-2.5 px-4 sm:px-5 font-sans text-xs uppercase tracking-[0.14em] font-medium transition-all flex items-center gap-2 rounded-sm shadow-sm active:scale-[0.98] ${
                  isOutOfStock
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-200 dark:border-neutral-700"
                    : "bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                }`}
              >
                {isAdding ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : addedSuccess ? (
                  <>
                    <Check size={14} />
                    <span>{c("Added ✓", "تمت الإضافة ✓")}</span>
                  </>
                ) : isOutOfStock ? (
                  <span>{c("Out of Stock", "غير متوفر")}</span>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>{c("Add to Bag", "أضف للحقيبة")}</span>
                  </>
                )}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
