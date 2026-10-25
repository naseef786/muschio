"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useCart } from "../../../../context/cart-context";

interface SampleItem {
  id: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  brandType?: "NICHE" | "DESIGNER";
  concentration: string;
  image: string;
  notes: string[];
}

const SAMPLE_SELECTION: SampleItem[] = [
  {
    id: "sample-1",
    nameEn: "Interlude 53 Man Extrait",
    nameAr: "إنترلود 53 إكستري",
    brand: "Amouage",
    brandType: "NICHE",
    concentration: "Extrait de Parfum (53%)",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=85",
    notes: ["Silver Frankincense", "Cambodian Oud", "Bergamot"],
  },
  {
    id: "sample-2",
    nameEn: "Baccarat Rouge 540 Extrait",
    nameAr: "باكارات روج 540 إكستري",
    brand: "Maison Francis Kurkdjian",
    brandType: "NICHE",
    concentration: "Extrait de Parfum",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=85",
    notes: ["Kashmiri Saffron", "Golden Ambergris", "Bitter Almond"],
  },
  {
    id: "sample-3",
    nameEn: "Elysium Pour Homme Parfum",
    nameAr: "إليزيوم بور هوم بارفان",
    brand: "Roja Parfums",
    brandType: "NICHE",
    concentration: "Pure Parfum",
    image:
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=85",
    notes: ["Calabrian Bergamot", "Tuscan Leather", "Pink Pepper"],
  },
  {
    id: "sample-4",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    brand: "Xerjoff",
    brandType: "NICHE",
    concentration: "Eau de Parfum",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=85",
    notes: ["Laos Oud", "Bulgarian Rose", "Cinnamon"],
  },
  {
    id: "sample-5",
    nameEn: "Tobacco Vanille Eau de Parfum",
    nameAr: "توباكو فانيلا أو دي بارفان",
    brand: "Tom Ford",
    brandType: "DESIGNER",
    concentration: "Eau de Parfum",
    image:
      "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=85",
    notes: ["Bourbon Vanilla", "Tobacco Leaf", "Tonka Bean"],
  },
  {
    id: "sample-6",
    nameEn: "Royal Taif Rose Attar",
    nameAr: "ورد الطائف الملكي الخالص",
    brand: "Muschio Privé",
    brandType: "NICHE",
    concentration: "Pure Attar Absolute",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=85",
    notes: ["Taif Rose", "Honeyed Accord", "Clean Musk"],
  },
  {
    id: "sample-7",
    nameEn: "No. 1 Masculine Edition",
    nameAr: "نمبر 1 ماسكيولين إديشن",
    brand: "Clive Christian",
    brandType: "NICHE",
    concentration: "Pure Perfume",
    image:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=85",
    notes: ["50-Year Aged Sandalwood", "Pimento", "Florentine Iris"],
  },
  {
    id: "sample-8",
    nameEn: "Aventus Millésime",
    nameAr: "أفينتوس ميليزيم",
    brand: "Creed",
    brandType: "NICHE",
    concentration: "Eau de Parfum",
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=85",
    notes: ["Blackcurrant", "French Birch", "Italian Bergamot"],
  },
];

