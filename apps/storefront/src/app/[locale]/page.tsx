"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "../../navigation";
import {
  Button,
  PriceDisplay,
  NoteChip,
  InstallmentBadge,
} from "@muschio/ui";
import {
  Sparkles,
  Compass,
  ShieldCheck,
  Truck,
  Award,
  Flame,
  Eye,
  ShoppingBag,
  Check,
  Star,
  X,
} from "lucide-react";

// Curated interactive luxury catalogue
const FEATURED_EXTRAITS = [
  {
    id: "amouage-interlude-53-man",
    slug: "amouage-interlude-53-man",
    nameEn: "Interlude 53 Man Extrait de Parfum",
    nameAr: "إنترلود 53 مان إكستري دو بارفان",
    brand: "Amouage",
    concentration: "Extrait de Parfum (53%)",
    mood: "evening",
    rating: 4.95,
    reviews: 148,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "100ml Extrait", price: 1850, compareAt: 2100 },
      { size: "50ml Extrait", price: 1190, compareAt: null },
      { size: "2ml Official Sample", price: 65, compareAt: null },
    ],
    notes: [
      { name: "Silver Frankincense", nameAr: "اللبان الفضي", position: "HEART" as const },
      { name: "Cambodian Oud", nameAr: "دهن عود كمبودي", position: "BASE" as const },
      { name: "Pimento Berry", nameAr: "توت البيمنتو", position: "TOP" as const },
    ],
    topNote: "Pimento & Oregano",
    heartNote: "Silver Frankincense & Cistus",
    baseNote: "Aged Cambodian Agarwood & Leather",
    sillage: "Monolithic & Regal",
    longevity: "24+ Hours",
  },
  {
    id: "mfk-baccarat-rouge-540-extrait",
    slug: "mfk-baccarat-rouge-540-extrait",
    nameEn: "Baccarat Rouge 540 Extrait de Parfum",
    nameAr: "باكارات روج 540 إكستري دو بارفان",
    brand: "Maison Francis Kurkdjian",
    concentration: "Extrait de Parfum",
    mood: "intimate",
    rating: 4.98,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "200ml Extrait", price: 3450, compareAt: 3800 },
      { size: "70ml Extrait", price: 1650, compareAt: null },
      { size: "2ml Official Sample", price: 60, compareAt: null },
    ],
    notes: [
      { name: "Kashmiri Saffron", nameAr: "زعفران كشمير", position: "TOP" as const },
      { name: "Grandiflorum Jasmine", nameAr: "ياسمين مصري", position: "HEART" as const },
      { name: "Ambergris", nameAr: "عنبر أشهب", position: "BASE" as const },
    ],
    topNote: "Bitter Almond & Kashmiri Saffron",
    heartNote: "Egyptian Jasmine Grandiflorum & Cedar",
    baseNote: "Ambergris & Woody Musk",
    sillage: "Radiant & Intoxicating",
    longevity: "18-24 Hours",
  },
  {
    id: "xerjoff-alexandria-ii",
    slug: "xerjoff-alexandria-ii",
    nameEn: "Alexandria II Eau de Parfum",
    nameAr: "ألكسندريا 2 أو دي بارفان",
    brand: "Xerjoff",
    concentration: "Parfum Extrait",
    mood: "leather",
    rating: 4.92,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "100ml Parfum", price: 2200, compareAt: 2450 },
      { size: "50ml Parfum", price: 1350, compareAt: null },
      { size: "2ml Official Sample", price: 75, compareAt: null },
    ],
    notes: [
      { name: "Laos Oud 1988", nameAr: "عود لاوسي 1988", position: "BASE" as const },
      { name: "Bulgarian Rose", nameAr: "ورد بلغاري", position: "HEART" as const },
      { name: "Palisander Rosewood", nameAr: "خشب الورد", position: "TOP" as const },
    ],
    topNote: "Palisander Rosewood, Lavender & Apple",
    heartNote: "Bulgarian Rose, Lily of the Valley & Cedar",
    baseNote: "Aged 1988 Laos Oud, Sandalwood & Amber",
    sillage: "Aristocratic Sillage",
    longevity: "20+ Hours",
  },
  {
    id: "roja-amber-aoud-crystal",
    slug: "amouage-interlude-53-man",
    nameEn: "Amber Aoud Crystal Extrait",
    nameAr: "عنبر عود كريستال إكستري",
    brand: "Roja Parfums",
    concentration: "Pure Parfum Extrait",
    mood: "desert",
    rating: 4.96,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=85",
    variants: [
      { size: "100ml Crystal", price: 2950, compareAt: 3200 },
      { size: "2ml Official Sample", price: 85, compareAt: null },
    ],
    notes: [
      { name: "Royal Taif Rose", nameAr: "ورد الطائف الملكي", position: "HEART" as const },
      { name: "Sultanate Oud", nameAr: "عود سلطاني", position: "BASE" as const },
      { name: "Lime & Bergamot", nameAr: "ليمون وبرغموت", position: "TOP" as const },
    ],
    topNote: "Lime, Bergamot & Lemon",
    heartNote: "Royal Taif Rose, Jasmine & Ylang Ylang",
    baseNote: "Sultanate Oud, Birch, Ambergris & Musk",
    sillage: "Opulent Projection",
    longevity: "24 Hours",
  },
];

