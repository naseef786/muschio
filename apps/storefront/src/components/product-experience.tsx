"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../navigation";
import { Heart, Share2, ChevronDown, Check, Sparkles, ShieldCheck, Truck, Package } from "lucide-react";
import { PriceDisplay } from "@muschio/ui";
import { ProductCard } from "./product-card";
import { useWishlist } from "../context/wishlist-context";

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
      sizeLabelEn: string;
      sizeLabelAr: string;
      price: number;
      compareAtPrice?: number | null;
      isSampleVial?: boolean;
      availableQuantity?: number;
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
    product.variants.find((v) => !v.isSampleVial)?.id || product.variants[0]?.id,
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.slug);
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordion open states
  const [openAccordion, setOpenAccordion] = useState<string | null>("pyramid");

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

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
      price: selectedVariant?.price || 0,
      compareAtPrice: selectedVariant?.compareAtPrice,
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

  const brandSlug = product.brand.slug || product.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10">
      {/* 1. Breadcrumbs (Level Shoes Compact Pattern) */}
      <nav aria-label="Breadcrumb" className="text-[11px] sm:text-[12px] text-luxury-muted mb-6 md:mb-8">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-luxury-text transition-colors">
              {c("Home", "الرئيسية")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/shop" className="hover:text-luxury-text transition-colors">
              {c("Fragrance", "العطور")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/brands/${brandSlug}`} className="hover:text-luxury-text transition-colors">
              {product.brand.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-luxury-text font-medium truncate max-w-[200px] sm:max-w-none">
            {c(product.nameEn, product.nameAr)}
          </li>
        </ol>
      </nav>

      {/* 2. Main Product Section (2-Column Desktop Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-16 border-b border-luxury-border">
        {/* Left Column: Gallery (7 Cols Desktop) */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Primary Main Image Canvas (4:5 Ratio, Contain, Never Cropped) */}
            <div className="relative aspect-[4/5] w-full bg-luxury-surface2 border border-luxury-border overflow-hidden flex items-center justify-center">
              <Image
                src={currentImage}
                alt={c(product.nameEn, product.nameAr)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain p-6 sm:p-10 md:p-14"
              />

              {/* Floating Luxury Action Dock (Wishlist & Share) */}
              <div className="absolute top-4 end-4 right-4 rtl:right-auto rtl:left-4 z-20 flex flex-col items-center gap-1 p-1.5 rounded-full bg-luxury-surface/85 backdrop-blur-md border border-luxury-border/70 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-luxury-surface/95">
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
                  className={`group/wishlist w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    isWishlisted
                      ? "text-accent bg-accent/10"
                      : "text-luxury-muted hover:text-luxury-text hover:bg-luxury-surface2/80"
                  }`}
                >
                  <Heart
                    size={18}
                    className={`transition-all duration-300 ${
                      isWishlisted
                        ? "fill-accent text-accent scale-110 drop-shadow-[0_2px_4px_rgba(197,168,128,0.35)]"
                        : "group-hover/wishlist:scale-110 group-hover/wishlist:text-luxury-text"
                    }`}
                  />
                </button>

                {/* Micro Divider */}
                <div className="w-4 h-[1px] bg-luxury-border/60 my-0.5" />

                {/* Share Action */}
                <button
                  type="button"
                  onClick={handleShare}
                  title={copiedLink ? c("Link Copied!", "تم نسخ الرابط!") : c("Share Fragrance", "مشاركة العطر")}
                  aria-label={copiedLink ? c("Link Copied!", "تم نسخ الرابط!") : c("Share Fragrance", "مشاركة العطر")}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-luxury-muted hover:text-luxury-text hover:bg-luxury-surface2/80 active:scale-90 transition-all duration-200"
                >
                  {copiedLink ? (
                    <Check size={16} className="text-emerald-500 animate-in fade-in" />
                  ) : (
                    <Share2 size={16} className="transition-transform group-hover:scale-110" />
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
                    className={`relative w-20 h-24 aspect-[4/5] bg-luxury-surface2 border transition-all flex-shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-luxury-borderBold ring-1 ring-luxury-borderBold"
                        : "border-luxury-border opacity-75 hover:opacity-100"
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
                className="inline-block text-[12px] font-sans font-medium uppercase tracking-[0.16em] text-luxury-muted hover:text-luxury-text transition-colors"
              >
                {product.brand.name}
              </Link>
              <h1 className="font-serif text-3xl sm:text-4xl text-luxury-text font-normal leading-tight mt-1.5">
                {c(product.nameEn, product.nameAr)}
              </h1>
              <p className="text-[13px] text-luxury-muted mt-1 tracking-wide">
                {product.concentration.replaceAll("_", " ")}
              </p>
            </div>

            {/* Price Display */}
            {selectedVariant && (
              <div className="pt-2 border-t border-luxury-border">
                <PriceDisplay
                  price={selectedVariant.price}
                  compareAtPrice={selectedVariant.compareAtPrice}
                  locale={locale}
                  size="xl"
                />
              </div>
            )}

            {/* Volume / Size Variant Selection (Level Shoes Style Pills) */}
            {product.variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium uppercase tracking-wider text-luxury-text">
                    {c("Select Volume", "اختر الحجم")}
                  </span>
                  <span className="text-luxury-muted">
                    {c(selectedVariant?.sizeLabelEn || "", selectedVariant?.sizeLabelAr || "")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`volume-pill ${isSelected ? "selected" : ""}`}
                      >
                        {c(v.sizeLabelEn, v.sizeLabelAr)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Truthful Preview / Availability Banner */}
            {preview && (
              <div className="p-4 bg-luxury-surface2 border border-luxury-border text-xs leading-relaxed text-luxury-text">
                <div className="flex items-center gap-2 font-medium text-accent mb-1">
                  <Sparkles size={14} />
                  <span>{c("Maison Collection Preview", "معاينة مجموعة الميزون")}</span>
                </div>
                <p className="text-luxury-muted">
                  {c(
                    "This creation is part of our verified olfactory catalog. Online self-checkout is currently in preview mode. To reserve this flacon or request private consultation, contact our fragrance concierge.",
                    "هذا العطر جزء من مجموعتنا المعتمدة. الشراء الإلكتروني المباشر في وضع المعاينة حالياً. لحجز الزجاجة أو الاستشارة الخاصة، يُرجى التواصل مع مستشار العطور.",
                  )}
                </p>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link
                href="/discover/ai"
                className="editorial-button w-full text-center justify-center shadow-sm hover:shadow-md"
              >
                {c("Consult Scent Sommelier", "استشر خبير العطور")}
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pro Luxury Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`py-3.5 px-4 flex items-center justify-center gap-2.5 text-xs font-sans uppercase tracking-[0.14em] font-medium border transition-all duration-200 group active:scale-[0.99] ${
                    isWishlisted
                      ? "bg-accent/10 border-accent/60 text-accent shadow-sm"
                      : "bg-luxury-surface/70 border-luxury-border hover:border-luxury-borderBold hover:bg-luxury-surface text-luxury-text"
                  }`}
                >
                  <Heart
                    size={16}
                    className={`transition-all duration-300 ${
                      isWishlisted
                        ? "fill-accent text-accent scale-110"
                        : "text-luxury-muted group-hover:text-luxury-text group-hover:scale-110"
                    }`}
                  />
                  <span>
                    {isWishlisted
                      ? c("Saved in Vault", "محفوظ في المفضلة")
                      : c("Add to Wishlist", "إضافة إلى المفضلة")}
                  </span>
                </button>

                <Link
                  href="/delivery"
                  className="editorial-button-secondary w-full text-center justify-center"
                >
                  {c("White-Glove Delivery", "التوصيل الفاخر")}
                </Link>
              </div>
            </div>

            {/* Service Badges (Authentic, GCC Delivery, Sealed Guarantee) */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-luxury-border text-center">
              <div className="flex flex-col items-center gap-1.5 p-2">
                <ShieldCheck size={18} className="text-accent" />
                <span className="text-[11px] font-medium text-luxury-text">
                  {c("100% Authentic", "أصلي ١٠٠٪")}
                </span>
                <span className="text-[10px] text-luxury-muted">
                  {c("Direct from Houses", "مباشرة من الدور")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 border-x border-luxury-border">
                <Truck size={18} className="text-accent" />
                <span className="text-[11px] font-medium text-luxury-text">
                  {c("GCC Express", "توصيل سريع")}
                </span>
                <span className="text-[10px] text-luxury-muted">
                  {c("Complimentary >500 AED", "مجاني فوق ٥٠٠ د.إ")}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2">
                <Package size={18} className="text-accent" />
                <span className="text-[11px] font-medium text-luxury-text">
                  {c("2ml Sample Included", "عينة ٢ مل مرفقة")}
                </span>
                <span className="text-[10px] text-luxury-muted">
                  {c("Test Before Opening", "جرّب قبل الفتح")}
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="pt-4 border-t border-luxury-border">
              <p className="text-sm leading-relaxed text-luxury-text">
                {c(product.descriptionEn, product.descriptionAr)}
              </p>
            </div>

            {/* 3. Level Shoes Style Accordions */}
            <div className="border-b border-luxury-border">
              {/* Accordion 1: Olfactory Pyramid & Scent Notes */}
              {(topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0) && (
                <div className="pdp-accordion-item">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("pyramid")}
                    className="pdp-accordion-header"
                    aria-expanded={openAccordion === "pyramid"}
                  >
                    <span>{c("Olfactory Notes & Pyramid", "الهرم العطري والنوتات")}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        openAccordion === "pyramid" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "pyramid" && (
                    <div className="pdp-accordion-content space-y-4">
                      {topNotes.length > 0 && (
                        <div>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-luxury-text block mb-1.5">
                            {c("Top Notes", "الافتتاحية")}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {topNotes.map((n) => (
                              <Link
                                key={n.id}
                                href={`/notes/${n.slug}`}
                                className="px-3 py-1 text-xs border border-luxury-border bg-luxury-surface text-luxury-text hover:border-luxury-borderBold transition-colors"
                              >
                                {n.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {heartNotes.length > 0 && (
                        <div>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-luxury-text block mb-1.5">
                            {c("Heart Notes", "قلب العطر")}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {heartNotes.map((n) => (
                              <Link
                                key={n.id}
                                href={`/notes/${n.slug}`}
                                className="px-3 py-1 text-xs border border-luxury-border bg-luxury-surface text-luxury-text hover:border-luxury-borderBold transition-colors"
                              >
                                {n.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {baseNotes.length > 0 && (
                        <div>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-luxury-text block mb-1.5">
                            {c("Base Notes", "القاعدة العطرية")}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {baseNotes.map((n) => (
                              <Link
                                key={n.id}
                                href={`/notes/${n.slug}`}
                                className="px-3 py-1 text-xs border border-luxury-border bg-luxury-surface text-luxury-text hover:border-luxury-borderBold transition-colors"
                              >
                                {n.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
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
                  <div className="pdp-accordion-content space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-luxury-muted block">{c("Fragrance House", "دار العطور")}</span>
                        <span className="font-medium text-luxury-text">{product.brand.name}</span>
                      </div>
                      {product.origin && (
                        <div>
                          <span className="text-luxury-muted block">{c("Country of Origin", "بلد المنشأ")}</span>
                          <span className="font-medium text-luxury-text">{product.origin}</span>
                        </div>
                      )}
                      {product.perfumer && (
                        <div>
                          <span className="text-luxury-muted block">{c("Master Perfumer", "الأنف العطري")}</span>
                          <span className="font-medium text-luxury-text">{product.perfumer}</span>
                        </div>
                      )}
                      {product.longevity && (
                        <div>
                          <span className="text-luxury-muted block">{c("Longevity", "الثبات")}</span>
                          <span className="font-medium text-luxury-text">{product.longevity}</span>
                        </div>
                      )}
                    </div>
                    {product.perfumerBio && (
                      <p className="text-xs text-luxury-muted pt-2 border-t border-luxury-border">
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
                  <div className="pdp-accordion-content text-xs space-y-2">
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

              {/* Accordion 4: White-Glove Delivery & Returns */}
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
                  <div className="pdp-accordion-content text-xs space-y-2">
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
        <section className="py-14 border-b border-luxury-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow">{c("FROM THE SAME MAISON", "من الدار نفسها")}</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text mt-1">
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
            {houseProducts.slice(0, 4).map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                nameEn={p.nameEn}
                nameAr={p.nameAr}
                brand={p.brand?.name || p.brand || product.brand.name}
                concentration={p.concentration}
                price={p.price || p.variants?.[0]?.price || 0}
                compareAtPrice={p.compareAtPrice || p.variants?.[0]?.compareAtPrice}
                image={p.images?.[0] || p.image || "/product-placeholder.svg"}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. You May Also Like Section (Level Shoes Recommendation Style) */}
      {relatedProducts.length > 0 && (
        <section className="py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow">{c("CURATED RECOMMENDATIONS", "ترشيحات مختارة")}</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text mt-1">
                {c("You May Also Appreciate", "قد ينال إعجابك أيضاً")}
              </h2>
            </div>
            <Link href="/shop" className="editorial-text-link">
              {c("Shop All Fragrances", "تسوق كل العطور")} ↗
            </Link>
          </div>
          <div className="product-grid">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                nameEn={p.nameEn}
                nameAr={p.nameAr}
                brand={p.brand?.name || p.brand}
                concentration={p.concentration}
                price={p.price || p.variants?.[0]?.price || 0}
                compareAtPrice={p.compareAtPrice || p.variants?.[0]?.compareAtPrice}
                image={p.images?.[0] || p.image || "/product-placeholder.svg"}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
