"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button, PriceDisplay } from "@muschio/ui";
import {
  Check,
  Gift,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  X,
  Loader2,
} from "lucide-react";
import { useCart } from "../../../../context/cart-context";
import { muschioApi } from "../../../../lib/api";

interface SampleItem {
  id: string; // ProductVariant id
  nameEn: string;
  nameAr: string;
  brand: string;
  brandType?: "NICHE" | "DESIGNER";
  concentration: string;
  image: string;
  notes: string[];
}

export default function DiscoverySetsPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem, setCartDrawerOpen } = useCart();

  useEffect(() => {
    let active = true;
    muschioApi.getDiscoverySamples().then((data) => {
      if (!active) return;
      if (Array.isArray(data) && data.length > 0) {
        const mapped: SampleItem[] = data.map((v: any) => {
          const prod = v.product;
          const isAmouage = prod.slug === "amouage-interlude-53-man";
          const img = isAmouage
            ? "/amouage-placeholder.svg"
            : (prod.images?.[0] || "/product-placeholder.svg");

          const noteNames: string[] = prod.notes
            ? prod.notes.map((pn: any) => (isAr ? pn.note.nameAr : pn.note.nameEn))
            : [];

          return {
            id: v.id,
            nameEn: prod.nameEn,
            nameAr: prod.nameAr,
            brand: prod.brand.name,
            brandType: prod.brand.type,
            concentration: prod.concentration.replaceAll("_", " "),
            image: img,
            notes: noteNames.slice(0, 3),
          };
        });
        setSamples(mapped);
        if (mapped.length >= 2 && mapped[0] && mapped[1]) {
          setSelectedSamples([mapped[0].id, mapped[1].id]);
        }
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [isAr]);

  const toggleSample = (id: string) => {
    if (selectedSamples.includes(id)) {
      setSelectedSamples(selectedSamples.filter((s) => s !== id));
    } else {
      if (selectedSamples.length < 5) {
        setSelectedSamples([...selectedSamples, id]);
      }
    }
  };

  const removeSlot = (id: string) => {
    setSelectedSamples(selectedSamples.filter((s) => s !== id));
  };

  const isComplete = selectedSamples.length === 5;
  const remainingCount = 5 - selectedSamples.length;

  const handleAddBox = async () => {
    if (!isComplete || isAdding) return;
    setIsAdding(true);

    const chosenSampleObjects = selectedSamples
      .map((id) => samples.find((s) => s.id === id))
      .filter(Boolean) as SampleItem[];

    const chosenNamesEn = chosenSampleObjects.map((s) => s.nameEn).join(", ");
    const chosenNamesAr = chosenSampleObjects.map((s) => s.nameAr).join("، ");

    try {
      await addItem({
        variantId: "discovery-set-5x2ml-box",
        slug: "discovery-set-5x2ml",
        title: "Artisanal Discovery Set (5 x 2ml)",
        titleAr: "مجموعة العينات الملكية المخصصة (٥ × ٢ مل)",
        brand: "Muschio Privé",
        price: 280,
        compareAtPrice: 350,
        quantity: 1,
        image:
          chosenSampleObjects[0]?.image ||
          "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=85",
        sizeLabel: isAr
          ? `٥ عينات: ${chosenNamesAr}`
          : `5 Vials: ${chosenNamesEn}`,
      });

      setAddedToCart(true);
      setCartDrawerOpen(true);
      setTimeout(() => setAddedToCart(false), 3500);
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 pb-32 sm:pb-16 space-y-8 sm:space-y-12">
      {/* 1. Header (Level Shoes Architectural Compact Pattern) */}
      <div className="max-w-3xl space-y-3 pb-6 border-b border-luxury-border">
        <div className="inline-flex items-center gap-2 text-accent text-xs font-sans uppercase tracking-[0.2em] font-medium">
          <Gift size={14} />
          <span>{c("Artisanal Discovery Box", "صندوق العينات الملكي")}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-text font-normal leading-tight">
          {c(
            "Curate Your 5 x 2ml Discovery Set",
            "صمّم صندوقك الخاص (٥ عينات × ٢ مل)",
          )}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted font-sans leading-relaxed">
          {c(
            "Select five official 2ml atomizers to experience on bare skin before acquiring a full flacon. Priced at 280 AED, your bespoke discovery set includes a 100% redeemable 280 AED voucher credited automatically toward any full-bottle acquisition.",
            "اختر ٥ عينات رسمية بحجم ٢ مل لتجربتها على بشرتك في هدوء منزلك. سعر الصندوق ٢٨٠ درهم، ويشمل قسيمة شراء مستردة بالكامل بنفس القيمة (٢٨٠ درهم) تخصم تلقائياً عند طلب أي زجاجة بالحجم الكامل.",
          )}
        </p>
      </div>

      {/* 2. Visual 5-Slot Selection Tray */}
      <div className="border border-luxury-border bg-luxury-surface p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg sm:text-xl text-luxury-text font-normal">
              {c(
                `Your Bespoke Box: ${selectedSamples.length} of 5 Chosen`,
                `صندوقك المخصص: ${selectedSamples.length} من أصل ٥ محددة`,
              )}
            </span>
            {isComplete && (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-luxury-muted font-sans">
            {isComplete
              ? c("Ready to add to bag · Voucher included", "مكتمل وجاهز للإضافة · القسيمة متضمنة")
              : c(
                  `Please select ${remainingCount} more ${remainingCount === 1 ? "vial" : "vials"}`,
                  `يرجى اختيار ${remainingCount} عينات إضافية`,
                )}
          </span>
        </div>

        {/* 5 Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4">
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const sampleId = selectedSamples[slotIdx];
            const sample = sampleId
              ? samples.find((s) => s.id === sampleId)
              : null;

            return (
              <div
                key={slotIdx}
                className={`relative aspect-[3/4] p-2.5 flex flex-col justify-between border transition-all ${
                  sample
                    ? "border-luxury-borderBold bg-luxury-surface2 shadow-sm"
                    : "border-dashed border-luxury-border bg-luxury-canvas/50 text-luxury-muted"
                }`}
              >
                {sample ? (
                  <>
                    <button
                      type="button"
                      onClick={() => removeSlot(sample.id)}
                      className="absolute top-1.5 end-1.5 right-1.5 rtl:right-auto rtl:left-1.5 z-10 w-6 h-6 bg-luxury-surface/90 border border-luxury-border flex items-center justify-center text-luxury-muted hover:text-luxury-text transition-colors rounded-full"
                      aria-label="Remove sample"
                    >
                      <X size={12} />
                    </button>
                    <div className="relative flex-1 w-full my-1">
                      <Image
                        src={sample.image}
                        alt={c(sample.nameEn, sample.nameAr)}
                        fill
                        sizes="(max-width: 640px) 120px, 160px"
                        className="object-contain object-center p-1"
                      />
                    </div>
                    <div className="text-center pt-1 border-t border-luxury-border/60">
                      <span className="text-[9px] uppercase tracking-wider text-luxury-muted block truncate font-sans">
                        {sample.brand}
                      </span>
                      <span className="text-[11px] font-serif text-luxury-text line-clamp-1 leading-tight">
                        {c(sample.nameEn, sample.nameAr)}
                      </span>
                      <span className="text-[9px] text-accent block font-mono">
                        2ml Extrait
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                    <span className="w-8 h-8 rounded-full border border-dashed border-luxury-border flex items-center justify-center text-xs font-serif text-luxury-muted mb-2">
                      {slotIdx + 1}
                    </span>
                    <span className="text-[11px] font-sans text-luxury-muted">
                      {c("Empty Slot", "خانة فارغة")}
                    </span>
                    <span className="text-[9px] text-luxury-muted/70 mt-0.5">
                      {c("Choose below", "اختر من الأسفل")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pricing Summary & Add to Cart Card */}
      <div className="border border-luxury-border bg-luxury-surface p-4 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl sm:text-3xl text-luxury-text font-normal">
              <PriceDisplay price={280} locale={locale} />
            </span>
            <span className="text-sm text-luxury-muted line-through">
              350 AED
            </span>
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[11px] font-sans uppercase tracking-wider border border-accent/20">
              {c("Complimentary Shipping", "شحن مجاني")}
            </span>
          </div>

          <p className="text-xs text-luxury-muted font-sans flex items-center gap-2">
            <Sparkles size={13} className="text-accent flex-shrink-0" />
            <span>
              {c(
                "Includes 280 AED digital voucher valid for 60 days on any 50ml+ bottle purchase.",
                "تشمل قسيمة رقمية بقيمة ٢٨٠ درهم صالحة لمدة ٦٠ يوماً على أي زجاجة بالحجم الكامل.",
              )}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            disabled={!isComplete || isAdding}
            onClick={handleAddBox}
            className="w-full sm:w-auto min-w-[240px] h-12 text-xs uppercase tracking-widest font-sans"
          >
            {addedToCart ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <Check size={16} />
                <span>{c("Added to Bag", "تمت الإضافة للحقيبة")}</span>
              </span>
            ) : isAdding ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>{c("Adding to Bag…", "جاري الإضافة…")}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingBag size={16} />
                <span>
                  {isComplete
                    ? c("Add Discovery Box to Bag", "أضف الصندوق للحقيبة")
                    : c(`Select ${remainingCount} More`, `اختر ${remainingCount} عينات`)}
                </span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* 4. Available Samples Grid (Tailored for Mobile & Desktop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow">
            {c("OFFICIAL MAISON SAMPLES (2ML)", "العينات الرسمية المعتمدة (٢ مل)")}
          </span>
          <span className="text-xs text-luxury-muted">
            {samples.length} {c("Creations Available", "عطور متاحة")}
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-xs text-luxury-muted space-y-3">
            <Loader2 size={24} className="animate-spin text-accent" />
            <span>{c("Retrieving official sample vials from catalog…", "جاري تحميل العينات الرسمية من الكتالوج…")}</span>
          </div>
        ) : samples.length === 0 ? (
          <div className="py-16 text-center text-xs text-luxury-muted">
            {c("No discovery vials available at this time.", "لا تتوفر عينات حالياً.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {samples.map((sample) => {
              const isSelected = selectedSamples.includes(sample.id);
              const canSelect = isSelected || selectedSamples.length < 5;

              return (
                <div
                  key={sample.id}
                  onClick={() => toggleSample(sample.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleSample(sample.id);
                    }
                  }}
                  className={`group cursor-pointer border p-3.5 sm:p-5 transition-all duration-200 flex flex-row items-center gap-3.5 sm:gap-4 relative select-none ${
                    isSelected
                      ? "border-accent bg-accent/5 dark:bg-accent/10 shadow-sm"
                      : canSelect
                        ? "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                        : "border-luxury-border/60 bg-luxury-canvas opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Sample Bottle Thumbnail */}
                  <div className="relative h-20 w-16 sm:h-24 sm:w-20 bg-luxury-surface2 border border-luxury-border overflow-hidden flex-shrink-0">
                    <Image
                      src={sample.image}
                      alt={c(sample.nameEn, sample.nameAr)}
                      fill
                      sizes="(max-width: 640px) 70px, 90px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 start-1 left-1 rtl:left-auto rtl:right-1 text-[8px] font-mono px-1 py-0.2 bg-luxury-surface/90 text-luxury-text border border-luxury-border">
                      2ml
                    </span>
                  </div>

                  {/* Sample Copy */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-sans uppercase tracking-[0.12em] text-luxury-muted block truncate">
                        {sample.brand}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-accent text-luxury-canvas flex items-center justify-center flex-shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-luxury-border flex-shrink-0 group-hover:border-luxury-text transition-colors" />
                      )}
                    </div>

                    <h3 className="font-serif text-sm sm:text-base text-luxury-text font-normal truncate mt-0.5 group-hover:text-accent transition-colors">
                      {c(sample.nameEn, sample.nameAr)}
                    </h3>

                    <span className="text-[10px] text-accent font-medium block mt-0.5 truncate font-sans">
                      {sample.concentration}
                    </span>

                    {/* Key Notes Chips */}
                    {sample.notes.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 overflow-hidden">
                        {sample.notes.slice(0, 2).map((note, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-sans px-1.5 py-0.5 bg-luxury-surface2 border border-luxury-border text-luxury-muted truncate max-w-[85px]"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Mobile Fixed Bottom Summary Bar */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden z-30 bg-luxury-surface/95 backdrop-blur-md border-t border-luxury-border p-3 px-4 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium text-luxury-text">
              280 AED
            </span>
            <span className="text-[11px] text-emerald-600 font-sans font-medium">
              {c("Voucher incl.", "القسيمة متضمنة")}
            </span>
          </div>
          <span className="text-[11px] text-luxury-muted font-sans">
            {isComplete
              ? c("5 of 5 Selected", "٥ من ٥ محددة")
              : c(`${remainingCount} more needed`, `متبقي ${remainingCount} عينات`)}
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!isComplete || isAdding}
          onClick={handleAddBox}
          className="h-10 px-4 text-xs font-sans uppercase tracking-wider flex-shrink-0 min-w-[140px]"
        >
          {addedToCart ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check size={14} />
              <span>{c("Added", "تمت الإضافة")}</span>
            </span>
          ) : isAdding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <span className="flex items-center gap-1.5">
              <ShoppingBag size={14} />
              <span>{c("Add to Bag", "أضف للحقيبة")}</span>
            </span>
          )}
        </Button>
      </div>

      {/* 6. Assurance Badges Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-luxury-border text-xs text-luxury-muted font-sans">
        <div className="flex items-center gap-3 p-4 bg-luxury-surface border border-luxury-border">
          <ShieldCheck size={18} className="text-accent flex-shrink-0" />
          <div>
            <span className="font-medium text-luxury-text block">
              {c("100% Authentic Maison Vials", "عينات أصلية ١٠٠٪")}
            </span>
            <span className="text-[11px] text-luxury-muted">
              {c("Filled by the master perfume houses", "معبأة مباشرة من دور العطور الرسمية")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-luxury-surface border border-luxury-border">
          <Truck size={18} className="text-accent flex-shrink-0" />
          <div>
            <span className="font-medium text-luxury-text block">
              {c("Same-Day GCC Courier", "توصيل سريع بنفس اليوم")}
            </span>
            <span className="text-[11px] text-luxury-muted">
              {c("Climate-controlled transit", "نقل مبرد يحافظ على جودة العطور")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-luxury-surface border border-luxury-border">
          <Sparkles size={18} className="text-accent flex-shrink-0" />
          <div>
            <span className="font-medium text-luxury-text block">
              {c("280 AED Full Value Refund", "استرداد كامل بقيمة ٢٨٠ درهم")}
            </span>
            <span className="text-[11px] text-luxury-muted">
              {c("Applied on your next full flacon", "تُخصم فوراً عند طلب عطرك المفضل")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
