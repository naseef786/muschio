"use client";

import React, { useState } from "react";
import { Link } from "../../../navigation";
import { Badge, Button } from "@muschio/ui";
import {
  Sparkles,
  Droplets,
  Wind,
  Layers,
  Thermometer,
  Gift,
  Compass,
} from "lucide-react";

export default function FragranceGuidePage({
  params: { locale },
}: {
  params: { locale: "en" | "ar" };
}) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<string>("pyramid");

  const modules = [
    {
      id: "pyramid",
      icon: Layers,
      titleEn: "The Olfactory Pyramid",
      titleAr: "الهرم العطري وتشريح العطر",
      summaryEn: "Understanding how fragrance notes evaporate over time: Top, Heart, and Base.",
      summaryAr: "كيف تتبخر النوتات العطرية بمرور الوقت: الافتتاحية، قلب العطر، وقاعدته الثابتة.",
    },
    {
      id: "families",
      icon: Compass,
      titleEn: "The Scent Families",
      titleAr: "العائلات العطرية الرئيسية",
      summaryEn: "From Amber Orientals to Noble Leathers and Resinous Woods.",
      summaryAr: "من العطور الشرقية العنبرية إلى الجلود النبيلة والأخشاب الصمغية الفاخرة.",
    },
    {
      id: "concentration",
      icon: Droplets,
      titleEn: "Concentration & Maceration",
      titleAr: "التركيز ونسب الزيوت النقية",
      summaryEn: "Why Extrait de Parfum (30%–53%) behaves differently on skin and in high heat.",
      summaryAr: "لماذا تختلف خلاصات إكستري دو بارفان (30%–53%) على البشرة وفي الأجواء الحارة.",
    },
    {
      id: "climate",
      icon: Thermometer,
      titleEn: "GCC Climate & Longevity",
      titleAr: "طقس الخليج وثبات العطور",
      summaryEn: "Secrets for monolithic sillage in air conditioning and summer humidity.",
      summaryAr: "أسرار الفوحان الملكي والثبات في الأماكن المكيفة والطقس الرطب.",
    },
    {
      id: "layering",
      icon: Wind,
      titleEn: "The Royal Art of Layering",
      titleAr: "فن المزج والتعطير الخليجي",
      summaryEn: "Traditional layering of pure Dehn Al Oud, Taif Rose attars, and high extraits.",
      summaryAr: "طقوس مزج دهن العود المعتق مع ورد الطائف ورش الخلاصات المركزة.",
    },
    {
      id: "sampling",
      icon: Gift,
      titleEn: "The Art of Sampling",
      titleAr: "كيفية اختبار العينات باحترافية",
      summaryEn: "Testing 2ml discovery vials across 12-hour maceration periods before purchase.",
      summaryAr: "اختبار عينات الـ 2 مل على البشرة لـ 12 ساعة لاكتشاف تطور الهالة العطرية.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* 1. HERO */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 text-gold text-xs font-sans uppercase tracking-[0.25em] font-semibold">
          <Sparkles size={14} />
          <span>{isAr ? "دليل دار موسكيو للعطور الفاخرة" : "Muschio Haute Parfumerie Compendium"}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-zinc-900 dark:text-zinc-100 font-light leading-tight">
          {isAr
            ? "فن وعلوم العطور النيش: دليلك لاقتناء العطر المثالي"
            : "The Art & Science of Haute Parfumerie: The Collector's Guide"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
          {isAr
            ? "دليل شامل وموثوق صممه خبراؤنا العطريون لشرح تشريح النوتات، وفهم التركيزات الملكية، وأسرار ثبات العطور في مناخ الخليج العربي، مع روابط مباشرة لمجموعاتنا المعتمدة."
            : "An authoritative guide crafted by master evaluators exploring olfactory architecture, extrait concentrations, climate performance in the Arabian Gulf, and the art of confident acquisition."}
        </p>
      </section>

      {/* 2. NAVIGATION PILLS */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-4 flex flex-wrap gap-2">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-sans uppercase tracking-wider transition-all ${
                activeTab === m.id
                  ? "bg-accent text-white font-semibold shadow-sm"
                  : "bg-luxury-canvas border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
              }`}
            >
              <Icon size={14} />
              <span>{isAr ? m.titleAr : m.titleEn}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE MODULE DISPLAY */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 sm:p-12 space-y-12">
        {activeTab === "pyramid" && (
          <div className="space-y-10">
            <div className="space-y-3">
              <Badge variant="gold">{isAr ? "المستوى الأول" : "Chapter 1"}</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
                {isAr ? "الهرم العطري: رحلة تطور النوتات على البشرة" : "The Olfactory Pyramid: Evolution on Skin"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-2xl leading-relaxed">
                {isAr
                  ? "العطر كائن حي يتفاعل مع حرارة البشرة والأكسجين، وينقسم إلى 3 مراحل كلاسيكية تتلاشى وفق سرعة تطاير جزيئاتها العطرية."
                  : "A masterwork fragrance is a dynamic composition that unfurls over hours as molecules of varying molecular weights evaporate from your pulse points."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-3">
                <span className="text-xs font-mono font-bold text-accent">01. TOP NOTES (0 - 30 MIN)</span>
                <h4 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">
                  {isAr ? "النوتات العليا (الافتتاحية)" : "The Awakening (Opening)"}
                </h4>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  {isAr
                    ? "أسرع الجزيئات تطايراً. تمنح الانطباع الأول المشرق، مثل البرغموت الإيطالي، الجريب فروت، وحبوب الهيل الأخضر."
                    : "The most volatile molecules that create the brilliant opening flourish: Calabrian bergamot, pink pepper, and green cardamom."}
                </p>
                <Link href="/notes" className="text-xs text-accent hover:underline inline-block pt-2">
                  {isAr ? "استكشف نوتات الافتتاحية ←" : "Explore Top Notes →"}
                </Link>
              </div>

              <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-3">
                <span className="text-xs font-mono font-bold text-gold">02. HEART NOTES (30 MIN - 4 HOURS)</span>
                <h4 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">
                  {isAr ? "قلب العطر (الهوية)" : "The Heart Accord (Identity)"}
                </h4>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  {isAr
                    ? "جوهر العطر وشخصيته الحقيقية. خلاصات ورد الطائف الملكي، سوسن فلورنسا، واللبان الحوجري الفضي."
                    : "The true character and emotional signature: Royal Taif Rose, Florentine Iris, and Silver Frankincense."}
                </p>
                <Link href="/notes/taif-rose" className="text-xs text-accent hover:underline inline-block pt-2">
                  {isAr ? "استكشف ورد الطائف ←" : "Explore Royal Taif Rose →"}
                </Link>
              </div>

              <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-3">
                <span className="text-xs font-mono font-bold text-zinc-400">03. BASE NOTES (4 - 24+ HOURS)</span>
                <h4 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">
                  {isAr ? "قاعدة العطر (الثبات والفوحان)" : "The Foundation (Base & Sillage)"}
                </h4>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  {isAr
                    ? "أثقل الجزيئات وأطولها عمراً. دهن العود الكمبودي المعتق، العنبر الأشهب الطبيعي، وفانيليا بوربون."
                    : "Dense, enduring fixatives that anchor the perfume to garments and skin: aged Cambodian oud, ambergris, and leathers."}
                </p>
                <Link href="/notes/cambodian-oud" className="text-xs text-accent hover:underline inline-block pt-2">
                  {isAr ? "استكشف العود الكمبودي ←" : "Explore Cambodian Oud →"}
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "concentration" && (
          <div className="space-y-10">
            <div className="space-y-3">
              <Badge variant="gold">{isAr ? "علم التركيز" : "Oil Concentrations"}</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
                {isAr ? "مستويات التركيز وفترة التعتيق (Maceration)" : "Concentration Hierarchy & Sillage"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-2xl leading-relaxed">
                {isAr
                  ? "الفرق بين العطر التجاري والخلاصة النيش يكمن في نقاء الزيوت الطبيعية وزمن التعتيق في براميل خشبية محكمة."
                  : "The monumental distinction between mainstream spray and niche extraits lies in oil ratio and months of uninterrupted barrel maceration."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-2">
                <span className="text-xs font-mono text-zinc-400">EDT (5-15%)</span>
                <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">Eau de Toilette</h4>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {isAr ? "ثبات 3-5 ساعات. منعش وخفيف للأجواء الصباحية السريعة." : "3-5 hours longevity. Airy morning freshness."}
                </p>
              </div>

              <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-2">
                <span className="text-xs font-mono text-zinc-400">EDP (15-20%)</span>
                <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">Eau de Parfum</h4>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {isAr ? "ثبات 6-10 ساعات. معيار الفخامة اليومية الأكثر انتشاراً." : "6-10 hours longevity. Standard luxury daytime benchmark."}
                </p>
              </div>

              <div className="p-5 border border-gold/40 bg-luxury-canvas space-y-2">
                <span className="text-xs font-mono text-gold font-bold">PARFUM (20-30%)</span>
                <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">Pure Parfum</h4>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {isAr ? "ثبات 12-16 ساعة. هالة مخملية كثيفة وثبات هائل." : "12-16 hours longevity. Intoxicating close-range majesty."}
                </p>
              </div>

              <div className="p-5 border-2 border-accent bg-accent/5 dark:bg-accent/10 space-y-2">
                <span className="text-xs font-mono text-accent font-bold">EXTRAIT (30-53%)</span>
                <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">Extrait de Parfum</h4>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {isAr
                    ? "ثبات 24+ ساعة. تركيز ملكي معتق 6 أشهر، مثل إنترلود 53 مان."
                    : "24+ hours monolithic sillage. Macerated for 6 months (e.g. Interlude 53)."}
                </p>
              </div>
            </div>

            <div className="p-6 border border-gold/30 bg-gold/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-start">
                <h4 className="font-serif text-lg text-zinc-900 dark:text-zinc-100">
                  {isAr ? "تحفة التركيز الملكي: إنترلود 53 مان (53%)" : "Featured Monumental Extrait: Interlude 53 (53%)"}
                </h4>
                <p className="text-xs text-zinc-500 font-sans">
                  {isAr ? "معتق في سلطنة عُمان بتركيز 53% لثبات يدوم لأيام على الثوب." : "Formulated at 53% concentration for monolithic endurance."}
                </p>
              </div>
              <Button asChild variant="accent" size="sm">
                <Link href="/product/amouage-interlude-53-man">
                  {isAr ? "اكتشف العطر" : "Discover Extrait"}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {activeTab === "climate" && (
          <div className="space-y-8">
            <div className="space-y-3">
              <Badge variant="gold">{isAr ? "مناخ الخليج" : "GCC High-Heat Mastery"}</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
                {isAr ? "كيف تحافظ على فوحان عالي في طقس الخليج؟" : "Mastering Sillage in Arabian Heat & Humidity"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-2xl leading-relaxed">
                {isAr
                  ? "تتطلب حرارة الصيف والمكيفات في الخليج عطوراً تعتمد على الراتنجات الطبيعية الثقيلة واللبان والعنبر لضمان عدم تبخر العطر خلال ساعات قليلة."
                  : "Extreme outdoor heat contrasted with intense indoor air conditioning demands heavy natural resins, ambergris, and ouds that resist rapid evaporation."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-3">
                <h4 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">
                  {isAr ? "1. التركيز على نقاط النبض والملابس" : "1. Pulse Points & Fabric Attachment"}
                </h4>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  {isAr
                    ? "رش العطر على الياقة وأطراف الأكمام يحميه من حرارة البشرة المباشرة ويجعله يفوح بنعومة في الغرف المكيفة طوال اليوم."
                    : "Misting collar and cuffs prevents excessive perspiration evaporation while radiating softly in air-conditioned councils."}
                </p>
              </div>

              <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-luxury-canvas space-y-3">
                <h4 className="font-serif text-xl text-zinc-900 dark:text-zinc-100">
                  {isAr ? "2. اختيار قواعد اللبان والعود الصمغي" : "2. Choose Resinous Frankincense Bases"}
                </h4>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  {isAr
                    ? "اللبان الحوجري ودهن العود النقي يزدادان تألقاً ودفئاً في الطقس الحار بدلاً من التحلل السريع."
                    : "Hojari frankincense and natural agarwood thrive under heat, unfurling deeper honeyed layers rather than souring."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sampling" && (
          <div className="space-y-8">
            <div className="space-y-3">
              <Badge variant="gold">{isAr ? "التجربة الذكية" : "Discovery Set Box"}</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100">
                {isAr ? "بروتوكول اختبار العينات الرسمية 2 مل" : "The 2ml Sample Tasting Protocol"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-2xl leading-relaxed">
                {isAr
                  ? "لا تحكم أبداً على عطر نيش من الرشة الأولى على الورق. جربه على معصمك، وامنحه 30 دقيقة لاكتمال جفاف الافتتاحية وظهور قلب العطر."
                  : "Never judge a monumental niche extrait on paper strip. Test on bare skin, allowing 30 minutes for heart notes to emerge before forming your evaluation."}
              </p>
            </div>

            <div className="p-8 border border-gold/40 bg-luxury-canvas flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
                  {isAr ? "صمم صندوق عيناتك الخاص (5 × 2 مل)" : "Curate Your Bespoke 5x2ml Box"}
                </h3>
                <p className="text-xs text-zinc-500 font-sans max-w-lg">
                  {isAr
                    ? "اختر 5 عينات نيش نادرة بقيمة 290 درهم واحصل على قسيمة خصم 100% مستردة عند شراء أي زجاجة كاملة."
                    : "Choose 5 rare vials for 290 AED with a 100% redeemable voucher credited toward your next full-bottle purchase."}
                </p>
              </div>

              <Button asChild variant="gold" size="lg">
                <Link href="/discover/sets">
                  {isAr ? "ابدأ تصميم الصندوق" : "Build Box Now"}
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {(activeTab === "families" || activeTab === "layering") && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100">
              {activeTab === "families"
                ? isAr ? "العائلات العطرية الخالدة" : "The Olfactory Families"
                : isAr ? "فن المزج الملكي والطبقات" : "The Royal Art of Scent Layering"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-sans max-w-xl">
              {isAr
                ? "في التقاليد الخليجية، يتم مزج دهن العود المعتق على نقاط النبض مع رش خلاصة الورد الطائفي أو الفانيليا لتكوين بصمة عطرية فريدة لا تتكرر."
                : "In Gulf tradition, aged agarwood attar is warmed on wrists and collar before layering with a regal rose or smoky incense extrait."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/notes">{isAr ? "استكشف مكتبة النوتات" : "Explore Notes Library"}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* 4. CONTEXTUAL SHOPPING CALLOUT */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-start">
          <h3 className="font-serif text-2xl text-zinc-900 dark:text-zinc-100">
            {isAr ? "هل تبحث عن استشارة عطرية مخصصة؟" : "Seeking Bespoke Scent Recommendations?"}
          </h3>
          <p className="text-xs text-zinc-500 font-sans">
            {isAr
              ? "استخدم مستشار العطور الذكي المدعوم بالذكاء الاصطناعي لمطابقة تفضيلاتك مع منتجات خزانة موسكيو الحقيقية."
              : "Consult our DeepSeek-powered sommelier to match your mood and preferred notes to authentic catalog SKUs."}
          </p>
        </div>

        <Button asChild variant="accent" size="lg">
          <Link href="/discover/ai" className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>{isAr ? "استشر الخبير الذكي" : "AI Scent Consultation"}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
