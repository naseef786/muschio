import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { Badge, Button, PriceDisplay } from "@muschio/ui";
import { ArrowLeft, ShieldCheck, Globe } from "lucide-react";

interface BrandData {
  slug: string;
  name: string;
  type: "NICHE" | "DESIGNER";
  countryEn: string;
  countryAr: string;
  year: number;
  heroImage: string;
  storyEn: string;
  storyAr: string;
  perfumer: string;
  perfumes: Array<{
    slug: string;
    nameEn: string;
    nameAr: string;
    concentration: string;
    price: number;
    compareAtPrice?: number | null;
    image: string;
    topNotes: string[];
  }>;
}

const BRANDS_VAULT: Record<string, BrandData> = {
  amouage: {
    slug: "amouage",
    name: "Amouage",
    type: "NICHE",
    countryEn: "Sultanate of Oman",
    countryAr: "سلطنة عُمان",
    year: 1983,
    heroImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=85",
    storyEn:
      "Established in 1983 in the Sultanate of Oman at the request of the Royal Family, Amouage is revered as 'The Gift of Kings'. The house defines royal Arabian haute parfumerie by fusing precious Omani Silver Frankincense, wild rock rose, and aged Cambodian agarwood at monumental concentrations of up to 53%.",
    storyAr:
      "تأسست عام 1983 في سلطنة عُمان بطلب ملكي سامٍ، وتُعرف دار أمواج بلقب 'هدية الملوك'. تعيد الدار صياغة الفخامة العطرية الملكية بدمج اللبان الحوجري الفضي النادر والورد الجبلي وخشب العود المعتق بتراكيز أسطورية تصل إلى 53%.",
    perfumer: "Pierre Negrin, Renaud Salmon, Karine Vinchon",
    perfumes: [
      {
        slug: "amouage-interlude-53-man",
        nameEn: "Interlude 53 Man Extrait de Parfum",
        nameAr: "إنترلود 53 إكستري دي بارفان",
        concentration: "Extrait de Parfum (53%)",
        price: 1850,
        compareAtPrice: 2100,
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85",
        topNotes: ["Silver Frankincense", "Cambodian Oud", "Bergamot"],
      },
    ],
  },
  "maison-francis-kurkdjian": {
    slug: "maison-francis-kurkdjian",
    name: "Maison Francis Kurkdjian",
    type: "NICHE",
    countryEn: "Paris, France",
    countryAr: "باريس، فرنسا",
    year: 2009,
    heroImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85",
    storyEn:
      "Co-founded by Master Perfumer Francis Kurkdjian and Marc Chaya, MFK embodies Parisian elegance, precision, and architectural olfactory beauty. Celebrated globally for crystallizing light and warmth into eternal signatures.",
    storyAr:
      "تأسست على يد صانع العطور العالمي فرانسيس كوركديان ومارك شايا، وتجسد دار إم إف كيه الأناقة الباريسية الرفيعة والدقة المعمارية في صياغة العطور بنقاء بلوري استثنائي.",
    perfumer: "Francis Kurkdjian",
    perfumes: [
      {
        slug: "mfk-baccarat-rouge-540-extrait",
        nameEn: "Baccarat Rouge 540 Extrait de Parfum",
        nameAr: "باكارات روج 540 إكستري دي بارفان",
        concentration: "Extrait de Parfum",
        price: 1650,
        compareAtPrice: null,
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
        topNotes: ["Kashmiri Saffron", "Bitter Almond", "Ambergris"],
      },
    ],
  },
  "roja-parfums": {
    slug: "roja-parfums",
    name: "Roja Parfums",
    type: "NICHE",
    countryEn: "London, United Kingdom",
    countryAr: "لندن، المملكة المتحدة",
    year: 2011,
    heroImage: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1600&q=85",
    storyEn:
      "Founded by British Master Perfumer Roja Dove, the house is renowned for creating fragrances without economic constraint. Formulated using pure natural absolutes and encased in silk-lined boxes with Swarovski crystal stoppers.",
    storyAr:
      "تأسست على يد صانع العطور البريطاني الشهير روجا دوف، وتشتهر الدار بابتكار خلاصات عطرية دون أي قيود على التكلفة، باستخدام أنقى المستخلصات الطبيعية وزجاجات مرصعة بكريستال سواروفسكي.",
    perfumer: "Roja Dove",
    perfumes: [
      {
        slug: "roja-parfums-elysium-pour-homme-parfum",
        nameEn: "Elysium Pour Homme Parfum",
        nameAr: "إليزيوم بور هوم بارفان",
        concentration: "Pure Parfum Pour Homme",
        price: 1950,
        compareAtPrice: 2200,
        image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
        topNotes: ["Calabrian Bergamot", "Juniper Berry", "Ambergris"],
      },
    ],
  },
  xerjoff: {
    slug: "xerjoff",
    name: "Xerjoff",
    type: "NICHE",
    countryEn: "Turin, Italy",
    countryAr: "تورينو، إيطاليا",
    year: 2003,
    heroImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85",
    storyEn:
      "Created by Sergio Momo in Turin, Xerjoff is a journey into the precious realm of luxury fragrance where natural materials meet master Italian stone-cutting and hand-blown Murano glass artistry.",
    storyAr:
      "تأسست في تورينو بإيطاليا على يد سيرجيو مومو، وتقدم تجربة حسية فريدة تجمع بين أنقى المواد العطرية وفنون النحت الإيطالية وزجاج مورانو المنفوخ يدوياً.",
    perfumer: "Chris Maurice, Christian Carbonnel",
    perfumes: [
      {
        slug: "xerjoff-alexandria-ii",
        nameEn: "Alexandria II Eau de Parfum",
        nameAr: "ألكسندريا 2 أو دي بارفان",
        concentration: "Eau de Parfum",
        price: 2200,
        compareAtPrice: 2450,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
        topNotes: ["Laos Aged Oud", "Bulgarian Rose", "Lavender"],
      },
    ],
  },
  "tom-ford": {
    slug: "tom-ford",
    name: "Tom Ford",
    type: "DESIGNER",
    countryEn: "New York, USA",
    countryAr: "نيويورك، الولايات المتحدة",
    year: 2005,
    heroImage: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1600&q=85",
    storyEn:
      "Tom Ford Private Blend is the private scent laboratory of Tom Ford, designed for true fragrance connoisseurs who desire distinctive and rare notes composed with unapologetic glamour.",
    storyAr:
      "مجموعة برايفيت بليند هي المختبر العطري الخاص لتوم فورد، صُممت لعشاق العطور المميزة والباحثين عن نوتات استثنائية تنبض بالجاذبية والأناقة المعاصرة.",
    perfumer: "Olivier Gillotin, Harry Fremont",
    perfumes: [
      {
        slug: "tom-ford-tobacco-vanille",
        nameEn: "Tobacco Vanille Eau de Parfum",
        nameAr: "توباكو فانيلا أو دي بارفان",
        concentration: "Eau de Parfum (Private Blend)",
        price: 1720,
        compareAtPrice: 1950,
        image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=85",
        topNotes: ["Tobacco Leaf", "Bourbon Vanilla", "Tonka Bean"],
      },
    ],
  },
};

