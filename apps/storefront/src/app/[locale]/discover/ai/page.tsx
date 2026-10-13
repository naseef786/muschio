"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "../../../../navigation";
import { Button, Badge, PriceDisplay, NoteChip } from "@muschio/ui";
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";


import { muschioApi } from "../../../../lib/api";

export default function AIScentDiscoveryPage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const [query, setQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<string>("regal");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("evening");
  const [selectedNotes, setSelectedNotes] = useState<string[]>(["silver-frankincense", "cambodian-oud"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const vibes = [
    { id: "regal", labelEn: "Regal & Aristocratic", labelAr: "ملكي وأرستقراطي", icon: "👑" },
    { id: "smoky", labelEn: "Smoky & Resinous", labelAr: "دخاني وصمغي", icon: "🔥" },
    { id: "luminous", labelEn: "Luminous & Saffron", labelAr: "مشرق وزعفراني", icon: "✨" },
    { id: "velvet", labelEn: "Velvet Rose & Oud", labelAr: "ورد مخملي وعود", icon: "🌹" },
    { id: "fresh", labelEn: "Crisp Citrus & Woods", labelAr: "حمضي وخشبي منعش", icon: "🍃" },
  ];

  const occasions = [
    { id: "evening", labelEn: "Evening Galas & Weddings", labelAr: "أمسيات ملكية ومناسبات خاصة" },
    { id: "daily", labelEn: "Daily Signature Scent", labelAr: "توقيع يومي فاخر" },
    { id: "intimate", labelEn: "Intimate Dinner", labelAr: "عشاء هادئ وخاص" },
    { id: "business", labelEn: "Executive Boardroom", labelAr: "اجتماعات أعمال راقية" },
  ];

  const availableNotes = [
    { nameEn: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", slug: "taif-rose" },
    { nameEn: "Silver Frankincense", nameAr: "اللبان الحوجري الفضي", slug: "silver-frankincense" },
    { nameEn: "Cambodian Oud", nameAr: "دهن عود كمبودي معتق", slug: "cambodian-oud" },
    { nameEn: "Florentine Iris", nameAr: "سوسن فلورنسا النادر", slug: "florentine-iris" },
    { nameEn: "Golden Ambergris", nameAr: "عنبر أشهب طبيعي", slug: "golden-ambergris" },
    { nameEn: "Madagascar Vanilla", nameAr: "فانيليا بوربون سوداء", slug: "bourbon-vanilla" },
    { nameEn: "Tuscan Leather", nameAr: "جلود توسكانا", slug: "tuscan-leather" },
    { nameEn: "Kashmiri Saffron", nameAr: "زعفران كشميري", slug: "kashmiri-saffron" },
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
        query: query.trim() || `Atmosphere: ${selectedVibe}, Occasion: ${selectedOccasion}`,
        preferredNotes: selectedNotes,
        excludedNotes: [],
        preferredFamilies: [],
        locale,
      });

      if (apiRes && apiRes.recommendations.length > 0) {
        setResult({
          auraTitle: (apiRes as any).auraTitleAr && isAr 
            ? (apiRes as any).auraTitleAr 
            : (apiRes as any).auraTitleEn && !isAr 
            ? (apiRes as any).auraTitleEn 
            : isAr ? "الهالة العطرية المخصصة لك" : "Your Bespoke Olfactory Aura",
          analysis: isAr ? apiRes.analysisAr : apiRes.analysisEn,
          recommendations: apiRes.recommendations.map((rec) => ({
            slug: rec.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            nameEn: rec.productName,
            nameAr: rec.productName,
            brand: rec.brandName,
            concentration: "Extrait de Parfum",
            price: 0,
            matchPercentage: rec.matchPercentage,
            image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
            reason: isAr ? rec.matchReasonAr : rec.matchReasonEn,
            accords: rec.accordOverlap,
          })),
        });
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback
    }

    // Do not fabricate personalized recommendations on API failure.
    setResult({ error: isAr ? "تعذر الاتصال بمستشار العطور حالياً. حاول مرة أخرى لاحقاً." : "The scent advisor is currently unavailable. Please try again later.", recommendations: [] });
    setLoading(false);
    return;
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Background glowing orbs */}
      <div className="ambient-glow-gold top-10 start-10" />
      <div className="ambient-glow-crimson top-[600px] end-10" />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-accent text-xs font-sans uppercase tracking-[0.2em] font-bold shadow-sm">
          <Sparkles size={14} className="animate-spin" />
          <span>{isAr ? "المستشار العطري بالذكاء الاصطناعي" : "DeepSeek AI Sommelier Engine"}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-zinc-950 dark:text-white font-light leading-tight">
          {isAr ? (
            <>
              اكتشف توقيعك العطري <span className="luxury-gradient-text font-normal italic">الملكي</span>
            </>
          ) : (
            <>
              Bespoke Haute <span className="luxury-gradient-text font-normal italic">Scent Sommelier</span>
            </>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed max-w-2xl mx-auto">
          {isAr
            ? "أجب عن تفضيلاتك أو صف مناسبتك باللغة الطبيعية. يقوم نظامنا بتحليل كيمياء النوتات والهرم العطري لمطابقتها مع أندر الخلاصات المعتمدة."
            : "Select your olfactory persona or describe your mood in natural English or Arabic. Our engine matches notes, pyramids, and regional sillage against authenticated catalog SKUs."}
        </p>
      </div>

      {/* Interactive Consultation Glass Dashboard */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 border border-white/20 shadow-2xl">
        {/* Step 1: Vibe / Mood Selector */}
        <div className="space-y-3">
          <label className="text-xs font-sans uppercase tracking-widest text-gold font-bold flex items-center gap-2">
            <span>1. {isAr ? "اختر الطابع العطري المفضل:" : "Select Your Desired Olfactory Vibe:"}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {vibes.map((v) => {
              const active = selectedVibe === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVibe(v.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    active
                      ? "border-gold bg-gold/20 text-zinc-950 dark:text-white ring-1 ring-gold shadow-md font-semibold"
                      : "glass-pill text-zinc-700 dark:text-zinc-300 hover:border-gold/40"
                  }`}
                >
                  <span className="text-xl block mb-1">{v.icon}</span>
                  <span className="text-xs font-sans block">{isAr ? v.labelAr : v.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Occasion */}
        <div className="space-y-3">
          <label className="text-xs font-sans uppercase tracking-widest text-gold font-bold">
            2. {isAr ? "المناسبة والاستخدام:" : "Intended Occasion & Sillage Context:"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {occasions.map((occ) => {
              const active = selectedOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`p-3.5 rounded-xl border text-start transition-all ${
                    active
                      ? "border-gold bg-gold/20 text-zinc-950 dark:text-white ring-1 ring-gold shadow-md"
                      : "glass-pill text-zinc-700 dark:text-zinc-300 hover:border-gold/40"
                  }`}
                >
                  <span className="text-xs font-sans font-medium">{isAr ? occ.labelAr : occ.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Signature Notes Selector */}
        <div className="space-y-3">
          <label className="text-xs font-sans uppercase tracking-widest text-gold font-bold">
            3. {isAr ? "حدد النوتات والمكونات التي تعشقها:" : "Highlight Signature Notes You Desire:"}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableNotes.map((n) => {
              const selected = selectedNotes.includes(n.slug);
              return (
                <NoteChip
                  key={n.slug}
                  name={isAr ? n.nameAr : n.nameEn}
                  selected={selected}
                  locale={locale}
                  onClick={() => toggleNote(n.slug)}
                />
              );
            })}
          </div>
        </div>

        {/* Step 4: Natural Language Query */}
        <form onSubmit={handleConsult} className="space-y-4 pt-2 border-t border-white/10">
          <label className="text-xs font-sans uppercase tracking-widest text-gold font-bold block">
            4. {isAr ? "أضف تفاصيل مخصصة (اختياري):" : "Add Bespoke Nuances in Plain Language (Optional):"}
          </label>
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? "مثال: أريد عطراً دافئاً وغامضاً يدوم 24 ساعة للثوب في المناسبات المسائية بدبي، برائحة اللبان والعود..."
                : "e.g., Seeking a resinous, aristocratic extrait with 24-hour longevity for evening galas in Dubai with Silver Frankincense and honeyed woods..."
            }
            className="w-full p-4 rounded-2xl glass-input text-xs sm:text-sm font-sans resize-none"
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto shadow-xl hover:scale-105 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin" />
                  <span>{isAr ? "جاري التحليل والتركيب العصبي..." : "Synthesizing Olfactory Matrix..."}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  <span>{isAr ? "بدء التشخيص العطري الذكي" : "Run AI Scent Consultation"}</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result?.error && <p role="alert" className="text-sm text-red-400">{result.error}</p>}
      {result && !result.error && (
        <div className="space-y-8 animate-slide-up">
          {/* Aura Analysis Card */}
          <div className="glass-panel p-8 rounded-3xl border border-gold/40 text-zinc-950 dark:text-white space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-gold font-bold">
                <CheckCircle2 size={18} className="text-gold" />
                <span>{result.auraTitle}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                Grounded 2026 Vault
              </span>
            </div>
            <p className="text-xs sm:text-sm font-sans leading-relaxed text-zinc-700 dark:text-zinc-300">
              {result.analysis}
            </p>
          </div>

          {/* Matched Extrait Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {result.recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-white/20 shadow-xl"
              >
                <div className="relative h-80 w-full bg-zinc-950 overflow-hidden">
                  <Image src={rec.image} alt={rec.nameEn} fill className="object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 start-4">
                    <Badge variant="niche">{rec.brand}</Badge>
                  </div>
                  <div className="absolute top-4 end-4">
                    <span className="px-3 py-1 rounded-full bg-gold text-zinc-950 font-sans text-xs font-bold tracking-wider shadow-lg">
                      {rec.matchPercentage}% {isAr ? "توافق" : "Match"}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-bold">
                      {rec.concentration}
                    </span>
                    <h3 className="font-serif text-2xl text-zinc-950 dark:text-white font-light">
                      {isAr ? rec.nameAr : rec.nameEn}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {rec.accords.map((a: string, aIdx: number) => (
                        <span
                          key={aIdx}
                          className="px-2.5 py-1 rounded-full glass-panel-subtle text-[10px] text-gold font-sans font-medium"
                        >
                          ✦ {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <PriceDisplay price={rec.price} locale={locale} />
                    <Button asChild size="md" variant="gold">
                      <Link href={`/product/${rec.slug}`}>{isAr ? "اكتشف العطر" : "Explore Flacon"} →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
