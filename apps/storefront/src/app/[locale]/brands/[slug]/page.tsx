import React from "react";
import { notFound } from "next/navigation";
import { Link } from "../../../../navigation";
import { ProductCard } from "../../../../components/product-card";
import { Globe, ShieldCheck } from "lucide-react";

interface BrandData {
  slug: string;
  name: string;
  type: "NICHE" | "DESIGNER";
  countryEn: string;
  countryAr: string;
  year: number;
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
    badge?: string;
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
        image: "/amouage-placeholder.svg",
        badge: "Extrait (53%)",
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
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85",
        badge: "Haute Niche",
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
        concentration: "Pure Parfum",
        price: 1950,
        compareAtPrice: 2200,
        image:
          "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85",
        badge: "Pure Parfum",
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
    storyEn:
      "Founded by Sergio Momo in Turin, Xerjoff marries classical Italian luxury with rare aged oud and precious balsamic resins. Celebrated for architectural sculpted flacons capped with royal golden stoppers.",
    storyAr:
      "تأسست في تورينو بإيطاليا، وتجمع دار سيرجوف بين الفخامة الإيطالية الكلاسيكية وأندر خلاصات العود والصمغيات البلسمية الفاخرة في زجاجات ملكية ساحرة.",
    perfumer: "Chris Maurice, Christian Carbonnel",
    perfumes: [
      {
        slug: "xerjoff-alexandria-ii",
        nameEn: "Alexandria II Eau de Parfum",
        nameAr: "ألكسندريا 2 أو دي بارفان",
        concentration: "Eau de Parfum",
        price: 2200,
        compareAtPrice: 2450,
        image:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85",
        badge: "Rare Batch",
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
    storyEn:
      "Tom Ford's Private Blend is an artisanal scent laboratory where truly unconventional and opulent fragrances are born. Designed for fragrance connoisseurs who crave distinctive amber, leather, and vanilla architectures.",
    storyAr:
      "مجموعة توم فورد برايفيت بليند هي مختبر عطري استثنائي صُمم لعشاق التميز بنفحات العنبر والجلد والفانيليا الغنية.",
    perfumer: "Olivier Gillotin, Harry Fremont",
    perfumes: [
      {
        slug: "tom-ford-tobacco-vanille",
        nameEn: "Tobacco Vanille Eau de Parfum",
        nameAr: "توباكو فانيلا أو دي بارفان",
        concentration: "Eau de Parfum",
        price: 1720,
        compareAtPrice: 1950,
        image:
          "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=85",
        badge: "Private Blend",
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
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const brand = BRANDS_VAULT[slug];
  if (!brand) notFound();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 space-y-8">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#77776F]">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[#171917] transition-colors">
              {c("Home", "الرئيسية")}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/brands" className="hover:text-[#171917] transition-colors">
              {c("The Houses", "دور العطور")}
            </Link>
          </li>
          <li>/</li>
          <li className="text-[#171917] font-medium">{brand.name}</li>
        </ol>
      </nav>

      {/* 2. Compact Maison Editorial Header (No Oversized Blocks) */}
      <div className="border border-[#E6E4DE] bg-white p-6 sm:p-10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6E4DE]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#46513B] px-2.5 py-1 bg-[#F3F1EC] border border-[#E6E4DE]">
              {brand.type === "NICHE" ? "Haute Niche" : "Designer Privé"}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#77776F]">
              <Globe size={13} className="text-[#46513B]" />
              <span>{isAr ? brand.countryAr : brand.countryEn}</span>
              <span>·</span>
              <span>Est. {brand.year}</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#46513B]">
            <ShieldCheck size={14} />
            <span>{c("Authorized Stockist", "موزع رسمي معتمد")}</span>
          </div>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl text-[#171917] font-normal">
            {brand.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#77776F] leading-relaxed">
            {isAr ? brand.storyAr : brand.storyEn}
          </p>
          <div className="pt-2 text-xs text-[#171917]">
            <span className="text-[#77776F] me-2">{c("Master Noses:", "صناع العطور:")}</span>
            <span className="font-medium">{brand.perfumer}</span>
          </div>
        </div>
      </div>

      {/* 3. Products by This House Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between pb-4 border-b border-[#E6E4DE]">
          <div>
            <span className="eyebrow mb-1">
              {c("AUTHORIZED FLACONS", "العطور المتوفرة")}
            </span>
            <h2 className="font-serif text-2xl text-[#171917] font-normal">
              {c(`Creations by ${brand.name}`, `إصدارات دار ${brand.name}`)}
            </h2>
          </div>
          <span className="text-xs text-[#77776F]">
            {brand.perfumes.length} {c("Available", "متوفر")}
          </span>
        </div>

        {/* Level Shoes 2-col mobile / 3-col tablet / 4-col desktop product grid */}
        <div className="product-grid">
          {brand.perfumes.map((perfume) => (
            <ProductCard
              key={perfume.slug}
              slug={perfume.slug}
              nameEn={perfume.nameEn}
              nameAr={perfume.nameAr}
              brand={brand.name}
              concentration={perfume.concentration}
              price={perfume.price}
              compareAtPrice={perfume.compareAtPrice}
              image={perfume.image}
              badge={perfume.badge}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