export default function BrandDetailPage({
  params: { locale, slug },
}: {
  params: { locale: "en" | "ar"; slug: string };
}) {
  const isAr = locale === "ar";
  const brand = BRANDS_VAULT[slug] || BRANDS_VAULT["amouage"];

  if (!brand) notFound();

  return (
    <div className="space-y-16 pb-24">
      {/* 1. BRAND HERO */}
      <section className="relative min-h-[55vh] flex items-end bg-zinc-950 text-white px-4 sm:px-6 lg:px-8 pb-16 pt-24">
        <div className="absolute inset-0 z-0 opacity-35">
          <Image
            src={brand.heroImage}
            alt={brand.name}
            fill
            priority
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent z-0" />

        <div className="relative z-10 max-w-5xl mx-auto w-full space-y-4">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-zinc-300 hover:text-white"
          >
            <ArrowLeft size={14} />
            <span>{isAr ? "دليل الدور العطرية" : "All Houses"}</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={brand.type === "NICHE" ? "niche" : "default"}>
              {brand.type === "NICHE" ? (isAr ? "نيش فاخر" : "Haute Niche House") : (isAr ? "مجموعة خاصة" : "Designer Privé")}
            </Badge>
            <div className="inline-flex items-center gap-1.5 text-gold text-xs font-sans uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>{isAr ? "وكيل معتمد ومستورد أصلي" : "Official Verified Maison"}</span>
            </div>
          </div>

          <h1 className="font-serif text-4xl sm:text-7xl text-white font-light">
            {brand.name}
          </h1>

          <div className="flex items-center gap-4 text-xs font-sans text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-gold" />
              <span>{isAr ? brand.countryAr : brand.countryEn}</span>
            </span>
            <span>•</span>
            <span>{isAr ? `تأسست عام ${brand.year}` : `Established ${brand.year}`}</span>
          </div>

          <p className="max-w-2xl text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed pt-2">
            {isAr ? brand.storyAr : brand.storyEn}
          </p>
        </div>
      </section>

      {/* 2. MAISON PHILOSOPHY & ATTRIBUTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-luxury-surface p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans tracking-widest text-gold font-semibold">
              {isAr ? "صانع العطور المعتمد" : "Master Perfumers"}
            </span>
            <p className="font-serif text-lg text-zinc-900 dark:text-zinc-100">{brand.perfumer}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans tracking-widest text-gold font-semibold">
              {isAr ? "المقر والموطن" : "Atelier Origin"}
            </span>
            <p className="font-serif text-lg text-zinc-900 dark:text-zinc-100">
              {isAr ? brand.countryAr : brand.countryEn}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans tracking-widest text-gold font-semibold">
              {isAr ? "الضمان الإقليمي" : "Regional Allocation"}
            </span>
            <p className="font-serif text-lg text-zinc-900 dark:text-zinc-100">
              {isAr ? "تخزين مبرد بدرجة حرارة معتمدة" : "Direct Vault Temperature-Controlled Storage"}
            </p>
          </div>
        </div>
      </section>

      {/* 3. PERFUMES COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-accent font-medium">
              {isAr ? "المجموعة المعتمدة" : "Authorized Collection"}
            </span>
            <h2 className="font-serif text-3xl text-zinc-900 dark:text-zinc-100">
              {isAr ? `إصدارات دار ${brand.name}` : `Fragrances by ${brand.name}`}
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-sans">
            {brand.perfumes.length} {isAr ? "عطور متوفرة" : "available"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brand.perfumes.map((perfume) => (
            <div
              key={perfume.slug}
              className="group border border-zinc-200 dark:border-zinc-800 bg-luxury-surface hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between"
            >
              <div className="relative h-80 w-full overflow-hidden bg-zinc-950">
                <Image
                  src={perfume.image}
                  alt={perfume.nameEn}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 start-3">
                  <Badge variant="niche">{brand.name}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-zinc-400">
                    {perfume.concentration}
                  </span>
                  <Link href={`/product/${perfume.slug}`} className="block">
                    <h3 className="font-serif text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-accent transition-colors">
                      {isAr ? perfume.nameAr : perfume.nameEn}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {perfume.topNotes.map((note, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <PriceDisplay price={perfume.price} locale={locale} />
                  <Button asChild size="sm" variant="accent">
                    <Link href={`/product/${perfume.slug}`}>
                      {isAr ? "اكتشف العطر" : "Discover Scent"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
