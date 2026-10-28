"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link } from "../../../navigation";
import { useCompare, CompareItem } from "../../../context/compare-context";
import { useCart } from "../../../context/cart-context";
import { PREVIEW_CATALOG } from "../../../lib/preview-catalog";
import {
  ArrowLeft,
  ArrowLeftRight,
  Scale,
  ShoppingBag,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Layers,
  Award,
  Globe,
  Clock,
  Wind,
  Plus,
} from "lucide-react";

export default function ComparePage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);
  const searchParams = useSearchParams();
  const { items, removeItem, clearCompare, addItem } = useCompare();
  const { addItem: addToCart } = useCart();
  const [copiedLink, setCopiedLink] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  // If query string has ?items=slug1,slug2, hydrate items if compare list is empty
  useEffect(() => {
    const queryItems = searchParams.get("items");
    if (queryItems && items.length === 0) {
      const slugs = queryItems.split(",").map((s) => s.trim()).filter(Boolean);
      for (const slug of slugs) {
        const local = PREVIEW_CATALOG[slug];
        if (local) {
          const topNotes = local.notes?.filter((n: any) => n.position === "TOP").map((n: any) => n.name) || [];
          const heartNotes = local.notes?.filter((n: any) => n.position === "HEART").map((n: any) => n.name) || [];
          const baseNotes = local.notes?.filter((n: any) => n.position === "BASE").map((n: any) => n.name) || [];
          addItem({
            slug: local.slug,
            nameEn: local.nameEn,
            nameAr: local.nameAr,
            brand: local.brand,
            brandType: "NICHE",
            concentration: local.concentration,
            perfumer: local.perfumer,
            perfumerBio: local.perfumerBio,
            origin: local.origin,
            scentFamily: local.scentFamily || "Woody Amber",
            longevity: local.longevity || "20+ Hours",
            sillage: local.sillage || "Royal Sillage",
            price: local.variants?.[0]?.price || 1500,
            image: local.images?.[0] || "/product-placeholder.svg",
            volumeMl: local.variants?.[0]?.volumeMl || 100,
            variantId: local.variants?.[0]?.id,
            topNotes,
            heartNotes,
            baseNotes,
          });
        }
      }
    }
  }, [searchParams, items.length, addItem]);

  // Find shared notes across compared items
  const sharedNotes = useMemo(() => {
    if (items.length < 2) return new Set<string>();
    const allNoteOccurrences: Record<string, number> = {};
    items.forEach((item) => {
      const allItemNotes = [
        ...(item.topNotes || []),
        ...(item.heartNotes || []),
        ...(item.baseNotes || []),
      ];
      const uniqueInItem = Array.from(new Set(allItemNotes.map((n) => n.toLowerCase().trim())));
      uniqueInItem.forEach((n) => {
        allNoteOccurrences[n] = (allNoteOccurrences[n] || 0) + 1;
      });
    });
    const shared = new Set<string>();
    Object.entries(allNoteOccurrences).forEach(([name, count]) => {
      if (count >= 2) shared.add(name);
    });
    return shared;
  }, [items]);

  const handleShare = async () => {
    const slugs = items.map((i) => i.slug).join(",");
    const url = `${window.location.origin}/${locale}/compare?items=${encodeURIComponent(slugs)}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      }
    } catch {
      // fallback
    }
  };

  const handleAddToCart = async (item: CompareItem) => {
    setAddingId(item.slug);
    await addToCart({
      variantId: item.variantId || `var-${item.slug}`,
      slug: item.slug,
      title: item.nameEn,
      titleAr: item.nameAr || item.nameEn,
      brand: item.brand,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      quantity: 1,
      image: item.image,
      sizeLabel: `${item.volumeMl || 100}ml Extrait`,
    });
    setTimeout(() => setAddingId(null), 1000);
  };

  // Sample curated pairs for instant comparison when empty
  const handleLoadCuratedPair = (slug1: string, slug2: string) => {
    clearCompare();
    [slug1, slug2].forEach((slug) => {
      const local = PREVIEW_CATALOG[slug];
      if (local) {
        const topNotes = local.notes?.filter((n: any) => n.position === "TOP").map((n: any) => n.name) || [];
        const heartNotes = local.notes?.filter((n: any) => n.position === "HEART").map((n: any) => n.name) || [];
        const baseNotes = local.notes?.filter((n: any) => n.position === "BASE").map((n: any) => n.name) || [];
        addItem({
          slug: local.slug,
          nameEn: local.nameEn,
          nameAr: local.nameAr,
          brand: local.brand,
          brandType: "NICHE",
          concentration: local.concentration,
          perfumer: local.perfumer,
          perfumerBio: local.perfumerBio,
          origin: local.origin,
          scentFamily: local.scentFamily || "Woody Amber",
          longevity: local.longevity || "20+ Hours",
          sillage: local.sillage || "Royal Sillage",
          price: local.variants?.[0]?.price || 1500,
          image: local.images?.[0] || "/product-placeholder.svg",
          volumeMl: local.variants?.[0]?.volumeMl || 100,
          variantId: local.variants?.[0]?.id,
          topNotes,
          heartNotes,
          baseNotes,
        });
      }
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-luxury-muted hover:text-luxury-text transition-colors"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          <span>{c("Back to Catalog", "العودة للمتجر")}</span>
        </Link>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-luxury-border text-xs text-luxury-muted hover:text-luxury-text transition-colors font-sans"
              title={c("Copy shareable comparison link", "نسخ رابط المقارنة")}
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-emerald-500">{c("Link Copied!", "تم النسخ!")}</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>{c("Share Comparison", "مشاركة المقارنة")}</span>
                </>
              )}
            </button>

            <button
              onClick={clearCompare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-luxury-muted hover:text-rose-500 transition-colors font-sans"
            >
              <Trash2 size={13} />
              <span>{c("Clear All", "تفريغ المقارنة")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="border-b border-luxury-border pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent text-xs font-sans font-medium uppercase tracking-widest">
            <Scale size={14} className="text-accent" />
            <span>{c("Olfactory Matrix", "المصفوفة العطرية")}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal">
            {c("Haute Fragrance Comparison", "مقارنة العطور الملكية النيش")}
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted font-sans max-w-2xl leading-relaxed">
            {c(
              "An intimate side-by-side deconstruction of olfactory pyramids, rare harvest concentrations, master noses, and GCC climate sillage.",
              "تحليل مقارن دقيق للأهرامات العطرية وتراكيز الخلاصات النادرة والأنف العطري وثبات الانتشار في الأجواء الخليجية."
            )}
          </p>
        </div>

        <div className="text-xs font-sans text-luxury-muted">
          <span>
            {items.length} {c("of 4 fragrances selected", "من ٤ عطور مختارة")}
          </span>
        </div>
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 ? (
        <div className="py-16 sm:py-24 text-center border border-luxury-border bg-luxury-surface space-y-8 max-w-2xl mx-auto p-6 sm:p-12 rounded-sm shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
            <ArrowLeftRight size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
              {c("No Fragrances Selected for Comparison", "لم يتم اختيار أي عطور للمقارنة")}
            </h2>
            <p className="text-xs sm:text-sm text-luxury-muted font-sans max-w-md mx-auto leading-relaxed">
              {c(
                "Click the comparison icon on any fragrance card across the catalog or choose one of our iconic curated pairings below:",
                "انقر على أيقونة المقارنة على بطاقة أي عطر في المتجر، أو استكشف إحدى المقارنات الملكية المقترحة أدناه:"
              )}
            </p>
          </div>

          {/* Curated Pre-sets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-start">
            <button
              onClick={() =>
                handleLoadCuratedPair("amouage-interlude-53-man", "roja-elysium-pour-homme-parfum")
              }
              className="p-4 rounded border border-luxury-border bg-luxury-surface2/60 hover:border-accent text-start transition-all group"
            >
              <span className="text-[10px] text-accent font-mono uppercase tracking-wider block mb-1">
                {c("Spicy Smoky vs Fresh Citrus", "دخاني حار مقابل حمضيات منعشة")}
              </span>
              <h4 className="text-sm font-serif text-luxury-text font-medium group-hover:text-accent transition-colors">
                Amouage Interlude 53 vs Roja Elysium
              </h4>
              <span className="text-xs text-luxury-muted mt-1 block">
                {c("Compare 53% Extrait with British Royal Freshness", "مقارنة تركيز 53% مع الانتعاش البريطاني الملكي")}
              </span>
            </button>

            <button
              onClick={() =>
                handleLoadCuratedPair("mfk-baccarat-rouge-540-extrait", "xerjoff-alexandria-ii-eau-de-parfum")
              }
              className="p-4 rounded border border-luxury-border bg-luxury-surface2/60 hover:border-accent text-start transition-all group"
            >
              <span className="text-[10px] text-accent font-mono uppercase tracking-wider block mb-1">
                {c("Amber Crystal vs Laotian Oud", "كريستال عنبري مقابل عود لاوسي")}
              </span>
              <h4 className="text-sm font-serif text-luxury-text font-medium group-hover:text-accent transition-colors">
                MFK Baccarat 540 vs Xerjoff Alexandria II
              </h4>
              <span className="text-xs text-luxury-muted mt-1 block">
                {c("Compare Crystalline Sillage with Royal Italian Oud", "مقارنة الإشراقة الكريستالية مع فخامة العود الإيطالي")}
              </span>
            </button>
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-accent hover:bg-accent-hover text-luxury-canvas font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
            >
              <Sparkles size={14} />
              <span>{c("Explore The Vault Catalog", "استكشف الكتالوج الكامل")}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* COMPARISON MATRIX TABLE */
        <div className="space-y-6">
          {/* Shared Notes Alert (if any shared notes found) */}
          {sharedNotes.size > 0 && (
            <div className="p-3.5 rounded bg-accent/10 border border-accent/30 text-xs font-sans text-luxury-text flex items-center gap-2.5">
              <Sparkles size={16} className="text-accent shrink-0" />
              <div>
                <span className="font-semibold text-accent uppercase tracking-wider text-[11px] block">
                  {c("Harmonious Olfactory Overlap", "تناغم النوتات المشتركة")}
                </span>
                <span className="text-luxury-muted">
                  {c("These fragrances share signature essences: ", "تشترك هذه العطور في المكونات الملكية التالية: ")}
                  <strong className="text-luxury-text capitalize">
                    {Array.from(sharedNotes).join(", ")}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto border border-luxury-border bg-luxury-surface rounded-sm shadow-sm scrollbar-thin">
            <table className="w-full border-collapse text-xs font-sans min-w-[700px]">
              {/* STICKY TOP ROW: FLACON CARDS */}
              <thead>
                <tr className="border-b border-luxury-border divide-x rtl:divide-x-reverse divide-luxury-border bg-luxury-surface2/40">
                  <th className="p-4 sm:p-6 w-44 sm:w-56 text-start align-top font-serif text-sm font-normal text-luxury-muted">
                    <span className="block font-sans text-[10px] uppercase tracking-widest text-accent mb-1">
                      {c("CRITERIA", "المعايير")}
                    </span>
                    {c("Maison Flacon", "العطر والدار")}
                  </th>

                  {items.map((item) => (
                    <th key={item.slug} className="p-4 sm:p-6 text-start align-top relative group">
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="absolute top-3 end-3 w-6 h-6 rounded-full bg-luxury-surface border border-luxury-border hover:border-rose-500 hover:text-rose-500 text-luxury-muted flex items-center justify-center transition-all shadow-sm"
                        title={c("Remove fragrance", "إزالة العطر")}
                        aria-label={`Remove ${item.nameEn}`}
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="space-y-3">
                        {/* Flacon Image */}
                        <div className="relative aspect-[4/5] w-full max-w-[200px] mx-auto rounded overflow-hidden bg-luxury-surface2 border border-luxury-border/60">
                          <Image
                            src={item.image || "/product-placeholder.svg"}
                            alt={item.nameEn}
                            fill
                            className="object-cover transition-transform group-hover:scale-105 duration-300"
                            sizes="240px"
                          />
                        </div>

                        {/* Title and Brand */}
                        <div className="text-center space-y-1">
                          <span className="text-[10px] text-accent uppercase tracking-widest font-semibold block">
                            {item.brand}
                          </span>
                          <h3 className="font-serif text-base sm:text-lg text-luxury-text font-normal leading-snug">
                            {isAr && item.nameAr ? item.nameAr : item.nameEn}
                          </h3>
                          <div className="pt-1">
                            <span className="text-sm font-semibold text-luxury-text font-mono">
                              {item.price} AED
                            </span>
                            {item.compareAtPrice && (
                              <span className="text-xs text-luxury-muted line-through font-mono ms-2">
                                {item.compareAtPrice} AED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Purchase Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full py-2.5 px-3 rounded bg-accent hover:bg-accent-hover text-luxury-canvas font-sans font-semibold text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <ShoppingBag size={13} />
                            <span>
                              {addingId === item.slug
                                ? c("Added!", "تمت الإضافة!")
                                : c("Add to Bag", "إضافة للحقيبة")}
                            </span>
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Empty Slot placeholder in column header */}
                  {items.length < 4 && (
                    <th className="p-4 sm:p-6 text-center align-middle bg-luxury-surface2/20">
                      <Link
                        href="/shop"
                        className="inline-flex flex-col items-center justify-center gap-2 p-6 rounded border border-dashed border-luxury-border hover:border-accent text-luxury-muted hover:text-accent transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full border border-dashed border-luxury-border group-hover:border-accent flex items-center justify-center">
                          <Plus size={18} />
                        </div>
                        <span className="text-xs font-sans tracking-wide">
                          {c("+ Add Flacon", "+ إضافة عطر")}
                        </span>
                      </Link>
                    </th>
                  )}
                </tr>
              </thead>

              {/* TABLE BODY: ATTRIBUTES MATRIX */}
              <tbody className="divide-y divide-luxury-border">
                {/* 1. Scent Family */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="flex items-center gap-1.5 text-accent">
                      <Layers size={14} />
                      <span>{c("Scent Family", "العائلة العطرية")}</span>
                    </span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent font-medium text-[11px]">
                        {item.scentFamily || c("Woody Amber", "عنبر خشبي")}
                      </span>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 2. Master Perfumer / Nose */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="flex items-center gap-1.5 text-amber-500">
                      <Award size={14} />
                      <span>{c("Master Perfumer (The Nose)", "الأنف العطري")}</span>
                    </span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text space-y-1">
                      <span className="font-semibold text-luxury-text block text-sm">
                        {item.perfumer || c("Master Perfumer", "أنف عطري عالمي")}
                      </span>
                      {item.perfumerBio && (
                        <p className="text-[11px] text-luxury-muted line-clamp-2 leading-relaxed">
                          {item.perfumerBio}
                        </p>
                      )}
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 3. Top Notes */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="block text-luxury-text font-semibold">{c("Top Notes", "القمة العطرية")}</span>
                    <span className="text-[10px] text-luxury-muted">{c("Opening accord (first 30 min)", "الانطباع الافتتاحي")}</span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text">
                      <div className="flex flex-wrap gap-1.5">
                        {item.topNotes && item.topNotes.length > 0 ? (
                          item.topNotes.map((note) => {
                            const isShared = sharedNotes.has(note.toLowerCase().trim());
                            return (
                              <span
                                key={note}
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  isShared
                                    ? "bg-accent/25 text-accent font-semibold border border-accent/50"
                                    : "bg-luxury-surface2 text-luxury-text border border-luxury-border"
                                }`}
                              >
                                {note} {isShared && "★"}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-luxury-muted italic text-[11px]">
                            {c("Calabrian Bergamot, Pink Pepper", "حمضيات إيطالية، فلفل وردي")}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 4. Heart Notes */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="block text-luxury-text font-semibold">{c("Heart Notes", "قلب العطر")}</span>
                    <span className="text-[10px] text-luxury-muted">{c("The soul of the composition", "جوهر التكوين الملكي")}</span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text">
                      <div className="flex flex-wrap gap-1.5">
                        {item.heartNotes && item.heartNotes.length > 0 ? (
                          item.heartNotes.map((note) => {
                            const isShared = sharedNotes.has(note.toLowerCase().trim());
                            return (
                              <span
                                key={note}
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  isShared
                                    ? "bg-accent/25 text-accent font-semibold border border-accent/50"
                                    : "bg-luxury-surface2 text-luxury-text border border-luxury-border"
                                }`}
                              >
                                {note} {isShared && "★"}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-luxury-muted italic text-[11px]">
                            {c("Silver Frankincense, Taif Rose", "لبان حوجري فضي، ورد الطائف")}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 5. Base Notes */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="block text-luxury-text font-semibold">{c("Base Notes", "القاعدة العطرية")}</span>
                    <span className="text-[10px] text-luxury-muted">{c("Monumental sillage & drydown", "ثبات واستقرار العطر")}</span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text">
                      <div className="flex flex-wrap gap-1.5">
                        {item.baseNotes && item.baseNotes.length > 0 ? (
                          item.baseNotes.map((note) => {
                            const isShared = sharedNotes.has(note.toLowerCase().trim());
                            return (
                              <span
                                key={note}
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  isShared
                                    ? "bg-accent/25 text-accent font-semibold border border-accent/50"
                                    : "bg-luxury-surface2 text-luxury-text border border-luxury-border"
                                }`}
                              >
                                {note} {isShared && "★"}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-luxury-muted italic text-[11px]">
                            {c("Cambodian Oud, Ambergris, Leather", "عود كمبودي، عنبر أشهب، جلود")}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 6. Concentration */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="flex items-center gap-1.5 text-luxury-text">
                      <Sparkles size={14} className="text-accent" />
                      <span>{c("Concentration", "درجة التركيز")}</span>
                    </span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text">
                      <span className="font-semibold text-luxury-text block">
                        {item.concentration || "Extrait de Parfum (30-53%)"}
                      </span>
                      <span className="text-[10px] text-luxury-muted">
                        {item.concentration?.includes("53%")
                          ? c("Maximum High-Density Maceration", "أعلى تركيز بالزيوت الملكية النقية")
                          : c("Haute Purity Extrait", "خلاصة عطرية فائقة النقاوة")}
                      </span>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 7. Performance (Longevity & Sillage) */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="flex items-center gap-1.5 text-luxury-text">
                      <Clock size={14} className="text-accent" />
                      <span>{c("Longevity & Sillage", "الثبات والانتشار")}</span>
                    </span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock size={12} className="text-accent" />
                        <span className="font-medium text-luxury-text">
                          {item.longevity || "20+ Hours"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Wind size={12} className="text-amber-500" />
                        <span className="text-luxury-muted">
                          {item.sillage || "Royal Projection"}
                        </span>
                      </div>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 8. Volume & Value per ml */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="flex items-center gap-1.5 text-luxury-text">
                      <Scale size={14} className="text-accent" />
                      <span>{c("Volume & Value", "الحجم والقيمة")}</span>
                    </span>
                  </td>
                  {items.map((item) => {
                    const vol = item.volumeMl || 100;
                    const pricePerMl = (item.price / vol).toFixed(1);
                    return (
                      <td key={item.slug} className="p-4 text-luxury-text font-mono">
                        <span className="block font-semibold text-luxury-text text-sm">
                          {vol} ml
                        </span>
                        <span className="text-[10px] text-luxury-muted">
                          ~{pricePerMl} AED / ml
                        </span>
                      </td>
                    );
                  })}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>

                {/* 9. Maison & Provenance */}
                <tr className="divide-x rtl:divide-x-reverse divide-luxury-border hover:bg-luxury-surface2/30 transition-colors">
                  <td className="p-4 font-medium text-luxury-muted bg-luxury-surface2/40">
                    <span className="flex items-center gap-1.5 text-luxury-text">
                      <Globe size={14} className="text-accent" />
                      <span>{c("Origin & Heritage", "بلد المنشأ والتاريخ")}</span>
                    </span>
                  </td>
                  {items.map((item) => (
                    <td key={item.slug} className="p-4 text-luxury-text">
                      <span className="font-semibold block text-luxury-text">
                        {item.brand}
                      </span>
                      <span className="text-[11px] text-luxury-muted">
                        {item.origin || (item.brand === "Amouage" ? "Sultanate of Oman" : "Paris, France")}
                      </span>
                    </td>
                  ))}
                  {items.length < 4 && <td className="p-4 bg-luxury-surface2/10"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