export default function HomePage({ params: { locale } }: { params: { locale: "en" | "ar" } }) {
  const router = useRouter();
  const isAr = locale === "ar";

  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [activeSniffModal, setActiveSniffModal] = useState<any | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({
    "amouage-interlude-53-man": 0,
    "mfk-baccarat-rouge-540-extrait": 1,
    "xerjoff-alexandria-ii": 0,
    "roja-amber-aoud-crystal": 0,
  });
  const [addedState, setAddedState] = useState<Record<string, boolean>>({});

  const moods = [
    { id: "all", labelEn: "All Extraits", labelAr: "كافة العطور" },
    { id: "evening", labelEn: "Royal Evening Gala", labelAr: "أمسيات ملكية" },
    { id: "intimate", labelEn: "Intimate Extrait", labelAr: "خلاصات حميمية" },
    { id: "desert", labelEn: "Desert Incense", labelAr: "بخور وعنبر صحراوي" },
    { id: "leather", labelEn: "Aristocratic Leather", labelAr: "جلود نادرة" },
  ];

  const filteredProducts =
    selectedMood === "all"
      ? FEATURED_EXTRAITS
      : FEATURED_EXTRAITS.filter((p) => p.mood === selectedMood || selectedMood === "all");

  const handleQuickAdd = (prodId: string) => {
    setAddedState({ ...addedState, [prodId]: true });
    setTimeout(() => {
      setAddedState((prev) => ({ ...prev, [prodId]: false }));
    }, 2000);
  };

  return (
    <div className="relative pb-32 overflow-hidden">
      {/* Ambient background glowing orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="ambient-glow-gold top-20 start-10" />
        <div className="ambient-glow-crimson top-[800px] end-5" />
        <div className="ambient-glow-amber top-[1800px] start-1/3" />
      </div>

      {/* 1. ULTRA-GLASS HERO BANNER */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=85"
            alt="Muschio Luxury Haute Parfumerie"
            fill
            priority
            className="object-cover object-center opacity-30 dark:opacity-20 scale-105 filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxury-canvas/60 to-luxury-canvas z-0" />
        </div>

        <div className="relative z-10 max-w-5xl text-center space-y-8 animate-fade-in">
          {/* Top Glass Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 glass-pill text-xs font-sans uppercase tracking-[0.25em] text-zinc-900 dark:text-zinc-100 shadow-glass">
            <Sparkles size={14} className="text-gold animate-pulse" />
            <span className="font-medium">
              {isAr ? "المجموعة الملكية للشرق الأوسط 2026" : "Middle East Haute Parfumerie Vault 2026"}
            </span>
          </div>

          {/* Majestic Heading */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[1.02] font-light text-zinc-950 dark:text-white">
            {isAr ? (
              <>
                سيمفونية من <span className="luxury-gradient-text font-normal italic">أندر الخلاصات</span>
              </>
            ) : (
              <>
                The Poetry of <span className="luxury-gradient-text font-normal italic">Rare Essences</span>
              </>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-xl text-zinc-600 dark:text-zinc-300 font-sans font-light leading-relaxed">
            {isAr
              ? "عطور نيش نقية وإكستري دي بارفان صُنعت يدوياً من أرقى دور العطور الملكية والمستقلة في العالم، مع خدمة التوصيل الخاص السريع في نفس اليوم بدبي."
              : "Handcrafted extraits de parfum, vintage aged attars, and bespoke niche creations curated with White-Glove VIP Same-Day Courier across Dubai."}
          </p>

          {/* Interactive CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="gold"
              className="w-full sm:w-auto text-sm tracking-widest shadow-glass-glow hover:scale-105 transition-all"
            >
              <Link href="/shop">{isAr ? "استكشف الخزانة الملكية" : "Explore The Vault"}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto glass-pill border-white/20 text-sm tracking-wider hover:border-gold/50"
            >
              <Link href="/discover/ai" className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span>{isAr ? "المستشار العطري الذكي" : "AI Scent Sommelier"}</span>
              </Link>
            </Button>
          </div>

          {/* Floating Glass Telemetry Stats */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              {
                icon: <Award size={16} className="text-gold" />,
                title: isAr ? "100% أصالة معتمدة" : "100% Certified Allocations",
                subtitle: isAr ? "تخصيص رسمي مباشر" : "Direct from European Maisons",
              },
              {
                icon: <Truck size={16} className="text-gold" />,
                title: isAr ? "توصيل VIP دبي" : "VIP Same-Day Dubai",
                subtitle: isAr ? "بسيارات مبردة خاصة" : "Chilled 14°C Transport",
              },
              {
                icon: <Flame size={16} className="text-gold" />,
                title: isAr ? "تعتيق مركز حتى 53%" : "Up to 53% Extrait Oils",
                subtitle: isAr ? "فوحان يدوم 24+ ساعة" : "24+ Hour Sillage Guarantee",
              },
              {
                icon: <ShieldCheck size={16} className="text-gold" />,
                title: isAr ? "تقسيط تابي وتمارا" : "Tabby & Tamara 4x",
                subtitle: isAr ? "بدون أي فوائد" : "0% Interest Installments",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-xl text-center space-y-1 hover:border-gold/40 transition-all group"
              >
                <div className="mx-auto w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="font-serif text-xs sm:text-sm font-medium text-zinc-950 dark:text-white">
                  {stat.title}
                </div>
                <div className="text-[10px] font-sans text-zinc-500 dark:text-zinc-400">
                  {stat.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content sections container with controlled spacing */}
      <div className="space-y-28 md:space-y-36 mt-28 md:mt-36">
        {/* 2. INTERACTIVE OLFACTORY MOOD NAVIGATOR & VAULT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-zinc-200/60 dark:border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent font-semibold flex items-center gap-1.5">
              <Compass size={12} />
              <span>{isAr ? "الاستكشاف التفاعلي" : "Curated Haute Selection"}</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-zinc-950 dark:text-white font-light">
              {isAr ? "أيقونات الفخامة المعتقة" : "Masterpiece Extraits"}
            </h2>
          </div>

          {/* Interactive Mood Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => {
              const active = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`px-4 py-2 rounded-full text-xs font-sans transition-all duration-300 backdrop-blur-md cursor-pointer ${
                    active
                      ? "bg-gold text-zinc-950 font-semibold shadow-md ring-2 ring-gold/40 scale-105"
                      : "glass-pill text-zinc-700 dark:text-zinc-300 hover:text-gold hover:border-gold/40"
                  }`}
                >
                  {isAr ? m.labelAr : m.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D-Tilt Glassmorphic Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentVariantIdx = selectedVariants[product.id] ?? 0;
            const currentVariant = product.variants[currentVariantIdx] || product.variants[0]!;
            const isAdded = addedState[product.id];

            return (
              <div
                key={product.id}
                className="group glass-card rounded-2xl overflow-hidden flex flex-col justify-between relative transition-all duration-500 hover:-translate-y-2 border border-white/60 dark:border-white/[0.08]"
              >
                {/* Image & Badges */}
                <div className="relative h-80 w-full overflow-hidden bg-zinc-950">
                  <Image
                    src={product.image}
                    alt={product.nameEn}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B101B] via-transparent to-transparent opacity-80" />

                  {/* Brand Badge */}
                  <div className="absolute top-3 start-3">
                    <span className="px-3 py-1 rounded-full glass-pill text-[10px] font-sans font-bold tracking-wider text-gold border border-gold/30">
                      {product.brand}
                    </span>
                  </div>

                  {/* Quick Sniff Button Overlay */}
                  <button
                    onClick={() => setActiveSniffModal(product)}
                    className="absolute bottom-3 end-3 px-3 py-1.5 rounded-full glass-panel text-[11px] font-sans text-zinc-200 hover:text-white hover:border-gold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  >
                    <Eye size={13} className="text-gold" />
                    <span>{isAr ? "استكشاف النوتات" : "Quick Sniff"}</span>
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{product.concentration}</span>
                      <span className="flex items-center gap-1 text-gold font-bold">
                        <Star size={11} fill="currentColor" />
                        {product.rating}
                      </span>
                    </div>

                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-serif text-lg font-medium text-zinc-950 dark:text-white group-hover:text-gold transition-colors leading-snug">
                        {isAr ? product.nameAr : product.nameEn}
                      </h3>
                    </Link>

                    {/* Interactive Note Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {product.notes.map((n, idx) => (
                        <NoteChip
                          key={idx}
                          name={isAr ? n.nameAr : n.name}
                          position={n.position}
                          locale={locale}
                          onClick={() => setActiveSniffModal(product)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Interactive Size Variant Pills */}
                  <div className="pt-2 border-t border-zinc-200/50 dark:border-white/10 space-y-3">
                    <div className="flex gap-1.5">
                      {product.variants.map((v, vIdx) => (
                        <button
                          key={vIdx}
                          onClick={() =>
                            setSelectedVariants({ ...selectedVariants, [product.id]: vIdx })
                          }
                          className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-sans transition-all ${
                            currentVariantIdx === vIdx
                              ? "bg-gold text-zinc-950 font-bold shadow-sm"
                              : "glass-pill text-zinc-600 dark:text-zinc-400 hover:text-gold"
                          }`}
                        >
                          {v.size.split(" ")[0]}
                        </button>
                      ))}
                    </div>

                    {/* Price & Action Row */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <PriceDisplay
                          price={currentVariant.price}
                          compareAtPrice={currentVariant.compareAt}
                          locale={locale}
                        />
                        <InstallmentBadge price={currentVariant.price} locale={locale} />
                      </div>

                      <Button
                        onClick={() => handleQuickAdd(product.id)}
                        size="sm"
                        variant={isAdded ? "outline" : "gold"}
                        className={`rounded-full p-2.5 transition-all ${
                          isAdded ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : ""
                        }`}
                        aria-label="Add to cart"
                      >
                        {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DEDICATED NOTES TAXONOMY DISCOVERY MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl relative overflow-hidden space-y-10 border border-white/15 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-accent font-semibold">
                {isAr ? "مكتبة النوتات العطرية النادرة" : "Signature Olfactory Matrix"}
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-zinc-950 dark:text-white font-light">
                {isAr ? "تسوق حسب النوتة والمكون النادر" : "Explore Perfumes by Signature Notes"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
                {isAr
                  ? "انغمس في عالم الخلاصات الطبيعية النادرة، واكتشف فورياً جميع العطور الملكية التي تستند إلى نوتتك المفضلة."
                  : "Filter our entire fragrance vault through solitary precious extraits. Click any note to access authenticated matching extraits and attars."}
              </p>
            </div>
            <Button asChild variant="gold" size="md">
              <Link href="/notes">{isAr ? "دليل النوتات الكامل (v9)" : "Full Notes Graph (v9)"}</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              {
                nameEn: "Royal Taif Rose",
                nameAr: "ورد الطائف الملكي",
                slug: "taif-rose",
                origin: "Taif, Saudi Arabia",
                family: "Floral",
                count: "12 Extraits",
              },
              {
                nameEn: "Silver Frankincense",
                nameAr: "اللبان الحوجري الفضي",
                slug: "silver-frankincense",
                origin: "Dhofar, Oman",
                family: "Resins",
                count: "8 Extraits",
              },
              {
                nameEn: "Cambodian Oud",
                nameAr: "دهن عود كمبودي معتق",
                slug: "cambodian-oud",
                origin: "Pursat, Cambodia",
                family: "Woody",
                count: "18 Extraits",
              },
              {
                nameEn: "Florentine Iris",
                nameAr: "سوسن فلورنسا النادر",
                slug: "florentine-iris",
                origin: "Tuscany, Italy",
                family: "Floral",
                count: "6 Extraits",
              },
              {
                nameEn: "Golden Ambergris",
                nameAr: "عنبر أشهب طبيعي",
                slug: "golden-ambergris",
                origin: "Arabian Sea",
                family: "Amber",
                count: "14 Extraits",
              },
              {
                nameEn: "Tuscan Leather",
                nameAr: "جلود توسكانا الفاخرة",
                slug: "tuscan-leather",
                origin: "Florence, Italy",
                family: "Leather",
                count: "9 Extraits",
              },
            ].map((note, idx) => (
              <Link
                key={idx}
                href={`/notes/${note.slug}`}
                className="group glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3 text-center transition-all hover:scale-105"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-gold/15 text-gold flex items-center justify-center font-serif text-lg group-hover:scale-110 transition-transform">
                  ✦
                </div>
                <div>
                  <h4 className="font-serif text-sm sm:text-base font-medium text-zinc-950 dark:text-white group-hover:text-gold transition-colors">
                    {isAr ? note.nameAr : note.nameEn}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">{note.origin}</p>
                </div>
                <span className="text-[10px] font-mono text-accent font-semibold">
                  {note.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI SCENT SOMMELIER GLASS INTERACTIVE CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative glass-panel p-8 sm:p-14 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-10 border border-gold/30 shadow-2xl">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 glass-pill text-accent text-xs font-sans uppercase tracking-wider font-bold">
              <Sparkles size={15} />
              <span>{isAr ? "مستشار العطور بالذكاء الاصطناعي" : "DeepSeek Olfactory Intelligence"}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-zinc-950 dark:text-white font-light leading-tight">
              {isAr ? "مستشارك العطري الخاص بالذكاء الاصطناعي" : "Your Private Haute Parfumerie Sommelier"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
              {isAr
                ? "صف لنا العطر الذي تبحث عنه، ذكرياتك، مناسبتك، أو مشاعرك المفضلة باللغة العربية أو الإنجليزية. سيقوم المستشار الذكي بمطابقتها مع أكثر من 19 نوتة وهرم عطري معتمد."
                : "Describe your scent memories, mood, or gala in plain language. Our catalog-grounded AI analyzes notes, pyramids, sillage, and regional longevity to match your next signature extrait."}
            </p>
            <div className="pt-2">
              <Button asChild variant="gold" size="lg" className="shadow-lg hover:scale-105 transition-all">
                <Link href="/discover/ai" className="flex items-center gap-2">
                  <Sparkles size={16} />
                  <span>{isAr ? "بدء الاستشارة العطرية" : "Start Scent Consultation"}</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-96 glass-card p-6 rounded-2xl space-y-4 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between text-xs font-serif italic text-gold">
              <span className="flex items-center gap-1.5">
                <Compass size={15} />
                <span>{isAr ? "نموذج التشخيص العطري" : "Live Scent Diagnostic"}</span>
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                98% Match
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans italic border-s-2 border-gold ps-3 py-1">
              &quot;I desire a smoky, resinous oud with sweet honeyed rose and aristocratic silage for evening Galas in Dubai.&quot;
            </p>
            <div className="p-3.5 rounded-xl bg-gold/10 border border-gold/20 space-y-1">
              <span className="text-[11px] uppercase font-sans tracking-widest text-zinc-950 dark:text-white font-bold block">
                ✦ Interlude 53 Man Extrait
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Matched via Silver Frankincense, Cambodian Oud & Royal Taif Rose accord overlap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE 5X2ML DISCOVERY SET BUILDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-gold/40 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-4 max-w-xl">
            <span className="px-3.5 py-1 rounded-full bg-gold/20 text-gold border border-gold/40 text-xs font-sans uppercase font-bold tracking-wider">
              {isAr ? "صندوق الاستكشاف المخصص" : "Custom Discovery Vault"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 dark:text-white font-light">
              {isAr ? "صمّم صندوق الاستكشاف الخاص بك (5 × 2 مل)" : "Curate Your Custom 5x2ml Discovery Set"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
              {isAr
                ? "اختر 5 عينات نيش نادرة بحجم 2 مل لتجربتها على بشرتك. تتضمن كل مجموعة قسيمة استرداد بقيمة 280 درهم تخصم بالكامل عند شراء العطر بالحجم الكبير."
                : "Select five 2ml official sample extraits. Every set includes a full 280 AED voucher redeemable against your favorite full-sized bottle."}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-gold">
              <span>✦ 5 Official Vials</span>
              <span>•</span>
              <span>✦ 280 AED Voucher</span>
              <span>•</span>
              <span>✦ VIP Delivery</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className="w-12 h-20 rounded-xl glass-panel border border-gold/40 flex flex-col items-center justify-center text-gold font-serif text-xs"
                >
                  <span>2ml</span>
                  <span className="text-[10px] opacity-60">#{slot}</span>
                </div>
              ))}
            </div>
            <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
              <Link href="/discover/sets">{isAr ? "صمّم مجموعتك الآن (280 درهم)" : "Build Custom Box (280 AED)"}</Link>
            </Button>
          </div>
        </div>
      </section>
      </div>

      {/* 6. INTERACTIVE QUICK SNIFF MODAL */}
      {activeSniffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveSniffModal(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
          />
          <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20 z-10 animate-slide-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-bold">
                  {activeSniffModal.brand}
                </span>
                <h3 className="font-serif text-2xl text-zinc-950 dark:text-white">
                  {isAr ? activeSniffModal.nameAr : activeSniffModal.nameEn}
                </h3>
              </div>
              <button
                onClick={() => setActiveSniffModal(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scent Pyramid Breakdown */}
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl glass-panel-subtle space-y-1">
                <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  ✦ {isAr ? "افتتاحية العطر (Top)" : "Opening (Top)"}
                </span>
                <p className="text-zinc-700 dark:text-zinc-200">{activeSniffModal.topNote}</p>
              </div>

              <div className="p-3 rounded-xl glass-panel-subtle space-y-1">
                <span className="text-rose-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  ✦ {isAr ? "قلب العطر (Heart)" : "Core (Heart)"}
                </span>
                <p className="text-zinc-700 dark:text-zinc-200">{activeSniffModal.heartNote}</p>
              </div>

              <div className="p-3 rounded-xl glass-panel-subtle space-y-1">
                <span className="text-gold font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  ✦ {isAr ? "قاعدة العطر (Base)" : "Dry Down (Base)"}
                </span>
                <p className="text-zinc-700 dark:text-zinc-200">{activeSniffModal.baseNote}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="space-y-0.5">
                <div className="text-[10px] text-zinc-400 font-sans uppercase">
                  {isAr ? "الفوحان والثبات" : "Performance"}
                </div>
                <div className="text-xs font-serif text-gold font-medium">
                  {activeSniffModal.longevity} • {activeSniffModal.sillage}
                </div>
              </div>
              <Button
                onClick={() => {
                  router.push(`/product/${activeSniffModal.slug}`);
                  setActiveSniffModal(null);
                }}
                variant="gold"
                size="sm"
              >
                {isAr ? "صفحة العطر الكاملة" : "Full Extrait Details"} →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
