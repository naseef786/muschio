"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart, Share2, ChevronDown, Check, Sparkles, ShieldCheck, Truck, Package, ShoppingBag, ArrowLeftRight } from "lucide-react";
import { PriceDisplay, formatCurrency } from "@muschio/ui";
import { ProductCard } from "./product-card";
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
  };
  relatedProducts?: Array<any>;
  houseProducts?: Array<any>;
  locale: "en" | "ar";
  preview: boolean;
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
  preview,
}: ProductDetailProps) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.isDefault && (v.availableQuantity ?? v.stockQuantity ?? 1) > 0)?.id ||
    product.variants.find((v) => v.isDefault)?.id ||
    product.variants.find((v) => !v.isSampleVial && (v.availableQuantity ?? v.stockQuantity ?? 1) > 0)?.id ||
    product.variants.find((v) => (v.availableQuantity ?? v.stockQuantity ?? 1) > 0)?.id ||
    product.variants[0]?.id,
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.slug);
  const [copiedLink, setCopiedLink] = useState(false);
  const { addItem, setCartDrawerOpen } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Sticky Mobile Buy Bar visibility tracker
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = mainCtaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Show sticky bar when the main CTA scrolls out of view above the viewport
        const rect = entry.boundingClientRect;
        const isPastCta = !entry.isIntersecting && rect.top < 0;
        setShowStickyBar(isPastCta);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string | null>("maison");

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
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
    const currentStock = selectedVariant.stock ?? selectedVariant.availableQuantity ?? selectedVariant.stockQuantity ?? 25;
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 pb-28 sm:pb-12 bg-white dark:bg-neutral-950">
      {/* 1. Breadcrumbs (Level Shoes Compact Pattern) */}
      <nav aria-label="Breadcrumb" className="text-xs text-neutral-400 mb-6 md:mb-8 font-sans">
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
            {/* Primary Main Image Canvas (4:5 Ratio, Contain, Soft Off-white Background) */}
            <div className="relative aspect-[4/5] w-full bg-[#F8F8F8] dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 overflow-hidden flex items-center justify-center rounded-sm">
              <Image
                src={currentImage}
                alt={c(product.nameEn, product.nameAr)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-6 sm:p-10 md:p-14 transition-transform duration-500 ease-out hover:scale-105"
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
                    className={`relative w-20 h-24 aspect-[4/5] bg-[#F8F8F8] dark:bg-neutral-900/60 border rounded-sm transition-all flex-shrink-0 ${
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
                      className="object-contain p-2"
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

                {/* Live Real-time Vault Stock Status */}
                {(() => {
                  const stock = selectedVariant.stock ?? selectedVariant.availableQuantity ?? selectedVariant.stockQuantity ?? 25;
                  const wh = selectedVariant.warehouse || "DXB-MAIN";
                  if (stock <= 0) {
                    return (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 rounded-none text-xs text-rose-600 dark:text-rose-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{c(`Currently Sold Out (${wh}) — Flacon Awaiting Restock`, `الكمية نفدت حالياً (${wh}) — بانتظار دفعة جديدة`)}</span>
                      </div>
                    );
                  }
                  if (stock <= 5) {
                    return (
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-none text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>
                          {c(
                            `Rare Stock — Only ${stock} flacon${stock === 1 ? "" : "s"} remaining in ${wh}`,
                            `كمية نادرة ومحدودة — متبقي ${stock} فقط في مستودع ${wh}`
                          )}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-none text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{c(`In Stock (${wh}) — Ready for White-Glove GCC Delivery`, `متوفر بالخزينة (${wh}) — جاهز للتوصيل الفاخر المبرد`)}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Volume / Size Variant Selection (Level Shoes Style Selector Pills) */}
            {product.variants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-sans">
                    {c("Select Volume", "اختر الحجم")}
                  </span>
                  <span className="text-neutral-400 font-mono text-xs">
                    {typeof selectedVariant?.volume === "number"
                      ? `${selectedVariant.volume}ml`
                      : (selectedVariant?.volume || c(selectedVariant?.sizeLabelEn || "", selectedVariant?.sizeLabelAr || ""))}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    const stock = v.stock ?? v.availableQuantity ?? v.stockQuantity ?? 25;
                    const isOutOfStock = stock <= 0;
                    const volRaw = typeof v.volume === "number" ? `${v.volume}ml` : (v.volume || c(v.sizeLabelEn, v.sizeLabelAr));
                    const volLabel = volRaw.replace(/\s*Flacon/i, "").replace(/\s*Extrait/i, "").trim();
                    const vPricing = getVariantPricing(v);

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-4 py-2.5 text-xs font-sans tracking-wide transition-all rounded-sm border ${
                          isSelected
                            ? "border-neutral-900 text-neutral-900 bg-neutral-900/5 dark:border-white dark:text-white dark:bg-white/10 font-semibold"
                            : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 bg-transparent font-normal"
                        } ${isOutOfStock ? "opacity-40 border-dashed cursor-not-allowed" : ""}`}
                        title={
                          isOutOfStock
                            ? c("Out of stock", "غير متوفر")
                            : vPricing.hasDiscount
                            ? `${volLabel} - ${vPricing.sellingPrice} AED (MRP: ${vPricing.regularPrice} AED | Save ${vPricing.discountPercent}%)`
                            : `${volLabel} - ${vPricing.sellingPrice} AED`
                        }
                      >
                        <span>{volLabel}</span>
                        {vPricing.hasDiscount && !isOutOfStock && (
                          <span className="ms-1.5 px-1 py-0.5 text-[10px] font-sans font-semibold text-accent bg-accent/10 rounded">
                            -{vPricing.discountPercent}%
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="ms-1.5 text-[9px] uppercase tracking-wider opacity-80 font-semibold text-rose-500">
                            {c("(Sold Out)", "(نفد)")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Truthful Preview / Availability Banner */}
            {preview && (
              <div className="p-4 bg-[#F9F9FB] dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 rounded-sm">
                <div className="flex items-center gap-2 font-medium text-accent mb-1">
                  <Sparkles size={14} />
                  <span>{c("Maison Collection Preview", "معاينة مجموعة الميزون")}</span>
                </div>
                <p className="text-neutral-500 text-xs">
                  {c(
                    "This creation is part of our verified olfactory catalog. Online self-checkout is currently in preview mode. To reserve this flacon or request private consultation, contact our fragrance concierge.",
                    "هذا العطر جزء من مجموعتنا المعتمدة. الشراء الإلكتروني المباشر في وضع المعاينة حالياً. لحجز الزجاجة أو الاستشارة الخاصة، يُرجى التواصل مع مستشار العطور.",
                  )}
                </p>
              </div>
            )}

            {/* Primary Action Buttons (Level Shoes Add to Bag Standard) */}
            <div ref={mainCtaRef} className="space-y-3 pt-2">
              {(() => {
                const currentStock = selectedVariant?.availableQuantity ?? selectedVariant?.stockQuantity ?? 25;
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

            {/* Service Badges (Authentic, GCC Delivery, Sealed Guarantee) */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center font-sans">
              <div className="flex flex-col items-center gap-1.5 p-2">
                <ShieldCheck size={18} className="text-neutral-900 dark:text-neutral-100" />
                <span className="text-[11px] font-medium text-neutral-900 dark:text-neutral-100">
                  {c("100% Authentic", "أصلي ١٠٠٪")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {c("Direct from Houses", "مباشرة من الدور")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 border-x border-neutral-100 dark:border-neutral-800">
                <Truck size={18} className="text-neutral-900 dark:text-neutral-100" />
                <span className="text-[11px] font-medium text-neutral-900 dark:text-neutral-100">
                  {c("GCC Express", "توصيل سريع")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {c("Complimentary >500 AED", "مجاني فوق ٥٠٠ د.إ")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2">
                <Package size={18} className="text-neutral-900 dark:text-neutral-100" />
                <span className="text-[11px] font-medium text-neutral-900 dark:text-neutral-100">
                  {c("2ml Sample Included", "عينة ٢ مل مرفقة")}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {c("Test Before Opening", "جرّب قبل الفتح")}
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-sans">
                {c(product.descriptionEn, product.descriptionAr)}
              </p>
            </div>

            {/* Olfactory Architecture Section (3-Column Visual Accord Block) */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-medium uppercase tracking-[0.16em] text-neutral-500">
                  {c("Olfactory Architecture", "الهندسة العطرية")}
                </span>
                <span className="text-[11px] text-neutral-400 font-sans tracking-wide">
                  {c("Pyramid of Accords", "هرم النغمات")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Column 1: Top Notes */}
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
                      {c("Light, citrus, spice", "نغمات منعشة وحمضيات وتوابل خفيفة")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                    {topNotes.length > 0 ? (
                      topNotes.map((n) => (
                        <Link
                          key={n.id}
                          href={`/notes/${n.slug}`}
                          className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white transition-colors rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          {n.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 italic">
                        {c("Citrus & Sparkle", "حمضيات ونغمات أولى")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 2: Heart Notes */}
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
                      {c("Floral, resin, herbal", "أزهار وراتنجات ونفحات عشبية")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                    {heartNotes.length > 0 ? (
                      heartNotes.map((n) => (
                        <Link
                          key={n.id}
                          href={`/notes/${n.slug}`}
                          className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white transition-colors rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          {n.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 italic">
                        {c("Floral & Resinous accords", "أزهار وراتنجات مركزية")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 3: Base Notes */}
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
                      {c("Oud, musk, amber, woods", "عود، مسك، عنبر، وأخشاب ثمينة")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                    {baseNotes.length > 0 ? (
                      baseNotes.map((n) => (
                        <Link
                          key={n.id}
                          href={`/notes/${n.slug}`}
                          className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-white transition-colors rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                        >
                          {n.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 italic">
                        {c("Deep woods & Ambers", "أخشاب وعنبر معتق")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Level Shoes Style Clean Accordions */}
            <div className="border-b border-neutral-100 dark:border-neutral-800">
              {/* Accordion 1: Maison Heritage & Perfumer */}
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
                    </div>
                    {product.perfumerBio && (
                      <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        {product.perfumerBio}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Scent Care & Gulf Climate Rituals */}
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

              {/* Accordion 3: White-Glove Delivery & Returns */}
              <div className="pdp-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="pdp-accordion-header"
                  aria-expanded={openAccordion === "shipping"}
                >
                  <span>{c("Delivery, Samples & Guarantees", "التوصيل والعينات والضمان")}</span>
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
                        "• Express courier dispatch across the United Arab Emirates (1–2 business days) and Kingdom of Saudi Arabia (2–4 business days).",
                        "• شحن سريع داخل الإمارات (١-٢ يوم عمل) والمملكة العربية السعودية (٢-٤ أيام عمل).",
                      )}
                    </p>
                    <p>
                      {c(
                        "• Every full bottle includes an official 2ml discovery vial. Please test the sample first; returns are accepted on unopened, sealed flacons within 14 days.",
                        "• تتضمن كل زجاجة عينة تجريبية ٢ مل رسمية. يُرجى اختبار العينة أولاً؛ تُقبل الإرجاعات للزجاجات المغلفة وغير المفتوحة خلال ١٤ يوماً.",
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
        <section className="py-14 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow">{c("FROM THE SAME MAISON", "من الدار نفسها")}</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-50 mt-1">
                {c(`More from ${product.brand.name}`, `عطور أخرى من ${product.brand.name}`)}
              </h2>
            </div>
            <Link
              href={`/brands/${brandSlug}`}
              className="editorial-text-link"
            >
              {c("View Maison", "عرض الدار")} ↗
            </Link>
          </div>
          <div className="product-grid">
            {houseProducts.slice(0, 4).map((p) => {
              const cardPricing = getProductCardPricing(p);
              return (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  nameEn={p.nameEn}
                  nameAr={p.nameAr}
                  brand={p.brand?.name || p.brand || product.brand.name}
                  concentration={p.concentration}
                  price={cardPricing.price}
                  compareAtPrice={cardPricing.compareAtPrice}
                  variants={p.variants}
                  image={p.images?.[0] || p.image || "/product-placeholder.svg"}
                  locale={locale}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 5. You May Also Like Section (Level Shoes Recommendation Style) */}
      {relatedProducts.length > 0 && (
        <section className="py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow">{c("CURATED RECOMMENDATIONS", "ترشيحات مختارة")}</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-50 mt-1">
                {c("You May Also Appreciate", "قد ينال إعجابك أيضاً")}
              </h2>
            </div>
            <Link href="/shop" className="editorial-text-link">
              {c("Shop All Fragrances", "تسوق كل العطور")} ↗
            </Link>
          </div>
          <div className="product-grid">
            {relatedProducts.slice(0, 4).map((p) => {
              const cardPricing = getProductCardPricing(p);
              return (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  nameEn={p.nameEn}
                  nameAr={p.nameAr}
                  brand={p.brand?.name || p.brand}
                  concentration={p.concentration}
                  price={cardPricing.price}
                  compareAtPrice={cardPricing.compareAtPrice}
                  variants={p.variants}
                  image={p.images?.[0] || p.image || "/product-placeholder.svg"}
                  locale={locale}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Sticky Mobile Buy Bar (Level Shoes Standard) */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 font-sans">
            <span className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
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
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
              isWishlisted
                ? "bg-accent/10 border-accent/40 text-accent"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800"
            }`}
          >
            <Heart size={14} className={isWishlisted ? "fill-accent" : ""} />
          </button>

          {/* Mobile Quick Add to Bag (triggers mini-cart drawer) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="py-2.5 px-5 bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-sans text-xs uppercase tracking-[0.14em] font-medium transition-all flex items-center gap-2 rounded-sm shadow-sm"
          >
            {isAdding ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check size={14} />
                <span>{c("Added ✓", "تمت الإضافة ✓")}</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>{c("Add to Bag", "أضف للحقيبة")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
