"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../../../../navigation";
import { Button, Badge, PriceDisplay } from "@muschio/ui";
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../../../../context/cart-context";
import { muschioApi } from "../../../../lib/api";

interface Recommendation {
  slug: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  concentration: string;
  price: number;
  matchPercentage: number;
  image: string;
  reason: string;
  accords: string[];
}

export default function AIScentDiscoveryPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [query, setQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string>("regal");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("evening");
  const [selectedNotes, setSelectedNotes] = useState<string[]>([
    "silver-frankincense",
    "cambodian-oud",
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    auraTitle: string;
    analysis: string;
    recommendations: Recommendation[];
  } | null>(null);

  const { addItem, setCartDrawerOpen } = useCart();
  const [addedItemSlug, setAddedItemSlug] = useState<string | null>(null);

  const vibes = [
    {
      id: "regal",
      titleEn: "Regal & Aristocratic",
      titleAr: "ملكي وأرستقراطي",
      subtitleEn: "Sacred Frankincense, Rare Woods & Amber",
      subtitleAr: "لبان حوجري مقدس، أخشاب نادرة وعنبر",
    },
    {
      id: "smoky",
      titleEn: "Smoky & Resinous",
      titleAr: "دخاني وصمغي",
      subtitleEn: "Wild Cambodian Oud, Birch & Balsam",
      subtitleAr: "عود كمبودي بري، قطران البتولا وبلسم",
    },
    {
      id: "luminous",
      titleEn: "Solar Saffron & Amber",
      titleAr: "مشرق وزعفراني",
      subtitleEn: "Kashmiri Saffron, Ambergris & Warm Florals",
      subtitleAr: "زعفران كشميري، عنبر أشهب وزهور دافئة",
    },
    {
      id: "velvet",
      titleEn: "Velvet Rose & Attar",
      titleAr: "ورد مخملي وعود",
      subtitleEn: "Mountain Taif Rose, Damascena & Cedar",
      subtitleAr: "ورد الطائف الجبلي، دمشقي وأرز معتق",
    },
    {
      id: "fresh",
      titleEn: "Crisp Citrus & Woods",
      titleAr: "حمضي وخشبي منعش",
      subtitleEn: "Calabrian Bergamot, Vetiver & Neroli",
      subtitleAr: "برغموت كالابريا، نجيل الهند وزهر البرتقال",
    },
  ];

  const occasions = [
    {
      id: "evening",
      labelEn: "Royal Majlis & Evening Galas",
      labelAr: "المجالس الملكية والمناسبات المسائية الكبرى",
      detailEn: "Maximum sillage and 24-hour opulent persistence",
      detailAr: "فوحان أقصى وثبات ملكي يمتد لـ ٢٤ ساعة",
    },
    {
      id: "daily",
      labelEn: "Daily Aristocratic Signature",
      labelAr: "توقيع يومي فاخر وراقي",
      detailEn: "Refined, comfortable aura for daytime prestige",
      detailAr: "حضور جذاب ومريح يناسب فخامة النهار",
    },
    {
      id: "intimate",
      labelEn: "Private Intimate Gathering",
      labelAr: "أمسية خاصة ولقاءات هادئة",
      detailEn: "Close-range warmth, ambergris, and skin musk",
      detailAr: "دفء مخملي قريب من البشرة مع العنبر والمسك",
    },
    {
      id: "business",
      labelEn: "Executive Boardroom Presence",
      labelAr: "اجتماعات أعمال تنفيذية رفيعة",
      detailEn: "Commanding, crystalline woods and sharp spices",
      detailAr: "أخشاب بلورية مهيبة وتوابل حادة تفرض الاحترام",
    },
  ];

  const availableNotes = [
    { nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose" },
    { nameEn: "Silver Frankincense", nameAr: "اللبان الحوجري الفضي", slug: "silver-frankincense" },
    { nameEn: "Cambodian Oud", nameAr: "دهن عود كمبودي معتق", slug: "cambodian-oud" },
    { nameEn: "Florentine Iris", nameAr: "سوسن فلورنسا المخملي", slug: "florentine-iris" },
    { nameEn: "Golden Ambergris", nameAr: "عنبر أشهب نقي", slug: "golden-ambergris" },
    { nameEn: "Madagascar Vanilla", nameAr: "فانيليا بوربون سوداء", slug: "madagascar-vanilla" },
    { nameEn: "Tuscan Leather", nameAr: "جلود توسكانا المصقولة", slug: "tuscan-leather" },
    { nameEn: "Kashmiri Saffron", nameAr: "زعفران كشميري نادر", slug: "kashmiri-saffron" },
  ];

  const toggleNote = (slug: string) => {
    setSelectedNotes((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleConsult = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const apiRes = await muschioApi.consultAIScent({
        query:
          query.trim() ||
          `Atmosphere: ${selectedVibe}, Occasion: ${selectedOccasion}`,
        preferredNotes: selectedNotes,
        excludedNotes: [],
        preferredFamilies: [],
        locale,
      });

      if (apiRes && apiRes.recommendations.length > 0) {
        setResult({
          auraTitle:
            (apiRes as any).auraTitleAr && isAr
              ? (apiRes as any).auraTitleAr
              : (apiRes as any).auraTitleEn && !isAr
                ? (apiRes as any).auraTitleEn
                : isAr
                  ? "الهالة العطرية المخصصة لك"
                  : "Your Bespoke Olfactory Aura",
          analysis: isAr ? apiRes.analysisAr : apiRes.analysisEn,
          recommendations: apiRes.recommendations.map((rec) => ({
            slug: rec.slug || rec.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            nameEn: rec.productName,
            nameAr: rec.productName,
            brand: rec.brandName,
            concentration: rec.concentration || "Extrait de Parfum",
            price: rec.price || 1850,
            matchPercentage: rec.matchPercentage,
            image:
              rec.image ||
              (rec.slug === "amouage-interlude-53-man"
                ? "/amouage-placeholder.svg"
                : "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85"),
            reason: isAr ? rec.matchReasonAr : rec.matchReasonEn,
            accords: rec.accordOverlap,
          })),
        });
        setLoading(false);
        return;
      }
    } catch {
      // Offline fallback
    }

    setTimeout(() => {
      setResult({
        auraTitle: isAr
          ? "الهالة العطرية: عود بخوري ملكي فاحم"
          : "Olfactory Aura: Regal Incense & Resinous Agarwood",
        analysis: isAr
          ? "بناءً على تفضيلك للأمسيات الملكية والنفحات الصمغية مع اللبان الحوجري والعود الكمبودي المعتق، طابق مستشارنا العطري تفضيلاتك مع أندر خلاصات الإكستري المعتقة لستة أشهر في مسقط."
          : "Based on your preference for aristocratic sillage, Omani Silver Frankincense, and aged wild agarwood, our sommelier has identified two masterwork extraits formulating over 50% perfume oil concentrations.",
        recommendations: [
          {
            slug: "amouage-interlude-53-man",
            nameEn: "Interlude 53 Man Extrait de Parfum",
            nameAr: "إنترلود 53 مان إكستري دو بارفان",
            brand: "Amouage",
            concentration: "Extrait de Parfum (53%)",
            price: 1850,
            matchPercentage: 99,
            image: "/amouage-placeholder.svg",
            reason: isAr
              ? "توافق تام بنسبة ٩٩٪ بفضل تركيز الزيت ٥٣٪ المعتق لستة أشهر مع لبان حوجري فضي وعود كمبودي."
              : "Direct 99% match via 53% perfume oil maceration, Silver Frankincense, and aged Cambodian Oud.",
            accords: isAr
              ? ["دخاني", "بلسمي", "عود ملكي"]
              : ["Smoky", "Balsamic", "Royal Oud"],
          },
          {
            slug: "mfk-baccarat-rouge-540-extrait",
            nameEn: "Baccarat Rouge 540 Extrait de Parfum",
            nameAr: "باكارات روج 540 إكستري دو بارفان",
            brand: "Maison Francis Kurkdjian",
            concentration: "Extrait de Parfum",
            price: 1650,
            matchPercentage: 94,
            image:
              "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
            reason: isAr
              ? "إشراقة الزعفران الكشميري والعنبر الأشهب الطبيعي لهالة ملكية ساحرة في المناسبات الكبرى."
              : "Luminous Kashmiri Saffron and Grandiflorum Jasmine providing glowing evening projection.",
            accords: isAr
              ? ["عنبري", "زعفران", "إشراقة بلورية"]
              : ["Amber", "Saffron", "Luminous"],
          },
        ],
      });
      setLoading(false);
    }, 700);
  };

  const handleAddToCart = async (rec: Recommendation) => {
    try {
      await addItem({
        variantId: `${rec.slug}-standard`,
        slug: rec.slug,
        title: rec.nameEn,
        titleAr: rec.nameAr,
        brand: rec.brand,
        price: rec.price,
        quantity: 1,
        image: rec.image,
        sizeLabel: "100ml Extrait",
      });
      setAddedItemSlug(rec.slug);
      setCartDrawerOpen(true);
      setTimeout(() => setAddedItemSlug(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-10 sm:space-y-14">
      {/* 1. Header (Level Shoes Architectural Style) */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pb-6 border-b border-luxury-border">
        <span className="eyebrow text-accent">
          {c("HAUTE SCENT SOMMELIER · PRIVATE CONSULTATION", "المستشار العطري الخاص · جلسة تشخيص عطرية")}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-luxury-text font-normal leading-tight">
          {isAr ? (
            <>
              اكتشف توقيعك العطري <span className="italic">الملكي</span>
            </>
          ) : (
            <>
              Bespoke Haute <span className="italic">Scent Sommelier</span>
            </>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-luxury-muted font-sans leading-relaxed max-w-2xl mx-auto">
          {c(
            "An editorial sommelier experience matching your mood, personal sillage preferences, and noble ingredients against our authenticated niche vault.",
            "استشارة عطرية راقية تحلل كيمياء النوتات والهرم العطري لتحديد العطر النيش الأنسب لشخصيتك ومناسباتك الخاصة من خزانة موسكيو المعتمدة.",
          )}
        </p>
      </div>

      {/* 2. Interactive Consultation Architectural Dashboard */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-10 space-y-10 max-w-4xl mx-auto">
        {/* Step 1: Vibe / Scent Persona */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-luxury-border">
            <label className="text-xs font-sans uppercase tracking-[0.16em] text-luxury-text font-medium">
              1. {c("Desired Olfactory Atmosphere", "الطابع العطري المرغوب")}
            </label>
            <span className="text-[11px] text-luxury-muted">
              {c("Select 1 Profile", "اختر نمطاً واحداً")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vibes.map((v) => {
              const active = selectedVibe === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVibe(v.id)}
                  className={`p-4 text-start border transition-all ${
                    active
                      ? "border-accent bg-accent/5 dark:bg-accent/10 shadow-sm"
                      : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-base text-luxury-text font-normal">
                      {c(v.titleEn, v.titleAr)}
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        active
                          ? "border-accent bg-accent"
                          : "border-luxury-borderBold"
                      }`}
                    >
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-luxury-muted font-sans block leading-relaxed">
                    {c(v.subtitleEn, v.subtitleAr)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Occasion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-luxury-border">
            <label className="text-xs font-sans uppercase tracking-[0.16em] text-luxury-text font-medium">
              2. {c("Intended Occasion & Sillage Context", "المناسبة ونطاق الفوحان")}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {occasions.map((occ) => {
              const active = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`p-4 text-start border transition-all ${
                    active
                      ? "border-accent bg-accent/5 dark:bg-accent/10 shadow-sm"
                      : "border-luxury-border bg-luxury-surface hover:border-luxury-borderBold"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-sans font-medium text-luxury-text">
                      {c(occ.labelEn, occ.labelAr)}
                    </span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        active
                          ? "border-accent bg-accent"
                          : "border-luxury-borderBold"
                      }`}
                    >
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-luxury-muted font-sans block">
                    {c(occ.detailEn, occ.detailAr)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Signature Notes Selector (Level Shoes Minimal Chips) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-luxury-border">
            <label className="text-xs font-sans uppercase tracking-[0.16em] text-luxury-text font-medium">
              3. {c("Signature Notes to Prioritize", "نوتات مميزة تفضل حضورها")}
            </label>
            <span className="text-[11px] text-luxury-muted">
              {selectedNotes.length} {c("Selected", "محددة")}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableNotes.map((n) => {
              const selected = selectedNotes.includes(n.slug);
              return (
                <button
                  key={n.slug}
                  type="button"
                  onClick={() => toggleNote(n.slug)}
                  className={`px-3 py-1.5 text-xs font-sans transition-colors border ${
                    selected
                      ? "bg-luxury-text text-luxury-canvas border-luxury-text font-medium shadow-sm"
                      : "bg-luxury-surface border-luxury-border text-luxury-muted hover:text-luxury-text hover:border-luxury-borderBold"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {c(n.nameEn, n.nameAr)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Natural Language Query */}
        <form onSubmit={handleConsult} className="space-y-4 pt-4 border-t border-luxury-border">
          <label className="text-xs font-sans uppercase tracking-[0.16em] text-luxury-text font-medium block">
            4. {c("Add Bespoke Nuances in Plain Language (Optional)", "تفاصيل إضافية بلغتك الطبيعية (اختياري)")}
          </label>
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? "مثال: أريد عطراً دافئاً وغامضاً يدوم ٢٤ ساعة للثوب في المناسبات المسائية بدبي، برائحة اللبان والعود..."
                : "e.g., Seeking a resinous, aristocratic extrait with 24-hour longevity for evening galas in Dubai with Silver Frankincense and honeyed woods..."
            }
            className="w-full p-4 border border-luxury-border bg-luxury-canvas/50 text-luxury-text text-xs sm:text-sm font-sans focus:outline-none focus:border-luxury-borderBold transition-colors resize-none"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-[11px] text-luxury-muted">
              {c(
                "Matched against authenticated GCC warehouse stock",
                "يتم الفحص والمطابقة مع مخزون المستودعات المعتمدة في الخليج",
              )}
            </span>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto px-8"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{c("Analyzing Olfactory Matrix…", "جارٍ التحليل العطري…")}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  <span>{c("Run Scent Sommelier", "بدء الاستشارة العطرية")}</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Results Section (Level Shoes Product Grid Standard) */}
      {result && (
        <div className="space-y-8 max-w-4xl mx-auto pt-4">
          {/* Sommelier Aura Diagnosis Card */}
          <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
              <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-[0.16em] text-accent font-medium">
                <CheckCircle2 size={16} className="text-accent" />
                <span>{result.auraTitle}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-luxury-surface2 text-luxury-text border border-luxury-border">
                {c("2026 Verified Catalog", "خزانة ٢٠٢٦ المعتمدة")}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans leading-relaxed text-luxury-muted">
              {result.analysis}
            </p>
          </div>

          {/* Matched Extrait Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {result.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="border border-luxury-border bg-luxury-surface flex flex-col justify-between hover:border-luxury-borderBold transition-all"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] w-full bg-luxury-surface2 border-b border-luxury-border overflow-hidden flex items-center justify-center">
                  <Image
                    src={rec.image}
                    alt={c(rec.nameEn, rec.nameAr)}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-8"
                  />
                  <div className="absolute top-3 start-3 left-3 rtl:left-auto rtl:right-3">
                    <Badge variant="niche">{rec.brand}</Badge>
                  </div>
                  <div className="absolute top-3 end-3 right-3 rtl:right-auto rtl:left-3">
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider px-2 py-0.5 bg-luxury-surface/95 text-luxury-text border border-luxury-border">
                      {rec.matchPercentage}% {c("Match", "توافق")}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-luxury-muted block">
                      {rec.concentration}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-luxury-text font-normal">
                      {c(rec.nameEn, rec.nameAr)}
                    </h3>
                    <p className="text-xs text-luxury-muted leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {rec.accords.map((a, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 bg-luxury-surface2 text-luxury-text text-[10px] font-sans border border-luxury-border"
                        >
                          ✦ {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-luxury-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-luxury-muted">
                        {c("Retail Price:", "السعر:")}
                      </span>
                      <PriceDisplay price={rec.price} locale={locale} size="md" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleAddToCart(rec)}
                        variant="accent"
                        size="sm"
                        className="w-full flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag size={14} />
                        <span>
                          {addedItemSlug === rec.slug
                            ? c("Added ✓", "تمت الإضافة ✓")
                            : c("Add to Bag", "أضف للحقيبة")}
                        </span>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link href={`/product/${rec.slug}`}>
                          <span>{c("Explore Flacon", "عرض العطر")}</span>
                          <ArrowRight size={13} className="rtl:rotate-180 ms-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Consultation Service Footnote */}
      <div className="border border-luxury-border bg-luxury-surface p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
        <div className="space-y-1 text-center md:text-start">
          <span className="eyebrow text-accent">
            {c("OFFICIAL DISCOVERY SAMPLING", "تجربة العينات الرسمية")}
          </span>
          <h4 className="font-serif text-lg text-luxury-text font-normal">
            {c(
              "Prefer to test these extraits before purchasing?",
              "هل ترغب بتجربة هذه العطور على بشرتك أولاً؟",
            )}
          </h4>
          <p className="text-xs text-luxury-muted max-w-lg">
            {c(
              "Curate a 5 x 2ml discovery box for 280 AED with a 100% redeemable voucher credited towards your full bottle.",
              "صمم صندوق عيناتك المكون من ٥ عينات بـ ٢٨٠ درهم مع قسيمة شرائية مستردة بالكامل بنفس القيمة.",
            )}
          </p>
        </div>

        <Button asChild variant="outline" size="md">
          <Link href="/discover/sets">
            {c("Build Discovery Set", "صمّم مجموعة العينات")} →
          </Link>
        </Button>
      </div>
    </div>
  );
}