export default function DiscoverySetsPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [selectedSamples, setSelectedSamples] = useState<string[]>([
    "sample-1",
    "sample-2",
  ]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem, setCartDrawerOpen } = useCart();

  const toggleSample = (id: string) => {
    if (selectedSamples.includes(id)) {
      setSelectedSamples(selectedSamples.filter((s) => s !== id));
    } else {
      if (selectedSamples.length < 5) {
        setSelectedSamples([...selectedSamples, id]);
      }
    }
  };

  const removeSample = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedSamples(selectedSamples.filter((s) => s !== id));
  };

  const isComplete = selectedSamples.length === 5;
  const remainingCount = 5 - selectedSamples.length;

  const handleAddBox = async () => {
    if (!isComplete || isAdding) return;
    setIsAdding(true);

    const chosenSampleObjects = selectedSamples
      .map((id) => SAMPLE_SELECTION.find((s) => s.id === id))
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
              ? SAMPLE_SELECTION.find((s) => s.id === sampleId)
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
                      onClick={(e) => removeSample(sample.id, e)}
                      className="absolute top-1.5 end-1.5 z-10 w-5 h-5 rounded-full bg-luxury-surface border border-luxury-border text-luxury-muted hover:text-luxury-text hover:border-luxury-borderBold flex items-center justify-center transition-colors"
                      title={c("Remove sample", "إزالة العينة")}
                      aria-label={c(`Remove ${sample.nameEn}`, `إزالة ${sample.nameAr}`)}
                    >
                      <X size={11} />
                    </button>
                    <div className="relative w-full flex-1 mb-2 bg-luxury-surface overflow-hidden">
                      <Image
                        src={sample.image}
                        alt={c(sample.nameEn, sample.nameAr)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, 180px"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-sans uppercase tracking-wider text-accent block truncate">
                        {sample.brand}
                      </span>
                      <p className="font-serif text-xs text-luxury-text font-normal truncate">
                        {c(sample.nameEn, sample.nameAr)}
                      </p>
                      <span className="text-[9px] text-luxury-muted font-mono block">
                        2ml Extrait
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                    <span className="w-7 h-7 rounded-full border border-dashed border-luxury-border flex items-center justify-center text-xs mb-1.5 font-mono">
                      {slotIdx + 1}
                    </span>
                    <span className="text-[10px] font-sans uppercase tracking-wider text-luxury-muted">
                      {c("Empty Slot", "خانة فارغة")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Desktop Sticky Action Bar (Hidden on Mobile) */}
      <div className="hidden sm:flex sticky top-24 z-20 border border-luxury-border bg-luxury-surface/95 backdrop-blur-md p-5 shadow-sm items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl text-luxury-text font-normal">
              {c(
                `Selected: ${selectedSamples.length} of 5 Samples`,
                `المحدد: ${selectedSamples.length} من أصل ٥ عينات`,
              )}
            </span>
            {isComplete && (
              <CheckCircle2 size={18} className="text-emerald-600" />
            )}
          </div>
          <p className="text-xs text-luxury-muted font-sans">
            {isComplete
              ? c(
                  "Set is complete. Includes complimentary UAE delivery and 280 AED voucher.",
                  "المجموعة مكتملة. تشمل توصيلاً مجانياً في الإمارات وقسيمة بقيمة ٢٨٠ درهم.",
                )
              : c(
                  `Select ${remainingCount} more ${remainingCount === 1 ? "vial" : "vials"} to complete your box.`,
                  `اختر ${remainingCount} عينات إضافية لإكمال الصندوق.`,
                )}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-end">
            <PriceDisplay price={280} locale={locale} size="lg" />
            <span className="text-[10px] text-accent block uppercase tracking-wider">
              {c("100% Redeemable Voucher", "قسيمة مستردة ١٠٠٪")}
            </span>
          </div>

          <Button
            onClick={handleAddBox}
            disabled={!isComplete || isAdding}
            variant="accent"
            size="lg"
            className="whitespace-nowrap px-8"
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{c("Adding…", "جارٍ الإضافة…")}</span>
              </span>
            ) : addedToCart ? (
              <span className="flex items-center gap-2">
                <Check size={16} />
                <span>{c("Added to Bag ✓", "تمت الإضافة بنجاح ✓")}</span>
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
            {SAMPLE_SELECTION.length} {c("Creations Available", "عطور متاحة")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {SAMPLE_SELECTION.map((sample) => {
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

                {/* Sample Meta Details */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-accent truncate max-w-[130px]">
                      {sample.brand}
                    </span>
                    <span className="text-[9px] text-luxury-muted font-mono">
                      · {sample.concentration.includes("53%") ? "53% Extrait" : "Extrait"}
                    </span>
                  </div>

                  <h3 className="font-serif text-sm sm:text-base text-luxury-text font-normal truncate group-hover:text-accent transition-colors">
                    {c(sample.nameEn, sample.nameAr)}
                  </h3>

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {sample.notes.slice(0, 2).map((note, nIdx) => (
                      <span
                        key={nIdx}
                        className="text-[10px] text-luxury-muted font-sans"
                      >
                        • {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Checkbox Selector (Touch friendly) */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-none border flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected
                      ? "bg-accent border-accent text-white"
                      : "border-luxury-borderBold group-hover:border-luxury-text"
                  }`}
                >
                  {isSelected && <Check size={14} className="stroke-[2.5]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Level Shoes Trust Guarantees Bar */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-start">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
            <Sparkles size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base text-luxury-text font-normal">
              {c("100% Redeemable Voucher", "قسيمة خصم مستردة ١٠٠٪")}
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              {c(
                "Your 280 AED payment is fully credited towards any full flacon purchase from our vault within 60 days.",
                "قيمة الصندوق (٢٨٠ درهم) تُخصم بالكامل عند شرائك أي زجاجة بالحجم الكامل من خزانة موسكيو خلال ٦٠ يوماً.",
              )}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
            <ShieldCheck size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base text-luxury-text font-normal">
              {c("100% Authentic Maison Vials", "عينات رسمية أصلية ١٠٠٪")}
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              {c(
                "Filled directly from official maison batches in airtight glass atomizers with high-pressure micro-sprays.",
                "معبأة مباشرة من تشغيلات الدور الرسمية في زجاجات محكمة مع مضخة رذاذ فائقة الدقة لفوحان مثالي.",
              )}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 border border-luxury-border flex items-center justify-center flex-shrink-0 text-accent">
            <Truck size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-base text-luxury-text font-normal">
              {c("Complimentary UAE Delivery", "توصيل سريع مجاني في الإمارات")}
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              {c(
                "White-glove climate-controlled delivery within 24–48 hours across Dubai, Abu Dhabi, and the GCC.",
                "توصيل سريع ومبرد في غضون ٢٤ إلى ٤٨ ساعة داخل دبي وأبوظبي وجميع مدن الخليج العربي.",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Mobile Fixed Bottom Floating Action Bar (Level Shoes Mobile E-Commerce Standard) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-luxury-surface/95 backdrop-blur-md border-t border-luxury-border p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-base font-medium text-luxury-text">
              {c(
                `${selectedSamples.length}/5 Selected`,
                `${selectedSamples.length}/٥ محددة`,
              )}
            </span>
            {isComplete ? (
              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <span className="text-[10px] text-luxury-muted font-sans">
                ({c(`Add ${remainingCount}`, `تبقّى ${remainingCount}`)})
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-xs font-semibold text-luxury-text">
              280 AED
            </span>
            <span className="text-[9px] text-accent uppercase tracking-wider truncate">
              {c("Voucher included", "القسيمة متضمنة")}
            </span>
          </div>
        </div>

        <Button
          onClick={handleAddBox}
          disabled={!isComplete || isAdding}
          variant="accent"
          size="md"
          className="whitespace-nowrap px-5 flex-shrink-0"
        >
          {isAdding ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{c("Adding…", "جارٍ الإضافة…")}</span>
            </span>
          ) : addedToCart ? (
            <span className="flex items-center gap-1.5">
              <Check size={14} />
              <span>{c("Added ✓", "تمت الإضافة ✓")}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ShoppingBag size={14} />
              <span>
                {isComplete
                  ? c("Add Box to Bag", "أضف للحقيبة")
                  : c(`Pick ${remainingCount} More`, `اختر ${remainingCount}`)}
              </span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
